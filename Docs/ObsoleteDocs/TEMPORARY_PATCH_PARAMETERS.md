# GR-55 Temporary Patch Parameters

This document describes the structure of the GR-55's temporary patch memory area.

## Overview

The temporary patch is a memory area on the GR-55 that holds the patch currently being edited. When you interact with the controls in this application, you are modifying the parameters in this temporary patch area. The base address for the temporary patch is `0x18000000`.

The structure of the temporary patch is defined by the `PatchStruct` in `RolandGR55AddressMap.ts`. This struct is a collection of other structs, each representing a different logical section of a patch.

## Patch Structure (`PatchStruct`)

The `PatchStruct` is composed of the following sections. Each section has its own detailed documentation page.

| Section                                       | Description                                                                           | Address Offset          | Documentation                                                                                                          |
| --------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `common`                                      | Common patch parameters, including name, controller assignments, and master settings. | `0x000000`              | [COMMON_PATCH_PARAMETERS.md](./COMMON_PATCH_PARAMETERS.md), [PATCH_MASTER_PARAMETERS.md](./PATCH_MASTER_PARAMETERS.md) |
| `mfx`                                         | Multi-Effects parameters.                                                             | `0x000300`              | [MFX_PARAMETERS.md](./MFX_PARAMETERS.md)                                                                               |
| `sendsAndEq`                                  | Chorus, Delay, Reverb, and EQ parameters.                                             | `0x000600`              | [SENDS_AND_EQ_PARAMETERS.md](./SENDS_AND_EQ_PARAMETERS.md)                                                             |
| `ampModNs`                                    | Amplifier simulation, modulation effect, and noise suppressor parameters.             | `0x000700`              | [AMP_MOD_NS_PARAMETERS.md](./AMP_MOD_NS_PARAMETERS.md)                                                                 |
| `modelingTone`                                | Modeling tone parameters, for instrument modeling.                                    | `0x001000`              | [MODELING_TONE_PARAMETERS.md](./MODELING_TONE_PARAMETERS.md)                                                           |
| `patchPCMTone1` / `patchPCMTone2`             | Parameters for the two PCM tones.                                                     | `0x002000` / `0x002100` | [PCM_TONE_PARAMETERS.md](./PCM_TONE_PARAMETERS.md)                                                                     |
| `patchPCMTone1Offset` / `patchPCMTone2Offset` | Offset parameters for the two PCM tones.                                              | `0x003000` / `0x003100` | [PCM_TONE_PARAMETERS.md](./PCM_TONE_PARAMETERS.md)                                                                     |
