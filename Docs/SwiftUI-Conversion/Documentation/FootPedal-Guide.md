# FootPedal Component Guide

## Overview

The `FootPedal` component is a SwiftUI implementation of individual foot pedals for the GR55 hardware interface. It provides interactive foot pedal controls with trapezoidal shapes, LED indicators, and sophisticated gesture recognition for single-tap and double-tap interactions.

## Features

### Visual Design

- **Trapezoidal Shape**: Uses custom `PedalShape` for authentic hardware appearance
- **LED Indicator**: Circular LED with glow effects when active
- **3D Styling**: Realistic pedal appearance with shadows and depth
- **Visual Feedback**: Scale animations and press states for tactile feel

### Interaction Support

- **Single Tap**: Primary pedal selection action
- **Double Tap**: Secondary navigation actions (bank switching)
- **Long Press**: Visual press feedback without triggering actions
- **Haptic Feedback**: Medium impact for single tap, heavy impact for double tap

### Accessibility

- **VoiceOver Support**: Comprehensive accessibility labels and hints
- **Dynamic Labels**: Context-aware accessibility descriptions
- **Button Traits**: Proper accessibility traits for screen readers
- **State Announcements**: Active/inactive state communicated to assistive technologies

## Usage

### Basic Numbered Pedal

```swift
FootPedal(
    number: 1,
    isActive: activePedal == 1,
    topLabel: "LEAD GUITAR",
    onSingleTap: {
        setActivePedal(1)
    },
    onDoubleTap: {
        gotoNextBank()
    }
)
```

### CTL Pedal

```swift
FootPedal(
    isCtlActive: ctlStatus,
    ctlFunction: ctlStatus ? "ACTIVE" : "REC/PLAY/DUB",
    onCtlToggle: {
        toggleCtlPedal()
    }
)
```

### Advanced Configuration

```swift
FootPedal(
    number: .numbered(3),
    isActive: activePedal == 3,
    topLabel: "BASS GUITAR",
    subLabel: "LOW END",
    onSingleTap: {
        selectOrdinalInCurrentBank(3)
    },
    onDoubleTap: nil // No double-tap for pedal 3
)
```

## Properties

### Required Properties

| Property      | Type              | Description                           |
| ------------- | ----------------- | ------------------------------------- |
| `number`      | `FootPedalNumber` | Pedal identifier (numbered or CTL)    |
| `isActive`    | `Bool`            | Whether the pedal is currently active |
| `onSingleTap` | `() -> Void`      | Callback for single tap gesture       |

### Optional Properties

| Property      | Type            | Default | Description                     |
| ------------- | --------------- | ------- | ------------------------------- |
| `topLabel`    | `String?`       | `nil`   | Label displayed above pedal     |
| `subLabel`    | `String?`       | `nil`   | Label displayed below pedal     |
| `onDoubleTap` | `(() -> Void)?` | `nil`   | Callback for double tap gesture |

## FootPedalNumber Enum

The `FootPedalNumber` enum supports two types of pedals:

```swift
enum FootPedalNumber {
    case numbered(Int)  // Pedals 1, 2, 3
    case ctl           // Control pedal
}
```

### Display Properties

- `displayText`: Returns the text shown on the pedal ("1", "2", "3", or "CTL")
- `accessibilityLabel`: Returns accessibility-friendly description

## Gesture Recognition

### Single Tap

- **Timing**: Immediate response with 0.5s window for double-tap detection
- **Feedback**: Medium haptic impact
- **Animation**: State change animation
- **Use Case**: Pedal selection, CTL toggle

### Double Tap

- **Timing**: Two taps within 0.5 seconds
- **Feedback**: Heavy haptic impact
- **Animation**: State change animation
- **Use Case**: Bank navigation (pedals 1 and 2 only)

### Long Press

- **Purpose**: Visual feedback only (press state)
- **Duration**: Immediate response, no minimum duration
- **Animation**: Scale and shadow effects
- **Use Case**: Visual confirmation of touch

## Visual States

### Active State

- **LED**: Bright red with glow effect
- **Scale**: Slightly enlarged LED (1.1x)
- **Animation**: Pulsing glow effect
- **Color**: `DesignTokens.Colors.ledActive`

### Inactive State

- **LED**: Dim red/gray
- **Scale**: Normal size
- **Animation**: None
- **Color**: `DesignTokens.Colors.ledInactive`

### Pressed State

- **Scale**: 0.98x for entire pedal
- **Shadow**: Reduced shadow depth
- **Duration**: While finger is down
- **Animation**: Fast spring animation (0.1s)

## Layout and Sizing

### Dimensions

- **Width**: `DesignTokens.Dimensions.pedalWidth` (80pt)
- **Height**: `DesignTokens.Dimensions.pedalHeight` (120pt)
- **LED Size**: `DesignTokens.Dimensions.pedalLEDSize` (16pt)

### Spacing

- **Top Label**: `DesignTokens.Spacing.small` (8pt) below
- **Sub Label**: `DesignTokens.Spacing.small` (8pt) above

### Positioning

- **LED**: Offset 50pt up from center
- **Number**: Centered on pedal body
- **Labels**: Centered horizontally

## Styling Integration

### Design Tokens

The component uses centralized design tokens for consistent styling:

```swift
// Colors
DesignTokens.Colors.ledActive      // Active LED color
DesignTokens.Colors.ledInactive    // Inactive LED color
DesignTokens.Colors.accent         // Top label color
DesignTokens.Colors.textMuted      // Sub label color

// Fonts
DesignTokens.Fonts.pedalNumber     // Main pedal number
DesignTokens.Fonts.pedalTopLabel   // Top label text
DesignTokens.Fonts.pedalSubLabel   // Sub label text

// Animations
DesignTokens.Animations.buttonPress   // Press feedback
DesignTokens.Animations.stateChange   // State transitions
DesignTokens.Animations.ledGlow       // LED glow effect
```

### Custom Shape Integration

Uses `PedalShape` from `CustomShapes.swift` with the `.pedalStyle()` modifier for consistent 3D appearance.

## Integration with State Management

### With GR55StateManager

```swift
struct PedalCluster: View {
    @ObservedObject var stateManager: GR55StateManager

    var body: some View {
        HStack(spacing: DesignTokens.Spacing.large) {
            ForEach(1...3, id: \.self) { pedalNumber in
                FootPedal(
                    number: pedalNumber,
                    isActive: stateManager.currentState.activePedal == pedalNumber,
                    topLabel: stateManager.currentState.bankSlots?[pedalNumber - 1]?.name,
                    onSingleTap: {
                        stateManager.selectOrdinalInCurrentBank(pedalNumber)
                    },
                    onDoubleTap: {
                        if pedalNumber == 1 {
                            stateManager.gotoNextBank()
                        } else if pedalNumber == 2 {
                            stateManager.gotoPrevBank()
                        }
                    }
                )
            }

            FootPedal(
                isCtlActive: stateManager.currentState.ctlStatus,
                ctlFunction: stateManager.currentState.ctlFunction,
                onCtlToggle: {
                    stateManager.toggleCtlPedal()
                }
            )
        }
    }
}
```

## Performance Considerations

### Efficient Updates

- Uses `@State` for local animation states
- Minimizes unnecessary recompositions
- Efficient gesture recognition with proper timing

### Memory Management

- Lightweight component with minimal state
- Proper cleanup of gesture recognizers
- Efficient animation handling

### Accessibility Performance

- Cached accessibility labels
- Minimal accessibility tree updates
- Efficient VoiceOver integration

## Testing Considerations

### Unit Testing

- Test single and double tap recognition
- Verify proper state updates
- Test accessibility label generation
- Validate gesture timing windows

### Property-Based Testing

- Test with various pedal numbers and states
- Verify consistent behavior across different configurations
- Test accessibility compliance across states

### Integration Testing

- Test with GR55StateManager integration
- Verify MIDI command generation
- Test visual feedback animations

## Customization

### Custom Styling

The component can be customized by modifying design tokens:

```swift
// Custom colors
DesignTokens.Colors.ledActive = .blue
DesignTokens.Colors.accent = .green

// Custom dimensions
DesignTokens.Dimensions.pedalWidth = 100
DesignTokens.Dimensions.pedalHeight = 150
```

### Custom Gestures

Additional gestures can be added by extending the component:

```swift
extension FootPedal {
    func onTripleTap(_ action: @escaping () -> Void) -> some View {
        // Custom triple tap implementation
    }
}
```

## Requirements Validation

This component satisfies the following requirements:

- **4.1**: Renders four pedals with proper trapezoidal shapes and LED indicators
- **4.2**: Illuminates LEDs with red glow effect when active
- **4.3**: Implements single-tap for ordinal selection
- **4.4**: Implements double-tap for bank navigation (pedals 1-2)
- **4.5**: Selects ordinal 3 when pedal 3 is tapped
- **4.6**: Toggles CTL status and updates function display
- **4.7**: Displays current patch names above pedals and CTL function

## Swift 6.2 Compliance

- Uses `@MainActor` for UI updates
- Proper `Sendable` conformance for data types
- Async/await patterns for gesture handling
- Structured concurrency for timing operations
- Memory-safe gesture recognition
