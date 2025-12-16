
# PCM Tone Parameters

This document provides a detailed list of the "PCM Tone" parameters for the Roland GR-55. Each patch contains two PCM tones, and their parameters are nearly identical, just at different memory locations.

- **PCM Tone 1**:
  - Main parameters start at address offset `0x010000`.
  - Offset parameters start at address offset `0x010100`.
- **PCM Tone 2**:
  - Main parameters start at address offset `0x020000`.
  - Offset parameters start at address offset `0x020100`.

This document will list the parameters and their offsets relative to these base addresses.

## Main PCM Tone Parameters (`PatchPCMToneStruct`)

| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `toneSelect` | Tone Select | `0x0000` | `pcmToneSelectField` | Selects the PCM tone. This is a complex field that depends on the selected category. |
| `muteSwitch` | Mute Switch | `0x0003` | `BooleanField` | Mutes the PCM tone. Note: This is an `invertedMuteField`, so `1` = UNMUTE, `0` = MUTE. |
| `partLevel` | Part Level | `0x0004` | `C127Field` | The volume level of the PCM tone (0-100). |
| `partOctaveShift` | Part Octave Shift | `0x0005` | `UByteField` | Octave shift from -3 to +3. `encodedOffset: 64`. |
| `chromatic` | Chromatic | `0x0006` | `BooleanField` | Enables chromatic mode. |
| `legatoSwitch` | Legato Switch | `0x0007` | `BooleanField` | Enables legato. |
| `nuanceSwitch` | Nuance Switch | `0x0008` | `BooleanField` | Enables nuance. |
| `partPan` | Part Pan | `0x0009` | `C64Field` | Pan position from L50 to R50. |
| `partCoarseTune` | Part Coarse Tune | `0x000a` | `UByteField` | Coarse tuning from -24 to +24 semitones. `encodedOffset: 64`. |
| `partFineTune` | Part Fine Tune | `0x000b` | `UByteField` | Fine tuning from -50 to +50 cents. `encodedOffset: 64`. |
| `partPortamentoSwitch`| Part Portamento Switch | `0x000c` | `EnumField` | "OFF", "ON", "TONE". |
| `portamentoTime` | Portamento Time | `0x000d` | `C127Field` | Portamento time (0-127). Uses a `USplit8Field`. |
| `releaseMode` | Release Mode | `0x000f` | `EnumField` | "1" or "2". |
| `string1Level` - `string6Level` | String 1-6 Level | `0x0010` - `0x0015` | `C127Field` | Individual volume levels for each string. |
| `partOutputMFXSelect`| Part Output MFX Select | `0x0016` | `EnumField` | The output for the PCM tone ("BYPS", "AMP", "MFX"). |

## PCM Tone Offset Parameters (`PatchPCMToneOffsetStruct`)

These parameters control the offsets for various tone settings, allowing for velocity and nuance to affect the sound.

### TVF (Time Variant Filter)
| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `tvfFilterType` | TVF Filter Type | `0x0000` | `EnumField` | "OFF", "LPF", "BPF", "HPF", "PKG", "LPF2", "LPF3", "TONE". |
| `tvfCutoffFrequencyOffset` | TVF Cutoff Frequency Offset| `0x0001` | `C63Field` | Offset for the filter cutoff frequency. |
| `tvfResonanceOffset` | TVF Resonance Offset | `0x0002` | `C64Field` | Offset for the filter resonance. |
| `tvfCutoffVelocitySens`| TVF Cutoff Velocity Sens | `0x0003` | `C64Field` | How much velocity affects the filter cutoff. |
| `tvfCutoffVelocityCurve`| TVF Cutoff Velocity Curve| `0x0004` | `EnumField` | The velocity curve for the filter cutoff. |
| `tvfCutoffKeyfollowOffset`| TVF Cutoff Keyfollow Offset | `0x0005` | `c200Field` | How much the key position affects the filter cutoff. |
| `nuanceCutoffSens` | Nuance Cutoff Sens | `0x0006` | `C63Field` | How much nuance affects the filter cutoff. |
| `tvfEnvDepthOffset` | TVF Env Depth Offset | `0x0007` | `C63Field` | Offset for the filter envelope depth. |
| `tvfEnvTime1Offset` | TVF Env Time 1 Offset | `0x0008` | `C64Field` | Offset for the filter attack time. |
| `tvfEnvTime2Offset` | TVF Env Time 2 Offset | `0x0009` | `C64Field` | Offset for the filter decay time. |
| `tvfEnvLevel3Offset` | TVF Env Level 3 Offset | `0x000a` | `C64Field` | Offset for the filter sustain level. |
| `tvfEnvTime4Offset` | TVF Env Time 4 Offset | `0x000b` | `C64Field` | Offset for the filter release time. |
| `tvfEnvTime1VelocitySensOffset`| TVF Env Time 1 Velocity Sens Offset| `0x000c` | `C63Field` | How much velocity affects the filter attack time. |
| `tvfEnvTime1NuanceSensOffset`| TVF Env Time 1 Nuance Sens Offset| `0x000d` | `C63Field` | How much nuance affects the filter attack time. |

### TVA (Time Variant Amplifier)
| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `tvaLevelVelocitySensOffset`| TVA Level Velocity Sens Offset| `0x000e` | `C63Field` | How much velocity affects the amplifier level. |
| `tvaLevelVelocityCurve`| TVA Level Velocity Curve | `0x000f` | `EnumField` | The velocity curve for the amplifier level. |
| `tvaEnvTime1Offset` | TVA Env Time 1 Offset | `0x0010` | `C64Field` | Offset for the amplifier attack time. |
| `tvaEnvTime2Offset` | TVA Env Time 2 Offset | `0x0011` | `C64Field` | Offset for the amplifier decay time. |
| `tvaEnvLevel3Offset` | TVA Env Level 3 Offset | `0x0012` | `C64Field` | Offset for the amplifier sustain level. |
| `tvaEnvTime4Offset` | TVA Env Time 4 Offset | `0x0013` | `C64Field` | Offset for the amplifier release time. |
| `tvaEnvTime1VelocitySensOffset`| TVA Env Time 1 Velocity Sens Offset| `0x0014` | `C63Field` | How much velocity affects the amplifier attack time. |
| `tvaEnvTime1NuanceSensOffset`| TVA Env Time 1 Nuance Sens Offset| `0x0015` | `C63Field` | How much nuance affects the amplifier attack time. |
| `nuanceLevelSens` | Nuance Level Sens | `0x0016` | `C63Field` | How much nuance affects the amplifier level. |

### Pitch Envelope
| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `pitchEnvVelocitySensOffset`| Pitch Env Velocity Sens Offset| `0x0017` | `C64Field` | How much velocity affects the pitch envelope depth. |
| `pitchEnvOffset` | Pitch Env Offset | `0x0018` | `UByteField` | Offset for the pitch envelope depth. |
| `pitchEnvTime1Offset` | Pitch Env Time 1 Offset | `0x0019` | `C64Field` | Offset for the pitch envelope attack time. |
| `pitchEnvTime2Offset` | Pitch Env Time 2 Offset | `0x001a` | `C64Field` | Offset for the pitch envelope decay time. |

### LFOs (Low Frequency Oscillators)
| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `partPortamentoType` | Part Portamento Type | `0x001b` | `EnumField` | "RATE" or "TIME". |
| `lfo1Rate` | LFO1 Rate | `0x001c` | `toneRate150Field`| The rate of LFO1. |
| `lfo1PitchDepthOffset`| LFO1 Pitch Depth Offset | `0x001e` | `C63OffField` | The amount LFO1 modulates the pitch. |
| `lfo1TVFDepthOffset`| LFO1 TVF Depth Offset | `0x001f` | `C63OffField` | The amount LFO1 modulates the filter cutoff. |
| `lfo1TVADepthOffset`| LFO1 TVA Depth Offset | `0x0020` | `C63OffField` | The amount LFO1 modulates the amplifier level. |
| `lfo1PanDepthOffset`| LFO1 Pan Depth Offset | `0x0021` | `C63OffField` | The amount LFO1 modulates the pan position. |
| `lfo2Rate` | LFO2 Rate | `0x0022` | `toneRate150Field`| The rate of LFO2. |
| `lfo2PitchDepthOffset`| LFO2 Pitch Depth Offset | `0x0024` | `C63OffField` | The amount LFO2 modulates the pitch. |
| `lfo2TVFDepthOffset`| LFO2 TVF Depth Offset | `0x0025` | `C63OffField` | The amount LFO2 modulates the filter cutoff. |
| `lfo2TVADepthOffset`| LFO2 TVA Depth Offset | `0x0026` | `C63OffField` | The amount LFO2 modulates the amplifier level. |
| `lfo2PanDepthOffset`| LFO2 Pan Depth Offset | `0x0027` | `C63OffField` | The amount LFO2 modulates the pan position. |
