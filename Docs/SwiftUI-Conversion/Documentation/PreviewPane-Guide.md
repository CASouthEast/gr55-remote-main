# PreviewPane Component Guide

## Overview

The `PreviewPane` component provides contextual information overlay for effects, tones, and assigns. It displays detailed parameter information when hovering over interface elements and supports edit mode transitions for parameter adjustment.

## Requirements Addressed

- **12.1**: Display contextual information for effects, tones, and assign parameters
- **12.2**: Show current effect type, parameters, and values on hover
- **12.3**: Show tone category, name, level, and configuration on hover
- **12.4**: Show target parameter, source, and range settings for assigns
- **12.5**: Position contextually without obscuring controls
- **12.6**: Use card-style presentation with proper shadows
- **12.7**: Remain hidden when no element is hovered
- **12.8**: Transition to edit mode with detailed parameter controls

## Component Structure

### PreviewPane

Main overlay container that manages visibility and positioning.

**Properties:**

- `hoveredItem: HoveredItem` - Currently hovered interface element
- `isEditMode: Bool` - Whether edit mode is active

### PreviewCard

Card container with shadow and scrollable content.

### PreviewHeader

Header section with title, effect type badge, and status indicator.

### PreviewContent

Main content area showing parameters based on item type.

### EffectPreviewContent

Specialized content for effect parameters (MOD, MFX, DELAY, etc.).

### TonePreviewContent

Specialized content for tone source parameters (GUITAR, PCM1, PCM2, MODEL).

### AssignPreviewContent

Specialized content for assign parameters and routing.

### ParameterRow

Individual parameter display with label and value.

### EditModeControls

Cancel and Save buttons shown in edit mode.

## Usage Example

```swift
PreviewPane(
    hoveredItem: .effect("MFX"),
    isEditMode: false
)
```

## Effect Parameters

### MOD (Modulation)

- Type: PHASER
- Rate: 2.5 Hz
- Depth: 75
- Resonance: 50
- Level: 85

### MFX (Multi-Effects)

- Low Freq: 100 Hz
- Low Gain: +3 dB
- Mid Freq: 800 Hz
- Mid Gain: -2 dB
- High Freq: 5.0 kHz
- High Gain: +5 dB
- Level: 90

### DELAY

- Type: STEREO
- Time: 450 ms
- Feedback: 40
- HF Damp: 6.3 kHz
- Effect Level: 75

### CHORUS

- Type: MONO
- Rate: 1.5 Hz
- Depth: 60
- Effect Level: 70

### REVERB

- Type: HALL
- Time: 3.5 s
- High Cut: 8.0 kHz
- Effect Level: 65

### AMP

- Type: JC-120
- Gain: 50
- Bass: 55
- Middle: 60
- Treble: 65
- Presence: 50
- Level: 80

### NS (Noise Suppressor)

- Threshold: 25
- Release: 40 ms

### EQ (Equalizer)

- Low Cutoff: 200 Hz
- Low Gain: +2 dB
- Low Mid Freq: 800 Hz
- Low Mid Gain: -1 dB
- High Mid Freq: 3.2 kHz
- High Mid Gain: +3 dB
- High Gain: +1 dB

## Tone Parameters

### GUITAR (Normal Pickup)

- Level: 100

### PCM1

- Tone: A.PIANO 1
- Level: 90
- Octave Shift: 0
- Pan: CENTER
- Coarse Tune: 0

### PCM2

- Tone: STRINGS 1
- Level: 85
- Octave Shift: +1
- Pan: CENTER
- Coarse Tune: 0

### MODEL

- Category: E.GTR
- Tone: ST SINGLE 1
- Level: 95
- 12-String: OFF

## Assign Parameters

- Target: MFX Level
- Target Min: 0
- Target Max: 100
- Source: CC#11 (Expression)
- Active Range Lo: 0
- Active Range Hi: 127

## Styling

The component uses:

- White background with shadow for card appearance
- `DesignTokens.Colors.accent` for parameter values
- Gray text for parameter labels
- Proper spacing and typography hierarchy
- Smooth transitions for show/hide animations

## Edit Mode

When in edit mode, the preview pane shows:

- "EDIT MODE" header instead of "PREVIEW"
- Same parameter information as preview mode
- Cancel and Save buttons at the bottom
- Edit mode remains visible until Cancel or Save is pressed

## Positioning

The preview pane:

- Positions itself in the center-right area of the interface
- Uses GeometryReader for responsive positioning
- Maintains maximum width of 380 points
- Minimum height of 200 points
- Does not interfere with hardware controls

## Integration

The PreviewPane integrates with:

- DisplayComponent for hover detection on effects, tones, and assigns
- State manager for real-time parameter values
- Main GR55HardwareView as an overlay

## Swift 6.2 Compliance

- Uses `@MainActor` for UI thread safety
- Implements proper state management with `@State`
- Follows sendable patterns for data structures
- Uses async/await patterns where appropriate
