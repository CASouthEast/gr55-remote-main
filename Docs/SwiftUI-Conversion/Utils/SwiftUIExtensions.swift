import SwiftUI

// MARK: - SwiftUI Extensions for Hardware Interface
/// Collection of SwiftUI extensions to support hardware interface patterns
/// Follows Swift 6.2 patterns with proper concurrency support

// MARK: - View Extensions
extension View {
    /// Applies conditional modifiers based on a boolean condition
    @ViewBuilder
    func `if`<Content: View>(_ condition: Bool, transform: (Self) -> Content) -> some View {
        if condition {
            transform(self)
        } else {
            self
        }
    }
    
    /// Applies conditional modifiers with else clause
    @ViewBuilder
    func `if`<TrueContent: View, FalseContent: View>(
        _ condition: Bool,
        if trueTransform: (Self) -> TrueContent,
        else falseTransform: (Self) -> FalseContent
    ) -> some View {
        if condition {
            trueTransform(self)
        } else {
            falseTransform(self)
        }
    }
    
    /// Applies hardware-style chassis background
    func chassisBackground() -> some View {
        self
            .background(
                RoundedRectangle(cornerRadius: DesignTokens.Radii.large)
                    .fill(DesignTokens.Colors.chassis)
                    .shadow(
                        color: DesignTokens.Shadows.chassis.color,
                        radius: DesignTokens.Shadows.chassis.radius,
                        x: DesignTokens.Shadows.chassis.x,
                        y: DesignTokens.Shadows.chassis.y
                    )
            )
    }
    
    /// Applies hardware component styling
    func hardwareComponent() -> some View {
        self
            .background(
                RoundedRectangle(cornerRadius: DesignTokens.Radii.medium)
                    .fill(DesignTokens.Colors.surface)
                    .overlay(
                        RoundedRectangle(cornerRadius: DesignTokens.Radii.medium)
                            .stroke(DesignTokens.Colors.border, lineWidth: 1)
                    )
                    .shadow(
                        color: DesignTokens.Shadows.component.color,
                        radius: DesignTokens.Shadows.component.radius,
                        x: DesignTokens.Shadows.component.x,
                        y: DesignTokens.Shadows.component.y
                    )
            )
    }
    
    /// Applies LCD display styling
    func lcdDisplay() -> some View {
        self
            .background(
                RoundedRectangle(cornerRadius: DesignTokens.Radii.medium)
                    .fill(DesignTokens.Colors.lcdBackground)
                    .overlay(
                        RoundedRectangle(cornerRadius: DesignTokens.Radii.medium)
                            .stroke(DesignTokens.Colors.lcdBorder, lineWidth: DesignTokens.Dimensions.displayBorderWidth)
                    )
            )
    }
    
    /// Applies button press animation
    func buttonPressAnimation(isPressed: Bool) -> some View {
        self
            .scaleEffect(isPressed ? 0.98 : 1.0)
            .animation(DesignTokens.Animations.buttonPress, value: isPressed)
    }
    
    /// Applies LED glow effect
    func ledGlow(isActive: Bool, color: Color = DesignTokens.Colors.ledActive) -> some View {
        self
            .shadow(
                color: isActive ? color.opacity(0.8) : .clear,
                radius: isActive ? 8 : 0,
                x: 0,
                y: 0
            )
    }
    
    /// Applies haptic feedback on tap
    func hapticFeedback(_ style: UIImpactFeedbackGenerator.FeedbackStyle = .medium) -> some View {
        self.onTapGesture {
            let impactFeedback = UIImpactFeedbackGenerator(style: style)
            impactFeedback.impactOccurred()
        }
    }
    
    /// Applies accessibility labels for hardware components
    func hardwareAccessibility(
        label: String,
        hint: String? = nil,
        value: String? = nil,
        traits: AccessibilityTraits = []
    ) -> some View {
        self
            .accessibilityLabel(label)
            .if(hint != nil) { view in
                view.accessibilityHint(hint!)
            }
            .if(value != nil) { view in
                view.accessibilityValue(value!)
            }
            .accessibilityAddTraits(traits)
    }
}

// MARK: - Color Extensions
extension Color {
    /// Creates a color from hex string
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }
        
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
    
    /// Returns a lighter version of the color
    func lighter(by percentage: Double = 0.2) -> Color {
        return self.opacity(1.0 - percentage)
    }
    
    /// Returns a darker version of the color
    func darker(by percentage: Double = 0.2) -> Color {
        // This is a simplified implementation
        // In a real app, you'd want proper color space manipulation
        return Color(
            red: max(0, self.components.red * (1.0 - percentage)),
            green: max(0, self.components.green * (1.0 - percentage)),
            blue: max(0, self.components.blue * (1.0 - percentage))
        )
    }
    
    /// Gets RGB components (simplified for this implementation)
    private var components: (red: Double, green: Double, blue: Double, alpha: Double) {
        // This is a simplified implementation
        // In production, you'd use proper color space conversion
        return (0.5, 0.5, 0.5, 1.0)
    }
}

// MARK: - Animation Extensions
extension Animation {
    /// Hardware-style button press animation
    static var hardwareButtonPress: Animation {
        .easeInOut(duration: 0.1)
    }
    
    /// LED pulse animation
    static var ledPulse: Animation {
        .easeInOut(duration: 1.0).repeatForever(autoreverses: true)
    }
    
    /// Smooth state transition
    static var stateTransition: Animation {
        .easeInOut(duration: 0.2)
    }
    
    /// Layout change animation
    static var layoutChange: Animation {
        .easeInOut(duration: 0.3)
    }
}

// MARK: - Gesture Extensions
extension View {
    /// Single and double tap gesture handler
    func onTapGesture(
        singleTap: @escaping () -> Void,
        doubleTap: @escaping () -> Void
    ) -> some View {
        self
            .onTapGesture(count: 2) {
                doubleTap()
            }
            .onTapGesture(count: 1) {
                singleTap()
            }
    }
    
    /// Long press with immediate and completion handlers
    func onLongPressGesture(
        minimumDuration: Double = 0.5,
        onPressingChanged: @escaping (Bool) -> Void = { _ in },
        onLongPress: @escaping () -> Void = {}
    ) -> some View {
        self.onLongPressGesture(
            minimumDuration: minimumDuration,
            maximumDistance: .infinity,
            pressing: onPressingChanged,
            perform: onLongPress
        )
    }
    
    /// Rotation gesture for data wheel
    func onRotationGesture(
        onChanged: @escaping (Angle) -> Void,
        onEnded: @escaping (Angle) -> Void = { _ in }
    ) -> some View {
        self.gesture(
            RotationGesture()
                .onChanged(onChanged)
                .onEnded(onEnded)
        )
    }
    
    /// Drag gesture for level controls
    func onDragGesture(
        onChanged: @escaping (DragGesture.Value) -> Void,
        onEnded: @escaping (DragGesture.Value) -> Void = { _ in }
    ) -> some View {
        self.gesture(
            DragGesture()
                .onChanged(onChanged)
                .onEnded(onEnded)
        )
    }
}

// MARK: - Layout Extensions
extension View {
    /// Applies responsive scaling based on device size
    func responsiveScale(_ geometry: GeometryProxy) -> some View {
        let scale = min(geometry.size.width / 1200, geometry.size.height / 800)
        return self.scaleEffect(max(0.5, min(1.0, scale)))
    }
    
    /// Centers content with maximum width
    func centeredWithMaxWidth(_ maxWidth: CGFloat) -> some View {
        HStack {
            Spacer()
            self
                .frame(maxWidth: maxWidth)
            Spacer()
        }
    }
    
    /// Applies aspect ratio with content mode
    func aspectRatio(_ ratio: CGFloat, contentMode: ContentMode = .fit) -> some View {
        self.aspectRatio(ratio, contentMode: contentMode)
    }
}

// MARK: - Conditional Modifiers
extension View {
    /// Applies modifier only on specific platforms
    @ViewBuilder
    func iOS<Content: View>(_ modifier: (Self) -> Content) -> some View {
        #if os(iOS)
        modifier(self)
        #else
        self
        #endif
    }
    
    /// Applies modifier only in debug builds
    @ViewBuilder
    func debug<Content: View>(_ modifier: (Self) -> Content) -> some View {
        #if DEBUG
        modifier(self)
        #else
        self
        #endif
    }
}

// MARK: - State Management Extensions
extension Binding {
    /// Creates a binding that applies a transform to the value
    func map<T>(
        get: @escaping (Value) -> T,
        set: @escaping (T) -> Value
    ) -> Binding<T> {
        Binding<T>(
            get: { get(self.wrappedValue) },
            set: { self.wrappedValue = set($0) }
        )
    }
    
    /// Creates a binding that clamps numeric values to a range
    func clamped<T: Comparable>(to range: ClosedRange<T>) -> Binding<T> where Value == T {
        Binding<T>(
            get: { self.wrappedValue },
            set: { self.wrappedValue = max(range.lowerBound, min(range.upperBound, $0)) }
        )
    }
}

// MARK: - Performance Extensions
extension View {
    /// Applies view caching for expensive operations
    func cached() -> some View {
        self.drawingGroup()
    }
    
    /// Optimizes for frequent updates
    func optimizedForUpdates() -> some View {
        self.drawingGroup(opaque: false, colorMode: .nonLinear)
    }
}

// MARK: - Debug Extensions
#if DEBUG
extension View {
    /// Adds debug border for layout debugging
    func debugBorder(_ color: Color = .red, width: CGFloat = 1) -> some View {
        self.overlay(
            Rectangle()
                .stroke(color, lineWidth: width)
        )
    }
    
    /// Adds debug background for layout debugging
    func debugBackground(_ color: Color = .red.opacity(0.2)) -> some View {
        self.background(color)
    }
    
    /// Prints view updates for debugging
    func debugPrint(_ message: String) -> some View {
        print("🔍 \(message)")
        return self
    }
}
#endif