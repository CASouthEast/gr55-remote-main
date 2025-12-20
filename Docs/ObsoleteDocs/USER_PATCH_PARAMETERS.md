# GR-55 User Patch Parameters

This document describes the structure of the GR-55's user patch memory area.

## Overview

User patches are stored in a non-volatile memory area on the GR-55, allowing users to save their own sounds. While they can be selected and loaded, they are not directly modified. Instead, a user patch is first loaded into the temporary patch area for editing. Once editing is complete, the contents of the temporary patch area can be saved to a user patch slot.

The starting address for the user patch memory is `0x21000000`. Individual user patches are located at offsets from this address. However, writing to these addresses directly is not the standard way of saving a patch. The recommended method is to use the `saveAndSelectUserPatch` command, which copies the temporary patch to the desired user patch slot.

The structure of a user patch is identical to the temporary patch, defined by the `PatchStruct` in `RolandGR55AddressMap.ts`.

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
