# Common Patch Parameters

This document provides a detailed list of the "Common" patch parameters for the Roland GR-55. These parameters are part of every patch and control the overall behavior of the patch, including its name, controller assignments, and master settings.

The `common` parameter block is located at the base address of a patch (offset `0x000000`).

## Common Patch Parameter Example

F0 41 10 00 00 53 12 18 00 00 00 00 45 4A 20 4C 65 61 64 20 20 20 20 20 20 20 20 20 01 06 00 00 01 01 01 01 00 00 00 00 01 00 00 01 01 00 00 18 01 01 01 00 7F 01 01 01 01 01 01 00 64 00 64 00 64 03 01 01 00 00 24 00 01 00 00 7F 01 01 01 01 01 01 00 64 00 64 00 64 00 00 00 00 00 00 01 00 00 00 01 01 00 00 00 01 01 01 01 18 01 01 01 00 7F 01 01 01 01 01 01 00 64 00 64 00 64 00 00 00 00 00 01 01 00 00 00 00 01 00 00 00 00 00 00 01 01 00 00 00 00 01 00 01 00 08 0F 04 00 00 04 00 03 06 01 00 7F 00 32 00 28 02 01 00 08 0F 04 00 00 04 00 01 07 01 00 7F 00 32 00 28 02 00 00 00 00 04 00 00 04 00 01 00 01 00 7F 00 32 00 28 02 00 00 00 00 04 00 00 04 00 01 00 01 00 7F 00 32 00 28 02 00 00 00 00 04 00 00 04 00 01 00 01 00 7F 00 32 00 28 02 00 00 00 00 04 00 00 00 00 00 00 01 00 7F 00 32 00 28 02 00 00 00 00 04 00 00 04 00 01 00 01 00 7F 00 32 00 28 02 00 00 00 00 04 00 00 04 00 01 00 01 00 7F 00 32 00 28 02 00 01 00 00 01 03 04 00 01 01 01 00 06 04 00 32 00 00 40 40 40 40 40 40 07 08 64 64 64 64 00 64 00 64 00 64 00 00 00 00 00 00 20 F7

### Address packing and field extraction

**CRITICAL: Address offsets are NOT simple byte indices!**

Roland SysEx addresses and returned DT1 `valueBytes` use 7-bit packed bytes. However, the address offset calculation does NOT translate directly to byte positions in a simple 1:1 manner. Multiple fields with different address offsets can map to the same byte, with bit-level packing used to store multiple parameters in a single byte.

#### Address-to-Byte-Index Calculation

To compute the index into the DT1 `valueBytes` for a given address offset:

1. Convert the address offset (e.g. `0x0232`) into the protocol address (commonly 3 address bytes for GR-55 maps).
2. Pack that address into 7-bit bytes (use the codebase `pack7` helper). The packed numeric value represents the protocol address used in messages.
3. Compute the zero-based byte index into `valueBytes` as:

   ```
   index = unpack7(pack7(offsetAddr)) - unpack7(pack7(baseAddr))
   ```

Where `baseAddr` is the DT1 message's base address and `index` is the byte offset into the DT1 `valueBytes` array.

**Important**: Multiple address offsets can map to the same `index` value. When this happens, the fields are bit-packed into the same byte.

#### Field Decoding Rules

Once you have the `index`, decode based on the field type. Note that fields sharing the same byte index must be extracted using bit masks:

**Single-byte fields (when index is unique):**

- `BooleanField`: one byte at `valueBytes[index]`, value = `valueBytes[index] & 0x01` (0 or 1).
- `UByteField`: one 7-bit byte at `valueBytes[index]`, value = `valueBytes[index] & 0x7F` (0..127).

**Multi-byte fields:**

- `USplit8Field`: two bytes; use the low 4 bits of each byte:
  - low = `valueBytes[index] & 0x0F`
  - high = `valueBytes[index+1] & 0x0F`
  - value = (high << 4) | low
- `USplit12Field`: three bytes; assemble from low nibble of each:
  - l0 = `valueBytes[index] & 0x0F`
  - l1 = `valueBytes[index+1] & 0x0F`
  - l2 = `valueBytes[index+2] & 0x0F`
  - value = (l2 << 8) | (l1 << 4) | l0

**Bit-packed fields (when multiple fields share the same byte):**

When address offsets map to the same byte index, fields are packed into bits. The exact bit positions depend on the field definitions. Common patterns:

- **1-bit boolean fields**: Typically use bit 0 (LSB) or bit 7 (MSB)
- **7-bit numeric fields**: Typically use bits 0-6 or bits 1-7
- **4-bit fields**: Use a nibble (4 bits), either low (0-3) or high (4-7)
- **2-bit fields**: Use 2 consecutive bits

**Example: Normal PU Mute and Level**

The `normalPuMute` (offset `0x0232`) and `normalPuLevel` (offset `0x0233`) both map to the same byte index in the valueBytes array. In the example message, this is the second-to-last byte before `F7`:

- When Level=50 and Mute=ON: byte value = `0x20` (00100000 binary)
- When Level=50 and Mute=OFF: byte value = `0x1F` (00011111 binary)

The difference of 1 indicates the Mute field uses bit 0. The Level field uses the remaining 7 bits (bits 1-7 or bits 0-6, depending on encoding).

**Decoding pattern:**

```swift
let byte = valueBytes[index]
let mute = (byte & 0x01) != 0  // Bit 0
let level = (byte >> 1) & 0x7F  // Bits 1-7, or
// OR
let level = byte & 0x7E  // Bits 1-7 (if Mute is bit 0)
```

The exact bit positions must be determined empirically by testing different values, as Roland's documentation does not specify the bit layout for packed fields.

Apply any field-specific remapping (offsets, scaling) after extracting the raw integer.

#### Swift 6.2 Decoding Functions

```swift
// Unpack 7-bit bytes to numeric value (for address calculation)
func unpack7(_ bytes: [UInt8]) -> Int {
    var value = 0
    for b in bytes { value = (value << 7) | Int(b & 0x7F) }
    return value
}

// Pack numeric value into 7-bit bytes (for address calculation)
func pack7(_ value: Int) -> [UInt8] {
    var result: [UInt8] = []
    var v = value
    repeat {
        result.append(UInt8(v & 0x7F))
        v >>= 7
    } while v > 0
    return result.reversed()
}

// Calculate byte index from address offset
// Note: This requires pack7/unpack7 implementations that work with the packed address format
// The actual implementation depends on how pack7/unpack7 are implemented in your codebase
func addressToIndex(offsetAddr: Int, baseAddr: Int) -> Int {
    // This is a simplified version - actual implementation depends on pack7/unpack7 details
    // In practice, you'd use the actual pack7/unpack7 functions from your codebase
    return offsetAddr - baseAddr  // Simplified - actual calculation uses pack7/unpack7
}

// Read USplit12Field from valueBytes (3 bytes, low nibble each)
func readUSplit12(_ valueBytes: [UInt8], index: Int) -> Int {
    let b0 = Int(valueBytes[index] & 0x0F)
    let b1 = Int(valueBytes[index + 1] & 0x0F)
    let b2 = Int(valueBytes[index + 2] & 0x0F)
    return (b2 << 8) | (b1 << 4) | b0
}

// Read USplit8Field from valueBytes (2 bytes, low nibble each)
func readUSplit8(_ valueBytes: [UInt8], index: Int) -> Int {
    let low = Int(valueBytes[index] & 0x0F)
    let high = Int(valueBytes[index + 1] & 0x0F)
    return (high << 4) | low
}

// Read UByte (7-bit value)
func readUByte(_ valueBytes: [UInt8], index: Int) -> Int {
    return Int(valueBytes[index] & 0x7F)
}

// Read Boolean (1-bit, typically bit 0)
func readBool(_ valueBytes: [UInt8], index: Int) -> Bool {
    return (valueBytes[index] & 0x01) != 0
}

// Read Boolean from specific bit position
func readBool(_ valueBytes: [UInt8], index: Int, bitPosition: Int) -> Bool {
    return (valueBytes[index] & (1 << bitPosition)) != 0
}

// Read multi-bit field (n bits starting at bit position)
func readBits(_ valueBytes: [UInt8], index: Int, bitPosition: Int, bitCount: Int) -> Int {
    let mask = ((1 << bitCount) - 1) << bitPosition
    return Int((valueBytes[index] & UInt8(mask)) >> bitPosition)
}
```

#### Bit-Packed Field Extraction Examples

When multiple fields share the same byte, you must extract them using bit masks. Here are common patterns:

**Pattern 1: Boolean (1 bit) + 7-bit value in same byte**

Example: Normal PU Mute (bit 0) + Normal PU Level (bits 1-7)

```swift
func readNormalPuMuteAndLevel(_ valueBytes: [UInt8], index: Int) -> (mute: Bool, level: Int) {
    let byte = valueBytes[index]
    let mute = (byte & 0x01) != 0  // Bit 0: Mute (inverted: true = MUTE)
    let level = Int((byte >> 1) & 0x7F)  // Bits 1-7: Level (0-100)
    return (mute: mute, level: level)
}

// Encoding (when writing back):
func encodeNormalPuMuteAndLevel(mute: Bool, level: Int) -> UInt8 {
    let levelClamped = max(0, min(100, level))
    let muteBit: UInt8 = mute ? 0x01 : 0x00
    let levelBits = UInt8(levelClamped) << 1
    return levelBits | muteBit
}
```

**Pattern 2: Multiple 1-bit booleans in same byte**

When multiple boolean fields share a byte, each uses a different bit position:

```swift
func readMultipleBooleans(_ valueBytes: [UInt8], index: Int) -> (field1: Bool, field2: Bool, field3: Bool) {
    let byte = valueBytes[index]
    let field1 = (byte & 0x01) != 0  // Bit 0
    let field2 = (byte & 0x02) != 0  // Bit 1
    let field3 = (byte & 0x04) != 0  // Bit 2
    return (field1: field1, field2: field2, field3: field3)
}
```

**Pattern 3: 4-bit fields (nibbles)**

Some fields use 4 bits (a nibble), either low (0-3) or high (4-7):

```swift
func readNibbleFields(_ valueBytes: [UInt8], index: Int) -> (low: Int, high: Int) {
    let byte = valueBytes[index]
    let low = Int(byte & 0x0F)   // Bits 0-3
    let high = Int((byte >> 4) & 0x0F)  // Bits 4-7
    return (low: low, high: high)
}
```

**Pattern 4: 2-bit fields**

Some fields use 2 bits for 4 possible values:

```swift
func read2BitField(_ valueBytes: [UInt8], index: Int, bitPosition: Int) -> Int {
    return Int((valueBytes[index] >> bitPosition) & 0x03)  // 2 bits = 0-3
}
```

#### Determining Bit Positions Empirically

Since Roland's documentation doesn't specify bit layouts for packed fields, you must determine them by:

1. **Testing known values**: Set a field to a known value and observe the byte changes
2. **Bit difference analysis**: Compare byte values when only one field changes
3. **Range testing**: Test minimum and maximum values for each field
4. **Cross-validation**: Verify with multiple test cases

**Example analysis for Normal PU Mute and Level:**

- Level=50, Mute=ON → byte = `0x20` (00100000)
- Level=50, Mute=OFF → byte = `0x1F` (00011111)
- Difference = 1 → Mute uses bit 0
- Level=50 = 0x32, but byte shows 0x20 or 0x1F
- Testing Level=0, Mute=OFF → byte = `0x00` → confirms Level uses bits 1-7
- Level = (byte >> 1) & 0x7F = (0x20 >> 1) & 0x7F = 0x10 = 16? (Doesn't match 50)

**Note**: The actual encoding may use a different mapping. The Level value of 50 might be encoded differently (e.g., using a different bit range, or with an offset). Always verify with actual device responses.

#### Important Notes on Address Mapping

1. **Address offsets are NOT byte indices**: Multiple address offsets can map to the same byte index in the `valueBytes` array. When this happens, fields are bit-packed into the same byte.

2. **Use repository helpers**: Use the repository `pack7`/`unpack7` helpers for address math to match existing code exactly. These functions handle the 7-bit packing/unpacking required by Roland's SysEx protocol.

3. **Address sizes vary**: Address sizes vary (3 vs 4 bytes) — use the addressing length consistent with the message/map you are handling.

4. **Field size vs. storage size**: A field's logical size (as defined in the address map) does not necessarily equal its storage size. For example:

   - A `BooleanField` logically uses 1 bit, but may be stored in a byte with other fields
   - A `UByteField` logically uses 7 bits, but may share a byte with a 1-bit boolean
   - Multiple fields can share the same byte using bit-level packing

5. **After extraction, apply remapping**: After extracting raw values, apply any mapping (offset/scale) defined by the field definition.

#### Complete Example: Normal PU Mute and Level

Given the hex message ending with `... 00 00 00 00 00 00 20 F7`:

1. **Message structure**: The message is 347 bytes total (including `F7`). The `valueBytes` array excludes the SysEx header, address bytes, checksum, and `F7` terminator.

2. **Address calculation**:

   - `normalPuMute` has offset `0x0232`
   - `normalPuLevel` has offset `0x0233`
   - Both map to the same byte index (the second-to-last byte in valueBytes)

3. **Byte value analysis**:

   - When Level=50, Mute=ON: byte = `0x20` = `00100000` binary
   - When Level=50, Mute=OFF: byte = `0x1F` = `00011111` binary
   - The difference of 1 indicates Mute uses bit 0

4. **Extraction** (example - actual bit positions need verification):

   ```swift
   let byte = valueBytes[index]  // The shared byte
   let mute = (byte & 0x01) != 0  // Extract bit 0
   let level = Int((byte >> 1) & 0x7F)  // Extract bits 1-7
   ```

5. **Verification needed**: The exact bit positions and encoding for Level must be verified by testing different Level values (0, 50, 100) and observing the byte changes.

**Note on encoding discrepancy**: In the example, Level=50 but the byte shows `0x20` (32 decimal) or `0x1F` (31 decimal). This suggests the Level value may be:

- Encoded with an offset (e.g., Level = (byte_value >> 1) + offset)
- Stored in a different bit range than expected
- Using a non-linear encoding (e.g., logarithmic scale)
- The Level value of 50 might actually be stored as a different representation

To resolve this, test with known values:

- Set Level=0, Mute=OFF → observe byte value
- Set Level=0, Mute=ON → observe byte value
- Set Level=100, Mute=OFF → observe byte value
- Set Level=100, Mute=ON → observe byte value
- Set Level=50, Mute=OFF → observe byte value (should be 0x1F based on example)
- Set Level=50, Mute=ON → observe byte value (should be 0x20 based on example)

From these tests, derive the exact encoding formula.

#### Field Type Summary

The application uses different field types with various bit sizes:

- **1-bit fields**: Boolean values (on/off)
- **2-bit fields**: 4 possible values (0-3)
- **4-bit fields**: 16 possible values (0-15), often used in split fields
- **7-bit fields**: 128 possible values (0-127), standard for most numeric parameters
- **14-bit fields**: 16384 possible values (0-16383), used for larger ranges (e.g., `USplit12Field` for values 0-200 or higher)

When multiple fields share a byte, their bit positions must be determined empirically by testing different combinations of values.

## Parameter List

### `patchAttribute`

- **Description**: Patch Attribute
- **Address Offset**: `0x0000`
- **Data Type**: `BooleanField`
- **Logic**: A boolean value that determines if the patch is a "GUITAR" or "BASS" patch.
  - `0`: GUITAR
  - `1`: BASS

### `patchName`

- **Description**: Patch Name
- **Address Offset**: `0x0001`
- **Data Type**: `AsciiStringField(16)`
- **Logic**: A 16-byte ASCII string for the patch name.

---

### `ctl` Struct (CTL Pedal Settings)

- **Base Address Offset**: `0x0011`

| Parameter               | Description                  | Address Offset | Data Type      | Logic                                                                          |
| ----------------------- | ---------------------------- | -------------- | -------------- | ------------------------------------------------------------------------------ |
| `status`                | CTL Status                   | `0x0000`       | `BooleanField` | "OFF" / "ON"                                                                   |
| `function`              | CTL Function                 | `0x0001`       | `EnumField`    | The function assigned to the CTL pedal (e.g., "HOLD", "TAP TEMPO", "TONE SW"). |
| `holdType`              | CTL Hold Type                | `0x0002`       | `EnumField`    | Type of hold ("1", "2", "3", "4").                                             |
| `holdSwitchMode`        | CTL Hold Switch Mode         | `0x0003`       | `EnumField`    | "LATCH" or "MOMENT"                                                            |
| `holdPcmTone1`          | CTL Hold PCM Tone1           | `0x0004`       | `BooleanField` | "OFF" / "ON"                                                                   |
| `holdPcmTone2`          | CTL Hold PCM Tone2           | `0x0005`       | `BooleanField` | "OFF" / "ON"                                                                   |
| `offPcmTone1Switch`     | CTL=OFF PCM Tone1 Switch     | `0x0006`       | `BooleanField` | "OFF" / "ON"                                                                   |
| `offPcmTone2Switch`     | CTL=OFF PCM Tone2 Switch     | `0x0007`       | `BooleanField` | "OFF" / "ON"                                                                   |
| `offModelingToneSwitch` | CTL=OFF Modeling Tone Switch | `0x0008`       | `BooleanField` | "OFF" / "ON"                                                                   |
| `offNormalPuSwitch`     | CTL=OFF Normal PU Switch     | `0x0009`       | `BooleanField` | "OFF" / "ON"                                                                   |
| `onPcmTone1Switch`      | CTL=ON PCM Tone1 Switch      | `0x000A`       | `BooleanField` | "OFF" / "ON"                                                                   |
| `onPcmTone2Switch`      | CTL=ON PCM Tone2 Switch      | `0x000B`       | `BooleanField` | "OFF" / "ON"                                                                   |
| `onModelingToneSwitch`  | CTL=ON Modeling Tone Switch  | `0x000C`       | `BooleanField` | "OFF" / "ON"                                                                   |
| `onNormalPuSwitch`      | CTL=ON Normal PU Switch      | `0x000D`       | `BooleanField` | "OFF" / "ON"                                                                   |

---

### `expPdlOff` / `expPdlOn` / `gkVol` Structs (Expression Pedal & GK Volume Settings)

- **Base Address Offsets**: `0x001f` (EXP PDL OFF), `0x0036` (EXP PDL ON), `0x005b` (GK VOL)
- These three structs share the same internal structure to define the behavior of the expression pedal (when the EXP SW is off or on) and the GK volume knob.

| Parameter                | Description            | Address Offset         | Data Type      | Logic                                                                               |
| ------------------------ | ---------------------- | ---------------------- | -------------- | ----------------------------------------------------------------------------------- |
| `function`               | Function               | `0x0000`               | `EnumField`    | The function assigned (e.g., "PATCH VOLUME", "PITCH BEND", "MODULATION").           |
| `volumeSwitch...`        | Volume Switch ...      | `+0x0001` to `+0x0004` | `BooleanField` | Individual on/off switches for each tone source when the function is "TONE VOLUME". |
| `bendRange`              | Bend Range             | `+0x0005`              | `UByteField`   | The pitch bend range from -12 to +12 semitones.                                     |
| `bendSwitch...`          | Bend Switch ...        | `+0x0006` to `+0x0008` | `BooleanField` | Individual on/off switches for each tone source when the function is "PITCH BEND".  |
| `modulationMin` / `Max`  | Modulation Min / Max   | `+0x0009`, `+0x000A`   | `C127Field`    | Min/max values for the modulation depth.                                            |
| `modulationSwitch...`    | Modulation Switch ...  | `+0x000B`, `+0x000C`   | `BooleanField` | Individual on/off switches for PCM tones when the function is "MODULATION".         |
| `xfadePolarity...`       | X-Fade Polarity ...    | `+0x000D` to `+0x0010` | `EnumField`    | The crossfade polarity ("OFF", "TOE", "HEEL") for each tone source.                 |
| `delayLevelMin` / `Max`  | Delay Level Min / Max  | `+0x0011`, `+0x0012`   | `UByteField`   | Min/max values for the delay level.                                                 |
| `reverbLevelMin` / `Max` | Reverb Level Min / Max | `+0x0013`, `+0x0014`   | `UByteField`   | Min/max values for the reverb level.                                                |
| `chorusLevelMin` / `Max` | Chorus Level Min / Max | `+0x0015`, `+0x0016`   | `UByteField`   | Min/max values for the chorus level.                                                |

---

### `expSw`, `gkS1`, `gkS2` Structs (EXP, GK S1/S2 Switch Settings)

- **Base Address Offsets**: `0x004d` (EXP SW), `0x0072` (GK S1), `0x007f` (GK S2)
- These structs define the behavior of the EXP, GK S1, and GK S2 switches.

| Parameter      | Description    | Address Offset         | Data Type      | Logic                                                                         |
| -------------- | -------------- | ---------------------- | -------------- | ----------------------------------------------------------------------------- |
| `status`       | Status         | `0x0000`               | `BooleanField` | "OFF" / "ON" (EXP SW only)                                                    |
| `function`     | Function       | `+0x0001`              | `EnumField`    | The function assigned to the switch (e.g., "TAP TEMPO", "TONE SW", "AMP SW"). |
| `off...Switch` | OFF ... Switch | `+0x0006` to `+0x0009` | `BooleanField` | Which tone sources are active when the switch is OFF.                         |
| `on...Switch`  | ON ... Switch  | `+0x000A` to `+0x000D` | `BooleanField` | Which tone sources are active when the switch is ON.                          |

---

### `assign` Structs (Assignable Controller Settings)

- **Base Address Offsets**: `0x010c` to `0x0211` (8 assign slots)
- These 8 structs define the 8 user-assignable controllers.

| Parameter              | Description                 | Address Offset       | Data Type       | Logic                                                                                                                      |
| ---------------------- | --------------------------- | -------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `switch`               | ASSIGN Switch               | `0x0000`             | `BooleanField`  | "OFF" / "ON"                                                                                                               |
| `target`               | ASSIGN Target               | `+0x0001`            | `USplit12Field` | The parameter that this assign will control. This is a number that is mapped to a human-readable name by the `AssignsMap`. |
| `targetMin` / `Max`    | ASSIGN Target Min / Max     | `+0x0004`, `+0x0007` | `USplit12Field` | The minimum and maximum values of the target parameter.                                                                    |
| `source`               | ASSIGN Source               | `+0x000A`            | `EnumField`     | The controller that will be used (e.g., "CTL", "EXP PEDAL", "WAVE PDL", "CC1").                                            |
| `sourceMode`           | ASSIGN Source Mode          | `+0x000B`            | `EnumField`     | "MOMENT" or "TOGGLE"                                                                                                       |
| `activeRangeLo` / `Hi` | ASSIGN Active Range Lo / Hi | `+0x000C`, `+0x000D` | `UByteField`    | The active range of the source controller.                                                                                 |
| ...                    | ...                         | ...                  | ...             | ...                                                                                                                        |

---

### Other Common Parameters

| Parameter            | Description                | Address Offset       | Data Type      | Logic                                                                      |
| -------------------- | -------------------------- | -------------------- | -------------- | -------------------------------------------------------------------------- |
| `gkSet`              | GK SET                     | `0x0224`             | `EnumField`    | Selects which of the 10 GK Sets to use ("SYSTEM" or "1"-"10").             |
| `guitarOutSource`    | Guitar Out Source          | `0x0225`             | `EnumField`    | The source for the guitar output ("NORMAL PU", "MODELING", "BOTH", "OFF"). |
| ...                  | V-LINK Parameters          | `0x0226` to `0x022b` | `...`          | V-LINK settings for video control.                                         |
| `effectStructure`    | EFFECT Structure           | `0x022c`             | `EnumField`    | The signal chain structure ("1" or "2").                                   |
| `lineSelectModel`    | Line Select Model          | `0x022d`             | `EnumField`    | The output for the modeling tone ("BYPS", "AMP", "MFX").                   |
| `lineSelectNormalPU` | Line Select Normal PU      | `0x022e`             | `EnumField`    | The output for the normal pickup ("BYPS", "AMP", "MFX").                   |
| `patchLevel`         | Patch Level                | `0x0230`             | `USplit8Field` | The master level for the patch (0-100).                                    |
| `normalPuMute`       | Normal PU Mute             | `0x0232`             | `BooleanField` | Mutes the normal pickup signal.                                            |
| `normalPuLevel`      | Normal PU Level            | `0x0233`             | `UByteField`   | The level of the normal pickup (0-100).                                    |
| `altTuneSwitch`      | Alt Tune Switch            | `0x0234`             | `BooleanField` | Enables or disables alternate tuning.                                      |
| `altTuneType`        | Alt Tune Type              | `0x0235`             | `EnumField`    | The type of alternate tuning (e.g., "OPEN-D", "DROP-D", "USER").           |
| ...                  | User Tune Shift String 1-6 | `0x0236` to `0x023b` | `UByteField`   | Pitch shift for each string in user tuning mode.                           |
| `patchTempo`         | Patch Tempo                | `0x023c`             | `USplit8Field` | The tempo for the patch (20-250 bpm).                                      |
| ...                  | Send Levels                | `0x023e` to `0x0240` | `UByteField`   | Send levels to chorus, delay, and reverb from the bypass signal.           |
| ...                  | MOD CONTROL Min/Max        | `0x0242` to `0x0247` | `UByteField`   | Min/max values for the "MOD CONTROL" function of the expression pedals.    |
