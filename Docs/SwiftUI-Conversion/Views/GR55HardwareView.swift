import SwiftUI
import UIKit

// MARK: - GR55HardwareView
/// Main container view for the GR55 hardware interface
/// Integrates all component views with state manager and provides responsive scaling
/// Follows Swift 6.2 concurrency patterns with comprehensive accessibility support
@MainActor
struct GR55HardwareView: View {
    @StateObject private var stateManager = GR55StateManager()
    @StateObject private var focusManager = AccessibilityFocusManager()
    @State private var hoveredItem: HoveredItem = .none
    @State private var isEditMode = false
    @Environment(\.colorScheme) private var colorScheme
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @Environment(\.accessibilityDifferentiateWithoutColor) private var differentiateWithoutColor
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Main chassis background with proper styling and shadows
                chassisBackground
                
                // Hardware layout with responsive scaling
                hardwareLayout(geometry: geometry)
                    .padding(DesignTokens.Spacing.large)
                    .scaleEffect(calculateScaleFactor(for: geometry.size))
                    .reducedMotionAnimation(
                        normal: DesignTokens.Animations.layoutChange,
                        reduced: .easeInOut(duration: 0.1)
                    )
            }
            .overlay(
                // Preview pane overlay system
                PreviewPane(
                    hoveredItem: hoveredItem,
                    isEditMode: isEditMode
                )
                .allowsHitTesting(false)
                .zIndex(DesignTokens.ZIndex.preview)
                .accessibilitySupport(
                    order: .previewPane,
                    label: AccessibilityLabels.previewPane,
                    hint: AccessibilityHints.previewHint,
                    traits: .updatesFrequently
                )
            )
        }
        .background(DesignTokens.Colors.background)
        .preferredColorScheme(colorScheme) // Respect system appearance mode
        .clipped() // Ensure content doesn't overflow on smaller screens
        .accessibilitySupport(
            order: .display,
            label: AccessibilityLabels.hardwareView,
            hint: AccessibilityHints.navigationHint,
            traits: AccessibilityTraitsHelper.headerTraits()
        )
        .environmentObject(focusManager)
        .onAppear {
            setupAccessibilityNotifications()
        }
        .onDisappear {
            removeAccessibilityNotifications()
        }
    }
    
    // MARK: - Chassis Background
    private var chassisBackground: some View {
        RoundedRectangle(cornerRadius: DesignTokens.Radii.large)
            .fill(DesignTokens.Colors.chassis)
            .shadow(
                color: UIAccessibility.isReduceTransparencyEnabled ? .clear : DesignTokens.Shadows.chassis.color,
                radius: UIAccessibility.isReduceTransparencyEnabled ? 0 : DesignTokens.Shadows.chassis.radius,
                x: DesignTokens.Shadows.chassis.x,
                y: DesignTokens.Shadows.chassis.y
            )
            .overlay(
                // Subtle inner shadow for depth (disabled in high contrast)
                RoundedRectangle(cornerRadius: DesignTokens.Radii.large)
                    .stroke(
                        LinearGradient(
                            gradient: Gradient(colors: [
                                DesignTokens.Colors.border.opacity(UIAccessibility.isDarkerSystemColorsEnabled ? 0.8 : 0.5),
                                DesignTokens.Colors.border.opacity(UIAccessibility.isDarkerSystemColorsEnabled ? 0.4 : 0.1)
                            ]),
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: UIAccessibility.isDarkerSystemColorsEnabled ? 2 : 1
                    )
                    .opacity(UIAccessibility.isReduceTransparencyEnabled ? 0 : 1)
            )
    }
    
    // MARK: - Hardware Layout
    private func hardwareLayout(geometry: GeometryProxy) -> some View {
        VStack(spacing: DesignTokens.Spacing.large) {
            // Top ports bar
            PortsBar(guitarOutSource: stateManager.currentState.guitarOutSource)
                .accessibilitySupport(
                    order: .display,
                    label: "Connection ports and guitar output source",
                    traits: .isStaticText
                )
            
            // Main hardware sections with proper hierarchy
            HStack(spacing: DesignTokens.Spacing.extraLarge) {
                // Left section - Main controls
                leftSection
                    .frame(maxWidth: .infinity, alignment: .leading)
                
                // Right section - Expression pedal
                rightSection
                    .frame(maxWidth: 200, alignment: .trailing)
            }
        }
    }
    
    // MARK: - Left Section
    private var leftSection: some View {
        VStack(spacing: DesignTokens.Spacing.large) {
            // Header with branding
            HeaderView()
                .accessibilitySupport(
                    order: .display,
                    label: "Roland GR-55 Guitar Synthesizer branding",
                    traits: AccessibilityTraitsHelper.headerTraits()
                )
            
            // Main control layout
            HStack(spacing: DesignTokens.Spacing.extraLarge) {
                // Left column - Display and pedals
                leftColumn
                
                // Right column - Navigation
                rightColumn
            }
        }
    }
    
    // MARK: - Left Column
    private var leftColumn: some View {
        VStack(spacing: DesignTokens.Spacing.medium) {
            // LCD Display with hover and edit mode callbacks
            DisplayComponent(stateManager: stateManager)
                .onHover { item in
                    hoveredItem = item
                }
                .onEditModeChange { isEdit in
                    isEditMode = isEdit
                    
                    // Announce edit mode changes for VoiceOver users
                    if UIAccessibility.isVoiceOverRunning {
                        let announcement = isEdit ? 
                            AccessibilityHints.editModeHint : 
                            "Edit mode closed"
                        focusManager.announceLayoutChange(announcement)
                    }
                }
                .accessibilitySupport(
                    order: .display,
                    label: AccessibilityLabels.displayComponent,
                    hint: AccessibilityHints.doubleTapToEdit
                )
            
            // Sound style panel
            SoundStylePanel(stateManager: stateManager)
                .accessibilitySupport(
                    order: .soundStylePanel,
                    label: AccessibilityLabels.soundStylePanel,
                    hint: AccessibilityHints.styleHint
                )
            
            // Foot pedals cluster
            PedalCluster(stateManager: stateManager)
                .withAccessibilityFocus(focusManager)
                .accessibilitySupport(
                    order: .pedalCluster,
                    label: AccessibilityLabels.pedalCluster,
                    hint: AccessibilityHints.pedalSingleTap
                )
        }
    }
    
    // MARK: - Right Column
    private var rightColumn: some View {
        NavigationCluster(stateManager: stateManager)
            .accessibilitySupport(
                order: .navigationCluster,
                label: AccessibilityLabels.navigationCluster,
                hint: AccessibilityHints.dataWheelHint
            )
    }
    
    // MARK: - Right Section
    private var rightSection: some View {
        ExpressionPedal(stateManager: stateManager)
            .accessibilitySupport(
                order: .expressionPedal,
                label: AccessibilityLabels.expressionPedal,
                hint: AccessibilityHints.expressionPedalHint,
                traits: AccessibilityTraitsHelper.sliderTraits()
            )
    }
    
    // MARK: - Responsive Scaling
    /// Calculates appropriate scale factor based on available screen size
    private func calculateScaleFactor(for size: CGSize) -> CGFloat {
        // Base dimensions for the hardware interface
        let baseWidth: CGFloat = 1200
        let baseHeight: CGFloat = 800
        
        // Calculate scale factors for width and height
        let widthScale = size.width / baseWidth
        let heightScale = size.height / baseHeight
        
        // Use the smaller scale factor to ensure everything fits
        let scale = min(widthScale, heightScale)
        
        // Clamp scale between reasonable bounds
        return max(0.5, min(1.2, scale))
    }
    
    // MARK: - Accessibility Notifications
    private func setupAccessibilityNotifications() {
        NotificationCenter.default.addObserver(
            forName: UIAccessibility.voiceOverStatusDidChangeNotification,
            object: nil,
            queue: .main
        ) { _ in
            handleVoiceOverStatusChange()
        }
        
        NotificationCenter.default.addObserver(
            forName: UIAccessibility.reduceMotionStatusDidChangeNotification,
            object: nil,
            queue: .main
        ) { _ in
            handleReduceMotionChange()
        }
    }
    
    private func removeAccessibilityNotifications() {
        NotificationCenter.default.removeObserver(self)
    }
    
    private func handleVoiceOverStatusChange() {
        if UIAccessibility.isVoiceOverRunning {
            focusManager.announceFocusChange("VoiceOver enabled for GR-55 hardware interface")
        }
    }
    
    private func handleReduceMotionChange() {
        // Animations will automatically adjust based on UIAccessibility.isReduceMotionEnabled
        // This handler can be used for additional motion-related adjustments if needed
    }
}

// MARK: - HeaderView
/// Header section with Roland branding and model designation
/// Enhanced with accessibility support and appearance mode compatibility
struct HeaderView: View {
    @Environment(\.colorScheme) private var colorScheme
    
    var body: some View {
        HStack {
            // Roland branding
            VStack(alignment: .leading, spacing: 2) {
                Text("ROLAND")
                    .font(DesignTokens.Fonts.previewTitle)
                    .fontWeight(.black)
                    .foregroundColor(DesignTokens.Colors.accent)
                    .highContrastColor(
                        normal: DesignTokens.Colors.accent,
                        highContrast: DesignTokens.Colors.accent.opacity(0.9)
                    )
                    .kerning(2)
                    .accessibilityLabel("Roland brand")
                
                Text("GUITAR SYNTHESIZER")
                    .font(DesignTokens.Fonts.statusText)
                    .foregroundColor(DesignTokens.Colors.textMuted)
                    .highContrastColor(
                        normal: DesignTokens.Colors.textMuted,
                        highContrast: DesignTokens.Colors.textSecondary
                    )
                    .kerning(1)
                    .accessibilityLabel("Guitar Synthesizer")
            }
            .accessibilityElement(children: .combine)
            .accessibilityLabel("Roland Guitar Synthesizer")
            
            Spacer()
            
            // Model designation
            VStack(alignment: .trailing, spacing: 2) {
                Text("GR-55")
                    .font(DesignTokens.Fonts.previewTitle)
                    .fontWeight(.black)
                    .foregroundColor(DesignTokens.Colors.textPrimary)
                    .highContrastColor(
                        normal: DesignTokens.Colors.textPrimary,
                        highContrast: colorScheme == .dark ? .white : .black
                    )
                    .kerning(2)
                    .accessibilityLabel("GR-55 model")
                
                Text("GUITAR SYNTHESIZER")
                    .font(DesignTokens.Fonts.statusText)
                    .foregroundColor(DesignTokens.Colors.textMuted)
                    .highContrastColor(
                        normal: DesignTokens.Colors.textMuted,
                        highContrast: DesignTokens.Colors.textSecondary
                    )
                    .kerning(1)
                    .accessibilityHidden(true) // Avoid repetition
            }
            .accessibilityElement(children: .combine)
            .accessibilityLabel("Model GR-55")
        }
        .padding(.horizontal, DesignTokens.Spacing.medium)
        .padding(.vertical, DesignTokens.Spacing.small)
        .background(
            RoundedRectangle(cornerRadius: DesignTokens.Radii.small)
                .fill(DesignTokens.Colors.surface.opacity(UIAccessibility.isReduceTransparencyEnabled ? 0.8 : 0.3))
                .overlay(
                    RoundedRectangle(cornerRadius: DesignTokens.Radii.small)
                        .stroke(
                            DesignTokens.Colors.border.opacity(UIAccessibility.isDarkerSystemColorsEnabled ? 0.8 : 0.5), 
                            lineWidth: UIAccessibility.isDarkerSystemColorsEnabled ? 2 : 1
                        )
                )
        )
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Roland GR-55 Guitar Synthesizer header")
        .accessibilityAddTraits(.isHeader)
    }
}

// MARK: - Preview
#Preview {
    GR55HardwareView()
        .frame(width: 1200, height: 800)
        .background(DesignTokens.Colors.background)
}