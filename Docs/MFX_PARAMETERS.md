# MFX (Multi-Effects) Parameters

This document details the MFX (Multi-Effects) parameters in the Roland GR-55. The MFX block allows for selecting one of many different effects, each with its own set of unique parameters.

The MFX parameter block is located at address offset `0x000300` within a patch.

## Common MFX Parameters

These parameters are always available regardless of the selected MFX type.

| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `mfxChorusSendLevel` | MFX Chorus Send Level | `0x0000` | `UByteField` | 0 to 100. |
| `mfxDelaySendLevel` | MFX Delay Send Level | `0x0001` | `UByteField` | 0 to 100. |
| `mfxReverbSendLevel` | MFX Reverb Send Level | `0x0002` | `UByteField` | 0 to 100. |
| `mfxSwitch` | MFX Switch | `0x0004` | `BooleanField` | "OFF" / "ON" |
| `mfxType` | MFX Type | `0x0005` | `EnumField` | Selects the MFX effect type. See list below. |
| `mfxPan` | MFX Pan | `0x0006` | `pan100Field` | L50-C-50R. |

## MFX Types

The `mfxType` parameter can have one of the following values:
`EQ`, `SUPER FILTER`, `PHASER`, `STEP PHASER`, `RING MODULATOR`, `TREMOLO`, `AUTO PAN`, `SLICER`, `VK ROTARY`, `HEXA-CHORUS`, `SPACE-D`, `FLANGER`, `STEP FLANGER`, `GUITAR AMP SIM`, `COMPRESSOR`, `LIMITER`, `3TAP PAN DELAY`, `TIME CTRL DELAY`, `LOFI COMPRESS`, `PITCH SHIFTER`

The parameters from `0x0007` onwards are interpreted based on the selected `mfxType`.

---

## MFX Type Parameter Details

### 1. EQ

| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `eqLowFreq` | Low Freq | `0x0007` | `EnumField` | "200", "400" Hz |
| `eqLowGain` | Low Gain | `0x0008` | `gain15dBField` | -15 to +15 dB |
| `eqMid1Freq` | Mid1 Freq | `0x0009` | `freq8000Field` | 200Hz to 8.0kHz |
| `eqMid1Gain` | Mid1 Gain | `0x000A` | `gain15dBField` | -15 to +15 dB |
| `eqMid1Q` | Mid1 Q | `0x000B` | `q8Field` | 0.5 to 8.0 |
| `eqMid2Freq` | Mid2 Freq | `0x000C` | `freq8000Field` | 200Hz to 8.0kHz |
| `eqMid2Gain` | Mid2 Gain | `0x000D` | `gain15dBField` | -15 to +15 dB |
| `eqMid2Q` | Mid2 Q | `0x000E` | `q8Field` | 0.5 to 8.0 |
| `eqHighFreq` | High Freq | `0x000F` | `EnumField` | "2000", "4000", "8000" Hz |
| `eqHighGain` | High Gain | `0x0010` | `gain15dBField` | -15 to +15 dB |
| `eqLevel` | Level | `0x0011` | `C127Field` | 0 to 127 |

### 2. SUPER FILTER

| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `superFilterFilterType` | Filter Type | `0x0012` | `EnumField` | "LPF", "BPF", "HPF", "NOTCH" |
| `superFilterFilterSlope` | Filter Slope | `0x0013` | `EnumField` | "-12", "-24", "-36" dB/oct |
| `superFilterFilterCutoff`| Filter Cutoff| `0x0014` | `C127Field` | 0 to 127 |
| `superFilterFilterResonance`| Resonance | `0x0015` | `C127Field` | 0 to 127 |
| `superFilterFilterGain` | Gain | `0x0016` | `UByteField` | 0 to +12 |
| `superFilterModulationSw` | Modulation Sw| `0x0017` | `BooleanField`| "OFF" / "ON" |
| `superFilterModulationWave`| Mod Wave | `0x0018` | `mfxModWaveField`| "TRI", "SQR", "SIN", "SAW1", "SAW2" |
| `superFilterRateSyncSw` | Rate Sync Sw | `0x0019` | `BooleanField`| "OFF" / "ON" |
| `superFilterRate` | Rate | `0x001A` | `UByteField` | 0 to 100 |
| `superFilterRateNote` | Rate Note | `0x001B` | `mfxRateNoteField`| Tempo-synced rates |
| `superFilterDepth` | Depth | `0x001C` | `C127Field` | 0 to 127 |
| `superFilterAttack` | Attack | `0x001D` | `C127Field` | 0 to 127 |
| `superFilterLevel` | Level | `0x001E` | `C127Field` | 0 to 127 |

### 3. PHASER

| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `phaserMode` | Mode | `0x001F` | `EnumField` | "4-STAGE", "8-STAGE", "12-STAGE" |
| `phaserManual` | Manual | `0x0020` | `C127Field` | 0 to 127 |
| `phaserRateSyncSw`| Rate Sync Sw | `0x0021` | `BooleanField`| "OFF" / "ON" |
| `phaserRate` | Rate | `0x0022` | `UByteField` | 0 to 100 |
| `phaserRateNote` | Rate Note | `0x0023` | `mfxRateNoteField`| Tempo-synced rates |
| `phaserDepth` | Depth | `0x0024` | `C127Field` | 0 to 127 |
| `phaserPolarity` | Polarity | `0x0025` | `BooleanField` | "INVERSE" / "SYNCHRO" |
| `phaserResonance` | Resonance | `0x0026` | `C127Field` | 0 to 127 |
| `phaserCrossFeedback`| Cross Feedback| `0x0027` | `feedback98Field`| -98% to +98% |
| `phaserMix` | Mix | `0x0028` | `C127Field` | 0 to 127 |
| `phaserLowGain` | Low Gain | `0x0029` | `gain15dBField`| -15 to +15 dB |
| `phaserHighGain` | High Gain | `0x002A` | `gain15dBField`| -15 to +15 dB |
| `phaserLevel` | Level | `0x002B` | `C127Field` | 0 to 127 |

... and so on for all the other MFX types. The file `RolandGR55AddressMap.ts` contains the full mapping for each type. I will continue generating the rest of the documentation for the MFX types. Due to the large number of parameters, this will be a large document.
This is a truncated example. I will generate the full file now.

### 4. STEP PHASER

| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `stepPhaserMode` | Mode | `0x002C` | `EnumField` | "4-STAGE", "8-STAGE", "12-STAGE" |
| `stepPhaserManual` | Manual | `0x002D` | `C127Field` | 0 to 127 |
| `stepPhaserRateSyncSw`| Rate Sync Sw | `0x002E` | `BooleanField`| "OFF" / "ON" |
| `stepPhaserRate` | Rate | `0x002F` | `UByteField` | 0 to 100 |
| `stepPhaserRateNote` | Rate Note | `0x0030` | `mfxRateNoteField`| Tempo-synced rates |
| `stepPhaserDepth` | Depth | `0x0031` | `C127Field` | 0 to 127 |
| `stepPhaserPolarity` | Polarity | `0x0032` | `BooleanField` | "INVERSE" / "SYNCHRO" |
| `stepPhaserResonance` | Resonance | `0x0033` | `C127Field` | 0 to 127 |
| `stepPhaserCrossFeedback`| Cross Feedback| `0x0034` | `feedback98Field`| -98% to +98% |
| `stepPhaserStepRateSyncSw` | Step Rate Sync Sw | `0x0035` | `BooleanField`| "OFF" / "ON" |
| `stepPhaserStepRate` | Step Rate | `0x0036` | `UByteField` | 0 to 100 |
| `stepPhaserStepRateNote`| Step Rate Note | `0x0037` | `mfxRateNoteField`| Tempo-synced rates |
| `stepPhaserMix` | Mix | `0x0038` | `C127Field` | 0 to 127 |
| `stepPhaserLowGain` | Low Gain | `0x0039` | `gain15dBField`| -15 to +15 dB |
| `stepPhaserHighGain` | High Gain | `0x003A` | `gain15dBField`| -15 to +15 dB |
| `stepPhaserLevel` | Level | `0x003B` | `C127Field` | 0 to 127 |

### 5. RING MODULATOR

| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `ringModulatorFrequency`| Frequency | `0x003C` | `UByteField` | 0 to 127 |
| `ringModulatorSens` | Sens | `0x003D` | `UByteField` | 0 to 127 |
| `ringModulatorPolarity`| Polarity | `0x003E` | `BooleanField`| "UP" / "DOWN" |
| `ringModulatorLowGain` | Low Gain | `0x003F` | `gain15dBField`| -15 to +15 dB |
| `ringModulatorHighGain`| High Gain | `0x0040` | `gain15dBField`| -15 to +15 dB |
| `ringModulatorBalance`| Balance | `0x0041` | `dryWet100Field`| D100:W0 to D0:W100 |
| `ringModulatorLevel` | Level | `0x0042` | `C127Field` | 0 to 127 |

### 6. TREMOLO

| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `tremoloModWave` | Mod Wave | `0x0043` | `mfxModWaveField`| "TRI", "SQR", "SIN", "SAW1", "SAW2" |
| `tremoloRateSyncSw` | Rate Sync Sw | `0x0044` | `BooleanField`| "OFF" / "ON" |
| `tremoloRate` | Rate | `0x0045` | `UByteField` | 0 to 100 |
| `tremoloRateNote` | Rate Note | `0x0046` | `mfxRateNoteField`| Tempo-synced rates |
| `tremoloDepth` | Depth | `0x0047` | `C127Field` | 0 to 127 |
| `tremoloLowGain` | Low Gain | `0x0048` | `gain15dBField`| -15 to +15 dB |
| `tremoloHighGain` | High Gain | `0x0049` | `gain15dBField`| -15 to +15 dB |
| `tremoloLevel` | Level | `0x004A` | `C127Field` | 0 to 127 |

### 7. AUTO PAN

| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `autoPanModWave` | Mod Wave | `0x004B` | `mfxModWaveField`| "TRI", "SQR", "SIN", "SAW1", "SAW2" |
| `autoPanRateSyncSw` | Rate Sync Sw | `0x004C` | `BooleanField`| "OFF" / "ON" |
| `autoPanRate` | Rate | `0x004D` | `UByteField` | 0 to 100 |
| `autoPanRateNote` | Rate Note | `0x004E` | `mfxRateNoteField`| Tempo-synced rates |
| `autoPanDepth` | Depth | `0x004F` | `C127Field` | 0 to 127 |
| `autoPanLowGain` | Low Gain | `0x0050` | `gain15dBField`| -15 to +15 dB |
| `autoPanHighGain` | High Gain | `0x0051` | `gain15dBField`| -15 to +15 dB |
| `autoPanLevel` | Level | `0x0052` | `C127Field` | 0 to 127 |

### 8. SLICER

| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `slicerPattern` | Pattern | `0x0053` | `UByteField` | 1 to 20 |
| `slicerRateSyncSw` | Rate Sync Sw | `0x0054` | `BooleanField`| "OFF" / "ON" |
| `slicerRate` | Rate | `0x0055` | `UByteField` | 0 to 100 |
| `slicerRateNote` | Rate Note | `0x0056` | `mfxRateNoteField`| Tempo-synced rates |
| `slicerAttack` | Attack | `0x0057` | `C127Field` | 0 to 127 |
| `slicerInputSyncSw` | Input Sync Sw | `0x0058` | `BooleanField`| "OFF" / "ON" |
| `slicerInputSyncThreshold` | Input Sync Threshold | `0x0059` | `C127Field` | 0 to 127 |
| `slicerLevel` | Level | `0x005A` | `C127Field` | 0 to 127 |

### 9. VK ROTARY

| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `vkRotarySpeed` | Speed | `0x005B` | `BooleanField` | "SLOW" / "FAST" |
| `vkRotaryBrake` | Brake | `0x005C` | `BooleanField` | "OFF" / "ON" |
| `vkRotaryWooferSlowSpeed` | Woofer Slow Speed | `0x005D` | `UByteField` | 0 to 100 |
| `vkRotaryWooferFastSpeed` | Woofer Fast Speed | `0x005E` | `UByteField` | 0 to 100 |
| `vkRotaryWooferTransUp` | Woofer Trans Up | `0x005F` | `C127Field` | 0 to 127 |
| `vkRotaryWooferTransDown`| Woofer Trans Down | `0x0060` | `C127Field` | 0 to 127 |
| `vkRotaryWooferLevel` | Woofer Level | `0x0061` | `C127Field` | 0 to 127 |
| `vkRotaryTweeterSlowSpeed` | Tweeter Slow Speed| `0x0062` | `UByteField` | 0 to 100 |
| `vkRotaryTweeterFastSpeed` | Tweeter Fast Speed| `0x0063` | `UByteField` | 0 to 100 |
| `vkRotaryTweeterTransUp` | Tweeter Trans Up | `0x0064` | `C127Field` | 0 to 127 |
| `vkRotaryTweeterTransDown`| Tweeter Trans Down | `0x0065` | `C127Field` | 0 to 127 |
| `vkRotaryTweeterLevel`| Tweeter Level | `0x0066` | `C127Field` | 0 to 127 |
| `vkRotarySpread` | Spread | `0x0067` | `UByteField` | 0 to 10 |
| `vkRotaryHighGain` | High Gain | `0x0068` | `gain15dBField`| -15 to +15 dB |
| `vkRotaryLowGain` | Low Gain | `0x0069` | `gain15dBField`| -15 to +15 dB |
| `vkRotaryLevel` | Level | `0x006A` | `C127Field` | 0 to 127 |

### 10. HEXA-CHORUS

| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `hexaChorusPreDelay` | Pre Delay | `0x006B` | `mfxPreDelayField` | 0 to 100ms |
| `hexaChorusRateSyncSw` | Rate Sync Sw | `0x006C` | `BooleanField`| "OFF" / "ON" |
| `hexaChorusRate` | Rate | `0x006D` | `UByteField` | 0 to 100 |
| `hexaChorusRateNote` | Rate Note | `0x006E` | `mfxRateNoteField`| Tempo-synced rates |
| `hexaChorusDepth` | Depth | `0x006F` | `C127Field` | 0 to 127 |
| `hexaChorusPreDelayDeviation`| Pre Delay Deviation | `0x0070` | `UByteField` | 0 to 20 |
| `hexaChorusDepthDeviation` | Depth Deviation | `0x0071` | `UByteField` | -20 to 20 |
| `hexaChorusPanDeviation` | Pan Deviation | `0x0072` | `UByteField` | 0 to 20 |
| `hexaChorusBalance` | Balance | `0x0073` | `dryWet100Field`| D100:W0 to D0:W100 |
| `hexaChorusLevel` | Level | `0x0074` | `C127Field` | 0 to 127 |

### 11. SPACE-D

| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `spaceDPreDelay` | Pre Delay | `0x0075` | `mfxPreDelayField` | 0 to 100ms |
| `spaceDRateSyncSw` | Rate Sync Sw | `0x0076` | `BooleanField`| "OFF" / "ON" |
| `spaceDRate` | Rate | `0x0077` | `UByteField` | 0 to 100 |
| `spaceDRateNote` | Rate Note | `0x0078` | `mfxRateNoteField`| Tempo-synced rates |
| `spaceDDepth` | Depth | `0x0079` | `C127Field` | 0 to 127 |
| `spaceDPhase` | Phase | `0x007A` | `mfxPhaseField` | 0 to 180° |
| `spaceDLowGain` | Low Gain | `0x007B` | `gain15dBField`| -15 to +15 dB |
| `spaceDHighGain` | High Gain | `0x007C` | `gain15dBField`| -15 to +15 dB |
| `spaceDBalance` | Balance | `0x007D` | `dryWet100Field`| D100:W0 to D0:W100 |
| `spaceDLevel` | Level | `0x007E` | `C127Field` | 0 to 127 |

### 12. FLANGER

| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `flangerFilterType` | Filter Type | `0x007F` | `mfxFilterTypeField`| "OFF", "LPF", "HPF" |
| `flangerCutoffFreq` | Cutoff Freq | `0x0100` | `freq8000Field`| 200Hz to 8.0kHz |
| `flangerPreDelay` | Pre Delay | `0x0101` | `mfxPreDelayField` | 0 to 100ms |
| `flangerRateSyncSw` | Rate Sync Sw | `0x0102` | `BooleanField`| "OFF" / "ON" |
| `flangerRate` | Rate | `0x0103` | `UByteField` | 0 to 100 |
| `flangerRateNote` | Rate Note | `0x0104` | `mfxRateNoteField`| Tempo-synced rates |
| `flangerDepth` | Depth | `0x0105` | `C127Field` | 0 to 127 |
| `flangerPhase` | Phase | `0x0106` | `mfxPhaseField` | 0 to 180° |
| `flangerFeedback` | Feedback | `0x0107` | `feedback98Field`| -98% to +98% |
| `flangerLowGain` | Low Gain | `0x0108` | `gain15dBField`| -15 to +15 dB |
| `flangerHighGain` | High Gain | `0x0109` | `gain15dBField`| -15 to +15 dB |
| `flangerBalance` | Balance | `0x010A` | `dryWet100Field`| D100:W0 to D0:W100 |
| `flangerLevel` | Level | `0x010B` | `C127Field` | 0 to 127 |

### 13. STEP FLANGER

| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `stepFlangerFilterType` | Filter Type | `0x010C` | `mfxFilterTypeField`| "OFF", "LPF", "HPF" |
| `stepFlangerCutoffFreq`| Cutoff Freq | `0x010D` | `freq8000Field`| 200Hz to 8.0kHz |
| `stepFlangerPreDelay` | Pre Delay | `0x010E` | `mfxPreDelayField` | 0 to 100ms |
| `stepFlangerRateSyncSw` | Rate Sync Sw | `0x010F` | `BooleanField`| "OFF" / "ON" |
| `stepFlangerRate` | Rate | `0x0110` | `UByteField` | 0 to 100 |
| `stepFlangerRateNote` | Rate Note | `0x0111` | `mfxRateNoteField`| Tempo-synced rates |
| `stepFlangerDepth` | Depth | `0x0112` | `C127Field` | 0 to 127 |
| `stepFlangerPhase` | Phase | `0x0113` | `mfxPhaseField` | 0 to 180° |
| `stepFlangerFeedback` | Feedback | `0x0114` | `feedback98Field`| -98% to +98% |
| `stepFlangerStepRateSyncSw` | Step Rate Sync Sw | `0x0115` | `BooleanField`| "OFF" / "ON" |
| `stepFlangerStepRate` | Step Rate | `0x0116` | `UByteField` | 0 to 100 |
| `stepFlangerStepRateNote`| Step Rate Note | `0x0117` | `mfxRateNoteField`| Tempo-synced rates |
| `stepFlangerLowGain` | Low Gain | `0x0118` | `gain15dBField`| -15 to +15 dB |
| `stepFlangerHighGain` | High Gain | `0x0119` | `gain15dBField`| -15 to +15 dB |
| `stepFlangerBalance` | Balance | `0x011A` | `dryWet100Field`| D100:W0 to D0:W100 |
| `stepFlangerLevel` | Level | `0x011B` | `C127Field` | 0 to 127 |

### 14. GUITAR AMP SIM

| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `gtrAmpSimPreAmpSw` | Pre Amp Sw | `0x011C` | `BooleanField` | "OFF" / "ON" |
| `gtrAmpSimPreAmpType` | Pre Amp Type | `0x011D` | `EnumField` | "JC-120", "CLEAN TWIN", "MATCH DRIVE", "BG LEAD", "MS1959I", "MS1959II", "MS1959I+II", "SLDN LEAD", "METAL 5150", "METAL LEAD", "OD-1", "OD-2 TURBO", "DISTORTION", "FUZZ" |
| `gtrAmpSimPreAmpVolume` | Pre Amp Volume | `0x011E` | `C127Field` | 0 to 127 |
| `gtrAmpSimPreAmpMaster` | Pre Amp Master | `0x011F` | `C127Field` | 0 to 127 |
| `gtrAmpSimPreAmpGain`| Pre Amp Gain | `0x0120` | `EnumField` | "LOW", "MIDDLE", "HIGH" |
| `gtrAmpSimPreAmpBass`| Pre Amp Bass | `0x0121` | `C127Field` | 0 to 127 |
| `gtrAmpSimPreAmpMiddle`| Pre Amp Middle | `0x0122` | `C127Field` | 0 to 127 |
| `gtrAmpSimPreAmpTreble`| Pre Amp Treble | `0x0123` | `C127Field` | 0 to 127 |
| `gtrAmpSimPreAmpPresence`| Pre Amp Presence | `0x0124` | `C127Field` | 0 to 127 |
| `gtrAmpSimPreAmpBright`| Pre Amp Bright | `0x0125` | `BooleanField` | "OFF" / "ON" |
| `gtrAmpSimSpeakerSw` | Speaker Sw | `0x0126` | `BooleanField` | "OFF" / "ON" |
| `gtrAmpSimSpeakerType` | Speaker Type | `0x0127` | `EnumField` | "SMALL 1", "SMALL 2", "MIDDLE", "JC-120", "BUILT-IN 1", "BUILT-IN 2", "BUILT-IN 3", "BUILT-IN 4", "BUILT-IN 5", "BG STACK 1", "BG STACK 2", "MS STACK 1", "MS STACK 2", "METAL STACK", "2-STACK", "3-STACK" |
| `gtrAmpSimMicSetting`| Mic Setting | `0x0128` | `EnumField` | "1", "2", "3" |
| `gtrAmpSimMicLevel` | Mic Level | `0x0129` | `C127Field` | 0 to 127 |
| `gtrAmpSimDirectLevel`| Direct Level | `0x012A` | `C127Field` | 0 to 127 |
| `gtrAmpSimPan` | Pan | `0x012B` | `c64PanField` | L64-C-R64 |
| `gtrAmpSimLevel` | Level | `0x012C` | `C127Field` | 0 to 127 |

### 15. COMPRESSOR

| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `compressorAttack` | Attack | `0x012D` | `C127Field` | 0 to 127 |
| `compressorThreshold` | Threshold | `0x012E` | `C127Field` | 0 to 127 |
| `compressorPostGain` | Post Gain | `0x012F` | `positiveGain18dbField`| 0 to +18 dB |
| `compressorLowGain` | Low Gain | `0x0130` | `gain15dBField`| -15 to +15 dB |
| `compressorHighGain` | High Gain | `0x0131` | `gain15dBField`| -15 to +15 dB |
| `compressorLevel` | Level | `0x0132` | `C127Field` | 0 to 127 |

### 16. LIMITER

| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `limiterRelease` | Release | `0x0133` | `C127Field` | 0 to 127 |
| `limiterThreshold` | Threshold | `0x0134` | `C127Field` | 0 to 127 |
| `limiterRatio` | Ratio | `0x0135` | `EnumField` | "1.5:1", "2:1", "4:1", "100:1" |
| `limiterPostGain` | Post Gain | `0x0136` | `positiveGain18dbField`| 0 to +18 dB |
| `limiterLowGain` | Low Gain | `0x0137` | `gain15dBField`| -15 to +15 dB |
| `limiterHighGain` | High Gain | `0x0138` | `gain15dBField`| -15 to +15 dB |
| `limiterLevel` | Level | `0x0139` | `C127Field` | 0 to 127 |

### 17. 3TAP PAN DELAY

| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `threeTapDelayDelayLeftSyncSw`| Delay Left Sync Sw| `0x013A` | `BooleanField`| "OFF" / "ON" |
| `threeTapDelayDelayLeft` | Delay Left | `0x013B` | `mfx2600msecField`| 1 to 2600 ms |
| `threeTapDelayDelayLeftNote` | Delay Left Note | `0x013E` | `mfxDelayNoteField`| Tempo-synced rates |
| `threeTapDelayDelayRightSyncSw`| Delay Right Sync Sw| `0x013F` | `BooleanField`| "OFF" / "ON" |
| `threeTapDelayDelayRight` | Delay Right | `0x0140` | `mfx2600msecField`| 1 to 2600 ms |
| `threeTapDelayDelayRightNote` | Delay Right Note | `0x0143` | `mfxDelayNoteField`| Tempo-synced rates |
| `threeTapDelayDelayCenterSyncSw`| Delay Center Sync Sw|`0x0144` | `BooleanField`| "OFF" / "ON" |
| `threeTapDelayDelayCenter` | Delay Center | `0x0145` | `mfx2600msecField`| 1 to 2600 ms |
| `threeTapDelayDelayCenterNote` | Delay Center Note | `0x0148` | `mfxDelayNoteField`| Tempo-synced rates |
| `threeTapDelayCenterFeedback`| Center Feedback | `0x0149` | `feedback98Field`| -98% to +98% |
| `threeTapDelayHFDamp` | HF Damp | `0x014A` | `freq8000BypassField`| 200Hz to 8.0kHz, BYPASS |
| `threeTapDelayLeftLevel` | Left Level | `0x014B` | `C127Field` | 0 to 127 |
| `threeTapDelayRightLevel` | Right Level | `0x014C` | `C127Field` | 0 to 127 |
| `threeTapDelayCenterLevel`| Center Level | `0x014D` | `C127Field` | 0 to 127 |
| `threeTapDelayLowGain` | Low Gain | `0x014E` | `gain15dBField`| -15 to +15 dB |
| `threeTapDelayHighGain` | High Gain | `0x014F` | `gain15dBField`| -15 to +15 dB |
| `threeTapDelayBalance` | Balance | `0x0150` | `dryWet100Field`| D100:W0 to D0:W100 |
| `threeTapDelayLevel` | Level | `0x0151` | `C127Field` | 0 to 127 |

### 18. TIME CTRL DELAY

| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `timeCtrlDelayDelayTimeSyncSw` | Delay Time Sync Sw | `0x0152` | `BooleanField`| "OFF" / "ON" |
| `timeCtrlDelayDelayTime` | Delay Time | `0x0153` | `mfx1300msecField`| 1 to 1300 ms |
| `timeCtrlDelayDelayTimeNote`| Delay Time Note | `0x0156` | `mfxDelayNoteField`| Tempo-synced rates |
| `timeCtrlDelayAcceleration`| Acceleration | `0x0157` | `UByteField` | 0 to 15 |
| `timeCtrlDelayFeedback`| Feedback | `0x0158` | `feedback98Field`| -98% to +98% |
| `timeCtrlDelayHFDamp` | HF Damp | `0x0159` | `freq8000BypassField`| 200Hz to 8.0kHz, BYPASS |
| `timeCtrlDelayLowGain` | Low Gain | `0x015A` | `gain15dBField`| -15 to +15 dB |
| `timeCtrlDelayHighGain`| High Gain | `0x015B` | `gain15dBField`| -15 to +15 dB |
| `timeCtrlDelayBalance` | Balance | `0x015C` | `dryWet100Field`| D100:W0 to D0:W100 |
| `timeCtrlDelayLevel` | Level | `0x015D` | `C127Field` | 0 to 127 |

### 19. LOFI COMPRESS

| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `lofiCompressPreFilterType` | Pre Filter Type | `0x015E` | `UByteField` | 1 to 6 |
| `lofiCompressLoFiType` | LoFi Type | `0x015F` | `UByteField` | 1 to 9 |
| `lofiCompressPostFilterType` | Post Filter Type | `0x0160` | `EnumField` | "OFF", "LPF", "HPF" |
| `lofiCompressPostFilterCutoff`| Post Filter Cutoff | `0x0161` | `freq8000Field`| 200Hz to 8.0kHz |
| `lofiCompressLowGain` | Low Gain | `0x0162` | `gain15dBField`| -15 to +15 dB |
| `lofiCompressHighGain`| High Gain | `0x0163` | `gain15dBField`| -15 to +15 dB |
| `lofiCompressBalance` | Balance | `0x0164` | `dryWet100Field`| D100:W0 to D0:W100 |
| `lofiCompressLevel` | Level | `0x0165` | `C127Field` | 0 to 127 |

### 20. PITCH SHIFTER

| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `pitchShifterCoarse` | Coarse | `0x0166` | `UByteField` | -24 to 12 |
| `pitchShifterFine` | Fine | `0x0167` | `UByteField` | -100 to 100 |
| `pitchShifterDelayTimeSyncSw`| Delay Time Sync Sw | `0x0168` | `BooleanField`| "OFF" / "ON" |
| `pitchShifterDelayTime` | Delay Time | `0x0169` | `mfx1300msecField`| 1 to 1300 ms |
| `pitchShifterDelayTimeNote`| Delay Time Note | `0x016C` | `mfxDelayNoteField`| Tempo-synced rates |
| `pitchShifterFeedback` | Feedback | `0x016D` | `feedback98Field`| -98% to +98% |
| `pitchShifterLowGain` | Low Gain | `0x016E` | `gain15dBField`| -15 to +15 dB |
| `pitchShifterHighGain` | High Gain | `0x016F` | `gain15dBField`| -15 to +15 dB |
| `pitchShifterBalance` | Balance | `0x0170` | `dryWet100Field`| D100:W0 to D0:W100 |
| `pitchShifterLevel` | Level | `0x0171` | `C127Field` | 0 to 127 |
