# Address Map and Assigns

This document provides a deeper dive into the address map and assigns logic, which are fundamental to how the application interacts with the Roland GR-55.

## The Address Map

The address map is a hierarchical representation of the GR-55's memory. It defines every parameter that can be controlled via MIDI SysEx, along with its address, data type, and other properties. This is the foundation upon which the entire application is built.

### Core Concepts (`RolandAddressMap.ts`)

The address map is built using a few core building blocks:

- **`AtomDefinition`**: The base class for any item in the address map. It has a `description` and an `offset` (relative to its parent).

- **`FieldDefinition`**: Represents a single, contiguous parameter on the device. It contains a `FieldType` that defines how to interpret the data for that parameter.

- **`StructDefinition`**: Represents a collection of `AtomDefinition`s. This allows for creating a hierarchical structure that mirrors the logical organization of the device's parameters. For example, the `PatchStruct` contains a `common` struct, a `modelingTone` struct, two `patchPCMTone` structs, and so on.

- **`FieldType`**: An interface that defines how to encode a value into a byte array for sending to the GR-55, and how to decode a byte array received from the GR-55 into a meaningful value. There are several implementations of this interface for different data types:
  - **`NumericField`**: For numeric values. This is a base class for more specific types like `UByteField` (unsigned byte), `UWordField` (unsigned 14-bit word), etc. It supports remapping values, which is useful when the range of a parameter displayed to the user is different from the range of the value sent in the SysEx message.
  - **`AsciiStringField`**: For string values, such as the patch name.
  - **`BooleanField`**: For boolean (on/off) values.
  - **`EnumField`**: For enumerated values, where a number corresponds to a string label (e.g., a list of effect types).
  - **`USplit8Field` and `USplit12Field`**: The GR-55's SysEx implementation frequently uses a technique where a value is split into 4-bit "nibbles" and sent as separate bytes. These `FieldType`s handle the logic for encoding and decoding these split values.

### The GR-55 Address Map (`RolandGR55AddressMap.ts`)

This massive file uses the building blocks from `RolandAddressMap.ts` to define the entire memory map of the GR-55. It creates a large, hierarchical `StructDefinition` for a "patch", which contains all the parameters for a single sound on the device. It also defines structs for system-level parameters.

The file also defines many custom `FieldType`s that are specific to the GR-55. For example, `rate113Field` is a custom field for rate parameters that have 113 possible values.

## Address Space Overview

In a Roland SysEx message, the memory address of a parameter is specified as a 4-byte value, starting from the 8th byte of the message (at index 7). The first of these four bytes is the most significant and indicates the high-level memory section being accessed.

Here is a list of the first-byte values and their corresponding memory sections, as defined in this application's address map:

- **`0x00` - `0x0F`**: **Patch Data**. These addresses are for parameters within a patch. The exact section depends on the address. For example:

  - **`0x00`**: Common patch parameters
  - **`0x01`**: PCM Tone 1
  - **`0x02`**: PCM Tone 2
  - **`0x03`**: Modeling Tone
  - **`0x04`**: Amp / Modulation / Noise Suppressor
  - **`0x05`**: Multi-Effects (MFX)
  - **`0x06`**: Sends & EQ
  - **`0x07`**: Patch Master settings

- **`0x10`**: **System Parameters**. These are global settings that affect the entire device, such as master tuning, output levels, and GK pickup settings.

- **`0x20`**: **Temporary Patch**. This is the memory area where a patch is held while it is being edited. When you change a parameter in the UI, you are modifying the temporary patch.

- **`0x21`**: **User Patches**. This is the starting address for the user patch memory. Individual user patches are located at offsets from this address (e.g., `0x210000` for the first user patch, `0x220000` for the second, and so on).

- **`0x30`**: **Setup**. This section contains MIDI settings, pedal and switch assignments, and other system-level configuration.

The value `0x31` is not used in this application's address map.

## Assigns

"Assigns" are a powerful feature of the GR-55 that allow you to control almost any parameter using a physical controller, such as an expression pedal, a footswitch, or a MIDI CC message. The application provides a comprehensive UI for managing these assigns.

### Core Concepts (`RolandGR55Assigns.ts`)

- **`AssignDefinition`**: The base interface for an assign. It has a `description` which is displayed to the user in the list of available assign targets.

- **Types of `AssignDefinition`**:

  - **`FieldAssignDefinition`**: The most common type of assign. It maps directly to a single `FieldDefinition` in the address map.
  - **`VirtualFieldAssignDefinition`**: For assigns that don't map to a single field. For example, "PCM1 Tone1 Bend" is a virtual assign that likely controls multiple pitch-related parameters at once.
  - **`MultiFieldAssignDefinition`**: For assigns that control multiple, non-contiguous fields. For example, many of the MFX (multi-effects) rate parameters are `MultiFieldAssignDefinition`s because they control the rate value, a "sync to tempo" switch, and a note value (e.g., quarter note, eighth note) simultaneously.

- **`AssignsMap`**: A class that manages a collection of `AssignDefinition`s. It provides methods for getting an assign by its index and for getting the index of an assign by the field it controls. This is crucial for linking the "target" of an assign (which is just a number in the SysEx) to the actual parameter it controls.

### The GR-55 Assigns Map (`RolandGR55AssignsMap.ts`)

This file creates the definitive list of all possible assign targets for the GR-55. It does this by creating a massive array of `AssignDefinition`s and passing it to the `AssignsMap` constructor.

A key feature of this file is the `buildAssignsMap` function, which takes a `guitarBassSelect` parameter. This is because the GR-55 has different sets of available assigns depending on whether it is in guitar or bass mode.

### Reinterpreting Assign Fields

The `AssignsMap` class has two important methods for making the assigns UI more user-friendly:

- **`reinterpretTargetField`**: The "target" of an assign is stored as a number in the GR-55's memory. This method reinterprets that numeric field to display the human-readable `description` of the `AssignDefinition` instead of the raw number.

- **`reinterpretAssignValueField`**: The "min" and "max" values of an assign are also stored as numbers. However, the parameter being controlled might be a boolean switch or an enumerated list of options. This method reinterprets the min/max fields to have a `FieldType` that is appropriate for the assigned parameter. For example, if you assign a footswitch to control the "AMP Switch", the min/max values will be displayed as "ON" and "OFF" instead of 0 and 1. This is a key piece of logic that makes the assigns UI intuitive and easy to use.

## SysEx Message Types

The application primarily uses two types of Roland SysEx messages to communicate with the GR-55. These messages are part of the "Data Transmission" (DT) protocol.

- **`MESSAGE_DATA_SET_1` (DT1)**: This message is used to **write** data to the GR-55. It has a message type of `0x12`. When the user changes a parameter in the UI, the application constructs a DT1 message containing the address of the parameter and the new value, and sends it to the GR-55.

- **`MESSAGE_DATA_REQUEST_1` (RQ1)**: This message is used to **read** data from the GR-55. It has a message type of `0x11`. When the application needs to fetch the current state of a parameter or a block of parameters, it sends an RQ1 message containing the starting address and the number of bytes to read. The GR-55 then responds with a DT1 message containing the requested data.

## Examples

Here are a few examples to illustrate how parameters are mapped from SysEx messages to the UI.

### Example 1: Amp Gain (A simple numeric parameter)

The "Gain" of the amplifier is a simple numeric value from 0 to 120.

**1. Field Definition (`RolandGR55AddressMap.ts`)**

```typescript
// from the ampModNs struct
ampGain: new FieldDefinition(pack7(0x0001), "AMP Gain", new UByteField(0, 120)),
```

- **`pack7(0x0001)`**: The address of this field relative to its parent `ampModNs` struct. `pack7` is a function that performs 7-bit packing on the address, which is required by the SysEx protocol. The `ampModNs` struct itself has a base address, so the final address of the `ampGain` field will be the sum of the base address and this offset.
- **`"AMP Gain"`**: The human-readable name of the field.
- **`new UByteField(0, 120)`**: The `FieldType`. `UByteField` indicates that this is an unsigned byte with a range from 0 to 120.

**2. SysEx Message**

Let's say we want to set the amp gain to 100. The application would construct a SysEx "Data Set" (DT1) message like this:

```
F0 41 10 00 00 5D 12 [address] [value] [checksum] F7
```

- `F0`: Start of SysEx
- `41`: Roland Manufacturer ID
- `10`: Device ID (can be changed in settings)
- `00 00 5D`: Model ID for the GR-55
- `12`: DT1 message type (Data Set)
- `[address]`: The full, 7-bit packed address of the `ampGain` field.
- `[value]`: The value to set, in this case `0x64` (100).
- `[checksum]`: A checksum calculated from the address and value.
- `F7`: End of SysEx

**3. Decoding**

When the application receives a SysEx message containing the amp gain, the `UByteField`'s `decode` method is called with the value byte. Since it's a simple numeric field, the `decode` method just returns the numeric value of the byte.

**4. Encoding**

When the user moves a slider in the UI to set the amp gain, the `UByteField`'s `encode` method is called. It takes the numeric value from the slider, ensures it's within the 0-120 range, and returns it as a single byte to be included in the SysEx message.

### Example 2: Modeling Tone Type (An enumerated parameter)

The modeling tone type is an enumerated parameter that can be one of several string values ("CLA-ST", "MOD-ST", "H&H-ST", etc.).

**1. Field Definition (`RolandGR55AddressMap.ts`)**

```typescript
// from the PatchModelingToneStruct
toneNumberEGtr_guitar: new FieldDefinition(
  pack7(0x0001),
  "Tone Number:E.GTR (GK mode:Guitar)",
  enumField([
    "CLA-ST", "MOD-ST", "H&H-ST", "TE", "LP", "P-90",
    "LIPS", "RICK", "335", "L4",
  ] as const)
),
```

- **`enumField([...])`**: This creates an `EnumField` with the specified labels. The `EnumField` will map the numeric values 0, 1, 2, etc., to the corresponding string labels.

**2. Decoding**

If the GR-55 sends a SysEx message with the value `0x02` for this parameter, the `EnumField`'s `decode` method will look up the value at index 2 in the labels array and return the string `"H&H-ST"`.

**3. Encoding**

If the user selects `"TE"` from a picker in the UI, the `EnumField`'s `encode` method will find the index of `"TE"` in the labels array (which is 3) and return the numeric value `0x03` to be sent in the SysEx message.

### Example 3: MFX Filter Rate (A complex, multi-field parameter)

The rate of the MFX filter is more complex. It can be set as a numeric value, or it can be synced to the patch tempo with a specific note value. This requires multiple SysEx parameters to be controlled together.

**1. Assign Definition (`RolandGR55AssignsMap.ts`)**

```typescript
new MultiFieldAssignDefinition(
  "MFX FILTER Rate",
  [
    patch.mfx.superFilterRate,
    patch.mfx.superFilterRateSyncSw,
    patch.mfx.superFilterRateNote,
  ],
  rate113Field.forAssign
),
```

- **`MultiFieldAssignDefinition`**: This indicates that the "MFX FILTER Rate" assign controls multiple fields.
- **`[...]`**: An array of `FieldReference`s to the fields that this assign controls.
- **`rate113Field.forAssign`**: A custom `FieldType` that is used to interpret the min/max values of the assign.

When the user changes the MFX Filter Rate in the UI, the application logic will update the appropriate fields based on the user's selection. For example, if the user chooses a tempo-synced value, the `superFilterRateSyncSw` field will be set to "ON", and the `superFilterRateNote` field will be set to the appropriate note value. If the user chooses a numeric value, `superFilterRateSyncSw` will be set to "OFF", and `superFilterRate` will be set to the numeric value. This logic is handled by the UI components and the `useRemoteField` hook.
