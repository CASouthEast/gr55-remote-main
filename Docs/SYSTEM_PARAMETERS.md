# GR-55 System Parameters

This document describes the MIDI sysex parameter mapping for the GR-55's System settings.

**Note:** This list is incomplete. More parameters need to be added.

The following parameters are located under `SystemStruct` at base address `0x02000000`.

## Common System Parameters

| Parameter | Description | Address Offset | Data Type | Logic |
| --- | --- | --- | --- | --- |
| `guitarBassSelect` | Selects whether the GR-55 is in GUITAR or BASS mode. | `0x001a` | `EnumField` | `["GUITAR", "BASS"]` |
