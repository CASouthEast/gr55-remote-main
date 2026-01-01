# GK Set 1 Parsing Fix Plan (Phase 1)

**Date:** 2026-01-01  
**Scope:** Fix GK Set 1 (Guitar Mode) data parsing only  
**Status:** Implementation in progress

## Background

The SystemGkGuitarStruct in `RolandGR55AddressMap.ts` has multiple critical offset errors when compared to the official Roland GR-55 MIDI Implementation specification:

1. **Scale field is 2 bytes** (0x09-0x0a), not 1 byte - causing cascade offset errors
2. **Normal PU Gain at wrong offset** - currently 0x1f, should be 0x0e (17 bytes too late)
3. **String Distance/Sensitivity offsets wrong** - currently 4 bytes too early
4. **6 Guitar mode fields missing** - velocityDynamics through downTuning (0x1d-0x22)
5. **2 Piezo fields missing** - piezoLow and piezoHigh (0x0f-0x10)

## Validation Data

Test data from actual GR-55 MIDI log (GK Set 1 response, 80 bytes):

```
20 20 20 20 20 20 20 20 00 0A 02 00 00 00 14 0A 0A 02 06 09 07 0B 0F 46 2B 2B 32 28 0A 02 05 05 05 05 00 20 20 20...
```

Expected decoded values (from hardware):

- **PU Type** (0x08): GK-3 (value 0)
- **Normal PU Gain** (0x0e): 0 dB (value 20, encoded as 0x14)
- **String Distances** (0x11-0x16): 11, 13, 14.5, 13.5, 15.5, 17.5 mm
  - Raw bytes: `02 06 09 07 0B 0F` (values × 0.5 mm)
- **String Sensitivities** (0x17-0x1c): 70, 43, 43, 50, 40, 10
  - Raw bytes: `46 2B 2B 32 28 0A`

## Correct Field Map (Guitar Mode)

Based on Roland GR-55 MIDI Implementation spec:

| Offset        | Bytes | Field Name           | Type        | Range          | Description                   |
| ------------- | ----- | -------------------- | ----------- | -------------- | ----------------------------- |
| 0x00-0x07     | 8     | name                 | AsciiString | -              | GK Set Name                   |
| 0x08          | 1     | puType               | Enum        | 0-7            | GK-3, GK-2A, etc.             |
| **0x09-0x0a** | **2** | **scale**            | **2-byte**  | 500-660        | Fretboard scale length        |
| 0x0b          | 1     | puPhase              | Enum        | 0-1            | Normal/Inverse                |
| 0x0c          | 1     | puDirection          | Enum        | 0-1            | Normal/Reverse                |
| 0x0d          | 1     | s1s2Pos              | Enum        | 0-1            | Normal/Reverse                |
| **0x0e**      | 1     | **normalPuGain**     | UByte       | -20 to +20 dB  | Normal PU Gain                |
| **0x0f**      | 1     | **piezoLow**         | UByte       | 0-20           | Piezo Low                     |
| **0x10**      | 1     | **piezoHigh**        | UByte       | 0-20           | Piezo High                    |
| 0x11          | 1     | string1Dist          | UByte       | 0-100 (×0.5mm) | String 1 Distance             |
| 0x12          | 1     | string2Dist          | UByte       | 0-100 (×0.5mm) | String 2 Distance             |
| 0x13          | 1     | string3Dist          | UByte       | 0-100 (×0.5mm) | String 3 Distance             |
| 0x14          | 1     | string4Dist          | UByte       | 0-100 (×0.5mm) | String 4 Distance             |
| 0x15          | 1     | string5Dist          | UByte       | 0-100 (×0.5mm) | String 5 Distance             |
| 0x16          | 1     | string6Dist          | UByte       | 0-100 (×0.5mm) | String 6 Distance             |
| 0x17          | 1     | string1Sens          | UByte       | 0-100          | String 1 Sensitivity          |
| 0x18          | 1     | string2Sens          | UByte       | 0-100          | String 2 Sensitivity          |
| 0x19          | 1     | string3Sens          | UByte       | 0-100          | String 3 Sensitivity          |
| 0x1a          | 1     | string4Sens          | UByte       | 0-100          | String 4 Sensitivity          |
| 0x1b          | 1     | string5Sens          | UByte       | 0-100          | String 5 Sensitivity          |
| 0x1c          | 1     | string6Sens          | UByte       | 0-100          | String 6 Sensitivity          |
| **0x1d**      | 1     | **velocityDynamics** | UByte       | 0-4            | Velocity Dynamics             |
| **0x1e**      | 1     | **velocityLowCut**   | UByte       | 0-10           | Velocity Low Cut              |
| **0x1f**      | 1     | **pcmVelocitySens**  | UByte       | 0-5            | PCM Velocity Sens             |
| **0x20**      | 1     | **nuanceDynamics**   | UByte       | 0-10           | Nuance Dynamics               |
| **0x21**      | 1     | **nuanceTrim**       | UByte       | 0-10           | Nuance Trim                   |
| **0x22**      | 1     | **downTuning**       | UByte       | 0-5            | Down Tuning                   |
| 0x23-0x52     | 48    | (Bass mode fields)   | -           | -              | Reserved/Bass mode (deferred) |

**Total Guitar mode fields:** 0x00-0x22 (35 bytes)  
**Total structure size:** 80 bytes (includes Bass mode + reserved)

## Implementation Tasks

### Task 1: Update Field Offsets

**File:** `src/lib/roland-gr55/RolandGR55AddressMap.ts` (lines ~4673-4720)

**Changes:**

1. Change `scale` field to 2-byte field at offset 0x09
2. Update `puPhase` offset: `0x0a` → `0x0b`
3. Update `puDirection` offset: `0x0b` → `0x0c`
4. Update `s1s2Pos` offset: `0x0c` → `0x0d`
5. Move `normalPuGain` from `0x1f` to `0x0e` (place right after s1s2Pos)
6. Add `piezoLow` at offset `0x0f`
7. Add `piezoHigh` at offset `0x10`
8. Update `string1Dist` through `string6Dist` offsets: `0x0d-0x12` → `0x11-0x16`
9. Update `string1Sens` through `string6Sens` offsets: `0x13-0x18` → `0x17-0x1c`

### Task 2: Add Missing Fields

**File:** `src/lib/roland-gr55/RolandGR55AddressMap.ts` (after string6Sens)

Add 6 new fields:

```typescript
velocityDynamics: new FieldDefinition(pack7(0x1d), "Velocity Dynamics", new UByteField(0, 4)),
velocityLowCut: new FieldDefinition(pack7(0x1e), "Velocity Low Cut", new UByteField(0, 10)),
pcmVelocitySens: new FieldDefinition(pack7(0x1f), "PCM Velocity Sens", new UByteField(0, 5)),
nuanceDynamics: new FieldDefinition(pack7(0x20), "Nuance Dynamics", new UByteField(0, 10)),
nuanceTrim: new FieldDefinition(pack7(0x21), "Nuance Trim", new UByteField(0, 10)),
downTuning: new FieldDefinition(pack7(0x22), "Down Tuning", new UByteField(0, 5)),
```

### Task 3: Create Validation Test

**File:** `__tests__/GKSet1Parsing.test.ts` (new file)

**Test cases:**

1. Parse real MIDI response data (80 bytes)
2. Verify `puType` decodes to 0 (GK-3)
3. Verify `normalPuGain` decodes to 0 dB
4. Verify string distances decode to [1.0, 3.0, 4.5, 3.5, 5.5, 7.5] mm
5. Verify string sensitivities decode to [70, 43, 43, 50, 40, 10]
6. Log all decoded values for manual verification

### Task 4: Update UI

**File:** `src/screens/GR55SystemScreen.tsx`

**Add section:**

- "GK Set 1 (Guitar Mode)" with fields:
  - Name (text display)
  - PU Type (picker)
  - Scale (numeric display)
  - Normal PU Gain (slider)
- "String Distance" subsection with 6 sliders
- "String Sensitivity" subsection with 6 sliders

**Bind to:** `GR55.system.gkSet1.*` field references

### Task 5: Verification

**Success criteria:**

- [ ] Test passes with all assertions matching validation data
- [ ] UI displays show correct values: distances 1.0-7.5mm, sensitivities 70/43/43/50/40/10
- [ ] No console errors when loading system data
- [ ] All new fields accessible in UI

## Out of Scope (Phase 1)

- Bass mode fields (0x23-0x52) - defer to Phase 2
- GK Sets 2-10 - will work automatically once Set 1 is correct
- System Common and CTL parsing - separate from GK Set parsing
- Scale field enum mapping ("LP", "ST", etc.) - display numeric value for now

## Notes

- GK Sets 2-10 all reference the same `SystemGkGuitarStruct`, so fixing Set 1 fixes all
- 80-byte response includes both Guitar mode (0x00-0x22) and Bass mode (0x23-0x52) data
- Constraint: Do NOT send any SysEx update messages to hardware during testing

---

**End of Plan Document**
