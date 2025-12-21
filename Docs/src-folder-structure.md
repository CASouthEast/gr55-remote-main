# src/ Folder Structure

This document describes the purpose and typical contents of the repository `src/` folder and its most important subfolders. It's intended as a quick guide for contributors who are navigating the codebase.

- **Top-level (`src/`)**: App entry and high-level modules.

  - Typical files: [src/App.tsx](src/App.tsx), [src/AppNavigationContainer.tsx](src/AppNavigationContainer.tsx), [src/navigation.tsx](src/navigation.tsx).
  - Purpose: application bootstrap, app-wide providers, and root-level hooks/state.

- **components/**: Reusable presentational components.

  - Expect: small UI components used across screens (buttons, pickers, themed text, search bars, wrappers).
  - Examples: shared, UI-focused, and lightly stateful components.

- **screens/**: Full-screen React components (routes/views).

  - Expect: one screen per file (PatchMainScreen, PatchListView, PatchEffects\* screens, IoSetupScreen, etc.).
  - Purpose: page-level logic, layout, and composition of `components` and domain modules.

- **lib/**: Protocols, device maps, and low-level utilities.

  - Expect: Roland/MIDI protocol implementations, SysEx helpers, address/patch maps and encoding logic.
  - Purpose: low-level domain logic used by multiple higher-level modules.

- **hooks/**: Custom React hooks.

  - Expect: `useRemoteField`, `usePatchMap`, `useCancellablePromise`, and other reusable behavior abstractions.
  - Purpose: shareable stateful logic used by screens and components.

- **contexts/**: React Context providers and related utilities.

  - Expect: page-level or domain contexts (e.g., remote device state, navigation-aware providers).
  - Purpose: declarative global or scoped application state.

- **modules/**: Larger domain groupings or feature modules.

  - Expect: grouped code that may include several related helpers and small components or wrappers.
  - Purpose: organize cohesive feature sets that are bigger than a single component but not low-level lib code.

- **navigation/**: Router-related helpers and navigator definitions.

  - Expect: screen registration, navigator defaults, and navigation helpers.
  - Purpose: centralize navigation setup and options.

- **services/**: Platform or background services.

  - Expect: BLE, MIDI I/O, data transfer, scheduling, and other runtime services.
  - Purpose: encapsulate interactions with hardware and OS APIs.

- **styles/**: Theming, shared style tokens, and contextual style helpers.

  - Expect: `Theme.tsx`, contextual styles, theme providers.
  - Purpose: centralize look-and-feel and theme constants.

- **screens, components and hooks interplay**:

  - Screens compose `components` and call `hooks` for behavior.
  - `lib` and `services` provide domain-specific logic and device interactions used by both screens and components.

- **How to use this guide**:
  - When adding UI, prefer `components/` for reusable pieces and `screens/` for page-level implementations.
  - Put protocol/device code and heavy business logic in `lib/` so it remains testable and importable without UI dependencies.
  - Add small, focused hooks to `hooks/` when behavior needs to be reused across multiple components or screens.

For a quick jump, the app entry lives at [src/App.tsx](src/App.tsx) and navigation setup at [src/navigation.tsx](src/navigation.tsx).

---

Generated: 21 December 2025
