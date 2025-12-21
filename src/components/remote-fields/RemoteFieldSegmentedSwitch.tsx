import { useCallback, useMemo } from "react";

import { RemoteFieldRow } from "./RemoteFieldRow";
import { RolandRemotePageContext } from "../../contexts/RolandRemotePageContext";
import { useMaybeControlledRemoteField } from "../../hooks/useRemoteField";
import { BooleanField, FieldReference } from "../../lib/RolandAddressMap";
import { SegmentedPicker } from "../SegmentedPicker";
import { FieldStyles } from "../fields/FieldStyles";

export function RemoteFieldSegmentedSwitch({
  page,
  field,
  value: valueProp,
  onValueChange: onValueChangeProp,
}: {
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  field: FieldReference<BooleanField>;
  inline?: boolean;
  segmented?: boolean;
  page: RolandRemotePageContext;
}) {
  const [value, onValueChange, status] = useMaybeControlledRemoteField(
    page,
    field,
    valueProp,
    onValueChangeProp
  );
  const invertedForDisplay = field.definition.type.invertedForDisplay;

  const handleLabelChange = useCallback(
    (label: string) => {
      onValueChange(label === field.definition.type.trueLabel);
    },
    [field, onValueChange]
  );
  const labelsInOrder = useMemo(
    () =>
      invertedForDisplay
        ? ([
            field.definition.type.trueLabel,
            field.definition.type.falseLabel,
          ] as const)
        : ([
            field.definition.type.falseLabel,
            field.definition.type.trueLabel,
          ] as const),
    [field, invertedForDisplay]
  );
  const isPending = status === "pending";
  return (
    <RemoteFieldRow page={page} field={field}>
      <SegmentedPicker
        style={FieldStyles.fieldControlInner}
        onValueChange={handleLabelChange}
        value={
          isPending
            ? undefined
            : (invertedForDisplay ? !value : value)
            ? field.definition.type.trueLabel
            : field.definition.type.falseLabel
        }
        values={labelsInOrder}
        disabled={isPending}
      />
    </RemoteFieldRow>
  );
}
