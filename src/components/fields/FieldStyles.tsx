import { StyleSheet } from "react-native";

export const FieldStyles = StyleSheet.create({
  horizontal: {
    flexDirection: "row",
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  fieldDescriptionColumn: {
    flex: 1,
    marginRight: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  fieldDescription: {
    flex: 1,
  },
  fieldControl: {
    flex: 1.5,
    alignItems: "stretch",
  },
  fieldControlInner: {
    width: "100%",
  },
  fieldRowAssigned: {},
  fieldDescriptionAssigned: {},
  fieldControlAssigned: {},
  fieldRowPressed: {
    opacity: 0.5,
  },
});
