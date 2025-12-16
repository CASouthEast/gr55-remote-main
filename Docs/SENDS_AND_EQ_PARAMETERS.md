# Chorus, Delay, Reverb, and EQ Parameters

This document details the Chorus, Delay, Reverb, and EQ parameters in the Roland GR-55. These effects are available in a dedicated block.

The CHO/DLY/EQ/REV parameter block is located at address offset `0x000600` within a patch.

## Chorus Parameters

| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `chorusSwitch` | Chorus Switch | `0x0000` | `BooleanField` | "OFF" / "ON" |
| `chorusType` | Chorus Type | `0x0001` | `EnumField` | "MONO", "STEREO", "MONO MILD", "STEREO MILD" |
| `chorusRate` | Chorus Rate | `0x0002` | `rate113Field` | 0-100, and then 13 tempo-relative labelled values |
| `chorusDepth` | Chorus Depth | `0x0003` | `UByteField` | 0 to 100 |
| `chorusEffectLevel` | Chorus Effect Level | `0x0004` | `UByteField` | 0 to 100 |

## Delay Parameters

| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `delaySwitch` | Delay Switch | `0x0005` | `BooleanField` | "OFF" / "ON" |
| `delayType` | Delay Type | `0x0006` | `EnumField` | "SINGLE", "PAN", "REVERSE", "ANALOG", "TAPE", "MODULATE", "HICUT" |
| `delayTime` | Delay Time | `0x0007` | `time3413Field` | 0-3400, and then 13 tempo-relative labelled values |
| `delayFeedback` | Delay Feedback | `0x000A` | `UByteField` | 0 to 100 |
| `delayEffectLevel` | Delay Effect Level | `0x000B` | `UByteField` | 0 to 120 |

## Reverb Parameters

| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `reverbSwitch` | Reverb Switch | `0x000C` | `BooleanField` | "OFF" / "ON" |
| `reverbType` | Reverb Type | `0x000D` | `EnumField` | "AMBIENCE", "ROOM", "HALL1", "HALL2", "PLATE" |
| `reverbTime` | Reverb Time | `0x000E` | `UByteField` | 0.1 to 10.0 s |
| `reverbHighCut` | Reverb High Cut | `0x000F` | `freq11000FlatField` | "700", "1000", "1400", "2000", "3000", "4000", "6000", "8000", "11000", "FLAT" |
| `reverbEffectLevel` | Reverb Effect Level | `0x0010` | `UByteField` | 0 to 100 |

## EQ Parameters

| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `eqSwitch` | EQ Switch | `0x0011` | `BooleanField` | "OFF" / "ON" |
| `eqLowCutoffFreq` | EQ Low Cutoff Freq | `0x0012` | `freqFlat800Field` | "FLAT", "55", "110", "165", "200", "280", "340", "400", "500", "630", "800" |
| `eqLowGain` | EQ Low Gain | `0x0013` | `gain20dBField` | -20 to +20 dB |
| `eqLowMidCutoffFreq` | EQ Low Mid Cutoff Freq | `0x0014` | `freq10000Field` | 20Hz to 10kHz |
| `eqLowMidQ` | EQ Low Mid Q | `0x0015` | `q16Field` | "0.5", "1", "2", "4", "8", "16" |
| `eqLowMidGain` | EQ Low Mid Gain | `0x0016` | `gain20dBField` | -20 to +20 dB |
| `eqHighMidCutoffFreq` | EQ High Mid Cutoff Freq | `0x0017` | `freq10000Field` | 20Hz to 10kHz |
| `eqHighMidQ` | EQ High Mid Q | `0x0018` | `q16Field` | "0.5", "1", "2", "4", "8", "16" |
| `eqHighMidGain` | EQ High Mid Gain | `0x0019` | `gain20dBField` | -20 to +20 dB |
| `eqHighCutoffFreq` | EQ High Cutoff Freq | `0x001A` | `freq11000FlatField` | "700", "1000", "1400", "2000", "3000", "4000", "6000", "8000", "11000", "FLAT" |
| `eqHighGain` | EQ High Gain | `0x001B` | `gain20dBField` | -20 to +20 dB |
| `eqLevel` | EQ Level | `0x001C` | `gain20dBField` | -20 to +20 dB |
| `ezCharacter` | EZ Character | `0x001D` | `UByteField` | -3 to +3 |
