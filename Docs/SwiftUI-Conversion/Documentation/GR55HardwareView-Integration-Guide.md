# GR55HardwareView Integration Guide

## Overview

The `GR55HardwareView` is the main container that orchestrates the entire GR55 hardware interface. It integrates all component views with the state manager and provides responsive scaling, proper layout hierarchy, and overlay systems.

## Architecture

### Component Hierarchy

```
GR55HardwareView
├── GeometryReader (for responsive scaling)
├── ZStack
│   ├── chassisBackground (styling and shadows)
│   ├── hardwareLayout
│   │   ├── PortsBar (top connection labels)
│   │   └── HStack (main sections)
│   │       ├── leftSection
│   │       │   ├── HeaderView (branding)
│   │       │   └── HStack (control layout)
│   │       │       ├── leftColumn
│   │       │       │   ├── DisplayComponent
│   │       │       │   ├── SoundStylePanel
│   │       │       │   └── PedalCluster
│   │       │       └── rightColumn
│   │       │           └── NavigationCluster
│   │       └── rightSection
│   │           └── ExpressionPedal
│   └── PreviewPane (overlay system)
```

### State Management Integration

The main view uses `@StateObject` to create and manage the `GR55StateManager`:

```swift
@StateObject private var stateManager = GR55StateManager()
```

All child components receive the state manager as an `@ObservedObject` parameter, ensuring reactive updates throughout the interface.

### Hover and Edit Mode System

The main view manages two key interaction states:

```swift
@State private var hoveredItem: HoveredItem = .none
@State private var isEditMode = false
```

These states are updated through callbacks from the `DisplayComponent` and passed to the `PreviewPane` for contextual information display.

## Key Features

### 1. Responsive Scaling

The interface automatically scales based on available screen size:

```swift
private func calculateScaleFactor(for size: CGSize) -> CGFloat {
    let baseWidth: CGFloat = 1200
    let baseHeight: CGFloat = 800

    let widthScale = size.width / baseWidth
    let heightScale = size.height / baseHeight

    let scale = min(widthScale, heightScale)
    return max(0.5, min(1.2, scale))
}
```

### 2. Chassis Styling

The main container applies realistic hardware styling with:

- Rounded corners using `DesignTokens.Radii.large`
- Chassis color from `DesignTokens.Colors.chassis`
- Drop shadow for depth using `DesignTokens.Shadows.chassis`
- Subtle inner border gradient for additional depth

### 3. Layout Hierarchy

The layout uses SwiftUI's native layout system:

- `VStack` for vertical arrangement of major sections
- `HStack` for horizontal arrangement of control groups
- `ZStack` for overlaying the preview pane
- Proper spacing using `DesignTokens.Spacing` values

### 4. Overlay System

The `PreviewPane` is overlaid using:

- `allowsHitTesting(false)` to prevent interaction blocking
- `zIndex(DesignTokens.ZIndex.preview)` for proper layering
- Conditional display based on hover and edit states

## Component Integration

### DisplayComponent Integration

```swift
DisplayComponent(stateManager: stateManager)
    .onHover { item in
        hoveredItem = item
    }
    .onEditModeChange { isEdit in
        isEditMode = isEdit
    }
```

The display component provides callbacks for hover events and edit mode changes.

### State Manager Distribution

All interactive components receive the state manager:

```swift
SoundStylePanel(stateManager: stateManager)
PedalCluster(stateManager: stateManager)
NavigationCluster(stateManager: stateManager)
ExpressionPedal(stateManager: stateManager)
```

### Preview Pane Integration

```swift
PreviewPane(
    hoveredItem: hoveredItem,
    isEditMode: isEditMode
)
.allowsHitTesting(false)
.zIndex(DesignTokens.ZIndex.preview)
```

## Swift 6.2 Compliance

### Concurrency Patterns

- Main view marked with `@MainActor` for UI thread safety
- State manager uses proper `@Published` properties
- Async operations handled with `Task` blocks
- Sendable conformance for data models

### Memory Management

- Proper use of `@StateObject` for state manager lifecycle
- `@ObservedObject` for child component state observation
- Efficient view updates through targeted state changes

## Performance Considerations

### View Update Optimization

- State manager uses granular `@Published` properties
- Components only update when relevant state changes
- Efficient layout calculations with `GeometryReader`

### Animation Performance

- Smooth transitions using `DesignTokens.Animations`
- Proper animation timing for responsive feel
- Minimal recomposition through targeted updates

## Integration Checklist

When integrating the GR55HardwareView:

- [ ] Ensure all component files are included in the project
- [ ] Verify DesignTokens are properly configured
- [ ] Test responsive scaling on different screen sizes
- [ ] Validate hover and edit mode interactions
- [ ] Confirm MIDI integration interface is connected
- [ ] Test accessibility features with VoiceOver
- [ ] Verify dark mode appearance
- [ ] Test performance on target devices

## Usage Example

```swift
import SwiftUI

struct ContentView: View {
    var body: some View {
        GR55HardwareView()
            .frame(minWidth: 800, minHeight: 600)
            .background(Color.black)
    }
}
```

## Troubleshooting

### Common Issues

1. **Components not updating**: Ensure state manager is passed correctly
2. **Layout issues**: Check DesignTokens spacing and dimensions
3. **Preview pane not showing**: Verify hover callbacks are connected
4. **Scaling problems**: Test calculateScaleFactor logic
5. **Performance issues**: Profile view update frequency

### Debug Tips

- Use SwiftUI's view hierarchy debugger
- Monitor state manager property changes
- Check animation performance with Instruments
- Validate accessibility with Accessibility Inspector
