import SwiftUI

// MARK: - FootPedal Component
/// Individual foot pedal with trapezoidal shape, LED indicator, and gesture recognition
/// Implements single-tap and double-tap interactions with visual feedback
/// Follows Swift 6.2 patterns with proper gesture handling and animations
struct FootPedal: View {
    // MARK: - Properties
    let number: FootPedalNumber
    let isActive: Bool
    let topLabel: String?
    let subLabel: String?
    let onSingleTap: () -> Void
    let onDoubleTap: (() -> Void)?
    
    // MARK: - State
    @State private var isPressed = false
    @State private var tapCount = 0
    @State private var lastTapTime = Date()
    
    // MARK: - Constants
    private let doubleTapTimeWindow: TimeInterval = 0.5
    
    // MARK: - Body
    var body: some View {
        VStack(spacing: DesignTokens.Spacing.small) {
            // Top label for patch names and functions
            topLabelView
            
            // Main pedal body with LED and interactions
            pedalBodyView
            
            // Sub label for descriptions
            subLabelView
        }
        .frame(width: DesignTokens.Dimensions.pedalWidth)
    }
    
    // MARK: - Top Label View
    @ViewBuilder
    private var topLabelView: some View {
        if let topLabel = topLabel, !topLabel.isEmpty {
            Text(topLabel)
                .font(DesignTokens.Fonts.pedalTopLabel)
                .foregroundColor(DesignTokens.Colors.accent)
                .lineLimit(1)
                .truncationMode(.tail)
                .frame(maxWidth: DesignTokens.Dimensions.pedalWidth + 20)
                .multilineTextAlignment(.center)
        } else {
            // Maintain consistent spacing even without label
            Text(" ")
                .font(DesignTokens.Fonts.pedalTopLabel)
                .opacity(0)
        }
    }
    
    // MARK: - Pedal Body View
    private var pedalBodyView: some View {
        ZStack {
            // Pedal shape with 3D styling
            PedalShape()
                .pedalStyle(isPressed: isPressed)
                .frame(
                    width: DesignTokens.Dimensions.pedalWidth,
                    height: DesignTokens.Dimensions.pedalHeight
                )
            
            // LED indicator positioned at top
            ledIndicatorView
                .offset(y: -50) // Position near top of pedal
            
            // Pedal number/label in center
            pedalNumberView
        }
        .contentShape(Rectangle()) // Ensure entire area is tappable
        .onTapGesture {
            handleTap()
        }
        .onLongPressGesture(
            minimumDuration: 0,
            maximumDistance: .infinity,
            pressing: { pressing in
                withAnimation(DesignTokens.Animations.buttonPress) {
                    isPressed = pressing
                }
            },
            perform: {}
        )
    }
    
    // MARK: - LED Indicator View
    private var ledIndicatorView: some View {
        Circle()
            .fill(isActive ? DesignTokens.Colors.ledActive : DesignTokens.Colors.ledInactive)
            .frame(width: DesignTokens.Dimensions.pedalLEDSize, height: DesignTokens.Dimensions.pedalLEDSize)
            .overlay(
                Circle()
                    .stroke(Color.black, lineWidth: 1)
            )
            .shadow(
                color: isActive ? DesignTokens.Colors.ledGlow : .clear,
                radius: isActive ? 8 : 0,
                x: 0,
                y: 0
            )
            .scaleEffect(isActive ? 1.1 : 1.0)
            .animation(
                isActive ? DesignTokens.Animations.ledGlow : .easeInOut(duration: 0.2),
                value: isActive
            )
    }
    
    // MARK: - Pedal Number View
    private var pedalNumberView: some View {
        Text(number.displayText)
            .font(DesignTokens.Fonts.pedalNumber)
            .foregroundColor(.white)
            .shadow(color: .black.opacity(0.5), radius: 2, x: 0, y: 1)
            .scaleEffect(isPressed ? 0.95 : 1.0)
            .animation(DesignTokens.Animations.buttonPress, value: isPressed)
    }
    
    // MARK: - Sub Label View
    @ViewBuilder
    private var subLabelView: some View {
        if let subLabel = subLabel, !subLabel.isEmpty {
            VStack(spacing: 2) {
                Text(subLabel)
                    .font(DesignTokens.Fonts.pedalSubLabel)
                    .foregroundColor(DesignTokens.Colors.textMuted)
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
                    .padding(.horizontal, DesignTokens.Spacing.small)
                    .padding(.vertical, DesignTokens.Spacing.extraSmall)
                    .background(
                        RoundedRectangle(cornerRadius: DesignTokens.Radii.small)
                            .fill(Color.black.opacity(0.5))
                            .overlay(
                                RoundedRectangle(cornerRadius: DesignTokens.Radii.small)
                                    .stroke(DesignTokens.Colors.border, lineWidth: 1)
                            )
                    )
            }
        }
    }
    
    // MARK: - Gesture Handling
    private func handleTap() {
        let now = Date()
        let timeSinceLastTap = now.timeIntervalSince(lastTapTime)
        
        if timeSinceLastTap < doubleTapTimeWindow && tapCount == 1 {
            // Double tap detected
            tapCount = 0
            handleDoubleTap()
        } else {
            // First tap or single tap after timeout
            tapCount = 1
            lastTapTime = now
            
            // Delay to check for potential double tap
            DispatchQueue.main.asyncAfter(deadline: .now() + doubleTapTimeWindow) {
                if tapCount == 1 && now.timeIntervalSince(lastTapTime) >= doubleTapTimeWindow {
                    tapCount = 0
                    handleSingleTap()
                }
            }
        }
        
        // Provide haptic feedback
        let impactFeedback = UIImpactFeedbackGenerator(style: .medium)
        impactFeedback.impactOccurred()
    }
    
    private func handleSingleTap() {
        withAnimation(DesignTokens.Animations.stateChange) {
            onSingleTap()
        }
    }
    
    private func handleDoubleTap() {
        if let onDoubleTap = onDoubleTap {
            withAnimation(DesignTokens.Animations.stateChange) {
                onDoubleTap()
            }
            
            // Stronger haptic feedback for double tap
            let impactFeedback = UIImpactFeedbackGenerator(style: .heavy)
            impactFeedback.impactOccurred()
        }
    }
}

// MARK: - FootPedalNumber Enum
/// Represents the different types of foot pedals
enum FootPedalNumber: Sendable, Hashable {
    case numbered(Int)
    case ctl
    
    var displayText: String {
        switch self {
        case .numbered(let number):
            return "\(number)"
        case .ctl:
            return "CTL"
        }
    }
    
    var accessibilityLabel: String {
        switch self {
        case .numbered(let number):
            return "Pedal \(number)"
        case .ctl:
            return "Control Pedal"
        }
    }
}

// MARK: - FootPedal Convenience Initializers
extension FootPedal {
    /// Convenience initializer for numbered pedals (1-3)
    init(
        number: Int,
        isActive: Bool,
        topLabel: String? = nil,
        subLabel: String? = nil,
        onSingleTap: @escaping () -> Void,
        onDoubleTap: (() -> Void)? = nil
    ) {
        self.init(
            number: .numbered(number),
            isActive: isActive,
            topLabel: topLabel,
            subLabel: subLabel,
            onSingleTap: onSingleTap,
            onDoubleTap: onDoubleTap
        )
    }
    
    /// Convenience initializer for CTL pedal
    init(
        isCtlActive: Bool,
        ctlFunction: String? = nil,
        subLabel: String? = "REC/PLAY/DUB",
        onCtlToggle: @escaping () -> Void
    ) {
        self.init(
            number: .ctl,
            isActive: isCtlActive,
            topLabel: ctlFunction,
            subLabel: subLabel,
            onSingleTap: onCtlToggle,
            onDoubleTap: nil
        )
    }
}

// MARK: - Accessibility Support
extension FootPedal {
    /// Adds accessibility support for VoiceOver users
    private func accessibilityModifiers() -> some ViewModifier {
        return AccessibilityModifier(
            label: number.accessibilityLabel,
            hint: "Tap to select, double tap for navigation",
            isActive: isActive,
            topLabel: topLabel
        )
    }
}

// MARK: - Accessibility Modifier
private struct AccessibilityModifier: ViewModifier {
    let label: String
    let hint: String
    let isActive: Bool
    let topLabel: String?
    
    func body(content: Content) -> some View {
        content
            .accessibilityElement(children: .ignore)
            .accessibilityLabel(buildAccessibilityLabel())
            .accessibilityHint(hint)
            .accessibilityAddTraits(isActive ? .isSelected : [])
            .accessibilityAddTraits(.isButton)
    }
    
    private func buildAccessibilityLabel() -> String {
        var components = [label]
        
        if let topLabel = topLabel, !topLabel.isEmpty {
            components.append(topLabel)
        }
        
        if isActive {
            components.append("active")
        }
        
        return components.joined(separator: ", ")
    }
}

// MARK: - Preview Support
#if DEBUG
struct FootPedalPreview: View {
    @State private var activePedal = 1
    @State private var ctlActive = false
    @State private var ctlFunction = "REC/PLAY/DUB"
    
    var body: some View {
        VStack(spacing: DesignTokens.Spacing.large) {
            Text("FootPedal Component Preview")
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(DesignTokens.Colors.textPrimary)
            
            HStack(spacing: DesignTokens.Spacing.large) {
                // Numbered pedals 1-3
                ForEach(1...3, id: \.self) { pedalNumber in
                    FootPedal(
                        number: pedalNumber,
                        isActive: activePedal == pedalNumber,
                        topLabel: "PATCH \(pedalNumber)",
                        subLabel: pedalNumber == 3 ? "BASS GUITAR" : nil,
                        onSingleTap: {
                            withAnimation {
                                activePedal = pedalNumber
                            }
                        },
                        onDoubleTap: pedalNumber <= 2 ? {
                            print("Double tap on pedal \(pedalNumber) - Bank navigation")
                        } : nil
                    )
                }
                
                // CTL pedal
                FootPedal(
                    isCtlActive: ctlActive,
                    ctlFunction: ctlActive ? "ACTIVE" : ctlFunction,
                    onCtlToggle: {
                        withAnimation {
                            ctlActive.toggle()
                        }
                    }
                )
            }
            
            // Control buttons for testing
            VStack(spacing: DesignTokens.Spacing.medium) {
                Text("Test Controls")
                    .font(.headline)
                    .foregroundColor(DesignTokens.Colors.textSecondary)
                
                HStack(spacing: DesignTokens.Spacing.medium) {
                    ForEach(1...3, id: \.self) { number in
                        Button("Pedal \(number)") {
                            withAnimation {
                                activePedal = number
                            }
                        }
                        .buttonStyle(.bordered)
                        .tint(activePedal == number ? DesignTokens.Colors.accent : DesignTokens.Colors.buttonDefault)
                    }
                    
                    Button("Toggle CTL") {
                        withAnimation {
                            ctlActive.toggle()
                        }
                    }
                    .buttonStyle(.bordered)
                    .tint(ctlActive ? DesignTokens.Colors.accent : DesignTokens.Colors.buttonDefault)
                }
            }
        }
        .padding(DesignTokens.Spacing.large)
        .background(DesignTokens.Colors.chassis)
        .preferredColorScheme(.dark)
    }
}

#Preview {
    FootPedalPreview()
}
#endif