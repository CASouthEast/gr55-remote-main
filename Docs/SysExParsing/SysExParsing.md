# GR-55 SysEx Parsing Guide

This document details how to parse Roland GR-55 System Exclusive (SysEx) messages. It is intended to guide the implementation of parsing logic in a JavaScript/TypeScript environment.

## 1. SysEx Message Structure

A standard Roland GR-55 SysEx message follows this format:

```
F0 41 10 00 00 53 12 [Address] [Data] [Checksum] F7
```

| Component        | Length  | Description                                                                        |
| ---------------- | ------- | ---------------------------------------------------------------------------------- |
| **SOX**          | 1 byte  | `F0` (Start of Exclusive)                                                          |
| **Manufacturer** | 1 byte  | `41` (Roland)                                                                      |
| **Device ID**    | 1 byte  | `10` (Default, configurable)                                                       |
| **Model ID**     | 4 bytes | `00 00 53` (GR-55)                                                                 |
| **Command**      | 1 byte  | `12` (DT1 - Data Set) or `11` (RQ1 - Request Data)                                 |
| **Address**      | 4 bytes | The starting address of the data (BIG Endian). **NOT** 7-bit packed in the header. |
| **Data**         | N bytes | The payload. **IS** 7-bit packed (each byte 0x00-0x7F).                            |
| **Checksum**     | 1 byte  | Validation checksum.                                                               |
| **EOX**          | 1 byte  | `F7` (End of Exclusive)                                                            |

### 1.1 Address & Offset Calculation

The **Address** in the header defines where the **Data** block starts in the device's memory map.

To map a specific parameter to the data bytes:

1.  **Base Address**: The starting address from the SysEx Header.
2.  **Parameter Address**: The absolute address of the parameter (defined in JSON).
3.  **Byte Index**: `Parameter Address - Base Address`.

> **Note**: For "Common" patches and most bulk dumps, the Base Address is usually `18 00 00 00` (Temporary Patch) or similar. If the Base Address is `00 00 00 00` (relative), the Offset equals the Byte Index.

---

## 2. Data Types & Extraction Logic

GR-55 data is 7-bit packed standard MIDI, but specific fields often span multiple bytes using nibble-packing.

### 2.1 Standard 7-bit Byte (`UByte`, `value`)

A single byte value ranging from 0-127.

- **Size**: 1 Byte
- **Range**: 0-127 (0x00 - 0x7F)
- **Extraction**:
  ```javascript
  const value = dataBytes[index] & 0x7f;
  ```

### 2.2 Split 8-bit (`USplit8`)

A value usually up to 255 spread across 2 bytes (Lower 4 bits of each byte).

- **Size**: 2 Bytes
- **Range**: 0-255
- **Format**: `[0000 HHHH] [0000 LLLL]` (High Nibble, Low Nibble)
- **Extraction**:
  ```javascript
  const low = dataBytes[index] & 0x0f;
  const high = dataBytes[index + 1] & 0x0f;
  const value = (high << 4) | low;
  ```

### 2.3 Split 12-bit (`USplit12`)

A value up to 4095 spread across 3 bytes. Used for wider ranges (e.g. -1024 to +1023).

- **Size**: 3 Bytes
- **Range**: 0-4095
- **Format**: `[0000 LLLL] [0000 MMMM] [0000 HHHH]` (Note: Little Endian nibble order in some contexts, but check implementation below)
- **Swift Implementation (Big Endian of nibbles in sequence)**:
  - `l0` = byte[index]
  - `l1` = byte[index+1]
  - `l2` = byte[index+2]
  - `value = (l2 << 8) | (l1 << 4) | l0`
- **Extraction**:
  ```javascript
  const l0 = dataBytes[index] & 0x0f;
  const l1 = dataBytes[index + 1] & 0x0f;
  const l2 = dataBytes[index + 2] & 0x0f;
  const value = (l2 << 8) | (l1 << 4) | l0;
  ```
- **Signed Handling**: If the range is e.g. -2048 to 2047, you may need to interpret the 12-bit result as signed (2's complement or offset).
  - _Example_: `if (value > 2047) value -= 4096;` (Check specific parameter range).

### 2.4 Assign Target Key (Special 3-Byte)

Used for Assign Targets (Mappings).

- **Size**: 3 Bytes
- **Format**:
  - Byte 0: Level 1 Category (0, 1, 2...)
  - Byte 1: High nibble of Level 2
  - Byte 2: Low nibble of Level 2
- **Extraction**:

  ```javascript
  const level1 = dataBytes[index] & 0x0f;
  const hex1 = dataBytes[index + 1] & 0x0f;
  const hex2 = dataBytes[index + 2] & 0x0f;
  const level2 = (hex1 << 4) | hex2;

  // Result often formatted as string: "00-7F"
  const key = `${level1.toString(16).padStart(2, "0").toUpperCase()}-${level2
    .toString(16)
    .padStart(2, "0")
    .toUpperCase()}`;
  ```

### 2.5 Boolean / Bit Flags

Single bits packed into a byte.

- **Extraction**:
  ```javascript
  const bitPosition = 0; // 0-7
  const isSet = (dataBytes[index] & (1 << bitPosition)) !== 0;
  ```

---

## 3. Parameter Mapping (JSON to Logic)

The project uses JSON files (e.g., `Patch_Assigns.json`) to define parameters. Here is how to map them.

### JSON Field Definitions

```json
{
  "name": "ASSIGN1 Target Min",
  "address": "90",
  "type": "value",
  "range": { "min": -1024, "max": 1023 },
  "length": 3
}
```

### Mapping Rules

1.  **Address**:

    - The `address` field in JSON is usually a hex offset relative to the block start.
    - `parseInt("90", 16)` = Offset 144.

2.  **Type Determination**:

    - **`length: 3`** + **`type: "value"`**: Usually implies **`USplit12`**.
    - **`length: 2`** + **`type: "value"`**: Usually implies **`USplit8`**.
    - **`length: 1` (or undefined)** + **`type: "value"`**: Standard **`UByte`**.
    - **`type: "options"`**: Usually **`UByte`** (1 byte), index maps to the option list value.

3.  **Special Cases (By Name)**:
    - If name contains `"Target"` (and len=3): Use **Assign Target Key** extraction.
    - If name contains `"Target Min"` or `"Target Max"`: Use **`USplit12`** and apply signed correction if range implies it logic.

### JavaScript Implementation Strategy

```javascript
function parseParameter(paramDef, dataBuffer, baseAddress) {
  const offset = parseInt(paramDef.address, 16);
  // If working with a full SysEx dump, calculate absolute index
  // If working with a data chunk, offset might be direct
  const index = offset;

  let value;

  if (paramDef.length === 3) {
    if (
      paramDef.name.includes("Target") &&
      !paramDef.name.includes("Min") &&
      !paramDef.name.includes("Max")
    ) {
      value = extractAssignTargetKey(dataBuffer, index);
    } else {
      value = extractUSplit12(dataBuffer, index);
      // Handle Signed values
      if (paramDef.range.min < 0) {
        // 12-bit signed conversion example
        if (value > 2047) value -= 4096; // or similar based on specific bit-width
      }
    }
  } else if (paramDef.length === 2) {
    value = extractUSplit8(dataBuffer, index);
  } else {
    value = extractUByte(dataBuffer, index);
  }

  return value;
}
```

---

## 4. Specific Examples

### Example 1: Assign 1 Target Min

- **JSON**: `Address: 90`, `Length: 3`, `Range: -1024 to 1023`
- **Bytes**: `0E 00 00` (just an example combination)
- **Parsing**:
  1.  Read 3 bytes at Offset 0x90.
  2.  `extractUSplit12(bytes)`.
  3.  Convert to signed if needed.

### Example 2: Assign 1 Switch

- **JSON**: `Address: 8C`, `Type: Options` (Off/On)
- **Bytes**: `01`
- **Parsing**:
  1.  Read 1 byte at Offset 0x8C.
  2.  Value `0x01` corresponds to Option `01` ("ON").

---

## 5. System Parameter Reference

System data in the GR-55 is organized by **Sub-Address** (the 3rd byte of the Address).
Base Address: `02 00 00 00`

### 5.1 Sub-Address Routing Map

| Sub-Address (Hex) | Block Name        | Description                                  |
| ----------------- | ----------------- | -------------------------------------------- |
| **00**            | System Common     | Global settings (Output, MIDI, Tuner).       |
| **02**            | System CTL/Assign | Pedal functions (CTL, EXP, GK Vol/Switches). |
| **04 - 0D**       | GK Setup 1-10     | GK Pickup settings (User Sets 1-10).         |

---

### 5.2 System Common (Sub-Address `00`)

**Base Address**: `02 00 00 00`
**Offsets** are relative to this base.

| Offset | Parameter         | Type   | Range/Values                                                                                                               |
| ------ | ----------------- | ------ | -------------------------------------------------------------------------------------------------------------------------- |
| **00** | GK SET Select     | Value  | 0-9 (GK Set 1-10)                                                                                                          |
| **01** | OUTPUT Select     | Option | 0=LINE/PHONES, 1=JC-120, 2=SMALL, 3=COMBO, 4=STACK, 5=JC-120 RET, 6=COMBO RET, 7=STACK RET, 8=B-AMP Tweet, 9=B-AMP NoTweet |
| **02** | Assign Hold       | Bool   | 0=OFF, 1=ON                                                                                                                |
| **03** | Patch Ctrl Ch     | Value  | 0-15 (Ch 1-16)                                                                                                             |
| **04** | RX Switch         | Bool   | 0=OFF, 1=ON                                                                                                                |
| **05** | TX Switch         | Bool   | 0=OFF, 1=ON                                                                                                                |
| **06** | V-LINK MIDI Ch    | Value  | 0-15 (Ch 1-16)                                                                                                             |
| **07** | Gtr2Midi Sw       | Bool   | 0=OFF, 1=ON                                                                                                                |
| **08** | Gtr2Midi Mode     | Option | 0=MONO, 1=POLY                                                                                                             |
| **09** | Gtr2Midi Chromat  | Bool   | 0=OFF, 1=ON                                                                                                                |
| **0A** | Gtr2Midi StringCh | Option | 0=1-6, 1=2-7, ... 10=11-16                                                                                                 |
| **0B** | Gtr2Midi DataThin | Bool   | 0=OFF, 1=ON                                                                                                                |
| **0C** | Gtr2Midi CTL CC#  | Value  | 0-63 (OFF, 1-31, 64-95)                                                                                                    |
| **0D** | Gtr2Midi EXP CC#  | Value  | 0-63                                                                                                                       |
| **0E** | Gtr2Midi BendRng  | Value  | 0-48 (-24 to +24)                                                                                                          |
| **0F** | Gtr2Midi GKVOL CC | Value  | 0-63                                                                                                                       |
| **10** | Gtr2Midi GKS1 CC  | Value  | 0-63                                                                                                                       |
| **11** | Gtr2Midi GKS2 CC  | Value  | 0-63                                                                                                                       |
| **12** | RX MAP Select     | Option | 0=FIX, 1=PRG                                                                                                               |
| **15** | USB Dir Monitor   | Bool   | 0=OFF, 1=ON                                                                                                                |
| **16** | GtrOut Source     | Option | 0=PATCH, 1=OFF, 2=NRM PU, 3=MODEL, 4=BOTH                                                                                  |
| **17** | Tuner Pitch       | Value  | 0-10 (435-445 Hz)                                                                                                          |
| **18** | Tuner Mute Sw     | Bool   | 0=OFF, 1=ON                                                                                                                |
| **1A** | **GUITAR/BASS**   | Option | 0=GUITAR, 1=BASS (Critical: Affects GK Setup)                                                                              |
| **1C** | Audio Player Lvl  | Value  | 0-200                                                                                                                      |
| **1E** | USB Audio In Lvl  | Value  | 0-200                                                                                                                      |
| **20** | USB Audio Out Lvl | Value  | 0-200                                                                                                                      |

---

### 5.3 System Control/Assign (Sub-Address `02`)

**Base Address**: `02 00 02 00`
This block contains settings for all physical controllers.

#### **CTL Pedal (Offsets 00-0C)**

| Offset | Parameter    | Range/Values                                                                                                                           |
| ------ | ------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| **00** | Function     | 0=OFF, 1=PATCH, 2=HOLD, 3=TAP, 4=TONE SW, 5=AMP SW, 6=MOD SW, 7=MFX SW, 8=DLY SW, 9=REV SW, 10=CHO SW, ... (See System_Functions.json) |
| **01** | Hold Type    | 0-3 (1-4)                                                                                                                              |
| **02** | Hold Sw Mode | 0=LATCH, 1=MOMENT                                                                                                                      |
| **03** | Hold PCM1    | 0=OFF, 1=ON                                                                                                                            |
| **04** | Hold PCM2    | 0=OFF, 1=ON                                                                                                                            |
| **05** | OFF PCM1 Sw  | 0=OFF, 1=ON                                                                                                                            |
| **06** | OFF PCM2 Sw  | 0=OFF, 1=ON                                                                                                                            |
| **07** | OFF Model Sw | 0=OFF, 1=ON                                                                                                                            |
| **08** | OFF NrmPu Sw | 0=OFF, 1=ON                                                                                                                            |
| **09** | ON PCM1 Sw   | 0=OFF, 1=ON                                                                                                                            |
| **0A** | ON PCM2 Sw   | 0=OFF, 1=ON                                                                                                                            |
| **0B** | ON Model Sw  | 0=OFF, 1=ON                                                                                                                            |
| **0C** | ON NrmPu Sw  | 0=OFF, 1=ON                                                                                                                            |

#### **Expression Pedal OFF (Offsets 0D-23, 79-7A)**

| Offset    | Parameter             | Details                                                     |
| --------- | --------------------- | ----------------------------------------------------------- |
| **0D**    | Function              | 0=OFF, 1=PATCH, 2=PATCH VOL, 3=TONE VOL, 4=BEND, 5=MOD, ... |
| **0E-11** | Vol Sw (P1,P2,M,N)    | 4 Bytes (PCM1, PCM2, Model, Normal)                         |
| **12**    | Bend Range            | 0-24 (-12 to +12)                                           |
| **13-15** | Bend Sw (P1,P2,M)     | 3 Bytes                                                     |
| **16**    | Mod Min               | 0-127                                                       |
| **17**    | Mod Max               | 0-127                                                       |
| **18-19** | Mod Sw (P1,P2)        | 2 Bytes                                                     |
| **1A-1D** | XFade Pol (P1,P2,M,N) | 0=OFF, 1=TOE, 2=HEEL                                        |
| **1E-1F** | Delay Lvl Min/Max     | 0-127                                                       |
| **20-21** | Reverb Lvl Min/Max    | 0-127                                                       |
| **22-23** | Chorus Lvl Min/Max    | 0-127                                                       |
| ...       | ...                   | ...                                                         |
| **79**    | Mod Control Min       | 0-127                                                       |
| **7A**    | Mod Control Max       | 0-127                                                       |

#### **Expression Pedal ON (Offsets 24-3A, 7B-7C)**

Structure is identical to "Expression Pedal OFF" but offset by +0x17 (23 bytes).

- **24**: Function
- **25-28**: Vol Sw
- ...
- **7B**: Mod Control Min
- **7C**: Mod Control Max

#### **Expression Switch (Offsets 3B-47)**

| Offset    | Parameter          | Details                               |
| --------- | ------------------ | ------------------------------------- |
| **3B**    | Function           | 0=OFF, 1=PATCH, 2=TAP, 3=TONE SW, ... |
| **3C**    | Mode               | 0=LATCH, 1=MOMENT                     |
| **3D-40** | OFF Sw (P1,P2,M,N) | 4 Bytes                               |
| **41-44** | ON Sw (P1,P2,M,N)  | 4 Bytes                               |
| **45**    | Loop Rec/Play Lvl  | 0-100                                 |
| **46**    | Loop Dub Lvl       | 0-100                                 |
| **47**    | Loop Stop Lvl      | 0-100                                 |

#### **GK Volume (Offsets 48-5E, 7D-7E)**

Structure is similar to Expression Pedal.

- **48**: Function
- **49-4C**: Vol Sw
- **4D**: Bend Range
- ...
- **7D**: Mod Control Min
- **7E**: Mod Control Max

#### **GK S1 / S2 (Offsets 5F-6B, 6C-78)**

Structure is identical to Expression Switch (Function, Mode, Off/On Switches...).

- **5F**: GK S1 Function
- **6C**: GK S2 Function

---

### 5.4 GK Setup (Sub-Address `04` - `0D`)

This block's structure changes based on the **GUITAR/BASS Select** parameter (Offset `0x1A` in System Common).

**GK Set Index Calculation**: `Index = SubAddress - 0x04` (e.g., `04` -> Index 0).

#### **Guitar Mode Layout**

| Offset    | Parameter       | Size | Details                       |
| --------- | --------------- | ---- | ----------------------------- |
| **00**    | Name            | 8    | ASCII String                  |
| **08**    | PU Type         | 1    | 0=GK-3, 1=GK-3A, 2=GK-2A, ... |
| **09**    | Scale           | 1    | 0=LP, 1=ST, 2=Tele ...        |
| **0A**    | PU Phase        | 1    | 0=Normal, 1=Reverse           |
| **0B**    | PU Direction    | 1    | 0=Normal, 1=Reverse           |
| **0C**    | S1/S2 Pos       | 1    | 0=Normal, 1=Reverse           |
| **0D-12** | String Dist 1-6 | 1ea  | Value \* 0.5 mm               |
| **13-18** | String Sens 1-6 | 1ea  | 0-100                         |
| **1F**    | Normal PU Gain  | 1    | Value - 20 (dB)               |

#### **Bass Mode Layout**

| Offset    | Parameter       | Size | Details                |
| --------- | --------------- | ---- | ---------------------- |
| **00**    | Name            | 8    | ASCII String           |
| **08**    | PU Type         | 1    | 0=GK-3B, 1=GK-3A, ...  |
| **09**    | Scale           | 1    | 0=Long, 1=Med, 2=Short |
| **0A**    | **GK PU Pos**   | 1    | 0=6str, 1=4str         |
| **0B**    | PU Phase        | 1    | 0=Normal, 1=Reverse    |
| **0C**    | PU Direction    | 1    | 0=Normal, 1=Reverse    |
| **0D**    | S1/S2 Pos       | 1    | 0=Normal, 1=Reverse    |
| **0E-13** | String Dist 1-6 | 1ea  | Value \* 0.5 mm        |
| **14-19** | String Sens 1-6 | 1ea  | 0-100                  |
| **1F**    | Normal PU Gain  | 1    | Value - 20 (dB)        |
