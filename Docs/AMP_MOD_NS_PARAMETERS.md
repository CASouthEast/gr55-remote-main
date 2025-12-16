# Amp / Mod / NS Parameters

This document provides a detailed list of the "Amp/Mod/NS" parameters for the Roland GR-55. These parameters control the amplifier simulation, the modulation effect, and the noise suppressor.

The `ampModNs` parameter block is located at address offset `0x040000` within a patch.

## Amp Parameters

| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `ampSwitch` | Amp Switch | `0x0000` | `BooleanField` | "OFF" / "ON" |
| `ampType` | Amp Type | `0x0001` | `EnumField` | Selects the amplifier model (e.g., "BOSS CLEAN", "JC-120", "TWEED"). |
| `ampGain` | Amp Gain | `0x0002` | `UByteField(0, 120)` | The gain level of the amplifier. |
| `ampLevel` | Amp Level | `0x0003` | `UByteField(0, 100)` | The volume level of the amplifier. |
| `ampGainSwitch` | Amp Gain Switch | `0x0004` | `EnumField` | "LOW", "MID", "HIGH". |
| `ampSoloSwitch` | Amp Solo Switch | `0x0005` | `BooleanField` | "OFF" / "ON" |
| `ampSoloLevel`| Amp Solo Level | `0x0006` | `UByteField(0, 100)` | The volume level of the solo boost. |
| `ampBass` | Amp Bass | `0x0007` | `UByteField(0, 100)` | The bass level. |
| `ampMiddle` | Amp Middle | `0x0008` | `UByteField(0, 100)` | The middle level. |
| `ampTreble` | Amp Treble | `0x0009` | `UByteField(0, 100)` | The treble level. |
| `ampPresence` | Amp Presence | `0x000a` | `UByteField(0, 100)` | The presence level. |
| `ampBright` | Amp Bright | `0x000b` | `BooleanField` | "OFF" / "ON" |
| `ampSpType` | Amp SP type | `0x000c` | `EnumField` | The speaker type (e.g., "OFF", "ORIGIN", '1x12"', '4x10"'). |
| `ampMicType` | Amp Mic Type | `0x000d` | `EnumField` | The microphone type (e.g., "DYN57", "CND87"). |
| `ampMicDistance`| Amp Mic Distance | `0x000e` | `BooleanField` | "OFF MIC" / "ON MIC" |
| `ampMicPosition`| Amp Mic Position | `0x000f` | `UByteField(0, 10)` | The microphone position (0 = CENTER). |
| `ampMicLevel` | Amp Mic Level | `0x0010` | `UByteField(0, 100)` | The microphone level. |

## Modulation (MOD) Parameters

The MOD block can be one of several different effect types. The `modType` parameter determines which effect is active.

| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `modSwitch` | MOD Switch | `0x0015` | `BooleanField` | "OFF" / "ON" |
| `modType` | MOD Type | `0x0016` | `EnumField` | Selects the modulation effect type (e.g., "OD/DS", "WAH", "CHORUS"). |
| `modPan` | MOD Pan | `0x0017` | `pan100Field` | Pan position for the modulation effect. |
| `modChorusSendLevel` | MOD Chorus Send Level | `0x0011` | `UByteField(0, 100)` | Send level to the main Chorus effect. |
| `modDelaySendLevel`| MOD Delay Send Level | `0x0012` | `UByteField(0, 100)` | Send level to the main Delay effect. |
| `modReverbSendLevel`| MOD Reverb Send Level | `0x0013` | `UByteField(0, 100)` | Send level to the main Reverb effect. |

### OD/DS
| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `odDsType` | Type | `0x0018` | `EnumField` | The specific overdrive/distortion model. |
| `odDsDrive`| Drive | `0x0019` | `UByteField(0, 120)` | |
| `odDsTone` | Tone | `0x001a` | `UByteField(0, 100)` | |
| `odDsLevel`| Level | `0x001b` | `UByteField(0, 100)` | |

### WAH
| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `wahMode` | Mode | `0x001c` | `EnumField` | "MANUAL", "T.UP", "T.DOWN" |
| `wahType` | Type | `0x001d` | `EnumField` | "CRY WAH", "VO WAH", etc. |
| `wahPedalPosition` | Pedal Position | `0x001e` | `UByteField(0, 100)` | |
| `wahSens` | Sens | `0x001f` | `UByteField(0, 100)` | |
| `wahFreq` | Freq | `0x0020` | `UByteField(0, 100)` | |
| `wahPeak` | Peak | `0x0021` | `UByteField(0, 100)` | |
| `wahLevel` | Level | `0x0022` | `UByteField(0, 100)` | |

### COMP
| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `compSustain` | Sustain | `0x0023` | `UByteField(0, 100)` | |
| `compAttack` | Attack | `0x0024` | `UByteField(0, 100)` | |
| `compLevel` | Level | `0x0025` | `UByteField(0, 100)` | |

### LIMITER
| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `limiterThreshold` | Threshold | `0x0026` | `UByteField(0, 100)` | |
| `limiterRelease` | Release | `0x0027` | `UByteField(0, 100)` | |
| `limiterLevel` | Level | `0x0028` | `UByteField(0, 100)` | |

### OCTAVE
| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `octaveOctLevel` | Oct Level | `0x0029` | `UByteField(0, 100)` | |
| `octaveDryLevel` | Dry Level | `0x002a` | `UByteField(0, 100)` | |

### PHASER
| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `phaserType` | Type | `0x002b` | `EnumField` | "4STAGE", "8STAGE", "12STAGE", "BI-PHASE" |
| `phaserRate` | Rate | `0x002c` | `rate113Field` | |
| `phaserDepth` | Depth | `0x002d` | `UByteField(0, 100)` | |
| `phaserResonance`| Resonance | `0x002e` | `UByteField(0, 100)` | |
| `phaserLevel` | Level | `0x002f` | `UByteField(0, 100)` | |

### FLANGER
| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `flangerRate` | Rate | `0x0030` | `rate113Field` | |
| `flangerDepth` | Depth | `0x0031` | `UByteField(0, 100)` | |
| `flangerManual` | Manual | `0x0032` | `UByteField(0, 100)` | |
| `flangerResonance`| Resonance | `0x0033` | `UByteField(0, 100)` | |
| `flangerLevel` | Level | `0x0034` | `UByteField(0, 100)` | |

### TREMOLO
| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `tremoloRate` | Rate | `0x0035` | `rate113Field` | |
| `tremoloDepth` | Depth | `0x0036` | `UByteField(0, 100)` | |
| `tremoloWaveShape`| Wave Shape | `0x0037` | `UByteField(0, 100)` | |
| `tremoloLevel` | Level | `0x0038` | `UByteField(0, 100)` | |

### ROTARY
| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `rotaryRateSlow`| Rate Slow | `0x0039` | `rate113Field` | |
| `rotaryRateFast`| Rate Fast | `0x003a` | `rate113Field` | |
| `rotaryDepth` | Depth | `0x003b` | `UByteField(0, 100)` | |
| `rotarySelect` | Select | `0x003c` | `BooleanField` | "SLOW", "FAST" |
| `rotaryLevel` | Level | `0x003d` | `UByteField(0, 100)` | |

### UNI-V
| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `uniVRate` | Rate | `0x003e` | `rate113Field` | |
| `uniVDepth` | Depth | `0x003f` | `UByteField(0, 100)` | |
| `uniVLevel` | Level | `0x0040` | `UByteField(0, 100)` | |

### PAN
| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `panRate` | Rate | `0x0041` | `rate113Field` | |
| `panDepth` | Depth | `0x0042` | `UByteField(0, 100)` | |
| `panWaveShape` | Wave Shape | `0x0043` | `UByteField(0, 100)` | |
| `panLevel` | Level | `0x0044` | `UByteField(0, 100)` | |

### DELAY
| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `delayType` | Type | `0x0045` | `EnumField` | "SINGLE", "PAN", etc. |
| `delayTime` | Time | `0x0046` | `time3413Field`| |
| `delayFeedback`| Feedback | `0x0049` | `UByteField(0, 100)`| |
| `delayEffectLevel`| Effect Level | `0x004a` | `UByteField(0, 120)`| |

### CHORUS
| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `chorusType` | Type | `0x004b` | `EnumField` | "MONO", "STEREO1", etc. |
| `chorusRate` | Rate | `0x004c` | `rate113Field` | |
| `chorusDepth` | Depth | `0x004d` | `UByteField(0, 100)`| |
| `chorusEffectLevel`| Effect Level | `0x004e` | `UByteField(0, 100)`| |

### EQ
| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `eqLowCutoffFreq`| Low Cutoff Freq | `0x004f` | `freqFlat800Field` | |
| `eqLowGain` | Low Gain | `0x0050` | `gain20dBField` | |
| `eqLowMidCutoffFreq`| Low Mid Cutoff Freq | `0x0051` | `freq10000Field` | |
| `eqLowMidQ` | Low Mid Q | `0x0052` | `q16Field` | |
| `eqLowMidGain` | Low Mid Gain | `0x0053` | `gain20dBField` | |
| `eqHighMidCutoffFreq`| High Mid Cutoff Freq | `0x0054` | `freq10000Field` | |
| `eqHighMidQ` | High Mid Q | `0x0055` | `q16Field` | |
| `eqHighMidGain` | High Mid Gain | `0x0056` | `gain20dBField` | |
| `eqHighGain` | High Gain | `0x0057` | `gain20dBField` | |
| `eqHighCutoffFreq`| High Cutoff Freq | `0x0058` | `freq11000FlatField`| |
| `eqLevel` | Level | `0x0059` | `gain20dBField` | |

## Noise Suppressor (NS) Parameters

| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `nsSwitch` | NS Switch | `0x005a` | `BooleanField` | "OFF" / "ON" |
| `nsThreshold`| NS Threshold | `0x005b` | `UByteField(0, 100)` | The threshold for the noise suppressor. |
| `nsReleaseTime`| NS Release Time | `0x005c` | `UByteField(0, 100)` | The release time for the noise suppressor. |