import SwiftUI
import UIKit

// MARK: - Accessibility Support
/// Comprehensive accessibility support for the GR55 hardware interface
/// Provides VoiceOver labels, hints, and navigation support
/// Follows Swift 6.2 accessibility best practices and WCAG guidelines

// MARK: - Accessibility Labels
enum AccessibilityLabels {
    // Hardware sections
    static let hardwareView = "GR-55 Guitar Synthesizer Hardware Interface"
    static let displayComponent = "LCD Display showing patch information and parameters"
    static let pedalCluster = "Foot pedal controls for patch selection and navigation"
    static let navigationCluster = "Navigation controls with data wheel and page buttons"
    static let soundStylePanel = "Sound style selection panel"
    static let expressionPedal = "Expression pedal for level control"
    static let previewPane = "Parameter preview and edit panel"
    
    // Display elements
    static let bankDisplay = "Current bank number"
    static let patchName = "Current patch name"
    static let styleSelector = "Sound style selector"
    static let bpmControl = "Tempo control in beats per minute"
    static let statusBar = "Tone source status indicators"
    
    // Pedal elements
    static func pedalLabel(_ number: Int) -> String {
        "Foot pedal \(number)"
    }
    static let ctlPedal = "Control pedal for recording and playback functions"
    static let expressionPedalSurface = "Expression pedal surface for level adjustment"
    static let expSwButton = "Expression switch button"
    
    // Navigation elements
    static let dataWheel = "Data wheel for parameter navigation"
    static let pageLeftButton = "Page left navigation button"
    static let pageRightButton = "Page right navigation button"
    static let editButton = "Edit parameter button"
    static let exitButton = "Exit edit mode button"
    static let enterButton = "Enter selection button"
    static let writeButton = "Write patch to memory button"
    
    // Effect and parameter elements
    static func effectButton(_ name: String) -> String {
        "\(name) effect toggle button"
    }
    static func assignButton(_ number: Int) -> String {
        "Assign switch \(number)"
    }
    static func toneSourceButton(_ name: String) -> String {
        "\(name) tone source toggle button"
    }
    
    // Style buttons
    static let leadStyleButton = "Lead sound style selection"
    static let rhythmStyleButton = "Rhythm sound style selection"
    static let otherStyleButton = "Other sound style selection"
    static let userStyleButton = "User sound style selection"
    static let vLinkButton = "V-Link visual synchronization button"
    static let ezEditButton = "Easy edit mode button"
}

// MARK: - Accessibility Hints
enum AccessibilityHints {
    // General interaction hints
    static let tapToSelect = "Tap to select"
    static let doubleTapToEdit = "Double tap to edit parameters"
    static let tapToToggle = "Tap to toggle on or off"
    static let dragToAdjust = "Drag vertically to adjust level"
    static let rotateToNavigate = "Rotate to navigate through options"
    
    // Specific component hints
    static let pedalSingleTap = "Tap to select patch, double tap for bank navigation"
    static let ctlPedalHint = "Tap to toggle control function"
    static let expressionPedalHint = "Drag up or down to adjust patch level from 0 to 100"
    static let expSwHint = "Tap to toggle expression switch function"
    static let patchNameHint = "Tap to open patch selection interface"
    static let bpmHint = "Tap to edit tempo, use plus and minus buttons to adjust"
    static let effectHint = "Tap to toggle effect, double tap to edit parameters"
    static let assignHint = "Tap to toggle assign switch, double tap to edit assignment"
    static let toneSourceHint = "Tap to mute or unmute tone source, double tap to edit"
    static let styleHint = "Tap to switch to this sound style"
    static let dataWheelHint = "Rotate to navigate, press directionally to select"
    
    // Navigation hints
    static let navigationHint = "Use VoiceOver rotor to navigate between hardware sections"
    static let editModeHint = "Edit mode active, use controls to adjust parameters"
    static let previewHint = "Preview information for selected parameter"
}

// MARK: - Accessibility Values
enum AccessibilityValues {
    static func pedalState(isActive: Bool, patchName: String?) -> String {
        var components = [isActive ? "active" : "inactive"]
        if let patchName = patchName, !patchName.isEmpty {
            components.append("patch: \(patchName)")
        }
        return components.joined(separator: ", ")
    }
    
    static func effectState(isOn: Bool) -> String {
        isOn ? "on" : "off"
    }
    
    static func levelValue(_ level: Int) -> String {
        "level \(level) percent"
    }
    
    static func bpmValue(_ bpm: Int) -> String {
        "\(bpm) beats per minute"
    }
    
    static func bankValue(_ bank: String) -> String {
        "bank \(bank)"
    }
    
    static func styleValue(_ style: String) -> String {
        "\(style) style selected"
    }
    
    static func connectionState(isConnected: Bool) -> String {
        isConnected ? "MIDI connected" : "MIDI disconnected"
    }
}

// MARK: - Accessibility Traits Helper
enum AccessibilityTraitsHelper {
    static func buttonTraits(isSelected: Bool = false, isToggle: Bool = false) -> AccessibilityTraits {
        var traits: AccessibilityTraits = [.isButton]
        if isSelected {
            traits.insert(.isSelected)
        }
        if isToggle {
            traits.insert(.toggleButton)
        }
        return traits
    }
    
    static func sliderTraits() -> AccessibilityTraits {
        [.adjustable]
    }
    
    static func headerTraits() -> AccessibilityTraits {
        [.isHeader]
    }
    
    static func statusTraits() -> AccessibilityTraits {
        [.isStaticText, .updatesFrequently]
    }
}

// MARK: - VoiceOver Navigation Support
struct AccessibilityNavigationModifier: ViewModifier {
    let order: DesignTokens.Accessibility.NavigationOrder
    let label: String
    let hint: String?
    let value: String?
    let traits: AccessibilityTraits
    let isEnabled: Bool
    
    init(
        order: DesignTokens.Accessibility.NavigationOrder,
        label: String,
        hint: String? = nil,
        value: String? = nil,
        traits: AccessibilityTraits = [],
        isEnabled: Bool = true
    ) {
        self.order = order
        self.label = label
        self.hint = hint
        self.value = value
        self.traits = traits
        self.isEnabled = isEnabled
    }
    
    func body(content: Content) -> some View {
        content
            .accessibilityElement(children: .ignore)
            .accessibilityLabel(label)
            .accessibilityHint(hint ?? "")
            .accessibilityValue(value ?? "")
            .accessibilityAddTraits(traits)
            .accessibilityRemoveTraits(isEnabled ? [] : .isButton)
            .accessibilitySortPriority(Double(order.rawValue))
            .accessibilityRespondsToUserInteraction(isEnabled)
    }
}

// MARK: - Accessibility Action Support
struct AccessibilityActionModifier: ViewModifier {
    let primaryAction: (() -> Void)?
    let secondaryAction: (() -> Void)?
    let adjustableAction: ((AccessibilityAdjustmentDirection) -> Void)?
    
    func body(content: Content) -> some View {
        content
            .accessibilityAction(.default) {
                primaryAction?()
            }
            .accessibilityAction(.escape) {
                secondaryAction?()
            }
            .accessibilityAdjustableAction { direction in
                adjustableAction?(direction)
            }
    }
}

// MARK: - High Contrast Support
struct HighContrastModifier: ViewModifier {
    let normalColor: Color
    let highContrastColor: Color
    
    func body(content: Content) -> some View {
        content
            .foregroundColor(
                UIAccessibility.isDarkerSystemColorsEnabled ? 
                    highContrastColor : normalColor
            )
    }
}

// MARK: - Reduced Motion Support
struct ReducedMotionModifier: ViewModifier {
    let normalAnimation: Animation
    let reducedAnimation: Animation
    
    func body(content: Content) -> some View {
        content
            .animation(
                UIAccessibility.isReduceMotionEnabled ? 
                    reducedAnimation : normalAnimation,
                value: UUID() // Placeholder for animation trigger
            )
    }
}

// MARK: - Focus Management
@MainActor
class AccessibilityFocusManager: ObservableObject {
    @Published var focusedElement: AccessibilityFocusState = .none
    
    enum AccessibilityFocusState: Equatable {
        case none
        case display
        case pedal(Int)
        case expressionPedal
        case navigationCluster
        case stylePanel
        case previewPane
    }
    
    func moveFocus(to element: AccessibilityFocusState) {
        focusedElement = element
        
        // Provide haptic feedback for focus changes
        let impactFeedback = UIImpactFeedbackGenerator(style: .light)
        impactFeedback.impactOccurred()
    }
    
    func announceFocusChange(_ announcement: String) {
        UIAccessibility.post(notification: .announcement, argument: announcement)
    }
    
    func announcePageChange(_ announcement: String) {
        UIAccessibility.post(notification: .pageScrolled, argument: announcement)
    }
    
    func announceLayoutChange(_ announcement: String) {
        UIAccessibility.post(notification: .layoutChanged, argument: announcement)
    }
}

// MARK: - View Extensions for Accessibility
extension View {
    /// Adds comprehensive accessibility support to any view
    func accessibilitySupport(
        order: DesignTokens.Accessibility.NavigationOrder,
        label: String,
        hint: String? = nil,
        value: String? = nil,
        traits: AccessibilityTraits = [],
        isEnabled: Bool = true
    ) -> some View {
        self.modifier(
            AccessibilityNavigationModifier(
                order: order,
                label: label,
                hint: hint,
                value: value,
                traits: traits,
                isEnabled: isEnabled
            )
        )
    }
    
    /// Adds accessibility actions to a view
    func accessibilityActions(
        primary: (() -> Void)? = nil,
        secondary: (() -> Void)? = nil,
        adjustable: ((AccessibilityAdjustmentDirection) -> Void)? = nil
    ) -> some View {
        self.modifier(
            AccessibilityActionModifier(
                primaryAction: primary,
                secondaryAction: secondary,
                adjustableAction: adjustable
            )
        )
    }
    
    /// Applies high contrast color support
    func highContrastColor(
        normal: Color,
        highContrast: Color
    ) -> some View {
        self.modifier(
            HighContrastModifier(
                normalColor: normal,
                highContrastColor: highContrast
            )
        )
    }
    
    /// Applies reduced motion animation support
    func reducedMotionAnimation(
        normal: Animation,
        reduced: Animation
    ) -> some View {
        self.modifier(
            ReducedMotionModifier(
                normalAnimation: normal,
                reducedAnimation: reduced
            )
        )
    }
    
    /// Ensures minimum touch target size for accessibility
    func minimumTouchTarget() -> some View {
        self.frame(
            minWidth: DesignTokens.Accessibility.minimumTouchTarget,
            minHeight: DesignTokens.Accessibility.minimumTouchTarget
        )
    }
    
    /// Adds focus ring for keyboard navigation
    func focusRing(isVisible: Bool) -> some View {
        self.overlay(
            DesignTokens.focusRing(isVisible: isVisible)
        )
    }
}

// MARK: - Accessibility Testing Support
#if DEBUG
struct AccessibilityTestingView: View {
    @StateObject private var focusManager = AccessibilityFocusManager()
    
    var body: some View {
        VStack(spacing: 20) {
            Text("Accessibility Testing")
                .font(.title)
                .accessibilityAddTraits(.isHeader)
            
            Button("Test Announcement") {
                focusManager.announceFocusChange("Testing accessibility announcement")
            }
            .accessibilitySupport(
                order: .display,
                label: "Test announcement button",
                hint: "Tap to test VoiceOver announcement"
            )
            
            Button("Test Focus Change") {
                focusManager.moveFocus(to: .display)
            }
            .accessibilitySupport(
                order: .pedalCluster,
                label: "Test focus change button",
                hint: "Tap to test focus management"
            )
            
            Text("Current Focus: \(String(describing: focusManager.focusedElement))")
                .accessibilitySupport(
                    order: .navigationCluster,
                    label: "Current focus state",
                    traits: .updatesFrequently
                )
        }
        .padding()
        .environmentObject(focusManager)
    }
}

#Preview {
    AccessibilityTestingView()
}
#endif