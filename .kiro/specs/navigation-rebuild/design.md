# Design Document

## Overview

The navigation rebuild will create a clean, web-focused navigation system that keeps the existing bottom navigation bar completely unchanged while adding a new top navigation bar exclusively for patch editing. The design eliminates the problematic PatchDrawer and platform-specific patterns, implementing a simple Material Top Tab Navigator only within the Patch section.

The architecture maintains the existing bottom navigation bar (Patch, Library, Hardware, Setup) exactly as-is at the bottom of the screen for major section navigation. A new top navigation bar with Material Top Tab Navigator is added only when users are in the Patch section, providing clean navigation between patch editing screens (Main, Tone, Effects, Pedal/GK, Assigns, Other).

## Architecture

The navigation system keeps the existing bottom navigation unchanged and adds top navigation only for patch editing:

```
App Structure:
├── Bottom Navigation Bar (RETAINED EXACTLY AS-IS)
│   ├── Patch (when selected)
│   │   └── NEW: Top Navigation Bar (Material Top Tab)
│   │       ├── Main Tab
│   │       ├── Tone Tab
│   │       ├── Effects Tab
│   │       ├── Pedal/GK Tab
│   │       ├── Assigns Tab
│   │       └── Other Tab
│   ├── Library (no top navigation)
│   ├── Hardware (no top navigation)
│   └── Setup (no top navigation)
```

**Key Architectural Principles:**

1. **Bottom Navigation Unchanged**: Keep existing bottom navigation bar exactly as-is
2. **Top Navigation Only for Patch**: Material Top Tab Navigator only appears in Patch section
3. **No App-Level Top Navigation**: Top navigation is not used at the app level
4. **Remove PatchDrawer**: Eliminate existing drawer-based patch navigation
5. **Web-Optimized**: Styling and behavior optimized for web browsers

## Components and Interfaces

### App Structure with Bottom Navigation

The main app structure keeps the existing bottom navigation completely unchanged:

```typescript
// App.tsx - Existing structure maintained
export default function App(): JSX.Element {
  return (
    <NavigationContainer>
      {/* Existing bottom navigation structure - NO CHANGES */}
      <ExistingBottomNavigator>
        <BottomTab.Screen
          name="Patch"
          component={PatchSectionWithTopNavigation} // Only this component is new
        />
        <BottomTab.Screen
          name="Library"
          component={ExistingLibraryScreen} // Unchanged
        />
        <BottomTab.Screen
          name="Hardware"
          component={ExistingHardwareScreen} // Unchanged
        />
        <BottomTab.Screen
          name="Setup"
          component={ExistingSetupScreen} // Unchanged
        />
      </ExistingBottomNavigator>
    </NavigationContainer>
  );
}
```

### Patch Section with New Top Navigation

Only the Patch section gets a new top navigation bar:

```typescript
// PatchSectionWithTopNavigation.tsx - NEW COMPONENT
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

type PatchTabParamList = {
  Main: undefined;
  Tone: undefined;
  Effects: undefined;
  PedalGK: undefined;
  Assigns: undefined;
  Other: undefined;
};

const PatchTopTab = createMaterialTopTabNavigator<PatchTabParamList>();

export function PatchSectionWithTopNavigation(): JSX.Element {
  return (
    <View style={{ flex: 1 }}>
      {/* NEW: Top navigation bar for patch editing */}
      <PatchTopTab.Navigator
        screenOptions={{
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "500",
            textTransform: "none",
          },
          tabBarStyle: {
            backgroundColor: "#f8f9fa",
          },
          tabBarActiveTintColor: "#007AFF",
          tabBarInactiveTintColor: "#6c757d",
          tabBarScrollEnabled: true,
        }}
      >
        <PatchTopTab.Screen
          name="Main"
          component={PatchMainScreen}
          options={{ title: "Main" }}
        />
        <PatchTopTab.Screen
          name="Tone"
          component={PatchToneScreen}
          options={{ title: "Tone" }}
        />
        <PatchTopTab.Screen
          name="Effects"
          component={PatchEffectsScreen}
          options={{ title: "Effects" }}
        />
        <PatchTopTab.Screen
          name="PedalGK"
          component={PatchMasterPedalGkCtlScreen}
          options={{ title: "Pedal/GK" }}
        />
        <PatchTopTab.Screen
          name="Assigns"
          component={PatchAssignsScreen}
          options={{ title: "Assigns" }}
        />
        <PatchTopTab.Screen
          name="Other"
          component={PatchMasterOtherScreen}
          options={{ title: "Other" }}
        />
      </PatchTopTab.Navigator>
    </View>
  );
}
```

### Other Sections Remain Unchanged

Library, Hardware, and Setup sections keep their existing implementations with no top navigation:

```typescript
// These components remain exactly as they are now:
// - ExistingLibraryScreen
// - ExistingHardwareScreen
// - ExistingSetupScreen
// No changes to these components at all
```

### Screen Component Interfaces

```typescript
// types/navigation.ts
import type { MaterialTopTabScreenProps } from "@react-navigation/material-top-tabs";

// Root navigation types
export type RootTabParamList = {
  Patch: undefined;
  Library: undefined;
  Hardware: undefined;
  Setup: undefined;
};

export type RootTabScreenProps<T extends keyof RootTabParamList> =
  MaterialTopTabScreenProps<RootTabParamList, T>;

// Patch navigation types
export type PatchTabParamList = {
  Main: undefined;
  Tone: undefined;
  Effects: undefined;
  PedalGK: undefined;
  Assigns: undefined;
  Other: undefined;
};

export type PatchTabScreenProps<T extends keyof PatchTabParamList> =
  MaterialTopTabScreenProps<PatchTabParamList, T>;
```

## Data Models

### Navigation Configuration

```typescript
// config/navigationConfig.ts
export interface TabConfig {
  name: string;
  title: string;
  component: React.ComponentType<any>;
}

export const ROOT_TABS: readonly TabConfig[] = [
  {
    name: "Patch",
    title: "Patch",
    component: PatchEditorNavigator,
  },
  {
    name: "Library",
    title: "Library",
    component: LibraryScreen,
  },
  {
    name: "Hardware",
    title: "Hardware",
    component: HardwareScreen,
  },
  {
    name: "Setup",
    title: "Setup",
    component: SetupScreen,
  },
] as const;

export const PATCH_TABS: readonly TabConfig[] = [
  {
    name: "Main",
    title: "Main",
    component: PatchMainScreen,
  },
  {
    name: "Tone",
    title: "Tone",
    component: PatchToneScreen,
  },
  {
    name: "Effects",
    title: "Effects",
    component: PatchEffectsScreen,
  },
  {
    name: "PedalGK",
    title: "Pedal/GK",
    component: PatchMasterPedalGkCtlScreen,
  },
  {
    name: "Assigns",
    title: "Assigns",
    component: PatchAssignsScreen,
  },
  {
    name: "Other",
    title: "Other",
    component: PatchMasterOtherScreen,
  },
] as const;
```

### Styling Configuration

```typescript
// config/navigationStyles.ts
export interface NavigationStyles {
  tabBarLabelStyle: {
    fontSize: number;
    fontWeight: string;
    textTransform: "none" | "uppercase" | "lowercase";
  };
  tabBarStyle: {
    backgroundColor: string;
  };
  tabBarActiveTintColor: string;
  tabBarInactiveTintColor: string;
  tabBarScrollEnabled?: boolean;
}

export const ROOT_TAB_STYLES: NavigationStyles = {
  tabBarLabelStyle: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "none",
  },
  tabBarStyle: {
    backgroundColor: "#ffffff",
  },
  tabBarActiveTintColor: "#007AFF",
  tabBarInactiveTintColor: "#8E8E93",
};

export const PATCH_TAB_STYLES: NavigationStyles = {
  tabBarLabelStyle: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "none",
  },
  tabBarStyle: {
    backgroundColor: "#f8f9fa",
  },
  tabBarActiveTintColor: "#007AFF",
  tabBarInactiveTintColor: "#6c757d",
  tabBarScrollEnabled: true,
};
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Tab Label Visibility

_For any_ navigation tab in the application, when rendered, the tab label should be visible with non-transparent colors and appropriate font sizing for web display.
**Validates: Requirements 2.2**

### Property 2: Tab Navigation Functionality

_For any_ tab in the navigation system, when clicked or touched, it should change the active tab and display the corresponding screen content.
**Validates: Requirements 2.5**

### Property 3: Nested Navigation Visibility

_For any_ navigation to the Patch tab, the patch-specific navigation tabs should become visible and functional.
**Validates: Requirements 3.3**

### Property 4: Styling Consistency

_For any_ navigation component in the system, it should use consistent styling patterns and properties across both root and patch navigation levels.
**Validates: Requirements 3.5**

### Property 5: Navigation State Observability

_For any_ navigation state change, the change should be detectable and verifiable through navigation state or screen content updates.
**Validates: Requirements 4.3**

### Property 6: Error-Free Navigation

_For any_ navigation operation, it should not generate console errors or warnings in browser developer tools.
**Validates: Requirements 4.5, 5.5**

### Property 7: Web Browser Compatibility

_For any_ web browser environment, the navigation should render correctly and function properly without browser-specific issues.
**Validates: Requirements 5.1**

### Property 8: Browser Navigation Integration

_For any_ browser back/forward button usage, the navigation should respond appropriately by updating the current tab and screen.
**Validates: Requirements 5.2**

### Property 9: State Persistence

_For any_ browser refresh operation, the navigation should maintain its current state and not lose navigation context.
**Validates: Requirements 5.3**

### Property 10: Responsive Design

_For any_ browser window size change, the navigation should adapt appropriately without breaking layout or hiding essential elements.
**Validates: Requirements 5.4**

### Property 11: Web-Optimized Styling

_For any_ navigation styling applied, it should be optimized for web browsers with consistent appearance and behavior.
**Validates: Requirements 6.4**

## Error Handling

### Navigation Failure Recovery

The navigation system will implement error boundaries to handle navigation failures gracefully:

```typescript
// components/NavigationErrorBoundary.tsx
import React from "react";

interface NavigationErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class NavigationErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  NavigationErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): NavigationErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Navigation Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, textAlign: "center" }}>
          <h2>Navigation Error</h2>
          <p>
            Something went wrong with the navigation. Please refresh the page.
          </p>
          <button onClick={() => window.location.reload()}>Refresh Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Screen Loading Fallbacks

Each screen component will have loading states to handle async operations:

```typescript
// components/ScreenWrapper.tsx
interface ScreenWrapperProps {
  children: React.ReactNode;
  loading?: boolean;
}

export function ScreenWrapper({
  children,
  loading = false,
}: ScreenWrapperProps): JSX.Element {
  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>
        <p>Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
```

### Invalid Navigation Handling

The navigation system will handle invalid routes by redirecting to the default tab:

```typescript
// navigation/RootNavigator.tsx
import { useNavigation } from "@react-navigation/native";

export function useNavigationFallback() {
  const navigation = useNavigation();

  const handleInvalidRoute = React.useCallback(() => {
    // Redirect to Patch tab as default
    navigation.navigate("Patch");
  }, [navigation]);

  return { handleInvalidRoute };
}
```

## Testing Strategy

### Dual Testing Approach

The testing strategy combines unit tests for specific scenarios and property-based tests for comprehensive coverage:

**Unit Tests**:

- Test specific tab configurations (Library, Patch Editor, Settings tabs)
- Test component rendering in isolation
- Test navigation state changes for specific user actions
- Test error boundary behavior with simulated errors
- Test browser integration with specific navigation events

**Property-Based Tests**:

- Generate random navigation sequences and verify state consistency
- Test responsive behavior across random screen sizes
- Generate random styling configurations and verify consistency
- Test error handling across random failure scenarios
- Verify accessibility properties across random navigation states

### Property-Based Testing Configuration

- **Testing Framework**: Jest with @fast-check/jest for property-based testing
- **Navigation Testing**: @react-navigation/testing for navigation utilities
- **Minimum Iterations**: 100 iterations per property test
- **Browser Testing**: @testing-library/react for component testing
- **Integration Testing**: React Navigation testing utilities for navigation flows

Each property test will be tagged with:
**Feature: navigation-rebuild, Property {number}: {property_text}**

### Testing Implementation

```typescript
// __tests__/navigation.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { NavigationContainer } from "@react-navigation/native";
import { RootNavigator } from "../navigation/RootNavigator";

describe("Navigation System", () => {
  const renderNavigation = () => {
    return render(
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    );
  };

  test("displays all required root tabs", () => {
    renderNavigation();

    expect(screen.getByText("Patch")).toBeInTheDocument();
    expect(screen.getByText("Library")).toBeInTheDocument();
    expect(screen.getByText("Hardware")).toBeInTheDocument();
    expect(screen.getByText("Setup")).toBeInTheDocument();
  });

  test("navigates between tabs when clicked", () => {
    renderNavigation();

    const patchTab = screen.getByText("Patch");
    fireEvent.press(patchTab);

    // Verify patch navigation tabs appear
    expect(screen.getByText("Main")).toBeInTheDocument();
    expect(screen.getByText("Tone")).toBeInTheDocument();
    expect(screen.getByText("Effects")).toBeInTheDocument();
  });
});
```

### Manual Testing Checklist

- [ ] Verify all root tabs (Patch, Library, Hardware, Setup) are visible and clickable
- [ ] Verify all patch tabs (Main, Tone, Effects, Pedal/GK, Assigns, Other) appear when Patch is selected
- [ ] Test tab navigation works correctly in Chrome, Firefox, Safari, and Edge
- [ ] Test responsive behavior at different browser window sizes
- [ ] Verify browser back/forward buttons work with navigation
- [ ] Test browser refresh maintains navigation state
- [ ] Verify no console errors appear during navigation
- [ ] Test keyboard navigation and accessibility features
- [ ] Verify consistent styling across all navigation levels
