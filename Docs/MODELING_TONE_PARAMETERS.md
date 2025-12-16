# Modeling Tone Parameters

This document provides a detailed list of the "Modeling Tone" parameters for the Roland GR-55. These parameters control the sound of the modeled instrument, such as the type of guitar, pickups, and various other settings.

The `modelingTone` parameter block is located at address offset `0x030000` within a patch.

**Note on GUITAR vs. BASS Mode:** Many of the parameters in this section are specific to either "GUITAR" or "BASS" mode. The `patchAttribute` field in the `common` block determines which mode is active. This document will indicate which parameters are mode-specific.

## Common Modeling Parameters

These parameters are available in both GUITAR and BASS modes.

| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `level` | Level | `0x0009` | `UByteField(0, 100)` | The volume level of the modeling tone. |
| `muteSwitch` | Mute Switch | `0x000a` | `BooleanField` | Mutes the modeling tone. Note: This is an `invertedMuteField`, so a value of `1` means UNMUTE and `0` means MUTE. |
| `string1Level` - `string6Level` | String 1-6 Level | `0x000b` - `0x0010` | `UByteField(0, 100)` | Individual volume levels for each string. |
| `pitchShiftString1` - `pitchShiftString6` | Pitch Shift String 1-6| `0x0011`, `0x0013`, ... | `UByteField(-24, 24)` | Pitch shift in semitones for each string. `encodedOffset: 24` |
| `pitchShiftFineString1` - `pitchShiftFineString6` | Pitch Shift Fine String 1-6| `0x0012`, `0x0014`, ... | `UByteField(-50, 50)` | Fine pitch adjustment in cents for each string. `encodedOffset: 50` |
| `twelveStrSwitch` | 12-STR Switch | `0x001d` | `BooleanField` | Enables the 12-string simulation. |
| `twelveStrDirectLevel` | 12-STR Direct Level | `0x001e` | `UByteField(0, 100)` | The volume of the direct (un-shifted) sound in the 12-string simulation. |
| `twelveStrShiftString1` - `twelveStrShiftString6` | 12-STR Shift String 1-6 | `0x001f` - `0x002a` | `UByteField` | Individual pitch shift and fine-tuning for the 12-string effect on each string. |
| `nsSwitch` | NS Switch | `0x002b` | `BooleanField` | Enables the noise suppressor for the modeling tone. |
| `nsThreshold` | NS Threshold | `0x002c` | `UByteField(0, 100)` | The threshold for the noise suppressor. |
| `nsRelease` | NS Release | `0x002d` | `UByteField(0, 100)` | The release time for the noise suppressor. |

## GUITAR Mode Parameters

These parameters are only active when the patch's `patchAttribute` is set to "GUITAR".

### Tone Selection
| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `toneCategory_guitar` | Tone Category | `0x0000` | `EnumField` | The main category of the modeled guitar sound ("E.GTR", "AC", "E.BASS", "SYNTH"). |
| `toneNumberEGtr_guitar`| E.GTR Tone Number | `0x0001` | `EnumField` | The specific electric guitar model (e.g., "CLA-ST", "MOD-ST", "LP"). |
| `toneNumberAc_guitar`| AC Tone Number | `0x0002` | `EnumField` | The specific acoustic instrument model (e.g., "STEEL", "NYLON", "SITAR"). |
| `toneNumberEBass_guitar`| E.BASS Tone Number | `0x0003` | `EnumField` | The specific electric bass model (e.g., "JB", "PB"). |
| `toneNumberSynth_guitar`| SYNTH Tone Number | `0x0004` | `EnumField` | The specific synth model (e.g., "ANALOG GR", "WAVE SYNTH"). |

### E.GTR Parameters
| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `eGuitarPickupSelect3_guitar` | E. Guitar Pickup Select 3 | `0x002e` | `EnumField` | For 3-pickup guitars ("REAR", "R+F", "FRONT"). |
| `eGuitarPickupSelect5_guitar` | E. Guitar Pickup Select 5 | `0x002f` | `EnumField` | For 5-pickup guitars ("REAR", "R+C", "R+F", "C+F", "FRONT"). |
| `eGuitarPickupSelectLips_guitar`| E. Guitar Pickup Select LIPS | `0x0030` | `EnumField` | For "LIPS" model ("REAR", "R+C", "CENTER", "C+F", "FRONT", "ALL"). |
| `eGuitarVolume_guitar` | E. Guitar Volume | `0x0031` | `UByteField(0, 100)` |  |
| `eGuitarTone_guitar` | E. Guitar Tone | `0x0032` | `UByteField(0, 100)` |  |

### Acoustic Parameters
| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `steelType_guitar` | Steel Type | `0x0033` | `EnumField` | The type of steel-string acoustic. |
| `steelBody_guitar` | Steel Body | `0x0034` | `UByteField(0, 100)` | Body resonance for steel-string. |
| `steelTone_guitar` | Steel Tone | `0x0035` | `UByteField(-50, 50)` | Tone for steel-string. `encodedOffset: 50` |
| `nylonBody_guitar` | Nylon Body | `0x0036` | `UByteField(0, 100)` | Body resonance for nylon-string. |
| `nylonAttack_guitar` | Nylon Attack | `0x0037` | `UByteField(0, 100)` | Attack for nylon-string. |
| `nylonTone_guitar` | Nylon Tone | `0x0038` | `UByteField(-50, 50)` | Tone for nylon-string. `encodedOffset: 50` |
| `sitarPickup_guitar` | Sitar Pickup | `0x0039` | `EnumField` | Sitar pickup selection. |
| ... | Sitar parameters | `0x003a` - `0x0040` | `...` | Sens, Body, Color, Decay, Buzz, Attack, Tone. |
| `banjoAttack_guitar` | Banjo Attack | `0x0041` | `UByteField(0, 100)` | |
| `banjoReso_guitar` | Banjo Reso | `0x0042` | `UByteField(0, 100)` | |
| `banjoTone_guitar` | Banjo Tone | `0x0043` | `UByteField(-50, 50)` | `encodedOffset: 50` |
| `resoSustain_guitar` | Reso Sustain | `0x0044` | `UByteField(0, 100)` | |
| `resoResonance_guitar` | Reso Resonance | `0x0045` | `UByteField(0, 100)` | |
| `resoTone_guitar` | Reso Tone | `0x0046` | `UByteField(-50, 50)` | `encodedOffset: 50` |

### E.BASS (in GUITAR mode) Parameters
| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `eBassRearVolume_guitar` | E. Bass Rear Volume | `0x0047` | `UByteField(0, 100)` | |
| `eBassFrontVolume_guitar`| E. Bass Front Volume | `0x0048` | `UByteField(0, 100)` | |
| `eBassVolume_guitar` | E. Bass Volume | `0x0049` | `UByteField(0, 100)` | |
| `eBassTone_guitar` | E. Bass Tone | `0x004a` | `UByteField(0, 100)` | |

### SYNTH (in GUITAR mode) Parameters
This section covers the various synth models available in GUITAR mode.

#### ANALOG GR
| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `gr300Mode_guitar` | GR-300 Mode | `0x004b` | `EnumField` | "VCO", "V+D", "DIST" |
| `gr300Comp_guitar` | GR-300 Comp | `0x004c` | `BooleanField` | |
| `gr300Cutoff_guitar` | GR-300 Cutoff | `0x004d` | `UByteField(0, 100)` | |
| `gr300Resonance_guitar` | GR-300 Resonance | `0x004e` | `UByteField(0, 100)` | |
| `gr300EnvModSwitch_guitar` | GR-300 Env Mod Switch | `0x004f` | `EnumField` | "OFF", "ON", "INV" |
| ... | GR-300 parameters | `0x0050` - `0x005d` | `...` | Env Mod Sens/Attack, Pitch A/B, Sweep, Vibrato |

#### WAVE SYNTH
| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `waveSynthType_guitar` | Wave Synth Type | `0x005e` | `EnumField` | "SAW", "SQU" |
| `waveSynthColor_guitar` | Wave Synth Color | `0x005f` | `UByteField(0, 100)` | |

#### FILTER BASS
| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `filterBassCutoff_guitar` | Filter Bass Cutoff | `0x0060` | `UByteField(0, 100)` | |
| ... | Filter Bass parameters | `0x0061` - `0x0064` | `...` | Resonance, Decay, Touch Sens, Color |

#### CRYSTAL
| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `crystalAttackLength_guitar` | Crystal Attack Length | `0x0065` | `UByteField(0, 100)` | |
| ... | Crystal parameters | `0x0066` - `0x006a` | `...` | Mod Tune/Depth, Attack Level, Body, Sustain |

#### ORGAN
| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `organFeet16_guitar` | Organ Feet 16 | `0x006b` | `UByteField(0, 100)` | |
| `organFeet8_guitar` | Organ Feet 8 | `0x006c` | `UByteField(0, 100)` | |
| `organFeet4_guitar` | Organ Feet 4 | `0x006d` | `UByteField(0, 100)` | |
| `organSustain_guitar` | Organ Sustain | `0x006e` | `UByteField(0, 100)` | |

#### BRASS
| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `brassCutoff_guitar` | Brass Cutoff | `0x006f` | `UByteField(0, 100)` | |
| ... | Brass parameters | `0x0070` - `0x0072` | `...` | Resonance, Touch Sens, Sustain |


## BASS Mode Parameters

These parameters are only active when the patch's `patchAttribute` is set to "BASS".

### Tone Selection
| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `toneCategory_bass` | Tone Category | `0x0005` | `EnumField` | "E.BASS", "SYNTH", "E.GTR" |
| `toneNumberEBass_bass`| E.BASS Tone Number | `0x0006` | `EnumField` | "VINT JB", "JB", "VINT PB", "PB", "M-MAN", "RICK", "T-BIRD", "ACTIVE", "VIOLIN" |
| `toneNumberEGtr_bass`| E.GTR Tone Number | `0x0007` | `EnumField` | "ST", "LP" |
| `toneNumberSynth_bass`| SYNTH Tone Number | `0x0008` | `EnumField` | "ANALOG GR", "WAVE SYNTH", "FILTER BASS", "CRYSTAL", "ORGAN", "BRASS" |

### E.BASS Parameters
| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `eBassRearVolume_bass` | E.Bass Rear Volume | `0x0114` | `UByteField(0, 100)` | |
| `eBassFrontVolume_bass`| E.Bass Front Volume | `0x0115` | `UByteField(0, 100)` | |
| `eBassVolume_bass` | E.Bass Volume | `0x0116` | `UByteField(0, 100)` | |
| `eBassTone_bass` | E.Bass Tone | `0x0117` | `UByteField(0, 100)` | |
| `eBassTreble_bass` | E.Bass Treble | `0x0118` | `UByteField(0, 100)` | For M-MAN model |
| `eBassBass_bass` | E.Bass Bass | `0x0119` | `UByteField(0, 100)` | For M-MAN model |
| `eBassActiveTreble_bass`| E.Bass Active Treble | `0x011a` | `UByteField(0, 100)` | For ACTIVE model |
| `eBassActiveBass_bass` | E.Bass Active Bass | `0x011b` | `UByteField(0, 100)` | For ACTIVE model |
| `eBassRearTone_bass` | E.Bass Rear Tone | `0x011c` | `UByteField(0, 100)` | For RICK model |
| `eBassFrontTone_bass`| E.Bass Front Tone | `0x011d` | `UByteField(0, 100)` | For RICK model |
| `eBassPickupSelect_bass` | E.Bass Pickup Select | `0x011e` | `EnumField` | For RICK model ("REAR", "R+F", "FRONT") |
| `eBassTrebleSwitch_bass`| E.Bass Treble Switch | `0x011f` | `BooleanField` | For VIOLIN model |
| `eBassBassSwitch_bass` | E.Bass Bass Switch | `0x0120` | `BooleanField` | For VIOLIN model |
| `eBassRhythmSoloSwitch_bass` | E.Bass Rhythm/Solo Switch | `0x0121` | `BooleanField` | For VIOLIN model ("RHYTHM", "SOLO") |

### E.GTR (in BASS mode) Parameters
| Parameter | Description | Address Offset | Data Type | Logic |
|---|---|---|---|---|
| `eGuitarPickupSelect3_bass` | E.Guitar Pickup Select 3 | `0x0110` | `EnumField` | "REAR", "R+F", "FRONT" |
| `eGuitarPickupSelect5_bass` | E.Guitar Pickup Select 5 | `0x0111` | `EnumField` | "REAR", "R+C", "CENTER", "C+F", "FRONT" |
| `eGuitarVolume_bass` | E.Guitar Volume | `0x0112` | `UByteField(0, 100)` | |
| `eGuitarTone_bass` | E.Guitar Tone | `0x0113` | `UByteField(0, 100)` | |

### SYNTH (in BASS mode) Parameters
The synth parameters in BASS mode are identical in function to their GUITAR mode counterparts, but they have different address offsets.

#### ANALOG GR
| Parameter | Address Offset |
|---|---|
| `gr300Mode_bass` | `0x0122` |
| ... | ... |

#### WAVE SYNTH
| Parameter | Address Offset |
|---|---|
| `waveSynthType_bass` | `0x0135` |
| ... | ... |

...and so on for FILTER BASS, CRYSTAL, ORGAN, and BRASS.