# System SysEx Request Fix Plan

**Date:** 2026-01-01  
**Issue:** Multiple incorrect System data requests being sent to GR-55  
**Scope:** GR-55 System parameter retrieval only

## Background

### Current Incorrect Behavior

The application is currently sending multiple individual SysEx data requests to addresses beginning with `02 00 ...`:

- `F0 41 10 00 00 53 11 02 00 00 00 ...` (to address `02 00 00 00`)
- `F0 41 10 00 00 53 11 02 00 02 00 ...` (to address `02 00 02 00`)
- Additional requests to `02 00 04 00` through `02 00 0D 00`

**Problem:** These addresses (`02 00 xx xx`) should ONLY appear in RESPONSES from the GR-55, never in REQUESTS sent to it.

### Correct Behavior (from traffic log)

**ONE request sent TO GR-55:**

```
F0 41 10 00 00 53 11 01 00 00 00 01 01 00 00 7D F7
```

**Breakdown:**

- `F0` = SysEx Start
- `41` = Roland Manufacturer ID
- `10` = Device ID (default)
- `00 00 53` = GR-55 Model ID
- `11` = Command RQ1 (Request Data)
- `01 00 00 00` = Request Address
- `01 01 00 00` = Length/Arguments
- `7D` = Checksum
- `F7` = SysEx End

**THIRTEEN responses received FROM GR-55:**

| #   | Address (hex) | Address (bytes) | Content Description           |
| --- | ------------- | --------------- | ----------------------------- |
| 1   | `0x01000000`  | `01 00 00 00`   | Setup area (2 bytes: `00 05`) |
| 2   | `0x02000000`  | `02 00 00 00`   | System Common (37 bytes)      |
| 3   | `0x02000200`  | `02 00 02 00`   | System CTL/Assign (127 bytes) |
| 4   | `0x02000400`  | `02 00 04 00`   | GK Set 1 (80 bytes)           |
| 5   | `0x02000500`  | `02 00 05 00`   | GK Set 2 (80 bytes)           |
| 6   | `0x02000600`  | `02 00 06 00`   | GK Set 3 (80 bytes)           |
| 7   | `0x02000700`  | `02 00 07 00`   | GK Set 4 (80 bytes)           |
| 8   | `0x02000800`  | `02 00 08 00`   | GK Set 5 (80 bytes)           |
| 9   | `0x02000900`  | `02 00 09 00`   | GK Set 6 (80 bytes)           |
| 10  | `0x02000A00`  | `02 00 0A 00`   | GK Set 7 (80 bytes)           |
| 11  | `0x02000B00`  | `02 00 0B 00`   | GK Set 8 (80 bytes)           |
| 12  | `0x02000C00`  | `02 00 0C 00`   | GK Set 9 (80 bytes)           |
| 13  | `0x02000D00`  | `02 00 0D 00`   | GK Set 10 (80 bytes)          |

**Total response payload:** 2 + 37 + 127 + (10 × 80) = 966 bytes

## Root Cause Analysis

### Address Encoding Issue

The System structure is defined at:

```typescript
system: new StructDefinition(pack7(0x02000000), "System", SystemStruct);
```

However:

- `pack7(0x02000000)` converts `0x02000000` (8-bit) → packed 7-bit number
- When `unpack7()` is applied, this becomes `0x01000000` (8-bit)
- Split into bytes: `[01, 00, 00, 00]`

**This is CORRECT for the request address** (`01 00 00 00`), but the structure definition's offset `0x02000000` is also correct for parsing responses.

### The Real Issue: Request Pattern

The GR-55 uses a special bulk retrieval pattern for System data:

1. **Standard pattern:** Request at address X, receive response at address X
2. **System bulk pattern:** Request at address `01 00 00 00`, receive MULTIPLE responses at addresses `01 00 00 00`, `02 00 00 00`, `02 00 02 00`, etc.

The app's `fetchAndTokenize` function doesn't know about this special pattern and tries to request each sub-block individually, generating incorrect requests to addresses `02 00 xx xx`.

## Code Locations

### Current Request Flow

1. **Hook initialization:** `src/hooks/useRolandRemoteSystemState.tsx`

   - Calls `useRolandRemotePageState(addressMap?.system, "read_utmost")`

2. **Page state handler:** `src/hooks/useRolandRemotePageState.tsx`

   - Calls `requestData(page.definition, page.address, signal, queueID)`

3. **Data transfer:** `src/services/RolandDataTransfer.tsx`

   - `requestData` calls `fetchAndTokenize` which breaks into chunks
   - Each chunk calls `fetchContiguous(address, length)`
   - `fetchContiguous` calls `makeDataRequestMessage` for each chunk

4. **Message construction:** `src/lib/RolandSysExProtocol.ts`
   - `makeDataRequestMessage` builds: `F0 41 10 00 00 53 11 [ADDRESS] [LENGTH] [CHECKSUM] F7`

### Special Command Infrastructure

The code already has support for non-standard request patterns:

**File:** `src/services/RolandDataTransfer.tsx` (lines ~267-340)

```typescript
async function requestNonDataCommand(
  address: number,
  args: Uint8Array | readonly number[] = [],
  responseAddresses: readonly number[] = [address],
  signal?: AbortSignal,
  queueID: string = "read_utmost"
): Promise<Map<number, Uint8Array>>;
```

This function:

- Sends ONE request with custom args
- Waits for MULTIPLE responses at specified addresses
- Returns a map of address → data

**This is the mechanism we need to use for System requests.**

## Address Map Structure

Current definition in `src/lib/roland-gr55/RolandGR55AddressMap.ts`:

```typescript
const SystemStruct = {
  common: new StructDefinition(pack7(0x000000), "Common", SystemCommonStruct),
  ctl: new StructDefinition(pack7(0x000200), "CTL/Assign", SystemCtlStruct),
  gkSet1: new StructDefinition(
    pack7(0x000400),
    "GK Set 1",
    SystemGkGuitarStruct
  ),
  gkSet2: new StructDefinition(
    pack7(0x000500),
    "GK Set 2",
    SystemGkGuitarStruct
  ),
  // ... gkSet3-10
};

system: new StructDefinition(pack7(0x02000000), "System", SystemStruct);
```

**Note:** The offsets are RELATIVE to the parent:

- `pack7(0x000000)` relative to `0x02000000` = absolute `0x02000000`
- `pack7(0x000200)` relative to `0x02000000` = absolute `0x02000200`
- etc.

These match the response addresses perfectly.

## Solution Design

### Option A: Custom System Request Handler (RECOMMENDED)

Create a dedicated function for System bulk requests that:

1. Sends the special request: address `0x01000000`, args `[01, 01, 00, 00]`
2. Receives 13 responses at known addresses
3. Maps response data to System structure
4. Returns properly formatted `RawDataBag`

**Advantages:**

- Clean separation of special-case logic
- Doesn't affect other data requests
- Easy to test and validate

### Option B: Modify fetchAndTokenize

Add logic to detect System structure and bypass chunking.

**Disadvantages:**

- Adds complexity to core data transfer logic
- Harder to maintain
- Not recommended

## Implementation Tasks

### Task 1: Create System Bulk Request Function

**File:** `src/services/RolandDataTransfer.tsx`

Add new function `requestSystemBulk`:

```typescript
async function requestSystemBulk(
  signal?: AbortSignal,
  queueID: string = "read_utmost"
): Promise<RawDataBag>;
```

**Implementation steps:**

1. Call `requestNonDataCommand` with:
   - Address: `pack7(0x01000000)`
   - Args: `[0x01, 0x01, 0x00, 0x00]`
   - Response addresses: 13 addresses from traffic log
2. Receive Map<address, Uint8Array> response
3. Map to structure offsets:
   - Response at `0x01000000` → ignore (Setup data)
   - Response at `0x02000000` → offset `0x000000` (Common)
   - Response at `0x02000200` → offset `0x000200` (CTL)
   - Response at `0x02000400` → offset `0x000400` (GK Set 1)
   - etc.
4. Return `RawDataBag` compatible with `SystemStruct` definition

### Task 2: Modify useRolandRemoteSystemState Hook

**File:** `src/hooks/useRolandRemoteSystemState.tsx`

Replace current implementation:

```typescript
// OLD:
return useRolandRemotePageState(addressMap?.system, "read_utmost");

// NEW:
// Call requestSystemBulk directly from context
// Process returned RawDataBag through createRemoteState
```

### Task 3: Update RolandDataTransfer Context

**File:** `src/services/RolandDataTransfer.tsx`

Add `requestSystemBulk` to context export:

```typescript
export const RolandDataTransferContext = React.createContext<{
  requestData: typeof requestData | undefined;
  requestNonDataCommand: typeof requestNonDataCommand | undefined;
  requestSystemBulk: typeof requestSystemBulk | undefined; // NEW
  setField: typeof setField | undefined;
  // ...
}>;
```

### Task 4: Add Diagnostic Logging

Add temporary logging in `fetchContiguous` to verify requests being sent:

```typescript
const message = makeDataRequestMessage(
  sysExConfig,
  deviceId ?? ALL_DEVICES,
  address,
  length
);
console.log(
  "📤 SysEx Request:",
  message.map((b) => b.toString(16).padStart(2, "0").toUpperCase()).join(" ")
);
```

This will help verify the fix is working.

### Task 5: Validation Testing

**Test cases:**

1. Verify single request sent: `F0 41 10 00 00 53 11 01 00 00 00 01 01 00 00 7D F7`
2. Verify 13 responses received and parsed
3. Verify System Common parameters accessible (e.g., GK SET Select at offset 0x00)
4. Verify System CTL parameters accessible (e.g., CTL Function at offset 0x00 of CTL block)
5. Verify all 10 GK Sets parse correctly
6. Verify no requests sent to addresses `02 00 xx xx`

## Response Address Mapping Reference

For `requestNonDataCommand`, specify these response addresses:

```typescript
const SYSTEM_BULK_RESPONSE_ADDRESSES = [
  pack7(0x01000000), // Setup (will be present but not used for System)
  pack7(0x02000000), // System Common
  pack7(0x02000200), // System CTL
  pack7(0x02000400), // GK Set 1
  pack7(0x02000500), // GK Set 2
  pack7(0x02000600), // GK Set 3
  pack7(0x02000700), // GK Set 4
  pack7(0x02000800), // GK Set 5
  pack7(0x02000900), // GK Set 6
  pack7(0x02000a00), // GK Set 7
  pack7(0x02000b00), // GK Set 8
  pack7(0x02000c00), // GK Set 9
  pack7(0x02000d00), // GK Set 10
];
```

## Checksum Verification

The correct request checksum is `7D` (125 decimal).

**Verification:**

```
Address bytes: 01 00 00 00
Args bytes:    01 01 00 00
Sum: 01 + 00 + 00 + 00 + 01 + 01 + 00 + 00 = 02
Checksum: (128 - (02 % 128)) & 0x7F = 126 & 0x7F = 126 = 0x7E
```

Wait, that gives `0x7E`, not `0x7D`. Let me recalculate...

Actually checking the provided message: `F0 41 10 00 00 53 11 01 00 00 00 01 01 00 00 7D F7`

The checksum calculation might use a different method. The provided checksum `7D` is from verified working traffic, so use it as-is for validation.

## Success Criteria

- [ ] Only ONE request sent to GR-55 for System data
- [ ] Request address is `01 00 00 00`
- [ ] Request args are `01 01 00 00`
- [ ] Checksum is `7D`
- [ ] Zero requests sent to addresses starting with `02 00`
- [ ] All System parameters parse and display correctly
- [ ] No timeout errors or missing data

## Notes

- Setup area (`01 00 00 00`) is OUT OF SCOPE for this fix
- Do not modify address map structure definitions
- Do not attempt to fix other device types
- Use provided traffic log as ground truth

---

## Implementation Attempts Summary (2026-01-01)

### What Was Done

Multiple attempts were made to fix `requestSystemBulk()` through incremental patches:

1. **Added StructDefinition import** - Fixed missing import causing `instanceof` check to fail
2. **Changed to use `systemDef.$`** - Fixed iteration to access actual struct fields instead of StructDefinition properties
3. **Fixed address calculation** - Changed from direct addition to `pack7(unpack7(systemBase) + unpack7(value.offset))`
4. **Added extensive SYSBULK logging** - Comprehensive console logging to trace execution flow

**Logging Infrastructure Added:**

- `🟦 SYSBULK: Starting requestSystemBulk` - Function entry
- `🟦 SYSBULK: Received 13 responses` - Response count
- `🟦 SYSBULK: Response addresses: [...]` - All addresses received
- `🟦 SYSBULK: Processing response at 0x...` - Per-response iteration
- `🟦 SYSBULK: Looking for match for address 0x...` - Matching attempt
- `🟦 SYSBULK: systemStruct keys: [...]` - Available sub-structures
- `🟦 SYSBULK: Matched to sub-structure: ...` - Successful match
- `🟦 SYSBULK: Tokenizing ... at 0x... with N bytes` - Tokenization attempt
- `🟦 SYSBULK: ✅ Tokenized into N fields` - Success
- `🟦 SYSBULK: ❌ Error tokenizing ...` - Failure

### Why It Failed

**Root Cause:** The entire `requestSystemBulk()` approach violates the established pattern used successfully for patch loading.

**Patch Loading (WORKS):**

```typescript
async function requestData(definition, baseAddress) {
  return await fetchAndTokenize(definition, baseAddress, fetchContiguous);
}
```

Simple flow:

1. Call `fetchAndTokenize()` ONCE with definition
2. `fetchAndTokenize()` breaks down structure and fetches each part
3. Returns unified `RawDataBag` with all field addresses

**System Bulk (BROKEN):**

```typescript
async function requestSystemBulk() {
  const responseMap = await requestNonDataCommand(...);  // Get all 13 responses
  for (const [address, data] of Object.entries(responseMap)) {
    // Try to manually find matching sub-structure
    // Try to manually call fetchAndTokenize for each piece
    // Try to manually merge results
  }
}
```

**Problems:**

1. **Manual orchestration** - Code tries to be "clever" and manage tokenization manually
2. **Wrong abstraction** - `fetchAndTokenize()` expects to FETCH data, not receive pre-fetched blobs
3. **Violates separation of concerns** - Mixing response handling with parsing logic
4. **Error on line 464:** `subDef.definition` doesn't exist - `subDef` IS the StructDefinition

### Current Error

```
TypeError: Cannot read properties of undefined (reading 'isContiguous')
    at fetchAndTokenizeImpl (RolandAddressMap.ts:984:18)
    at fetchAndTokenize (RolandAddressMap.ts:966:9)
    at requestSystemBulk (RolandDataTransfer.tsx:464:55)
```

Caused by calling:

```typescript
const tokenizedData = await fetchAndTokenize(
  subDef.definition, // ❌ undefined - should be subDef.$
  subBaseAddr,
  async (def, baseAddr) => {
    return { [addr]: data }; // ❌ Wrong pattern - not actually fetching
  }
);
```

## Conclusion

**NO MORE QUICK FIXES.** The `requestSystemBulk()` function needs complete rewrite.

## Next Steps - Complete Rewrite Required

### Step 1: Study Working Patch Pattern

**File:** `src/services/RolandDataTransfer.tsx` - `requestData()` function (lines ~212-270)

Understand how patch loading:

1. Calls `fetchAndTokenize()` once
2. Passes a callback that actually FETCHES data via `fetchContiguous()`
3. Lets `fetchAndTokenize()` handle all the structure decomposition
4. Returns clean `RawDataBag`

### Step 2: Design System Bulk Adapter

**Goal:** Make System bulk responses work with `fetchAndTokenize()` pattern.

**Approach:** Create a fetcher callback that returns pre-fetched data instead of making new requests:

```typescript
async function requestSystemBulk(signal?, queueID?) {
  // 1. Send ONE request, get 13 responses
  const responseMap = await requestNonDataCommand(
    pack7(0x01000000),
    [0x01, 0x01, 0x00, 0x00],
    SYSTEM_BULK_RESPONSE_ADDRESSES,
    signal,
    queueID
  );

  // 2. Create fetcher that serves pre-fetched data
  const preFetchedDataProvider = async (
    def: AtomDefinition,
    baseAddr: number
  ) => {
    const data = responseMap[baseAddr];
    if (!data) {
      throw new Error(
        `No pre-fetched data for address 0x${unpack7(baseAddr).toString(16)}`
      );
    }
    return { [baseAddr]: data };
  };

  // 3. Let fetchAndTokenize do its job (like patch loading does)
  return await fetchAndTokenize(
    sysExConfig.addressMap!.system!.definition,
    pack7(0x02000000),
    preFetchedDataProvider
  );
}
```

### Step 3: Remove All Manual Logic

**Delete:**

- Manual loop through responses
- Manual sub-structure matching
- Manual tokenization calls
- All SYSBULK logging (replace with standard performance logging)

**Keep:**

- `requestNonDataCommand()` call to get bulk responses
- `SYSTEM_BULK_RESPONSE_ADDRESSES` constant

### Step 4: Verify Against Pattern

**Checklist:**

- [ ] Only ONE call to `fetchAndTokenize()`
- [ ] Pass ENTIRE System definition, not sub-structures
- [ ] Pass callback that serves pre-fetched data
- [ ] No manual loops over responses
- [ ] No manual matching logic
- [ ] Return `RawDataBag` directly from `fetchAndTokenize()`

### Step 5: Test

1. Remove SYSBULK logging
2. Reload app
3. Verify UI shows GK Set 1 data correctly
4. Verify no errors in console
5. Compare to patch loading behavior

## Reference Implementation

**Working Pattern (Patch Loading):**

```typescript
async function requestData<T extends AtomDefinition>(
  definition: T,
  baseAddress: number = 0,
  signal?: AbortSignal,
  queueID: string = "read_default"
): Promise<RawDataBag> {
  return await fetchAndTokenize(definition, baseAddress, (...args) =>
    scheduler.current!.enqueue(async () => {
      const result = await fetchContiguous(...args);
      await delay(GAP_BETWEEN_MESSAGES_MS);
      return result;
    }, queueID)
  );
}
```

**Key Insight:** `fetchAndTokenize()` calls the fetcher callback for EACH PIECE it needs. For System bulk, we already have all pieces, so callback just serves from `responseMap`.

---

**STATUS:** PAUSED - Awaiting rewrite of `requestSystemBulk()` before any further debugging.

**End of Plan Document**
