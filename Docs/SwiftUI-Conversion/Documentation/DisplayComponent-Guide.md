# DisplayComponent Implementation Guide

## Overview

The DisplayComponent is a comprehensive LCD-style interface that serves as the central information hub for the GR55 hardware emulation. It implements requirements 3.1 through 3.6, providing real-time display of patch information, tone source states, effect parameters, and interactive controls.

## Architecture

### Component Structure

```
DisplayComponent
├── LCD Container (bezel and background)
├── StatusBar (tone sources with mute states)
├── Patch Information Section (bank, style, patch name)
├── BPM Control Section (tempo adjustment)
└── ParameterGrid (effects and assign switches)
```

### Key Features

1. **LCD-Style Container**: Authentic bezel styling with proper shadows and borders
2. **Real-time Status Display**: Shows PCM1, PCM2, MODEL, and GUITAR tone source states
3. **Interactive Patch Selection**: Tap patch name to open selection modal
4. **BPM Control**: Increment/decrement buttons and tap-to-edit functionality
5. **Effect Parameter Grid**: Visual representation of all effects and assign switches
6. **Hover and Edit Support**: Preview pane integration and edit mode transitions

## Implementation Details

### StatusBar Component

The StatusBar displays the four main tone sources with visual indicators:

- **PCM1/PCM2**: Synthesizer tone sources
- **MODEL**: Guitar modeling engine
- **GUITAR**: Direct guitar pickup signal

Each tone source button:

- Shows mute state with color coding (green = active, red = muted)
- Supports single-tap to toggle mute state
- Supports hover for preview information
- Supports double-tap for edit mode

### Patch Information Section

Displays current patch context:

- **Bank**: Large monospaced display (e.g., "01-1")
- **Style**: Current sound style (LEAD, RHYTHM, OTHER, USER)
- **Patch Name**: Clickable patch name that opens selection modal

### BPM Control Section

Interactive tempo control with:

- **Decrement Button**: Reduces BPM by 1 (minimum 40)
- **BPM Display**: Shows current tempo, tap to edit directly
- **Increment Button**: Increases BPM by 1 (maximum 300)
- **Direct Input**: TextField for precise tempo entry

### ParameterGrid Component

Two-row grid showing:

**Top Row - Effects**:

- MFX, DELAY, CHORUS, REVERB, AMP, NS, MOD, EQ
- Color-coded active/inactive states
- Hover support for parameter preview
- Double-tap for edit mode

**Bottom Row - Assign Switches**:

- Numbered switches 1-8
- Green when active, gray when inactive
- Individual toggle functionality
- Preview and edit support

## State Management Integration

### ObservableObject Pattern

The DisplayComponent observes the GR55StateManager for:

- Patch name changes
- Effect state toggles
- Tone source mute states
- Assign switch states
- Style and bank updates

### MIDI Integration

All user interactions trigger appropriate MIDI commands:

- Tone source toggles → MIDI mute commands
- Effect toggles → MIDI parameter changes
- Assign toggles → MIDI assign commands
- Patch selection → MIDI patch change

## Visual Design

### LCD Aesthetic

- **Background**: Light blue LCD color (#DBE9FF)
- **Border**: Dark bezel with 12pt width
- **Text**: Dark blue LCD text (#1E3A8A)
- **Shadows**: Subtle component depth

### Interactive Elements

- **Hover Effects**: 1.05x scale animation
- **Press States**: 0.95x scale feedback
- **Color Coding**:
  - Green: Active/On states
  - Red: Muted/Error states
  - Orange: Accent/Selected states
  - Gray: Inactive/Off states

### Typography

- **Bank Display**: 60pt black monospaced
- **Patch Name**: 32pt bold monospaced
- **Status Text**: 10pt bold
- **Parameter Labels**: 12pt semibold

## Accessibility Features

### VoiceOver Support

All interactive elements include:

- Descriptive accessibility labels
- State information (on/off, muted/active)
- Action hints for buttons

### Keyboard Navigation

- Tab navigation through all interactive elements
- Space/Enter activation for buttons
- Escape key cancels edit modes

### High Contrast Support

- Maintains contrast ratios in all appearance modes
- Clear visual state differentiation
- Readable text at all sizes

## Performance Considerations

### Efficient Updates

- Uses @Published properties for reactive updates
- Minimizes unnecessary recomposition
- Efficient hover state management

### Memory Management

- Proper cleanup of state observers
- Efficient view recycling in grids
- Minimal retained closures

## Integration with Preview System

### Hover Detection

The DisplayComponent provides hover callbacks for:

- Effect buttons → Effect preview information
- Tone sources → Tone configuration details
- Assign switches → Assignment target information

### Edit Mode Support

Double-tap interactions trigger edit mode:

- Effect parameters → Detailed parameter controls
- Tone sources → Tone configuration interface
- Assign switches → Assignment configuration

## Testing Considerations

### Unit Testing

Test coverage should include:

- BPM control boundary conditions (40-300 range)
- Effect state synchronization
- Tone source mute state accuracy
- Assign switch toggle functionality

### Property-Based Testing

Verify properties such as:

- State consistency across all toggles
- Proper MIDI command generation
- UI state reflection accuracy
- Hover and edit mode transitions

## Usage Example

```swift
DisplayComponent(stateManager: stateManager)
    .onHover { hoveredItem in
        // Handle hover for preview pane
        showPreview(for: hoveredItem)
    }
    .onEditModeChange { isEditMode in
        // Handle edit mode transitions
        updateEditInterface(isEditMode)
    }
```

## Future Enhancements

### Planned Features

1. **Custom BPM Tap**: Tap tempo detection
2. **Parameter Animation**: Smooth value transitions
3. **Preset Recall**: Quick patch recall buttons
4. **MIDI Learn**: Parameter assignment learning

### Extensibility

The component architecture supports:

- Additional effect types
- Extended assign functionality
- Custom parameter layouts
- Theme customization

## Swift 6.2 Compliance

### Concurrency Features

- All UI updates on @MainActor
- Async MIDI command sending
- Sendable protocol conformance
- Proper actor isolation

### Modern SwiftUI Patterns

- @StateObject for lifecycle management
- @ObservedObject for state observation
- Proper view composition
- Efficient state binding
