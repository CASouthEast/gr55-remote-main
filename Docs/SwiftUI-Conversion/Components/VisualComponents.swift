import SwiftUI

// MARK: - Visual Components for Hardware Interface
/// Collection of reusable visual components that use custom shapes
/// Follows Swift 6.2 patterns with proper state management and animations

// MARK: - LevelBar Component
/// Vertical level indicator with gradient fill and smooth animations
struct LevelBar: View {
    let level: Int // 0-100 range
    let height: CGFloat
    let width: CGFloat
    
    @State private var animatedLevel: Double = 0
    
    init(level: Int, height: CGFloat = DesignTokens.Dimensions.levelBarHeight, width: CGFloat = DesignTokens.Dimensions.levelBarWidth) {
        self.level = max(0, min(100, level))
        self.height = height
        self.width = width
    }
    
    var body: some View {
        ZStack(alignment: .bottom) {
            // Background container
            RoundedRectangle(cornerRadius: DesignTokens.Radii.small)
                .fill(DesignTokens.Colors.surface)
                .overlay(
                    RoundedRectangle(cornerRadius: DesignTokens.Radii.small)
                        .stroke(DesignTokens.Colors.border, lineWidth: 1)
                )
                .frame(width: width, height: height)
            
            // Level fill with gradient
            LevelBarShape(level: animatedLevel / 100.0)
                .fill(
                    LinearGradient(
                        gradient: Gradient(colors: [
                            DesignTokens.Colors.accent,
                            DesignTokens.Colors.accentHover
                        ]),
                        startPoint: .bottom,
                        endPoint: .top
                    )
                )
                .frame(width: width - 4, height: height - 4)
                .clipShape(RoundedRectangle(cornerRadius: DesignTokens.Radii.small - 2))
        }
        .onAppear {
            withAnimation(DesignTokens.Animations.stateChange) {
                animatedLevel = Double(level)
            }
        }
        .onChange(of: level) { _, newLevel in
            withAnimation(DesignTokens.Animations.stateChange) {
                animatedLevel = Double(newLevel)
            }
        }
    }
}

// MARK: - LED Indicator Component
/// LED indicator with glow effects and state animations
struct LEDIndicator: View {
    let isActive: Bool
    let size: CGFloat
    let activeColor: Color
    let inactiveColor: Color
    let glowRadius: CGFloat
    
    @State private var isGlowing = false
    
    init(
        isActive: Bool,
        size: CGFloat = DesignTokens.Dimensions.pedalLEDSize,
        activeColor: Color = DesignTokens.Colors.ledActive,
        inactiveColor: Color = DesignTokens.Colors.ledInactive,
        glowRadius: CGFloat = 8
    ) {
        self.isActive = isActive
        self.size = size
        self.activeColor = activeColor
        self.inactiveColor = inactiveColor
        self.glowRadius = glowRadius
    }
    
    var body: some View {
        Circle()
            .fill(isActive ? activeColor : inactiveColor)
            .frame(width: size, height: size)
            .shadow(
                color: isActive ? activeColor.opacity(0.8) : .clear,
                radius: isActive ? glowRadius : 0,
                x: 0,
                y: 0
            )
            .scaleEffect(isActive && isGlowing ? 1.1 : 1.0)
            .animation(
                isActive ? DesignTokens.Animations.ledGlow : .none,
                value: isGlowing
            )
            .onAppear {
                if isActive {
                    isGlowing = true
                }
            }
            .onChange(of: isActive) { _, newValue in
                isGlowing = newValue
            }
    }
}

// MARK: - Knob Component
/// Rotatable knob with visual indicator and value display
struct KnobComponent: View {
    let value: Double // 0.0 to 1.0
    let size: CGFloat
    let label: String?
    let onValueChanged: ((Double) -> Void)?
    
    @State private var dragOffset: CGSize = .zero
    @State private var currentAngle: Double = 0
    
    private let minAngle: Double = -2.0 * .pi / 3 // -120 degrees
    private let maxAngle: Double = 2.0 * .pi / 3  // 120 degrees
    
    init(
        value: Double,
        size: CGFloat = 60,
        label: String? = nil,
        onValueChanged: ((Double) -> Void)? = nil
    ) {
        self.value = max(0.0, min(1.0, value))
        self.size = size
        self.label = label
        self.onValueChanged = onValueChanged
    }
    
    var body: some View {
        VStack(spacing: DesignTokens.Spacing.small) {
            // Knob body
            ZStack {
                // Main knob circle
                Circle()
                    .fill(DesignTokens.Colors.buttonDefault)
                    .overlay(
                        Circle()
                            .stroke(DesignTokens.Colors.border, lineWidth: 2)
                    )
                    .shadow(
                        color: DesignTokens.Shadows.component.color,
                        radius: DesignTokens.Shadows.component.radius,
                        x: DesignTokens.Shadows.component.x,
                        y: DesignTokens.Shadows.component.y
                    )
                
                // Indicator line
                KnobShape(angle: currentAngle, indicatorLength: 0.3)
                    .stroke(DesignTokens.Colors.accent, lineWidth: 3)
            }
            .frame(width: size, height: size)
            .gesture(
                DragGesture()
                    .onChanged { gesture in
                        let center = CGPoint(x: size / 2, y: size / 2)
                        let vector = CGPoint(
                            x: gesture.location.x - center.x,
                            y: gesture.location.y - center.y
                        )
                        let angle = atan2(vector.y, vector.x)
                        
                        // Clamp angle to valid range
                        let clampedAngle = max(minAngle, min(maxAngle, angle))
                        currentAngle = clampedAngle
                        
                        // Convert angle to value (0.0 to 1.0)
                        let normalizedAngle = (clampedAngle - minAngle) / (maxAngle - minAngle)
                        onValueChanged?(normalizedAngle)
                    }
            )
            
            // Label
            if let label = label {
                Text(label)
                    .font(DesignTokens.Fonts.navigationLabel)
                    .foregroundColor(DesignTokens.Colors.textMuted)
            }
        }
        .onAppear {
            // Set initial angle based on value
            currentAngle = minAngle + (maxAngle - minAngle) * value
        }
        .onChange(of: value) { _, newValue in
            withAnimation(DesignTokens.Animations.stateChange) {
                currentAngle = minAngle + (maxAngle - minAngle) * newValue
            }
        }
    }
}

// MARK: - Button Component
/// Hardware-style button with press animations and LED indicator
struct HardwareButton: View {
    let title: String
    let isPressed: Bool
    let isActive: Bool
    let hasLED: Bool
    let onTap: () -> Void
    
    @State private var isAnimatingPress = false
    
    init(
        title: String,
        isPressed: Bool = false,
        isActive: Bool = false,
        hasLED: Bool = false,
        onTap: @escaping () -> Void
    ) {
        self.title = title
        self.isPressed = isPressed
        self.isActive = isActive
        self.hasLED = hasLED
        self.onTap = onTap
    }
    
    var body: some View {
        VStack(spacing: DesignTokens.Spacing.extraSmall) {
            // LED indicator
            if hasLED {
                LEDIndicator(isActive: isActive, size: 12)
            }
            
            // Button body
            Button(action: {
                isAnimatingPress = true
                onTap()
                
                // Reset animation state
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                    isAnimatingPress = false
                }
            }) {
                Text(title)
                    .font(DesignTokens.Fonts.statusText)
                    .foregroundColor(DesignTokens.Colors.textPrimary)
                    .padding(.horizontal, DesignTokens.Spacing.small)
                    .padding(.vertical, DesignTokens.Spacing.extraSmall)
                    .background(
                        ButtonShape(isPressed: isPressed || isAnimatingPress)
                            .buttonStyle(isPressed: isPressed || isAnimatingPress)
                    )
            }
            .buttonStyle(PlainButtonStyle())
        }
    }
}

// MARK: - Display Bezel Component
/// LCD-style display bezel with inner content area
struct DisplayBezel<Content: View>: View {
    let content: Content
    let borderWidth: CGFloat
    let cornerRadius: CGFloat
    
    init(
        borderWidth: CGFloat = DesignTokens.Dimensions.displayBorderWidth,
        cornerRadius: CGFloat = DesignTokens.Radii.medium,
        @ViewBuilder content: () -> Content
    ) {
        self.borderWidth = borderWidth
        self.cornerRadius = cornerRadius
        self.content = content()
    }
    
    var body: some View {
        ZStack {
            // Outer bezel
            RoundedRectangle(cornerRadius: cornerRadius)
                .fill(DesignTokens.Colors.lcdBorder)
                .shadow(
                    color: DesignTokens.Shadows.component.color,
                    radius: DesignTokens.Shadows.component.radius,
                    x: DesignTokens.Shadows.component.x,
                    y: DesignTokens.Shadows.component.y
                )
            
            // Inner display area
            RoundedRectangle(cornerRadius: cornerRadius / 2)
                .fill(DesignTokens.Colors.lcdBackground)
                .padding(borderWidth)
                .overlay(
                    content
                        .padding(DesignTokens.Spacing.medium)
                )
        }
    }
}

// MARK: - Expression Pedal Surface Component
/// Large expression pedal with texture and level control
struct ExpressionPedalSurface: View {
    let level: Int
    let onLevelChanged: (Int) -> Void
    
    @State private var dragOffset: CGFloat = 0
    
    init(level: Int, onLevelChanged: @escaping (Int) -> Void) {
        self.level = max(0, min(100, level))
        self.onLevelChanged = onLevelChanged
    }
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Pedal surface
                ExpressionPedalShape()
                    .fill(DesignTokens.Colors.expressionPedalBody)
                    .overlay(
                        ExpressionPedalShape(hasTexture: false)
                            .stroke(DesignTokens.Colors.expressionPedalBorder, lineWidth: 2)
                    )
                    .shadow(
                        color: DesignTokens.Shadows.component.color,
                        radius: DesignTokens.Shadows.component.radius,
                        x: DesignTokens.Shadows.component.x,
                        y: DesignTokens.Shadows.component.y
                    )
                
                // Level display overlay
                VStack {
                    Text("PATCH LEVEL")
                        .font(DesignTokens.Fonts.expressionLabel)
                        .foregroundColor(DesignTokens.Colors.accent)
                    
                    Text("\(level)")
                        .font(DesignTokens.Fonts.expressionValue)
                        .foregroundColor(DesignTokens.Colors.textPrimary)
                    
                    Spacer()
                    
                    // Level bar
                    LevelBar(level: level, height: geometry.size.height * 0.6, width: 24)
                }
                .padding(DesignTokens.Spacing.large)
            }
            .gesture(
                DragGesture()
                    .onChanged { value in
                        let newLevel = Int((1.0 - value.location.y / geometry.size.height) * 100)
                        let clampedLevel = max(0, min(100, newLevel))
                        onLevelChanged(clampedLevel)
                    }
            )
        }
    }
}

// MARK: - Preview Helpers
#if DEBUG
struct VisualComponentsPreview: View {
    @State private var level = 75
    @State private var knobValue = 0.5
    @State private var isLEDActive = true
    @State private var isButtonPressed = false
    
    var body: some View {
        VStack(spacing: 30) {
            HStack(spacing: 30) {
                // Level bar
                LevelBar(level: level)
                
                // LED indicators
                VStack(spacing: 10) {
                    LEDIndicator(isActive: isLEDActive)
                    LEDIndicator(isActive: false)
                    LEDIndicator(isActive: true, activeColor: .green)
                }
                
                // Knob
                KnobComponent(
                    value: knobValue,
                    label: "OUTPUT",
                    onValueChanged: { knobValue = $0 }
                )
            }
            
            HStack(spacing: 20) {
                // Hardware buttons
                HardwareButton(
                    title: "LEAD",
                    isPressed: isButtonPressed,
                    isActive: true,
                    hasLED: true,
                    onTap: { isButtonPressed.toggle() }
                )
                
                HardwareButton(
                    title: "RHYTHM",
                    isActive: false,
                    hasLED: true,
                    onTap: { isLEDActive.toggle() }
                )
            }
            
            // Display bezel
            DisplayBezel {
                VStack {
                    Text("01-1")
                        .font(DesignTokens.Fonts.bankDisplay)
                        .foregroundColor(DesignTokens.Colors.lcdText)
                    
                    Text("LEAD GUITAR")
                        .font(DesignTokens.Fonts.patchName)
                        .foregroundColor(DesignTokens.Colors.lcdText)
                }
            }
            .frame(width: 300, height: 150)
            
            // Controls
            HStack {
                Button("Toggle LED") { isLEDActive.toggle() }
                Button("Change Level") { level = Int.random(in: 0...100) }
            }
        }
        .padding()
        .background(DesignTokens.Colors.chassis)
    }
}

#Preview {
    VisualComponentsPreview()
}
#endif
</content>
</invoke>