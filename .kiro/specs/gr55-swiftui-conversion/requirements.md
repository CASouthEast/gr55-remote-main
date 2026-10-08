# Requirements Document

## Introduction

This specification defines the requirements for converting the existing React Native GR55Controller hardware view interface to SwiftUI for iOS. The GR55Controller is a complex hardware emulation interface that replicates the Roland GR-55 Guitar Synthesizer's physical controls, display, and interactions. The conversion must maintain visual fidelity, functional behavior, and real-time MIDI integration while leveraging SwiftUI's native capabilities.

## Glossary

- **GR55Controller**: Main SwiftUI view that orchestrates the hardware interface layout
- **Hardware_View**: The complete visual representation of the Roland GR-55 device
- **Display_Component**: LCD screen emulation showing patch information and parameters
- **Pedal_Cluster**: Collection of foot pedals (1-4) with LED indicators and labels
- **Navigation_Cluster**: Data wheel, page buttons, and GK controls section
- **Sound_Style_Panel**: Style selection buttons (LEAD, RHYTHM, OTHER, USER)
- **Expression_Pedal**: Large right-side pedal with level control and EXP SW button
- **Ports_Bar**: Top connection labels display
- **Preview_Pane**: Contextual parameter display overlay (web-only feature)
- **State_Manager**: ObservableObject managing GR55 hardware state
- **MIDI_Integration**: Connection to existing Swift MIDI communication layer
- **Design_Tokens**: SwiftUI equivalent of hardware styling constants

## Requirements

### Requirement 1: Core Hardware Interface Structure

**User Story:** As a musician, I want to see a faithful SwiftUI representation of the Roland GR-55 hardware interface, so that I can intuitively control the synthesizer using familiar visual elements.

#### Acceptance Criteria

1. THE Hardware_View SHALL render the complete GR-55 chassis with proper proportions and visual hierarchy
2. WHEN the interface loads, THE Hardware_View SHALL display all major sections: Display_Component, Pedal_Cluster, Navigation_Cluster, Sound_Style_Panel, Expression_Pedal, and Ports_Bar
3. THE Hardware_View SHALL use SwiftUI's native layout system (VStack, HStack, ZStack) to replicate the React Native Flexbox positioning
4. THE Hardware_View SHALL maintain responsive scaling across different iOS device sizes
5. THE Hardware_View SHALL apply consistent design tokens for colors, spacing, shadows, and typography

### Requirement 2: State Management and Data Flow

**User Story:** As a developer, I want centralized state management using SwiftUI patterns, so that the hardware interface stays synchronized with MIDI data and user interactions.

#### Acceptance Criteria

1. THE State_Manager SHALL be implemented as an ObservableObject conforming to SwiftUI patterns
2. WHEN MIDI data changes, THE State_Manager SHALL update @Published properties to trigger UI updates
3. THE State_Manager SHALL manage GR55State including activePedal, patchName, activeStyle, and bank properties
4. THE State_Manager SHALL provide action methods for user interactions (setActivePedal, setPatchName, setActiveStyle)
5. THE State_Manager SHALL integrate with existing Swift MIDI communication layer without requiring changes to MIDI parsing logic

### Requirement 3: Display Component with Real-time Data

**User Story:** As a musician, I want to see current patch information, parameter states, and tempo controls in the LCD display, so that I can monitor and adjust synthesizer settings.

#### Acceptance Criteria

1. THE Display_Component SHALL render an LCD-style interface with proper bezel and screen styling
2. WHEN patch data updates, THE Display_Component SHALL display current patch name, bank, and sound type
3. THE Display_Component SHALL show real-time status of PCM1, PCM2, MODEL, and GUITAR tone sources with mute states
4. THE Display_Component SHALL provide interactive BPM control with tap-to-edit and increment/decrement buttons
5. THE Display_Component SHALL display effect parameter buttons (MFX, DELAY, CHORUS, REVERB, AMP, NS, MOD, EQ) with active/inactive states
6. THE Display_Component SHALL show assign switches (1-8) with proper on/off indication
7. WHEN a user taps the patch name, THE Display_Component SHALL present a patch selection interface
8. WHEN a user double-taps effect or parameter buttons, THE Display_Component SHALL enter edit mode and display detailed parameter controls
9. The status indicators also serves as buttons, and when pressed, they toggles on/off for the tone sources and effects, as well as assigns.
10. When hovering over the status indicators, a Preview is shown to the right of the Display, overlaying the rightmost area of the HW view . Previews are currently dummies for now.
11. When doubblecliking on the status indicators, a edit view is shown to the right of the Display, overlaying the rightmost area of the HW view . The edit views stays visible until Cancel or Save is pressed. Edit views has the same layout as the Previews.

### Requirement 4: Interactive Pedal Controls

**User Story:** As a musician, I want to interact with foot pedals that respond like physical hardware, so that I can select patches and control functions naturally.

#### Acceptance Criteria

1. THE Pedal_Cluster SHALL render four pedals (1, 2, 3, CTL) with proper trapezoidal shapes and LED indicators
2. WHEN a pedal is active, THE Pedal_Cluster SHALL illuminate the corresponding LED with red glow effect
3. WHEN pedal 1 or 2 is single-tapped, THE Pedal_Cluster SHALL select the corresponding ordinal in current bank
4. WHEN pedal 1 or 2 is double-tapped, THE Pedal_Cluster SHALL navigate to next/previous bank respectively
5. WHEN pedal 3 is tapped, THE Pedal_Cluster SHALL select ordinal 3 in current bank
6. WHEN CTL pedal is tapped, THE Pedal_Cluster SHALL toggle CTL status and update function display
7. THE Pedal_Cluster SHALL display current patch names above each pedal (1-3) and CTL function above CTL pedal

### Requirement 5: Navigation and Data Controls

**User Story:** As a musician, I want navigation controls that mirror the physical GR-55 interface, so that I can browse parameters and adjust settings efficiently. The only items currently supported in Navigation and Data Controls area are GK buttons and knob.
1,2,3,5, and 6 are just dummies for now.

#### Acceptance Criteria

1. THE Navigation_Cluster SHALL render a data wheel, page navigation buttons, and GK control section
2. WHEN the data wheel is rotated, THE Navigation_Cluster SHALL trigger pedal selection changes
3. WHEN the data wheel is pressed directionally, THE Navigation_Cluster SHALL navigate between sound styles and pedals
4. THE Navigation_Cluster SHALL display current GK S1, S2, and VOL function values
5. THE Navigation_Cluster SHALL provide PAGE left/right, EDIT, EXIT, ENTER, and WRITE button functionality
6. THE Navigation_Cluster SHALL include an Output Level knob with visual indicator

### Requirement 6: Sound Style Selection Panel

**User Story:** As a musician, I want to select between different sound styles (LEAD, RHYTHM, OTHER, USER), so that I can quickly access different categories of patches.

#### Acceptance Criteria

1. THE Sound_Style_Panel SHALL render style buttons for LEAD, RHYTHM, OTHER, and USER
2. WHEN a style is active, THE Sound_Style_Panel SHALL illuminate the corresponding button LED
3. WHEN a style button is tapped, THE Sound_Style_Panel SHALL switch to that style and update patch selection
4. THE Sound_Style_Panel SHALL include V-LINK and EZ EDIT buttons with proper styling
5. THE Sound_Style_Panel SHALL maintain visual consistency with hardware button appearance

### Requirement 7: Expression Pedal with Level Control

**User Story:** As a musician, I want an expression pedal that provides visual feedback and level adjustment, so that I can control patch volume and expression parameters.

#### Acceptance Criteria

1. THE Expression_Pedal SHALL render a large pedal surface with realistic 3D appearance
2. THE Expression_Pedal SHALL display current patch level value (0-100) with visual level bar
3. WHEN the pedal surface is dragged vertically, THE Expression_Pedal SHALL adjust patch level accordingly
4. THE Expression_Pedal SHALL include an EXP SW button with LED indicator and function display
5. WHEN EXP SW is tapped, THE Expression_Pedal SHALL toggle switch status and update function display
6. THE Expression_Pedal SHALL show PATCH LEVEL label and current level value prominently

### Requirement 8: Visual Design and Styling System

**User Story:** As a developer, I want a consistent SwiftUI styling system that replicates the hardware aesthetic, so that the interface maintains visual authenticity and professional appearance.

#### Acceptance Criteria

1. THE Design_Tokens SHALL define SwiftUI equivalents for all hardware colors, spacing, radii, and shadows
2. THE Hardware_View SHALL use consistent color scheme matching the original zinc/orange palette
3. THE Hardware_View SHALL apply proper shadow effects using SwiftUI's shadow modifiers
4. THE Hardware_View SHALL use appropriate SF Symbols or custom shapes for buttons and indicators
5. THE Hardware_View SHALL maintain proper contrast ratios and accessibility standards
6. THE Hardware_View SHALL support both light and dark iOS appearance modes appropriately

### Requirement 9: Gesture Recognition and Interactions

**User Story:** As a musician, I want touch interactions that feel responsive and provide appropriate feedback, so that the interface feels like controlling physical hardware.

#### Acceptance Criteria

1. WHEN buttons are pressed, THE Hardware_View SHALL provide visual feedback with scale animations
2. WHEN pedals are tapped, THE Hardware_View SHALL animate press states and LED changes
3. WHEN the expression pedal is dragged, THE Hardware_View SHALL provide smooth level bar updates
4. WHEN the data wheel is interacted with, THE Hardware_View SHALL recognize rotation and directional press gestures
5. THE Hardware_View SHALL use appropriate haptic feedback for button presses and significant state changes

### Requirement 10: MIDI Integration and Real-time Updates

**User Story:** As a musician, I want the SwiftUI interface to stay synchronized with MIDI data from my GR-55 hardware, so that the visual state always reflects the actual synthesizer state.

#### Acceptance Criteria

1. THE State_Manager SHALL integrate with existing Swift MIDI communication without breaking current functionality
2. WHEN MIDI patch changes are received, THE State_Manager SHALL update patch name, bank, and style properties
3. WHEN MIDI parameter changes are received, THE State_Manager SHALL update corresponding UI elements (effects, assigns, levels)
4. WHEN user interactions occur, THE State_Manager SHALL send appropriate MIDI commands to hardware
5. THE State_Manager SHALL handle MIDI connection states and provide appropriate UI feedback for disconnected states

### Requirement 11: Performance and Memory Management

**User Story:** As a developer, I want the SwiftUI interface to perform efficiently on iOS devices, so that real-time MIDI interaction remains responsive without audio dropouts.

#### Acceptance Criteria

1. THE Hardware_View SHALL render at 60fps during normal operation and interactions
2. THE State_Manager SHALL minimize unnecessary view updates using proper @Published property design
3. THE Hardware_View SHALL use efficient SwiftUI layout techniques to avoid excessive recomposition
4. THE Hardware_View SHALL properly manage memory for complex visual elements and animations
5. THE Hardware_View SHALL maintain responsive performance on older iOS devices (iPhone 12 and newer)

### Requirement 12: Preview Pane and Contextual Information

**User Story:** As a musician, I want to see detailed parameter information when hovering over or selecting interface elements, so that I can understand current settings and make informed adjustments.

#### Acceptance Criteria

1. THE Preview_Pane SHALL display contextual information for effects, tones, and assign parameters
2. WHEN a user hovers over effect buttons (MFX, DELAY, CHORUS, REVERB, AMP, NS, MOD, EQ), THE Preview_Pane SHALL show current effect type, parameters, and values
3. WHEN a user hovers over tone buttons (GUITAR, PCM1, PCM2, MODEL), THE Preview_Pane SHALL show tone category, name, level, and configuration
4. WHEN a user hovers over assign buttons (1-8), THE Preview_Pane SHALL show target parameter, source, and range settings
5. THE Preview_Pane SHALL position itself contextually near the hovered element without obscuring controls
6. THE Preview_Pane SHALL use card-style presentation with proper shadows and readable typography
7. WHEN no element is hovered, THE Preview_Pane SHALL remain hidden to avoid interface clutter
8. WHEN a user double-taps effect or parameter buttons, THE Preview_Pane SHALL transition to edit mode showing detailed parameter controls and value adjustment interfaces

### Requirement 13: Component Architecture and Modularity

**User Story:** As a developer, I want a well-structured SwiftUI component hierarchy, so that the codebase is maintainable and components can be reused or modified independently.

#### Acceptance Criteria

1. THE Hardware_View SHALL be composed of discrete SwiftUI view components for each major section
2. WHEN components are modified, THE Hardware_View SHALL maintain proper encapsulation and data flow
3. THE Hardware_View SHALL use SwiftUI's @StateObject, @ObservedObject, and @Binding patterns appropriately
4. THE Hardware_View SHALL separate presentation logic from business logic using proper MVVM patterns
5. THE Hardware_View SHALL provide clear interfaces between components using well-defined data models
