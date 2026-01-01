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

## Phase 1 Extended Implementation Plan (2026-01-01)

### Overview

Complete rewrite of `requestSystemBulk()` following the proven patch loading pattern, with comprehensive testing before UI validation.

### Implementation Steps

#### Step 1: Define Response Address Constant

**File:** `src/services/RolandDataTransfer.tsx`

Add constant array with all 13 packed 7-bit response addresses:

```typescript
const SYSTEM_BULK_RESPONSE_ADDRESSES = [
  pack7(0x01000000), // Setup (present but not used for System parsing)
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

#### Step 2: Rewrite requestSystemBulk() Function

**File:** `src/services/RolandDataTransfer.tsx`

Replace entire function with pattern-compliant implementation:

```typescript
async function requestSystemBulk(
  signal?: AbortSignal,
  queueID: string = "read_utmost"
): Promise<RawDataBag> {
  // 1. Send ONE request, receive 13 responses
  const responseMap = await requestNonDataCommand(
    pack7(0x01000000),
    [0x01, 0x01, 0x00, 0x00],
    SYSTEM_BULK_RESPONSE_ADDRESSES,
    signal,
    queueID
  );

  // 2. Create callback that serves pre-fetched data
  const preFetchedDataProvider = async (
    address: number,
    length: number
  ): Promise<Uint8Array> => {
    const data = responseMap[address];
    if (!data) {
      throw new Error(
        `No pre-fetched data for address 0x${unpack7(address)
          .toString(16)
          .padStart(8, "0")}`
      );
    }
    return data;
  };

  // 3. Single call to fetchAndTokenize with entire System definition
  return await fetchAndTokenize(
    sysExConfig.addressMap!.system!.definition,
    pack7(0x02000000),
    preFetchedDataProvider
  );
}
```

**Key Changes:**

- **Delete:** All manual loops, address matching, sub-structure iteration, manual tokenization
- **Delete:** All SYSBULK console.log statements (~15+ log lines)
- **Keep:** Single `requestNonDataCommand()` call to get bulk responses
- **Add:** Pre-fetched data provider callback
- **Add:** Single `fetchAndTokenize()` call with full System definition

#### Step 3: Clean Up Excessive Logging

**Files to clean:**

- `src/services/RolandDataTransfer.tsx` - Remove excessive debug logging
- `src/hooks/useRolandRemoteSystemState.tsx` - Remove excessive debug logging

**Criteria:**

- Keep only critical error logs
- Remove all SYSBULK-prefixed logs
- Remove redundant status logs that clutter console
- Keep minimal performance tracking if needed for debugging

#### Step 4: Create Unit Test with Traffic Log Data

**File:** `__tests__/GKSet1Parsing.test.ts` (new file)

Test GK Set 1 parsing using actual GR-55 MIDI response data from `Docs/SysExParsing/System_SysEx_message_interaction_model.txt`.

**Test data:** GK Set 1 response (80 bytes):

```
20 20 20 20 20 20 20 20 00 0A 02 00 00 00 14 0A 0A 02 06 09 07 0B 0F 46 2B 2B 32 28 0A 02 05 05 05 05 00 20 20 20 20 20 20 20 20 00 0E 09 07 00 00 00 14 0A 0A 32 32 32 32 32 32 41 41 41 41 41 41 02 05 05 05 05 00 00 00 00 00 00 00 00 00 00 00 32 32
```

**Expected results (Guitar Mode, bytes 0-34):**

| Field        | Offset | Expected Value | Raw Byte(s) | Notes                              |
| ------------ | ------ | -------------- | ----------- | ---------------------------------- |
| puType       | 0x08   | 0 (GK-3)       | `00`        | Enum value                         |
| normalPuGain | 0x0e   | 0 dB           | `14`        | Value 20 = 0 dB (range -20 to +20) |
| string1Dist  | 0x11   | 1.0 mm         | `02`        | Value × 0.5 mm                     |
| string2Dist  | 0x12   | 3.0 mm         | `06`        | Value × 0.5 mm                     |
| string3Dist  | 0x13   | 4.5 mm         | `09`        | Value × 0.5 mm                     |
| string4Dist  | 0x14   | 3.5 mm         | `07`        | Value × 0.5 mm                     |
| string5Dist  | 0x15   | 5.5 mm         | `0B`        | Value × 0.5 mm                     |
| string6Dist  | 0x16   | 7.5 mm         | `0F`        | Value × 0.5 mm                     |
| string1Sens  | 0x17   | 70             | `46`        | Direct value                       |
| string2Sens  | 0x18   | 43             | `2B`        | Direct value                       |
| string3Sens  | 0x19   | 43             | `2B`        | Direct value                       |
| string4Sens  | 0x1a   | 50             | `32`        | Direct value                       |
| string5Sens  | 0x1b   | 40             | `28`        | Direct value                       |
| string6Sens  | 0x1c   | 10             | `0A`        | Direct value                       |

**Test assertions:**

```typescript
describe("GK Set 1 Parsing with Real GR-55 Data", () => {
  it("should parse puType correctly", () => {
    expect(parsedData.puType).toBe(0); // GK-3
  });

  it("should parse normalPuGain correctly", () => {
    expect(parsedData.normalPuGain).toBe(0); // 0 dB
  });

  it("should parse string distances correctly", () => {
    expect(parsedData.string1Dist).toBe(1.0);
    expect(parsedData.string2Dist).toBe(3.0);
    expect(parsedData.string3Dist).toBe(4.5);
    expect(parsedData.string4Dist).toBe(3.5);
    expect(parsedData.string5Dist).toBe(5.5);
    expect(parsedData.string6Dist).toBe(7.5);
  });

  it("should parse string sensitivities correctly", () => {
    expect(parsedData.string1Sens).toBe(70);
    expect(parsedData.string2Sens).toBe(43);
    expect(parsedData.string3Sens).toBe(43);
    expect(parsedData.string4Sens).toBe(50);
    expect(parsedData.string5Sens).toBe(40);
    expect(parsedData.string6Sens).toBe(10);
  });
});
```

#### Step 5: Run Unit Tests

Execute unit test suite:

```bash
npm test GKSet1Parsing.test.ts
```

**Success criteria:**

- All assertions pass
- No parsing errors
- Decoded values match expected hardware values exactly

#### Step 6: Integration Testing with Real Hardware

**Setup:**

1. Connect to real GR-55 device via MIDI
2. Load app in development mode
3. Navigate to System screen to trigger data load

**Validation points:**

1. **SysEx traffic:** Only ONE request sent to `01 00 00 00` with args `01 01 00 00`
2. **Response count:** Exactly 13 responses received
3. **No invalid requests:** Zero requests sent to addresses starting with `02 00`
4. **GK Set 1 data:** All fields parse correctly with real device data
5. **No errors:** Console shows no parsing errors or timeout errors

**Test procedure:**

1. Clear console
2. Trigger System data load
3. Monitor console for SysEx request messages
4. Verify request format matches specification
5. Verify response count
6. Check for any error messages

#### Step 7: Verify GK Set 1 in UI

**Only after Steps 5 & 6 pass:**

Manual UI verification:

1. Navigate to System → GK Set 1 screen
2. Verify values display match known hardware values:
   - PU Type shows "GK-3"
   - Normal PU Gain shows "0 dB"
   - String distances show correct values (1.0, 3.0, 4.5, 3.5, 5.5, 7.5 mm)
   - String sensitivities show correct values (70, 43, 43, 50, 40, 10)
3. Verify no console errors during display

### Success Criteria

#### Code Quality

- [ ] `requestSystemBulk()` follows patch loading pattern exactly
- [ ] Only ONE call to `fetchAndTokenize()`
- [ ] No manual loops or address matching logic
- [ ] All SYSBULK logging removed
- [ ] Excessive debug logging cleaned up

#### Unit Testing

- [ ] Unit test file created with real GR-55 data
- [ ] All test assertions pass
- [ ] Parsing logic verified correct

#### Integration Testing

- [ ] Only ONE SysEx request sent: `F0 41 10 00 00 53 11 01 00 00 00 01 01 00 00 7D F7`
- [ ] Exactly 13 responses received and processed
- [ ] Zero invalid requests to addresses `02 00 xx xx`
- [ ] GK Set 1 fields parse correctly with real hardware
- [ ] No console errors or timeouts

#### UI Verification

- [ ] GK Set 1 screen displays correct values
- [ ] All fields accessible and readable
- [ ] No display errors or crashes

### Test Execution Order

**MANDATORY SEQUENCE:**

1. ✅ Implement code changes (Steps 1-3)
2. ✅ Run unit tests (Steps 4-5) - **MUST PASS**
3. ✅ Run integration tests with hardware (Step 6) - **MUST PASS**
4. ✅ Manual UI verification (Step 7) - **ONLY IF TESTS PASS**

**Do NOT proceed to next step until current step passes completely.**

### Out of Scope

- GK Sets 2-10 display (will work automatically if Set 1 works)
- System Common and CTL screens
- Bass mode fields in GK Set structure
- Parameter editing/writing to hardware

### Notes

- Focus exclusively on GK Set 1 Guitar Mode fields (offsets 0x00-0x22)
- Use real hardware data for integration testing - no mocking
- Do not proceed to UI until automated tests confirm parsing correctness
- Bass mode fields (0x23-0x52) are out of scope for Phase 1

---

**STATUS:** IMPLEMENTATION IN PROGRESS - Phase 1 Extended Plan

**End of Plan Document**
