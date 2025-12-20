# Flexible Addressing and Dynamic Offsets in GR-55 Patch Data

This document explains the mechanisms behind flexible addressing and dynamic offset calculations for patch parameters in the GR-55, as implemented in this codebase.

## Summary

The analysis of the codebase, particularly `RolandGR55AssignsMap.ts` and `RolandGR55Assigns.ts`, reveals two primary mechanisms that create a flexible addressing scheme. This flexibility explains why the defined address space for common patch parameters can be large (e.g., spanning over 600 bytes), while the actual SysEx messages sent are often much smaller (e.g., under 400 bytes).

The two main mechanisms are:

1.  **Conditional Parameter Sets:** The set of available parameters changes based on the context, such as the selected instrument mode ("GUITAR" or "BASS").
2.  **Address Rebasing:** The entire block of parameters can be relocated in memory, and the code dynamically calculates the absolute addresses based on a new base address.

These mechanisms allow for an efficient use of memory and SysEx message size, as only the parameters relevant to the current patch configuration are included.

## 1. Conditional Parameter Sets

The most direct evidence of flexible mappings is in the `buildAssignsMap` function within `RolandGR55AssignsMap.ts`. This function constructs a different list of assignable parameters based on the `guitarBassSelect` argument.

### Example from `RolandGR55AssignsMap.ts`

```typescript
function buildAssignsMap(guitarBassSelect: "GUITAR" | "BASS") {
  return new AssignsMap([
    // ... common parameters ...

    ...(guitarBassSelect === "GUITAR"
      ? [
          new FieldAssignDefinition(
            "Modeling E.GTR Cla-ST,Mod-ST PU Select",
            patch.modelingTone.eGuitarPickupSelect5_guitar
          ),
          // ... other GUITAR specific parameters
        ]
      : [
          new FieldAssignDefinition(
            "Modeling E.Bass PU Volume",
            patch.modelingTone.eBassVolume_bass
          ),
          // ... other BASS specific parameters
        ]),

    // ... other common parameters ...
  ]);
}
```

In this example, the spread operator (`...`) is used to conditionally include an array of `FieldAssignDefinition` objects. If `guitarBassSelect` is `"GUITAR"`, a set of guitar-specific modeling parameters are included in the `AssignsMap`. If it's `"BASS"`, a different set of bass-specific parameters are included.

This means that the total size and layout of the patch data can change depending on the selected instrument, leading to variable-sized data blocks.

## 2. Address Rebasing

The `AssignsMap` class in `RolandGR55Assigns.ts` is designed to work with relative addresses, allowing the entire map of parameters to be "rebased" to a different starting address. This is essential for handling multiple patches (e.g., temporary patch vs. user patches).

The `withAddressOffset` method, implemented by `FieldAssignDefinition` and other `AssignDefinition` types, is key to this functionality.

### Example from `RolandGR55Assigns.ts`

```typescript
export class FieldAssignDefinition implements AssignDefinition {
  // ... constructor ...

  withAddressOffset(offset: number): FieldAssignDefinition {
    return new FieldAssignDefinition(this.description, {
      ...this.field,
      address: this.field.address + offset,
    });
  }

  // ... other methods ...
}

export class AssignsMap {
  // ... constructor and other methods ...

  private rebaseAssign<T extends AssignDefinition>(
    assignDef: T,
    patch: AtomReference
  ): T {
    if (
      patch.address === this.basePatch.address ||
      !(assignDef instanceof FieldAssignDefinition)
    ) {
      return assignDef;
    }
    // ... caching logic ...
    const rebasedAssignDef = assignDef.withAddressOffset(
      patch.address - this.basePatch.address
    );
    // ... caching logic ...
    return rebasedAssignDef as any;
  }
}
```

Here's how it works:

1.  An `AssignsMap` is created with a default base address (e.g., for the temporary patch area).
2.  When data for a different patch needs to be accessed, the `rebaseAssign` method is called with a new `patch` object containing a different base address.
3.  `rebaseAssign` calculates the difference between the new and old base addresses.
4.  It then calls `withAddressOffset` on the `AssignDefinition`, which creates a _new_ definition with the address of the parameter recalculated relative to the new base.

This dynamic recalculation of addresses at runtime allows the same parameter definitions to be used for different memory locations, making the system highly flexible.

## Conclusion

The combination of conditional parameter sets and address rebasing results in a system where the structure of patch data is not fixed. The full address map defines all _possible_ parameters, but for any given patch, only a subset of those parameters might be active and included in SysEx messages. This explains the discrepancy between the large potential size of the address map and the smaller, more efficient size of the data being transmitted.
