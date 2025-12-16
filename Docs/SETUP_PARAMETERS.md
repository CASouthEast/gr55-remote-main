# GR-55 Setup Parameters

This document describes the MIDI sysex parameter mapping for the GR-55's Setup settings.

**Note:** The address `0x30` is mentioned for Setup in `ADDRESS_MAP_AND_ASSIGNS.md` but the address defined in `RolandGR55AddressMap.ts` is `0x01000000`. This documentation uses the value from the code.

The following parameters are located under `SetupStruct` at base address `0x01000000`.

## Setup Parameters

| Parameter | Description | Address Offset | Data Type | Logic |
| --- | --- | --- | --- | --- |
| `patchBsMsb` | Patch Bank Select MSB (CC #0) | `0x0000` | `UByteField` | `0-127` |
| `patchPc` | Patch Program Change (PC) | `0x0001` | `UByteField` | `0-127` |