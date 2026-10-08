import SwiftUI
import UIKit

// MARK: - ExpressionPedal Component
/// Large expression pedal with level control and EXP SW button
/// Provides vertical drag gesture for patch level adjustment (0-100)
/// Includes realistic 3D appearance with comprehensive accessibility support
struct ExpressionPedal: View {
    @ObservedObject var stateManager: GR55StateManager
    @State private var isDragging = false
    @State private var dragOffset: CGFloat = 0
    @State private var isFocused = false
    @Environment(\.accessibilityDifferentiateWithoutColor) private var differentiateWithoutColor
    
    var body: some View {
        VStack(spacing: DesignTokens.Spacing.medium) {
            // EXP SW Button at top
            ExpSwButton(stateManager: stateManager)
            
            // Main expression pedal surface
            GeometryReader { geometry in
                ZStack {
                    // Pedal background with realistic appearance
                    ExpressionPedalShape(hasTexture: !UIAccessibility.isReduceTransparencyEnabled)
                        .expressionPedalStyle(isFocused: isFocused)
                    
                    // Level control overlay
                    LevelControlOverlay(
                        stateManager: stateManager,
                        geometry: geometry,
                        isDragging: $isDragging,
                        dragOffset: $dragOffset,
                        isFocused: $isFocused
                    )
                }
            }
            .frame(
                width: DesignTokens.Dimensions.expressionPedalWidth,
                height: DesignTokens.Dimensions.expressionPedalHeight
            )
            .minimumTouchTarget()
            .focusRing(isVisible: isFocused)
            .accessibilitySupport(
                order: .expressionPedal,
                label: AccessibilityLabels.expressionPedalSurface,
                hint: AccessibilityHints.expressionPedalHint,
                value: AccessibilityValues.levelValue(stateManager.currentState.patchLevel),
                traits: AccessibilityTraitsHelper.sliderTraits()
            )
            .accessibilityActions(
                adjustable: { direction in
                    handleAccessibilityAdjustment(direction)
                }
            )
        }
        .padding(DesignTokens.Spacing.small)
        .background(DesignTokens.Colors.expressionPedalSurface)
        .clipShape(RoundedRectangle(cornerRadius: DesignTokens.Radii.medium))
        .accessibilityElement(children: .contain)
        .accessibilityLabel(AccessibilityLabels.expressionPedal)
    }
    
    // MARK: - Accessibility Support
    private func handleAccessibilityAdjustment(_ direction: AccessibilityAdjustmentDirection) {
        let currentLevel = stateManager.currentState.patchLevel
        let increment = 5 // 5% increments for accessibility
        
        let newLevel: Int
        switch direction {
        case .increment:
            newLevel = min(currentLevel + increment, 100)
        case .decrement:
            newLevel = max(currentLevel - increment, 0)
        @unknown default:
            return
        }
        
        stateManager.setPatchLevel(newLevel)
        
        // Provide haptic feedback
        let impactFeedback = UIImpactFeedbackGenerator(style: .light)
        impactFeedback.impactOccurred()
        
        // Announce the change for VoiceOver users
        if UIAccessibility.isVoiceOverRunning {
            let announcement = AccessibilityValues.levelValue(newLevel)
            UIAccessibility.post(notification: .announcement, argument: announcement)
        }
    }
}

// MARK: - ExpSwButton Component
/// Expression switch button with LED indicator and function display
/// Enhanced with accessibility support
struct ExpSwButton: View {
    @ObservedObject var stateManager: GR55StateManager
    @State private var isPressed = false
    @State private var isFocused = false
    
    var body: some View {
        VStack(spacing: DesignTokens.Spacing.small) {
            // Function label above button
            if !stateManager.currentState.expSwFunction.isEmpty {
                Text(stateManager.currentState.expSwFunction)
                    .font(DesignTokens.Fonts.expressionFunction)
                    .foregroundColor(DesignTokens.Colors.accent)
                    .highContrastColor(
                        normal: DesignTokens.Colors.accent,
                        highContrast: DesignTokens.Colors.accent.opacity(0.9)
                    )
                    .lineLimit(1)
                    .frame(maxWidth: 100)
                    .accessibilityLabel("Expression switch function: \(stateManager.currentState.expSwFunction)")
            }
            
            // EXP SW Button
            Button(action: {
                stateManager.toggleExpSw()
            }) {
                ZStack {
                    // Button background with accessibility enhancements
                    RoundedRectangle(cornerRadius: DesignTokens.Radii.small)
                        .fill(isPressed ? DesignTokens.Colors.buttonPressed : DesignTokens.Colors.buttonDefault)
                        .overlay(
                            RoundedRectangle(cornerRadius: DesignTokens.Radii.small)
                                .stroke(
                                    isFocused ? DesignTokens.Colors.focusRing : DesignTokens.Colors.border,
                                    lineWidth: isFocused ? DesignTokens.Accessibility.focusRingWidth : 
                                        (UIAccessibility.isDarkerSystemColorsEnabled ? 2 : 1)
                                )
                        )
                        .frame(width: 64, height: DesignTokens.Dimensions.expressionButtonHeight)
                    
                    // LED indicator with accessibility support
                    VStack {
                        Spacer()
                        
                        Rectangle()
                            .fill(stateManager.currentState.expSwStatus ? DesignTokens.Colors.ledActive : DesignTokens.Colors.ledInactive)
                            .frame(width: 16, height: 8)
                            .cornerRadius(2)
                            .overlay(
                                Rectangle()
                                    .stroke(
                                        DesignTokens.Colors.border,
                                        lineWidth: UIAccessibility.isDarkerSystemColorsEnabled ? 1 : 0.5
                                    )
                                    .cornerRadius(2)
                            )
                            .shadow(
                                color: stateManager.currentState.expSwStatus && !UIAccessibility.isReduceTransparencyEnabled ? 
                                    DesignTokens.Colors.ledGlow : .clear,
                                radius: stateManager.currentState.expSwStatus && !UIAccessibility.isReduceTransparencyEnabled ? 8 : 0
                            )
                        
                        Spacer().frame(height: 6)
                    }
                }
            }
            .minimumTouchTarget()
            .scaleEffect(isPressed ? 0.98 : 1.0)
            .reducedMotionAnimation(
                normal: DesignTokens.Animations.buttonPress,
                reduced: .easeInOut(duration: 0.05)
            )
            .onLongPressGesture(minimumDuration: 0, maximumDistance: .infinity, pressing: { pressing in
                isPressed = pressing
                
                if pressing {
                    let impactFeedback = UIImpactFeedbackGenerator(style: .light)
                    impactFeedback.impactOccurred()
                }
            }, perform: {})
            .onHover { hovering in
                isFocused = hovering
            }
            .focusable(true) { focused in
                isFocused = focused
            }
            .accessibilitySupport(
                order: .expressionPedal,
                label: AccessibilityLabels.expSwButton,
                hint: AccessibilityHints.expSwHint,
                value: AccessibilityValues.effectState(stateManager.currentState.expSwStatus),
                traits: AccessibilityTraitsHelper.buttonTraits(
                    isSelected: stateManager.currentState.expSwStatus,
                    isToggle: true
                )
            )
            
            // EXP SW label below button
            Text("EXP SW")
                .font(DesignTokens.Fonts.expressionFunction)
                .foregroundColor(DesignTokens.Colors.textSecondary)
                .highContrastColor(
                    normal: DesignTokens.Colors.textSecondary,
                    highContrast: DesignTokens.Colors.textPrimary
                )
                .padding(.horizontal, DesignTokens.Spacing.small)
                .padding(.vertical, 2)
                .background(
                    RoundedRectangle(cornerRadius: DesignTokens.Radii.small)
                        .fill(Color.black.opacity(UIAccessibility.isReduceTransparencyEnabled ? 0.8 : 0.5))
                        .overlay(
                            RoundedRectangle(cornerRadius: DesignTokens.Radii.small)
                                .stroke(
                                    DesignTokens.Colors.border, 
                                    lineWidth: UIAccessibility.isDarkerSystemColorsEnabled ? 2 : 1
                                )
                        )
                )
                .accessibilityHidden(true) // Included in button accessibility
        }
        .accessibilityElement(children: .combine)
    }
}

// MARK: - LevelControlOverlay Component
/// Overlay component for patch level control with drag gesture and accessibility support
struct LevelControlOverlay: View {
    @ObservedObject var stateManager: GR55StateManager
    let geometry: GeometryProxy
    @Binding var isDragging: Bool
    @Binding var dragOffset: CGFloat
    @Binding var isFocused: Bool
    @Environment(\.accessibilityDifferentiateWithoutColor) private var differentiateWithoutColor
    
    var body: some View {
        VStack(spacing: DesignTokens.Spacing.medium) {
            // PATCH LEVEL label
            Text("PATCH LEVEL")
                .font(DesignTokens.Fonts.expressionLabel)
                .foregroundColor(DesignTokens.Colors.accent)
                .highContrastColor(
                    normal: DesignTokens.Colors.accent,
                    highContrast: DesignTokens.Colors.accent.opacity(0.9)
                )
                .fontWeight(.heavy)
                .accessibilityHidden(true) // Included in main accessibility
            
            // Current level value with enhanced visibility
            Text("\(stateManager.currentState.patchLevel)")
                .font(DesignTokens.Fonts.expressionValue)
                .foregroundColor(DesignTokens.Colors.textPrimary)
                .highContrastColor(
                    normal: DesignTokens.Colors.textPrimary,
                    highContrast: .primary
                )
                .fontWeight(.black)
                .shadow(
                    color: UIAccessibility.isReduceTransparencyEnabled ? .clear : .black.opacity(0.8), 
                    radius: UIAccessibility.isReduceTransparencyEnabled ? 0 : 2, 
                    x: 0, 
                    y: 1
                )
                .accessibilityHidden(true) // Included in main accessibility
            
            Spacer()
            
            // Level bar visualization with accessibility enhancements
            LevelBar(
                level: stateManager.currentState.patchLevel,
                differentiateWithoutColor: differentiateWithoutColor
            )
            .frame(
                width: DesignTokens.Dimensions.levelBarWidth,
                height: DesignTokens.Dimensions.levelBarHeight
            )
            .accessibilityHidden(true) // Visual only, value provided by parent
        }
        .padding(DesignTokens.Spacing.medium)
        .contentShape(Rectangle()) // Make entire area draggable
        .gesture(
            DragGesture(minimumDistance: 0)
                .onChanged { value in
                    isDragging = true
                    
                    // Calculate new level based on drag position
                    // Invert Y coordinate so dragging up increases level
                    let relativeY = 1.0 - (value.location.y / geometry.size.height)
                    let clampedY = max(0.0, min(1.0, relativeY))
                    let newLevel = Int(clampedY * 100)
                    
                    stateManager.setPatchLevel(newLevel)
                    
                    // Provide haptic feedback for significant changes
                    #if os(iOS)
                    if abs(newLevel - stateManager.currentState.patchLevel) >= 5 {
                        let impactFeedback = UIImpactFeedbackGenerator(style: .light)
                        impactFeedback.impactOccurred()
                    }
                    #endif
                }
                .onEnded { _ in
                    isDragging = false
                    
                    // Provide completion haptic feedback
                    #if os(iOS)
                    let impactFeedback = UIImpactFeedbackGenerator(style: .medium)
                    impactFeedback.impactOccurred()
                    #endif
                    
                    // Announce final value for VoiceOver users
                    if UIAccessibility.isVoiceOverRunning {
                        let announcement = AccessibilityValues.levelValue(stateManager.currentState.patchLevel)
                        UIAccessibility.post(notification: .announcement, argument: announcement)
                    }
                }
        )
        .scaleEffect(isDragging ? 1.02 : 1.0)
        .reducedMotionAnimation(
            normal: DesignTokens.Animations.stateChange,
            reduced: .easeInOut(duration: 0.1)
        )
    }
}

// MARK: - LevelBar Component
/// Visual level indicator with gradient and accessibility enhancements
struct LevelBar: View {
    let level: Int
    let differentiateWithoutColor: Bool
    
    private var normalizedLevel: Double {
        Double(level) / 100.0
    }
    
    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .bottom) {
                // Background container with accessibility support
                RoundedRectangle(cornerRadius: DesignTokens.Radii.small)
                    .fill(Color.black)
                    .overlay(
                        RoundedRectangle(cornerRadius: DesignTokens.Radii.small)
                            .stroke(
                                DesignTokens.Colors.border, 
                                lineWidth: UIAccessibility.isDarkerSystemColorsEnabled ? 2 : 1
                            )
                    )
                
                // Level fill with accessibility-aware colors
                RoundedRectangle(cornerRadius: DesignTokens.Radii.small)
                    .fill(levelGradient)
                    .frame(height: geometry.size.height * normalizedLevel)
                    .reducedMotionAnimation(
                        normal: DesignTokens.Animations.stateChange,
                        reduced: .easeInOut(duration: 0.1)
                    )
                
                // Level indicator marks for better visual reference
                if !UIAccessibility.isReduceTransparencyEnabled {
                    VStack(spacing: 0) {
                        ForEach(0..<10, id: \.self) { index in
                            Rectangle()
                                .fill(Color.white.opacity(0.3))
                                .frame(height: 1)
                            
                            if index < 9 {
                                Spacer()
                            }
                        }
                    }
                    .padding(.horizontal, 2)
                }
            }
        }
    }
    
    private var levelGradient: LinearGradient {
        if differentiateWithoutColor || UIAccessibility.isDarkerSystemColorsEnabled {
            // Use monochrome gradient for accessibility
            return LinearGradient(
                gradient: Gradient(colors: [
                    Color.white.opacity(0.3),
                    Color.white.opacity(0.9)
                ]),
                startPoint: .bottom,
                endPoint: .top
            )
        } else {
            // Use color gradient for normal viewing
            return LinearGradient(
                gradient: Gradient(stops: [
                    .init(color: .green, location: 0.0),
                    .init(color: .yellow, location: 0.4),
                    .init(color: .orange, location: 0.7),
                    .init(color: .red, location: 1.0)
                ]),
                startPoint: .bottom,
                endPoint: .top
            )
        }
    }
}

// MARK: - ExpressionPedalShape Extension
extension ExpressionPedalShape {
    /// Applies expression pedal styling with accessibility enhancements
    func expressionPedalStyle(isFocused: Bool = false) -> some View {
        self
            .fill(DesignTokens.Colors.expressionPedalBody)
            .overlay(
                self
                    .stroke(
                        isFocused ? DesignTokens.Colors.focusRing : DesignTokens.Colors.expressionPedalBorder,
                        lineWidth: isFocused ? DesignTokens.Accessibility.focusRingWidth : 
                            (UIAccessibility.isDarkerSystemColorsEnabled ? 2 : 1)
                    )
            )
            .shadow(
                color: UIAccessibility.isReduceTransparencyEnabled ? .clear : .black.opacity(0.3),
                radius: UIAccessibility.isReduceTransparencyEnabled ? 0 : 8,
                x: 0,
                y: 4
            )
    }
}

// MARK: - Preview
#if DEBUG
struct ExpressionPedalPreview: View {
    @StateObject private var stateManager = GR55StateManager()
    
    var body: some View {
        VStack {
            ExpressionPedal(stateManager: stateManager)
                .frame(width: 160, height: 400)
            
            // Test controls
            HStack {
                Button("Toggle EXP SW") {
                    stateManager.toggleExpSw()
                }
                
                Button("Set Level 50") {
                    stateManager.setPatchLevel(50)
                }
                
                Button("Set Level 100") {
                    stateManager.setPatchLevel(100)
                }
            }
            .padding()
        }
        .padding()
        .background(DesignTokens.Colors.chassis)
    }
}

#Preview {
    ExpressionPedalPreview()
}
#endif