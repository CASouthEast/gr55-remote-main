# GR55 SwiftUI Conversion

This directory contains the SwiftUI conversion of the React Native GR55Controller hardware view interface.

## Directory Structure

- `Views/` - Main SwiftUI views and containers
- `Models/` - Data models and state management
- `Components/` - Reusable UI components
- `Utils/` - Utility functions and extensions
- `Documentation/` - Implementation guides and Swift 6.2 compliance notes

## Implemented Components

### ✅ Core Infrastructure

- **GR55StateManager**: Central state management with ObservableObject pattern
- **GR55State**: Main data model with Sendable conformance
- **Design Tokens**: Centralized styling system with hardware aesthetic
- **Custom Shapes**: PedalShape, DataWheelShape for authentic hardware look

### ✅ Display System

- **DisplayComponent**: Complete LCD interface with:
  - StatusBar showing tone sources (PCM1, PCM2, MODEL, GUITAR) with mute states
  - Patch information display (bank, style, patch name)
  - Interactive BPM control with tap-to-edit functionality
  - ParameterGrid for effect buttons and assign switches (1-8)
  - Hover detection for preview pane integration
  - Double-tap support for edit mode transitions

### ✅ Interactive Controls

- **FootPedal**: Individual pedal components with:

  - Trapezoidal shape using custom PedalShape
  - LED indicators with glow effects when active
  - Single-tap and double-tap gesture recognition
  - Visual feedback animations (scale effects, LED glow)
  - Top label display for patch names and functions
  - Sub-label support for pedal descriptions
  - Comprehensive accessibility support with VoiceOver
  - Haptic feedback for tactile interaction

- **NavigationCluster**: Complete navigation controls with:
  - DataWheel component with rotation and directional press gestures
  - OutputLevelKnob with visual indicator
  - Navigation buttons (PAGE left/right, EDIT, EXIT, ENTER, WRITE)
  - GKControlsRow showing S1, S2, and VOL function values
  - Drag gesture recognition for wheel rotation
  - Four directional buttons with triangle indicators
  - Visual feedback with scaling and rotation effects
  - Integration with state manager for pedal and style navigation

### 🚧 Pending Implementation

- **ExpressionPedal**: Large pedal with level control
- **SoundStylePanel**: Style selection buttons (LEAD, RHYTHM, OTHER, USER)
- **PreviewPane**: Contextual parameter information overlay

## Swift 6.2 Compliance

This codebase follows Swift 6.2 standards including:

- Strict concurrency checking with @MainActor
- Modern async/await patterns
- ObservableObject with @Published properties
- Proper memory management and lifecycle handling

## Integration

The converted SwiftUI code is designed to be imported into existing iOS applications while maintaining compatibility with the existing Swift MIDI communication layer.
