# ExpressionPedal Component Guide

## Overview

The `ExpressionPedal` component is a SwiftUI implementation of the large expression pedal found on the right side of the Roland GR-55 hardware interface. It provides patch level control through vertical drag gestures and includes an EXP SW button with LED indicator.

## Component Structure

### Main Components

1. **ExpressionPedal** - Main container view
2. **ExpSwButton** - Expression switch button with LED
3. **LevelControlOverlay** - Drag-sensitive level control interface
4. **LevelBar** - Visual level indicator with gradient

## Features

### Visual Design

- **Realistic 3D Appearance**: Uses `ExpressionPedalShape` with texture patterns
- **Professional Styling**: Matches hardware aesthetic with proper shadows and borders
- **Responsive Feedback**: Visual scaling and animations during interactions

### Interaction Capabilities

- **Vertical Drag Gesture**: Drag up/down to adjust patch level (0-100)
- **EXP SW Button**: Toggle expression switch with visual LED feedback
- **Haptic Feedback**: iOS haptic feedback for significant level changes
- **Smooth Animations**: Fluid level bar updates and button press feedback

### State Management

- **ObservableObject Integration**: Connects to `GR55StateManager` for reactive updates
- **Real-time Updates**: Level changes immediately reflected in UI and MIDI state
- **Function Display**: Shows current EXP SW function above button

## Usage

### Basic Implementation

```swift
struct MyView: View {
    @StateObject private var stateManager = GR55StateManager()

    var body: some View {
        ExpressionPedal(stateManager: stateManager)
            .frame(width: 160, height: 400)
    }
}
```

### Integration with Hardware View

```swift
struct GR55HardwareView: View {
    @StateObject private var stateManager = GR55StateManager()

    var body: some View {
        HStack {
            // Left section with other controls
            MainControlsSection(stateManager: stateManager)

            // Right section with expression pedal
            ExpressionPedal(stateManager: stateManager)
        }
    }
}
```

## Component Details

### ExpressionPedal

Main container that orchestrates the expression pedal interface.

**Properties:**

- `stateManager: GR55StateManager` - State management object
- `isDragging: Bool` - Internal drag state tracking
- `dragOffset: CGFloat` - Internal drag position tracking

**Layout:**

- Vertical stack with EXP SW button at top
- Large pedal surface with level control overlay
- Proper spacing and padding for hardware aesthetic

### ExpSwButton

Expression switch button with LED indicator and function display.

**Features:**

- Function label display above button
- LED indicator with glow effect when active
- Press animation with scale effect
- EXP SW label below button

**State Integration:**

- Reads `expSwStatus` from state manager
- Displays `expSwFunction` as top label
- Calls `stateManager.toggleExpSw()` on press

### LevelControlOverlay

Interactive overlay for patch level control with drag gesture recognition.

**Features:**

- PATCH LEVEL label at top
- Current level value display
- Vertical drag gesture recognition
- Haptic feedback on iOS devices

**Gesture Handling:**

- Drag gesture with minimum distance of 0 for immediate response
- Inverted Y coordinate mapping (drag up = increase level)
- Clamped values between 0-100
- Real-time state updates during drag

### LevelBar

Visual level indicator with gradient coloring and smooth animations.

**Features:**

- Gradient from green (low) to red (high)
- Smooth height animations based on level
- Level indicator marks for visual reference
- Rounded corners matching design system

**Color Mapping:**

- 0-40%: Green to Yellow
- 40-70%: Yellow to Orange
- 70-100%: Orange to Red

## Design Tokens Usage

The component extensively uses the design token system for consistent styling:

### Colors

- `expressionPedalBody` - Main pedal surface color
- `expressionPedalBorder` - Pedal border color
- `ledActive/ledInactive` - LED indicator states
- `accent` - Label and function text color

### Dimensions

- `expressionPedalWidth/Height` - Standard pedal dimensions
- `expressionButtonHeight` - EXP SW button height
- `levelBarWidth/Height` - Level indicator dimensions

### Fonts

- `expressionLabel` - PATCH LEVEL label font
- `expressionValue` - Level value display font
- `expressionFunction` - Function label font

### Animations

- `buttonPress` - Button press animation timing
- `stateChange` - Level change animation timing

## Accessibility

### VoiceOver Support

- Proper accessibility labels for all interactive elements
- Value announcements for level changes
- Button role identification for EXP SW

### Gesture Recognition

- Large touch targets for easy interaction
- Drag gesture works across entire pedal surface
- Visual feedback for all interactions

## Performance Considerations

### Efficient Updates

- Uses `@ObservedObject` for reactive state updates
- Minimal view recomposition through proper state management
- Smooth animations without performance impact

### Memory Management

- Proper cleanup of gesture recognizers
- Efficient gradient rendering
- Optimized shape drawing

## Integration Notes

### MIDI Communication

- Level changes automatically trigger MIDI commands through state manager
- EXP SW toggles send appropriate MIDI messages
- Real-time synchronization with hardware state

### State Synchronization

- Bidirectional state updates (UI ↔ MIDI)
- Proper handling of external state changes
- Consistent state across all UI components

## Testing Considerations

### Unit Testing

- Test level calculation from drag positions
- Verify proper state updates on interactions
- Test boundary conditions (0, 100 levels)

### Property Testing

- Drag gesture accuracy across different screen sizes
- Level bar visual consistency at all levels
- Animation smoothness during rapid changes

### Integration Testing

- MIDI command generation on level changes
- State synchronization with other components
- Proper cleanup on component disposal

## Swift 6.2 Compliance

### Concurrency

- All UI updates on `@MainActor`
- Proper async/await patterns for MIDI communication
- Thread-safe state management

### Memory Safety

- No retain cycles in closures
- Proper weak references where needed
- Automatic memory management for views

### Performance

- Efficient view updates through SwiftUI's diffing
- Minimal allocations during drag gestures
- Optimized rendering pipeline usage
