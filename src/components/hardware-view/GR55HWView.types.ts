/**
 * TypeScript type definitions for GR55 Hardware View components
 * These types define the interfaces for state management and component props
 */

export interface GR55State {
  /** Current active pedal (1-4) */
  activePedal: number;

  /** Current patch name displayed on LCD */
  patchName: string;

  /** Active sound style selection */
  activeStyle: "LEAD" | "RHYTHM" | "OTHER" | "USER";

  /** Current bank display (e.g., "01-1") */
  bank: string;
}

export interface GR55Actions {
  setActivePedal: (pedal: number) => void;
  setPatchName: (name: string) => void;
  setActiveStyle: (style: GR55State["activeStyle"]) => void;
}

export interface GR55HWViewProps {
  initialState?: Partial<GR55State>;
  onStateChange?: (state: GR55State) => void;
}

export interface StyleButtonConfig {
  id: string;
  label: string;
  patch: string;
}

export interface StyleConfig {
  styles: StyleButtonConfig[];
}
