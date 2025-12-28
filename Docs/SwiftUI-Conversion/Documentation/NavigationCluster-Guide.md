# NavigationCluster Component Guide

## Overview

The `NavigationCluster` component is a SwiftUI implementation of the GR-55's navigation controls section, converted from the React Native implementation. It provides data wheel interaction, page navigation buttons, output level control, and GK function controls.

## Architecture

The NavigationCluster is composed of several sub-components:

- **OutputLevelKnob**: Output level control with visual indicator
- **DataWheel**: Large rotary encoder with directional buttons
- **NavigationButtons**: Page navigation and control buttons
- **GKControlsRow**: GK S1, S2, and VOL function controls

## Components

### NavigationCluster (Main Container)

```swift
struct NavigationCluster: View {
    @ObservedObject var stateManager: GR55StateManager
}
```

**Props:**

- `stateManager`: ObservableObject managing GR55 hardware state

**Layout:**

- Vertical stack with consistent spacing
- Integrates all navigation sub-components
- Follows Swift 6.2 concurrency patterns

### OutputLevelKnob

```swift
struct OutputLevelKnob: View
```

**Features:**

- Circular knob with indicator line
- "OUTPUT LEVEL" label
- Visual styling matching hardware aesthetic
- Rotation indicator at 45-degree base angle

### DataWheel

```swift
struct DataWheel: View {
    let onRotate: (WheelDirection) -> Void
    let onPress: (WheelPressDirection) -> Void
}
```

**Features:**

- Large circular wheel (220x220 points)
- Four directional buttons (up, down, left, right)
- Drag gesture recognition for rotation
- Visual feedback with scaling and rotation
- Textured appearance with dashed circle overlay

**Interaction:**

- **Drag**: Rotates wheel and triggers `onRotate` callback
- **Tap**: Fallback rotation for simple interaction
- **Directional buttons**: Trigger `onPress` with direction

### DirectionalButtons

Four buttons positioned around the data wheel:

- **Up/Down**: 32x24 point rectangular buttons
- **Left/Right**: 24x32 point rectangular buttons
- Triangle indicators showing direction
- Rounded corners and shadow effects

### CenterWheel

```swift
struct CenterWheel: View {
    @Binding var rotation: Double
    @Binding var isDragging: Bool
    let onRotate: (WheelDirection) -> Void
}
```

**Features:**

- 141x141 point circular wheel
- Textured surface with dashed circle
- Spinner divot indicator at top
- Drag gesture handling with momentum
- Visual feedback during interaction

### NavigationButtons

```swift
struct NavigationButtons: View
```

**Button Layout:**

- PAGE left (◄) and right (►) buttons with labels
- EDIT button with label
- EXIT, ENTER, WRITE buttons without labels
- Consistent spacing and alignment

### GKControlsRow

```swift
struct GKControlsRow: View {
    @ObservedObject var stateManager: GR55StateManager
}
```

**Controls:**

- **GK S1**: Button control with value display
- **GK S2**: Button control with value display
- **GK VOL**: Knob control with value display
- Values from state manager: `gkS1Value`, `gkS2Value`, `gkVolValue`

## State Integration

### State Manager Integration

The NavigationCluster integrates with `GR55StateManager` through:

```swift
// Data wheel interactions
stateManager.handleDataWheelRotate(_:)
stateManager.handleDataWheelPress(_:)

// GK control values
stateManager.currentState.gkS1Value
stateManager.currentState.gkS2Value
stateManager.currentState.gkVolValue
```

### Gesture Handling

**Data Wheel Rotation:**

```swift
.gesture(
    DragGesture()
        .onChanged { value in
            // Calculate rotation delta
            // Update rotation state
            // Trigger onRotate callback
        }
)
```

**Button Interactions:**

- Visual feedback with scale effects
- Press state management
- Haptic feedback integration points

## Styling

### Design Tokens

Uses consistent design tokens from `DesignTokens`:

```swift
// Colors
DesignTokens.Colors.chassis
DesignTokens.Colors.surface
DesignTokens.Colors.border
DesignTokens.Colors.textMuted
DesignTokens.Colors.accent

// Spacing
DesignTokens.Spacing.large
DesignTokens.Spacing.medium
DesignTokens.Spacing.small

// Fonts
DesignTokens.Fonts.navigationLabel
DesignTokens.Fonts.gkValue

// Shadows
DesignTokens.Shadows.button
DesignTokens.Shadows.chassis
```

### Visual Effects

- **Shadows**: Consistent shadow system for depth
- **Animations**: Smooth transitions for interactions
- **Scaling**: Visual feedback for button presses
- **Rotation**: Smooth wheel rotation with momentum

## Swift 6.2 Compliance

### Concurrency Patterns

- `@MainActor` compliance for UI updates
- Proper `@ObservedObject` usage
- `@State` and `@Binding` for local state management
- Sendable conformance for data types

### Performance Optimizations

- Efficient gesture recognition
- Minimal view updates
- Proper animation timing
- Memory-efficient state management

## Usage Example

```swift
struct HardwareView: View {
    @StateObject private var stateManager = GR55StateManager()

    var body: some View {
        HStack {
            // Other components...

            NavigationCluster(stateManager: stateManager)

            // Other components...
        }
    }
}
```

## Integration Notes

### MIDI Integration

The NavigationCluster integrates with MIDI through the state manager:

- Data wheel rotations trigger pedal selection changes
- Directional presses navigate styles and banks
- GK controls reflect MIDI parameter values

### Accessibility

- Proper accessibility labels for all interactive elements
- VoiceOver support for navigation controls
- High contrast support for visual indicators
- Gesture alternatives for motor accessibility

### Testing Considerations

- Gesture recognition accuracy testing
- State synchronization validation
- Visual feedback timing verification
- Cross-device layout consistency

## Future Enhancements

1. **Haptic Feedback**: Add tactile feedback for wheel rotation
2. **Audio Feedback**: Optional click sounds for interactions
3. **Customization**: User-configurable button assignments
4. **Animation Polish**: Enhanced rotation momentum and easing
5. **Accessibility**: Enhanced VoiceOver descriptions

## Related Components

- `GR55StateManager`: State management integration
- `DesignTokens`: Styling and theming
- `CustomShapes`: Triangle and other custom shapes
- `VisualComponents`: Shared visual elements
