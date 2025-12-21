import { FieldRow } from "./components/FieldRow";

export function FieldPlaceholder({ children }: { children: React.ReactNode }) {
  return <FieldRow description={children} />;
}
