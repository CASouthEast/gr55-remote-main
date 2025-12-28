# Custom Shapes and Visual Components Guide

## Overview

This guide documents the custom SwiftUI shapes and visual components created for the GR55 hardware interface conversion. These components provide the building blocks for creating an authentic hardware emulation experience while following Swift 6.2 best practices.

## Custom Shapes

### PedalShape

A trapezoidal shape that represents foot pedals with realistic proportions.

```swift
struct PedalShape: Shape {
    func path(in rect: CGRect) -> Path
}
```

**Usage:**

```swift
PedalShape()
    .pedalStyle(isPressed: false)
    .frame(width: 80, height: 120)
```

**Features:**

- Trapezoidal geometry matching hardware pedals
- Supports press state animations
- Optimized path drawing for performance

### DataWheelShape

A circular shape with notches around the circumference for data wheel controls.

```swift
struct DataWheelShape: Shape {
    let notchCount: Int
    let notchLength: CGFloat
}
```

**Usage:**

```swift
DataWheelShape(notchCount: 24, notchLength: 8)
    .hardwareStyle()
    .frame(width: 80, height: 80)
```

**Features:**

- Configurable notch count and length
- Precise circumference calculations
- Hardware-authentic appearance

### LevelBarShape

A vertical level indicator that fills based on a 0.0-1.0 level value.

```swift
struct LevelBarShape: Shape {
    let level: Double // 0.0 to 1.0
}
```

**Usage:**

```swift
LevelBarShape(level: 0.7)
    .fill(LinearGradient(...))
    .frame(width: 20, height: 100)
```

**Features:**

- Smooth level transitions
- Gradient fill support
- Rounded corners for polish

### LEDShape

A circular LED indicator with optional glow ring.

```swift
struct LEDShape: Shape {
    let hasGlowRing: Bool
}
```

**Usage:**

```swift
LEDShape()
    .ledStyle(isActive: true)
    .frame(width: 16, height: 16)
```

**Features:**

- Glow effect support
- State-based styling
- Animation-ready

### KnobShape

A circular knob with a visual indicator line showing rotation angle.

```swift
struct KnobShape: Shape {
    let angle: Double // Rotation angle in radians
    let indicatorLength: CGFloat
}
```

**Usage:**

```swift
KnobShape(angle: .pi / 4, indicatorLength: 0.3)
    .hardwareStyle()
    .frame(width: 60, height: 60)
```

**Features:**

- Rotational indicator line
- Configurable indicator length
- Smooth rotation animations

### ButtonShape

A rounded rectangle button with press state support.

```swift
struct ButtonShape: Shape {
    let cornerRadius: CGFloat
    let isPressed: Bool
}
```

**Usage:**

```swift
ButtonShape(cornerRadius: 8, isPressed: false)
    .buttonStyle(isPressed: false)
    .frame(width: 80, height: 30)
```

**Features:**

- Press state visual feedback
- Configurable corner radius
- Animation support

### DisplayBezelShape

A rectangular bezel with rounded corners and inner border for LCD displays.

```swift
struct DisplayBezelShape: Shape {
    let borderWidth: CGFloat
    let cornerRadius: CGFloat
}
```

**Usage:**

```swift
DisplayBezelShape(borderWidth: 12, cornerRadius: 8)
    .fill(DesignTokens.Colors.lcdBorder)
    .frame(width: 400, height: 200)
```

**Features:**

- Authentic LCD bezel appearance
- Configurable border width
- Inner cutout for content area

### ExpressionPedalShape

A large rectangular pedal with rounded corners and optional surface texture.

```swift
struct ExpressionPedalShape: Shape {
    let cornerRadius: CGFloat
    let hasTexture: Bool
}
```

**Usage:**

```swift
ExpressionPedalShape(hasTexture: true)
    .expressionPedalStyle()
    .frame(width: 140, height: 300)
```

**Features:**

- Large pedal surface
- Optional texture lines
- Realistic proportions

## Visual Components

### LevelBar

A complete level bar component with animations and gradient fill.

```swift
struct LevelBar: View {
    let level: Int // 0-100 range
    let height: CGFloat
    let width: CGFloat
}
```

**Features:**

- Smooth level animations
- Gradient fill with accent colors
- Configurable dimensions
- State change animations

### LEDIndicator

A complete LED indicator with glow effects and state animations.

```swift
struct LEDIndicator: View {
    let isActive: Bool
    let size: CGFloat
    let activeColor: Color
    let inactiveColor: Color
    let glowRadius: CGFloat
}
```

**Features:**

- Glow effect animations
- Configurable colors and size
- Pulsing animation when active
- State transition animations

### KnobComponent

A rotatable knob with value display and gesture handling.

```swift
struct KnobComponent: View {
    let value: Double // 0.0 to 1.0
    let size: CGFloat
    let label: String?
    let onValueChanged: ((Double) -> Void)?
}
```

**Features:**

- Drag gesture recognition
- Value clamping and conversion
- Optional label display
- Smooth rotation animations

### HardwareButton

A hardware-style button with LED indicator and press animations.

```swift
struct HardwareButton: View {
    let title: String
    let isPressed: Bool
    let isActive: Bool
    let hasLED: Bool
    let onTap: () -> Void
}
```

**Features:**

- Optional LED indicator
- Press state animations
- Hardware-authentic styling
- Tap gesture handling

### DisplayBezel

A container component for LCD-style displays with proper bezel styling.

```swift
struct DisplayBezel<Content: View>: View {
    let content: Content
    let borderWidth: CGFloat
    let cornerRadius: CGFloat
}
```

**Features:**

- Generic content support
- Proper LCD styling
- Configurable dimensions
- Shadow effects

### ExpressionPedalSurface

A complete expression pedal with level control and gesture handling.

```swift
struct ExpressionPedalSurface: View {
    let level: Int
    let onLevelChanged: (Int) -> Void
}
```

**Features:**

- Vertical drag gesture recognition
- Level display overlay
- Integrated level bar
- Realistic pedal surface

## Shape Extensions

### Hardware Styling

```swift
extension Shape {
    func hardwareStyle(
        fillColor: Color = DesignTokens.Colors.surface,
        borderColor: Color = DesignTokens.Colors.border,
        shadowColor: Color = Color.black.opacity(0.2)
    ) -> some View
}
```

### LED Styling

```swift
extension Shape {
    func ledStyle(
        isActive: Bool,
        activeColor: Color = DesignTokens.Colors.ledActive,
        inactiveColor: Color = DesignTokens.Colors.ledInactive
    ) -> some View
}
```

### Button Styling

```swift
extension Shape {
    func buttonStyle(
        isPressed: Bool,
        normalColor: Color = DesignTokens.Colors.buttonDefault,
        pressedColor: Color = DesignTokens.Colors.buttonPressed
    ) -> some View
}
```

### Pedal Styling

```swift
extension Shape {
    func pedalStyle(
        isPressed: Bool = false,
        bodyColor: Color = DesignTokens.Colors.pedalBody,
        borderColor: Color = DesignTokens.Colors.pedalBorder
    ) -> some View
}
```

### Expression Pedal Styling

```swift
extension Shape {
    func expressionPedalStyle() -> some View
}
```

## Design Principles

### Performance Optimization

- All shapes use efficient path drawing
- Animations are optimized for 60fps
- State changes use appropriate animation curves
- Memory usage is minimized through proper view lifecycle

### Accessibility

- All interactive components support VoiceOver
- Proper contrast ratios maintained
- Gesture recognition accommodates accessibility needs
- State changes provide appropriate feedback

### Swift 6.2 Compliance

- All code follows strict concurrency patterns
- @MainActor usage for UI updates
- Proper async/await patterns where needed
- Memory safety and performance optimizations

### Visual Fidelity

- Shapes match original hardware proportions
- Colors and styling maintain authentic appearance
- Animations provide realistic feedback
- Shadows and effects enhance depth perception

## Usage Examples

### Creating a Complete Pedal

```swift
VStack(spacing: 8) {
    // LED indicator
    LEDIndicator(isActive: isActive)

    // Pedal body
    PedalShape()
        .pedalStyle(isPressed: isPressed)
        .frame(width: 80, height: 120)
        .overlay(
            Text("1")
                .font(DesignTokens.Fonts.pedalNumber)
                .foregroundColor(.white)
        )
        .onTapGesture {
            // Handle tap
        }

    // Label
    Text("LEAD GUITAR")
        .font(DesignTokens.Fonts.pedalTopLabel)
        .foregroundColor(DesignTokens.Colors.accent)
}
```

### Creating a Level Control

```swift
HStack {
    Text("LEVEL")
        .font(DesignTokens.Fonts.parameterLabel)

    LevelBar(level: currentLevel)

    Text("\(currentLevel)")
        .font(DesignTokens.Fonts.statusText)
}
```

### Creating a Control Knob

```swift
KnobComponent(
    value: outputLevel,
    label: "OUTPUT",
    onValueChanged: { newValue in
        outputLevel = newValue
        // Send MIDI command
    }
)
```

## Integration Notes

- All components use DesignTokens for consistent styling
- Components are designed to work together seamlessly
- State management follows SwiftUI best practices
- MIDI integration points are clearly defined
- Performance is optimized for real-time audio applications

## Testing Considerations

- All shapes render correctly at different sizes
- Animations perform smoothly on target devices
- Gesture recognition works reliably
- State changes update UI appropriately
- Memory usage remains stable during extended use
