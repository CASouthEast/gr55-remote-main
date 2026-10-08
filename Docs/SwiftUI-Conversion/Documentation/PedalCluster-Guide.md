# PedalCluster Component Guide

## Overview

The `PedalCluster` component is a SwiftUI view that implements the foot pedal section of the GR55 hardware interface. It arranges four FootPedal components (1, 2, 3, CTL) in a horizontal layout and coordinates single-tap vs double-tap behaviors for bank navigation.

## Architecture

### Component Structure

```
PedalCluster
├── pedalLayout (HStack)
│   ├── FootPedal (1) - Single tap: select ordinal, Double tap: next bank
│   ├── FootPedal (2) - Single tap: select ordinal, Double tap: previous bank
│   ├── FootPedal (3) - Single tap: select ordinal (no double tap)
│   └── FootPedal (CTL) - Single tap: toggle CTL status
└── AudioPlayerSection
    ├── brandingSection (Roland/GR-55 branding)
    └── audioControlsSection (decorative audio indicators)
```

### State Management

The component observes a `GR55StateManager` instance and coordinates the following interactions:

- **Single Tap (Pedals 1-3)**: Selects the corresponding ordinal in the current bank
- **Double Tap (Pedal 1)**: Navigates to the next bank
- **Double Tap (Pedal 2)**: Navigates to the previous bank
- **Single Tap (CTL)**: Toggles CTL pedal status and updates function display

## Key Features

### 1. Coordinated Tap Behaviors

The component implements sophisticated gesture recognition:

```swift
private func getDoubleTapHandler(for pedalNumber: Int) -> (() -> Void)? {
    switch pedalNumber {
    case 1:
        return { handlePedalDoubleTap(.next) }
    case 2:
        return { handlePedalDoubleTap(.previous) }
    case 3:
        return nil // No double tap functionality
    default:
        return nil
    }
}
```

### 2. Dynamic Label Generation

Patch names are dynamically generated from bank slots:

```swift
private func getPatchNameForPedal(_ pedalNumber: Int) -> String? {
    guard let bankSlots = stateManager.currentState.bankSlots,
          pedalNumber <= bankSlots.count else {
        return "PATCH \(pedalNumber)"
    }

    return bankSlots[pedalNumber - 1].name
}
```

### 3. Haptic Feedback

Different interaction types provide appropriate haptic feedback:

- **Single Tap**: Medium impact feedback
- **Double Tap**: Heavy impact feedback for bank navigation
- **CTL Toggle**: Medium impact feedback

### 4. AudioPlayerSection Integration

The component includes an `AudioPlayerSection` that provides:

- Roland and GR-55 branding elements
- Decorative audio player indicators
- Visual balance and hardware authenticity

## Usage

### Basic Implementation

```swift
struct MyView: View {
    @StateObject private var stateManager = GR55StateManager()

    var body: some View {
        PedalCluster(stateManager: stateManager)
    }
}
```

### Integration with Hardware View

```swift
// In GR55HardwareView
private var leftColumn: some View {
    VStack(spacing: DesignTokens.Spacing.medium) {
        DisplayComponent(stateManager: stateManager)
        SoundStylePanel(stateManager: stateManager)
        PedalCluster(stateManager: stateManager) // Integrated here
    }
}
```

## State Dependencies

The component depends on the following state properties:

### From GR55State

- `activePedal: Int` - Currently selected pedal (1-3)
- `ctlStatus: Bool` - CTL pedal active status
- `ctlFunction: String` - CTL pedal function display text
- `bankSlots: [BankSlot]?` - Current bank's patch slots for label generation

### State Manager Methods Used

- `selectOrdinalInCurrentBank(_:)` - Selects pedal within current bank
- `gotoNextBank()` - Navigates to next bank
- `gotoPrevBank()` - Navigates to previous bank
- `toggleCtlPedal()` - Toggles CTL pedal status

## Styling and Design

### Layout Specifications

- **Pedal Spacing**: `DesignTokens.Spacing.large` between pedals
- **Vertical Spacing**: `DesignTokens.Spacing.medium` between pedal row and audio section
- **Container Padding**: `DesignTokens.Spacing.medium` horizontal, `DesignTokens.Spacing.small` vertical

### Visual Elements

- **Pedal LEDs**: Red glow when active, dim when inactive
- **Branding Colors**: Orange accent for Roland branding
- **Audio Indicators**: Small circular LEDs with one active (red)

## Accessibility

The component inherits accessibility features from the FootPedal component:

- VoiceOver labels for each pedal
- Accessibility hints for tap behaviors
- Selected state indication for active pedals
- Button traits for interactive elements

## Performance Considerations

### Efficient State Updates

- Uses `@ObservedObject` for reactive updates
- Minimal recomposition through targeted state observation
- Efficient label generation with guard statements

### Gesture Recognition

- Leverages FootPedal's built-in gesture recognition
- No duplicate gesture handlers at cluster level
- Proper haptic feedback timing

## Testing Support

The component includes comprehensive preview support:

```swift
#Preview {
    PedalClusterPreview()
}
```

The preview includes:

- Interactive test controls for all pedal functions
- Bank navigation testing
- Current state display
- CTL toggle testing

## Integration Requirements

### Required Components

- `FootPedal` component with proper gesture recognition
- `GR55StateManager` with bank navigation methods
- `DesignTokens` for consistent styling

### Required State Properties

Ensure the state manager provides:

- Bank slot information for dynamic labels
- Proper CTL function text updates
- Correct active pedal tracking

## Common Issues and Solutions

### Issue: Labels Not Updating

**Problem**: Pedal labels show "PATCH X" instead of actual patch names.

**Solution**: Ensure `bankSlots` are properly populated in the state manager:

```swift
// In GR55StateManager
private func updateBankSlotsForStyle(_ style: SoundStyle) {
    state.bankSlots = generateSampleBankSlots(for: style)
}
```

### Issue: Double Tap Not Working

**Problem**: Double tap gestures not triggering bank navigation.

**Solution**: Verify FootPedal component has proper double tap implementation and timing.

### Issue: CTL Function Not Updating

**Problem**: CTL pedal shows wrong function text.

**Solution**: Ensure state manager updates `ctlFunction` when toggling:

```swift
func toggleCtlPedal() {
    state.ctlStatus.toggle()
    state.ctlFunction = state.ctlStatus ? "ACTIVE" : "REC/PLAY/DUB"
}
```

## Future Enhancements

### Planned Features

1. **Long Press Actions**: Additional functionality for long press gestures
2. **Visual Feedback**: Enhanced animations for bank changes
3. **Audio Integration**: Real audio player functionality in AudioPlayerSection
4. **Customizable Labels**: User-defined pedal labels and functions

### Extension Points

The component is designed for easy extension:

- Additional pedal types through FootPedalNumber enum
- Custom branding through AudioPlayerSection customization
- Enhanced gesture recognition through FootPedal extensions

## Requirements Validation

This component satisfies the following requirements:

- **4.1**: Renders four pedals with proper trapezoidal shapes and LED indicators
- **4.3**: Implements single-tap for ordinal selection in current bank
- **4.4**: Implements double-tap for bank navigation (pedals 1 and 2)
- **4.5**: Navigates to next/previous bank on double-tap
- **4.6**: Toggles CTL status on CTL pedal tap
- **4.7**: Displays current patch names above pedals and CTL function

The component provides a complete, interactive pedal cluster that maintains the authentic feel of the original GR-55 hardware while leveraging SwiftUI's modern capabilities.
