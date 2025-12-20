# GR-55 Patch Master Parameters

This document describes the MIDI sysex parameter mapping for the GR-55's Patch Master settings.

All addresses are relative to the start of the temporary patch data area (`0x18000000`).

## Common (Patch Master)

The following parameters are located under `PatchStruct.common` at base address `0x000000`.

### Other Settings

| Name                     | Address    | Type                                           | Description                                       |
| ------------------------ | ---------- | ---------------------------------------------- | ------------------------------------------------- |
| Patch Tempo              | `0x00023c` | `USplit8Field(20, 250)`                        | Sets the tempo for the patch.                     |
| GK Set                   | `0x000224` | `Enum("SYSTEM", "1"..."10")`                   | Selects the GK set to use.                        |
| Guitar Out Source        | `0x000225` | `Enum("OFF", "NORMAL PU", "MODELING", "BOTH")` | Determines the source for the guitar output jack. |
| Alt Tune Switch          | `0x000234` | `Boolean`                                      | Toggles alternate tuning.                         |
| Alt Tune Type            | `0x0235`   | `Enum("OPEN-D", ...)`                          | Selects the alternate tuning type.                |
| User Tune Shift String 1 | `0x000236` | `UByte(-24, 24)`                               | User-defined tuning shift for string 1.           |
| User Tune Shift String 2 | `0x000237` | `UByte(-24, 24)`                               | User-defined tuning shift for string 2.           |
| User Tune Shift String 3 | `0x000238` | `UByte(-24, 24)`                               | User-defined tuning shift for string 3.           |
| User Tune Shift String 4 | `0x000239` | `UByte(-24, 24)`                               | User-defined tuning shift for string 4.           |
| User Tune Shift String 5 | `0x00023a` | `UByte(-24, 24)`                               | User-defined tuning shift for string 5.           |
| User Tune Shift String 6 | `0x00023b` | `UByte(-24, 24)`                               | User-defined tuning shift for string 6.           |
| V-LINK Palette           | `0x000226` | `UByte(0, 32)`                                 | V-LINK palette setting.                           |
| V-LINK Patch Clip        | `0x000227` | `UByte(0, 32)`                                 | V-LINK patch clip setting.                        |
| V-LINK Clip Change       | `0x000228` | `UByte(0, 4)`                                  | V-LINK clip change setting.                       |
| V-LINK EXP Pedal         | `0x000229` | `Enum("OFF", ...)`                             | V-LINK control for EXP pedal.                     |
| V-LINK EXP Pedal On      | `0x00022a` | `Enum("OFF", ...)`                             | V-LINK control for EXP pedal (when switch is on). |
| V-LINK GK VOL            | `0x00022b` | `Enum("OFF", ...)`                             | V-LINK control for GK volume.                     |
| Patch Level              | `0x000230` | `USplit8Field(0, 100)`                         | Overall patch volume level.                       |

### Pedal / GK Control

#### CTL Pedal

Base Address: `0x000011`

| Name                       | Address (Rel)     | Type                      | Description                                                |
| -------------------------- | ----------------- | ------------------------- | ---------------------------------------------------------- |
| Status                     | `0x0000`          | `Boolean`                 | CTL pedal enable/disable.                                  |
| Function                   | `0x0001`          | `Enum(...)`               | Function assigned to the CTL pedal.                        |
| Hold Type                  | `0x0002`          | `Enum("1"..."4")`         | Type of hold.                                              |
| Hold Switch Mode           | `0x0003`          | `Enum("LATCH", "MOMENT")` | Latch or momentary mode for hold.                          |
| Hold PCM Tone 1/2          | `0x0004`-`0x0005` | `Boolean`                 | Whether hold applies to PCM tones.                         |
| OFF/ON PCM Tone 1/2 Switch | `0x0006`-`0x000d` | `Boolean`                 | Tone switch behavior for PCM 1/2, Modeling, and Normal PU. |

#### EXP Pedal (Switch Off)

Base Address: `0x00001f` (Struct: `PatchExpPedalGkContinuousControlStruct`)

| Name                              | Address (Rel)     | Type                         | Description                        |
| --------------------------------- | ----------------- | ---------------------------- | ---------------------------------- |
| Function                          | `0x0000`          | `Enum(...)`                  | Function for the EXP pedal.        |
| Volume Switch (PCM1/2, Mod, PU)   | `0x0001`-`0x0004` | `Boolean`                    | Tones affected by volume function. |
| Bend Range                        | `0x0005`          | `UByte(-12, 12)`             | Pitch bend range.                  |
| Bend Switch (PCM1/2, Mod)         | `0x0006`-`0x0008` | `Boolean`                    | Tones affected by bend function.   |
| Modulation Min/Max                | `0x0009`-`0x000a` | `C127`                       | Modulation range.                  |
| Modulation Switch (PCM1/2)        | `0x000b`-`0x000c` | `Boolean`                    | Tones affected by modulation.      |
| X-Fade Polarity (PCM1/2, Mod, PU) | `0x000d`-`0x0010` | `Enum("OFF", "TOE", "HEEL")` | Cross-fader polarity.              |
| Delay/Reverb/Chorus Level Min/Max | `0x0011`-`0x0016` | `UByte`                      | Min/max levels for effects.        |
| MOD CONTROL MIN                   | `0x0242` (Abs)    | `UByte(0, 120)`              | Min value for MOD CONTROL.         |
| MOD CONTROL MAX                   | `0x0243` (Abs)    | `UByte(0, 120)`              | Max value for MOD CONTROL.         |

#### EXP Pedal (Switch On)

Base Address: `0x000036` (Struct: `PatchExpPedalGkContinuousControlStruct`)
_Parameters are identical to EXP Pedal (Switch Off), but for when the expression pedal switch is active._
| Name | Address (Rel) | Type | Description |
| --- | --- | --- | --- |
| MOD CONTROL MIN | `0x0244` (Abs) | `UByte(0, 120)` | Min value for MOD CONTROL. |
| MOD CONTROL MAX | `0x0245` (Abs) | `UByte(0, 120)` | Max value for MOD CONTROL. |

#### EXP SW (Expression Pedal Switch)

Base Address: `0x00004d`

| Name            | Address (Rel)     | Type        | Description             |
| --------------- | ----------------- | ----------- | ----------------------- |
| Status          | `0x0000`          | `Boolean`   | Switch enable/disable.  |
| Function        | `0x0001`          | `Enum(...)` | Function of the switch. |
| OFF/ON Switches | `0x0006`-`0x000d` | `Boolean`   | Tone switch behavior.   |

#### GK VOL (GK Volume Knob)

Base Address: `0x00005b` (Struct: `PatchExpPedalGkContinuousControlStruct`)
_Parameters are identical to EXP Pedal, controlling the GK Volume knob._
| Name | Address (Rel) | Type | Description |
| --- | --- | --- | --- |
| MOD CONTROL MIN | `0x0246` (Abs) | `UByte(0, 120)` | Min value for MOD CONTROL. |
| MOD CONTROL MAX | `0x0247` (Abs) | `UByte(0, 120)` | Max value for MOD CONTROL. |

#### GK S1 / S2 Buttons

Base Address: `0x000072` (S1), `0x00007f` (S2)

| Name            | Address (Rel)     | Type        | Description             |
| --------------- | ----------------- | ----------- | ----------------------- |
| Function        | `0x0000`          | `Enum(...)` | Function of the button. |
| OFF/ON Switches | `0x0005`-`0x000c` | `Boolean`   | Tone switch behavior.   |
