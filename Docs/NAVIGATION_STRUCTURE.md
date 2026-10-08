# Navigation Structure: Web Platform

## Overview

This document explains how the navigation system works in the GR-55 Editor app when running in the browser. It focuses on the interaction between three key files:

- **[src/navigation/index.tsx](../src/navigation/index.tsx)** – Type definitions for all routes and parameters
- **[src/App.tsx](../src/App.tsx)** – Navigator tree construction (platform-aware)
- **[src/screens/PatchMainScreen.tsx](../src/screens/PatchMainScreen.tsx)** – A screen component that configures its header and triggers navigation

---

## Web-Specific Navigator Tree

On the web platform, the app uses a **Material Top Tab Navigator** instead of a drawer for the Patch editing interface.

### Root Navigator Structure

```
RootTab (BottomTabNavigator)
├── "PatchDrawer" (Top Tab Navigator on web, Drawer Navigator on native)
│   ├── "PatchMain"
│   ├── "PatchTone"
│   ├── "PatchEffects"
│   ├── "PatchMasterPedalGkCtl"
│   ├── "PatchAssigns"
│   └── "PatchMasterOther"
├── "LibraryPatchList"
├── "Hardware"
└── "SetupStack" (NativeStackNavigator)
    ├── "IoSetup"
    └── "BluetoothSettings"
```

### Platform Branching Logic

In [src/App.tsx](../src/App.tsx):

```typescript
// Only on web
const PatchTopTabs =
  Platform.OS === "web" ? createMaterialTopTabNavigator() : null;

// On native only
const PatchDrawer = Platform.OS !== "web" ? createDrawerNavigator() : null;
```

**Web Result:** The "PatchDrawer" tab on `RootTab` renders `PatchTopTabsNavigator` instead of a drawer, exposing all patch routes as horizontal top tabs.

---

## Component Responsibilities

### 1. [src/navigation/index.tsx](../src/navigation/index.tsx) – Type Safety

Defines param lists and navigation prop types used across navigators and screens:

- **`RootTabParamList`** – Routes in the bottom tab navigator
  - `PatchDrawer`, `LibraryPatchList`, `SetupStack`, `Hardware`
- **`PatchStackParamList`** – Routes within the patch editing area
  - `PatchMain`, `PatchTone`, `PatchEffects`, `PatchAssigns`, `PatchMasterOther`, `PatchMasterPedalGkCtl`, `PatchSaveAs`
- **`PatchToneTabParamList`** – Sub-routes within the Tone screen
  - `Normal`, `PCM1`, `PCM2`, `Modeling`
- **`PatchEffectsTabParamList`** – Sub-routes within the Effects screen
  - `Struct`, `Amp`, `Mod`, `MFX`, `DLY`, `REV`, `CHO`, `EQ`
- **`GlobalNavigationProp`** – A union navigation prop type combining multiple param lists

All screens use these types to ensure type-safe navigation calls.

---

### 2. [src/App.tsx](../src/App.tsx) – Navigator Construction

Builds the navigator hierarchy and handles platform-specific rendering:

#### Key Functions

- **`PatchTopTabsNavigator()`** – Web-only component

  - Creates horizontal tabs for Patch-related routes
  - Uses `createMaterialTopTabNavigator()`
  - Includes null-safety check (`if (!PatchTopTabs) return null`)
  - All screens are marked with `// @ts-ignore` because their prop types are from `NativeStackScreenProps`, but Material Top Tabs expects different props. At runtime, both navigators expose compatible navigation APIs.

- **`PatchDrawerNavigator()`** – Native-only component

  - Uses `createDrawerNavigator()`
  - Renders custom drawer content with menu items

- **`PatchStackNavigator()`** – Native only

  - Uses `createNativeStackNavigator()`
  - Groups screens with shared header options (e.g., save button)

- **`RootTabNavigator()`** – Cross-platform
  - Conditionally renders either `PatchTopTabsNavigator` or `PatchDrawerNavigator` based on platform
  - Hosts other tabs: Library, Hardware, Setup

---

### 3. [src/screens/PatchMainScreen.tsx](../src/screens/PatchMainScreen.tsx) – Screen-Level Navigation

A screen component that demonstrates how navigation integrates with UI:

#### Header Configuration

In a `useEffect`, it dynamically configures the navigation header:

```typescript
navigation.setOptions({
  headerTitle: renderHeaderTitle,  // Custom component with patch name
  title: "Overview",
  headerLeft: () => <DrawerToggleButton ... />,
});
```

**Note on Web:** The `DrawerToggleButton` is still rendered on web (to avoid code duplication), but it has no effect since the drawer UI does not exist. The button is conditionally disabled when no device is selected.

#### Intra-Patch Navigation

The screen triggers navigation to sibling tabs or sub-screens using standard React Navigation calls:

```typescript
// Navigate to PatchTone tab, then select the PCM1 sub-screen
navigation.navigate("PatchTone", { screen: "PCM1" });

// Navigate to PatchEffects tab
navigation.navigate("PatchEffects", { screen: "Amp" });
```

On web, `navigate("PatchTone")` switches the top tab to PatchTone. The `screen` parameter is forwarded to any nested tab navigators within that screen.

#### Tab Press Listener

The `PopStackToTopOnTabPress` function listens to the `RootTab` tab press event:

```typescript
navigation.getParent("RootTab")!.addListener("tabPress", () => {
  closeAllPopovers();
  navigation.dispatch(StackActions.popToTop());
});
```

This handles resetting the navigation stack when a tab is re-tapped. On web (where the Patch area uses tabs instead of a stack), this is a harmless no-op.

---

## Navigation Flow on Web – Example Journey

1. **User taps "PatchDrawer" tab** in the bottom tab bar

   - `RootTab` navigates to the "PatchDrawer" route
   - On web, this renders `PatchTopTabsNavigator`
   - The first screen shown is `PatchMainScreen` (the "PatchMain" tab)

2. **User taps "Tone" section in PatchMainScreen**

   - `navigation.navigate("PatchTone", { screen: "PCM1" })` is called
   - Top tabs switch to the "PatchTone" tab
   - `PatchToneScreen` renders with `PCM1` sub-tab active

3. **User taps "Back" or switches to another bottom tab**
   - Navigation state changes; `PatchToneScreen` unmounts
   - If they return to "PatchDrawer," they are back at the top-level `PatchMainScreen`

---

## Key Design Patterns

### Platform Abstraction

- Drawer UI is **native-only**; web uses tabs instead
- Route structures and params are **unified** via type definitions in `index.tsx`
- Screen components are **re-used** across platforms with `// @ts-ignore` bridges for navigator type mismatches

### Type Safety with Pragmatic Trade-offs

- `GlobalNavigationProp` unifies multiple param lists
- `NativeStackScreenProps` is used in screen signatures even on web (where a Material Top Tab navigator is used)
- `// @ts-ignore` comments acknowledge the type mismatch; runtime compatibility is ensured because both navigators expose the same `navigation` API methods (`navigate`, `setOptions`, etc.)

### Header Management

- Headers are configured dynamically in `useEffect` using `navigation.setOptions`
- Shared header logic (e.g., patch name, save button) is placed in groups or passed as options
- Custom header title components provide rich UI (e.g., `PatchNameHeaderButton`)

### Data-Driven Navigation

- Screen selection (e.g., which tone or effect) is passed via the `screen` parameter in `navigate()`
- No separate state management needed for route selection; React Navigation handles it

---

## Summary

On the **web platform**:

1. **index.tsx** defines the contract: route names, param types, and navigation prop types
2. **App.tsx** builds a top-tab-based navigator tree for the Patch area (instead of a drawer)
3. **PatchMainScreen.tsx** is one tab in that navigator; it configures headers and triggers navigation to other tabs

The three files work together to create a cohesive, type-safe navigation experience where the same codebase adapts its UI structure based on the platform (web = tabs, native = drawer + stack).
