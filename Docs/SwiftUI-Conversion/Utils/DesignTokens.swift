import SwiftUI
import UIKit

// MARK: - Design Tokens
/// Centralized design system for the GR55 hardware interface
/// Provides consistent styling across all SwiftUI components with accessibility and appearance mode support
/// Follows Swift 6.2 patterns with static properties for performance
enum DesignTokens {
    
    // MARK: - Colors
    /// Color palette matching the original hardware aesthetic with dynamic appearance mode support
    enum Colors {
        // Base colors - zinc palette with dynamic appearance support
        static let background = Color("BackgroundColor", bundle: nil) ?? Color(light: Color(red: 0.894, green: 0.894, blue: 0.906), dark: Color(red: 0.071, green: 0.071, blue: 0.078))
        static let chassis = Color("ChassisColor", bundle: nil) ?? Color(light: Color(red: 0.118, green: 0.125, blue: 0.141), dark: Color(red: 0.094, green: 0.094, blue: 0.106))
        static let surface = Color("SurfaceColor", bundle: nil) ?? Color(light: Color(red: 0.145, green: 0.157, blue: 0.180), dark: Color(red: 0.118, green: 0.125, blue: 0.141))
        static let border = Color("BorderColor", bundle: nil) ?? Color(light: Color(red: 0.322, green: 0.322, blue: 0.357), dark: Color(red: 0.244, green: 0.244, blue: 0.267))
        
        // Text colors with dynamic appearance support
        static let textPrimary = Color("TextPrimaryColor", bundle: nil) ?? Color(light: Color(red: 0.118, green: 0.125, blue: 0.141), dark: Color(red: 0.957, green: 0.957, blue: 0.961))
        static let textSecondary = Color("TextSecondaryColor", bundle: nil) ?? Color(light: Color(red: 0.322, green: 0.322, blue: 0.357), dark: Color(red: 0.780, green: 0.780, blue: 0.804))
        static let textMuted = Color("TextMutedColor", bundle: nil) ?? Color(light: Color(red: 0.631, green: 0.631, blue: 0.667), dark: Color(red: 0.631, green: 0.631, blue: 0.667))
        
        // Accent colors with high contrast support
        static let accent = Color("AccentColor", bundle: nil) ?? Color(red: 0.976, green: 0.451, blue: 0.086) // orange-500
        static let accentHover = Color("AccentHoverColor", bundle: nil) ?? Color(red: 0.992, green: 0.549, blue: 0.235) // orange-400
        
        // LED indicators with accessibility-compliant contrast
        static let ledActive = Color("LEDActiveColor", bundle: nil) ?? Color(red: 0.937, green: 0.267, blue: 0.267) // red-500
        static let ledInactive = Color("LEDInactiveColor", bundle: nil) ?? Color(light: Color(red: 0.631, green: 0.631, blue: 0.667), dark: Color(red: 0.094, green: 0.094, blue: 0.106))
        static let ledGlow = Color("LEDGlowColor", bundle: nil) ?? Color(red: 0.937, green: 0.267, blue: 0.267) // red-500 for glow effect
        
        // LCD Display colors with high contrast
        static let lcdBackground = Color("LCDBackgroundColor", bundle: nil) ?? Color(light: Color(red: 0.859, green: 0.914, blue: 0.996), dark: Color(red: 0.071, green: 0.094, blue: 0.141))
        static let lcdBorder = Color("LCDBorderColor", bundle: nil) ?? Color(light: Color(red: 0.153, green: 0.153, blue: 0.169), dark: Color(red: 0.322, green: 0.322, blue: 0.357))
        static let lcdText = Color("LCDTextColor", bundle: nil) ?? Color(light: Color(red: 0.118, green: 0.227, blue: 0.541), dark: Color(red: 0.678, green: 0.847, blue: 0.902))
        static let lcdTextMuted = Color("LCDTextMutedColor", bundle: nil) ?? Color(light: Color(red: 0.118, green: 0.227, blue: 0.541).opacity(0.6), dark: Color(red: 0.678, green: 0.847, blue: 0.902).opacity(0.6))
        
        // Pedal colors with appearance mode support
        static let pedalBody = Color("PedalBodyColor", bundle: nil) ?? Color(light: Color(red: 0.212, green: 0.220, blue: 0.235), dark: Color(red: 0.145, green: 0.157, blue: 0.180))
        static let pedalBorder = Color("PedalBorderColor", bundle: nil) ?? Color(light: Color(red: 0.322, green: 0.322, blue: 0.357), dark: Color(red: 0.244, green: 0.244, blue: 0.267))
        static let pedalPressed = Color("PedalPressedColor", bundle: nil) ?? Color(light: Color(red: 0.161, green: 0.169, blue: 0.184), dark: Color(red: 0.094, green: 0.094, blue: 0.106))
        
        // Expression pedal colors
        static let expressionPedalBody = Color("ExpressionPedalBodyColor", bundle: nil) ?? Color(light: Color(red: 0.145, green: 0.157, blue: 0.180), dark: Color(red: 0.118, green: 0.125, blue: 0.141))
        static let expressionPedalBorder = Color("ExpressionPedalBorderColor", bundle: nil) ?? Color(light: Color(red: 0.094, green: 0.094, blue: 0.106), dark: Color(red: 0.071, green: 0.071, blue: 0.078))
        static let expressionPedalSurface = Color("ExpressionPedalSurfaceColor", bundle: nil) ?? Color(light: Color(red: 0.212, green: 0.220, blue: 0.235), dark: Color(red: 0.145, green: 0.157, blue: 0.180))
        
        // Button colors with accessibility compliance
        static let buttonDefault = Color("ButtonDefaultColor", bundle: nil) ?? Color(light: Color(red: 0.322, green: 0.322, blue: 0.357), dark: Color(red: 0.244, green: 0.244, blue: 0.267))
        static let buttonHover = Color("ButtonHoverColor", bundle: nil) ?? Color(light: Color(red: 0.404, green: 0.404, blue: 0.427), dark: Color(red: 0.322, green: 0.322, blue: 0.357))
        static let buttonPressed = Color("ButtonPressedColor", bundle: nil) ?? Color(light: Color(red: 0.244, green: 0.244, blue: 0.267), dark: Color(red: 0.161, green: 0.169, blue: 0.184))
        
        // Status colors with WCAG AA compliance
        static let success = Color("SuccessColor", bundle: nil) ?? Color(red: 0.133, green: 0.694, blue: 0.298) // green-600
        static let warning = Color("WarningColor", bundle: nil) ?? Color(red: 0.918, green: 0.549, blue: 0.020) // amber-600
        static let error = Color("ErrorColor", bundle: nil) ?? Color(red: 0.863, green: 0.078, blue: 0.235) // rose-600
        
        // Focus and selection colors for accessibility
        static let focusRing = Color("FocusRingColor", bundle: nil) ?? Color(red: 0.000, green: 0.478, blue: 1.000) // iOS system blue
        static let selectionBackground = Color("SelectionBackgroundColor", bundle: nil) ?? Color(red: 0.000, green: 0.478, blue: 1.000).opacity(0.2)
    }
    
    // MARK: - Accessibility
    /// Accessibility-specific design tokens
    enum Accessibility {
        // Minimum touch target sizes (44pt minimum per Apple HIG)
        static let minimumTouchTarget: CGFloat = 44
        static let recommendedTouchTarget: CGFloat = 48
        
        // Focus ring properties
        static let focusRingWidth: CGFloat = 3
        static let focusRingOffset: CGFloat = 2
        
        // Animation durations for accessibility
        static let reducedMotionDuration: Double = 0.1
        static let standardMotionDuration: Double = 0.3
        
        // High contrast mode adjustments
        static let highContrastBorderWidth: CGFloat = 2
        static let highContrastShadowRadius: CGFloat = 0 // Disable shadows in high contrast
        
        // Voice Over navigation order
        enum NavigationOrder: Int, CaseIterable {
            case display = 1
            case soundStylePanel = 2
            case pedalCluster = 3
            case navigationCluster = 4
            case expressionPedal = 5
            case previewPane = 6
        }
    }
    
    // MARK: - Spacing
    /// Consistent spacing values for layout
    enum Spacing {
        static let extraSmall: CGFloat = 4
        static let small: CGFloat = 8
        static let medium: CGFloat = 16
        static let large: CGFloat = 24
        static let extraLarge: CGFloat = 32
        static let xxLarge: CGFloat = 48
        static let xxxLarge: CGFloat = 64
    }
    
    // MARK: - Border Radii
    /// Consistent corner radius values
    enum Radii {
        static let small: CGFloat = 4
        static let medium: CGFloat = 8
        static let large: CGFloat = 16
        static let extraLarge: CGFloat = 24
        static let round: CGFloat = 999 // For circular elements
    }
    
    // MARK: - Typography
    /// Font definitions matching hardware aesthetic
    enum Fonts {
        // Display fonts for large elements
        static let bankDisplay = Font.system(size: 60, weight: .black, design: .monospaced)
        static let patchName = Font.system(size: 32, weight: .bold, design: .monospaced)
        static let expressionValue = Font.system(size: 24, weight: .black, design: .monospaced)
        
        // Interface fonts
        static let modeText = Font.system(size: 14, weight: .bold, design: .monospaced)
        static let parameterLabel = Font.system(size: 12, weight: .semibold)
        static let statusText = Font.system(size: 10, weight: .bold)
        
        // Pedal fonts
        static let pedalNumber = Font.system(size: 28, weight: .black)
        static let pedalTopLabel = Font.system(size: 12, weight: .heavy)
        static let pedalSubLabel = Font.system(size: 10, weight: .bold)
        
        // Expression pedal fonts
        static let expressionLabel = Font.system(size: 12, weight: .heavy)
        static let expressionFunction = Font.system(size: 10, weight: .bold)
        
        // Navigation fonts
        static let navigationLabel = Font.system(size: 10, weight: .bold)
        static let gkValue = Font.system(size: 12, weight: .semibold, design: .monospaced)
        
        // Preview pane fonts
        static let previewTitle = Font.system(size: 16, weight: .bold)
        static let previewBody = Font.system(size: 14, weight: .medium)
        static let previewCaption = Font.system(size: 12, weight: .regular)
    }
    
    // MARK: - Shadows
    /// Shadow definitions for depth and hierarchy
    enum Shadows {
        // Main chassis shadow
        static let chassis = (
            color: Color.black.opacity(0.25),
            radius: CGFloat(25),
            x: CGFloat(0),
            y: CGFloat(12)
        )
        
        // Component shadows
        static let component = (
            color: Color.black.opacity(0.15),
            radius: CGFloat(8),
            x: CGFloat(0),
            y: CGFloat(4)
        )
        
        // Button shadows
        static let button = (
            color: Color.black.opacity(0.1),
            radius: CGFloat(4),
            x: CGFloat(0),
            y: CGFloat(2)
        )
        
        // LED glow effect
        static let ledGlow = (
            color: Colors.ledActive.opacity(0.8),
            radius: CGFloat(8),
            x: CGFloat(0),
            y: CGFloat(0)
        )
        
        // Preview pane shadow
        static let preview = (
            color: Color.black.opacity(0.2),
            radius: CGFloat(12),
            x: CGFloat(0),
            y: CGFloat(8)
        )
        
        // Inset shadow for pressed states
        static let inset = (
            color: Color.black.opacity(0.3),
            radius: CGFloat(2),
            x: CGFloat(0),
            y: CGFloat(1)
        )
    }
    
    // MARK: - Dimensions
    /// Standard dimensions for hardware components
    enum Dimensions {
        // Pedal dimensions
        static let pedalWidth: CGFloat = 80
        static let pedalHeight: CGFloat = 120
        static let pedalLEDSize: CGFloat = 16
        
        // Expression pedal dimensions
        static let expressionPedalWidth: CGFloat = 140
        static let expressionPedalHeight: CGFloat = 300
        static let expressionButtonHeight: CGFloat = 40
        
        // Display dimensions
        static let displayWidth: CGFloat = 400
        static let displayHeight: CGFloat = 200
        static let displayBorderWidth: CGFloat = 12
        
        // Data wheel dimensions
        static let dataWheelSize: CGFloat = 80
        static let dataWheelNotchLength: CGFloat = 8
        
        // Button dimensions
        static let standardButtonWidth: CGFloat = 60
        static let standardButtonHeight: CGFloat = 30
        static let smallButtonWidth: CGFloat = 40
        static let smallButtonHeight: CGFloat = 24
        
        // Level bar dimensions
        static let levelBarWidth: CGFloat = 20
        static let levelBarHeight: CGFloat = 200
        
        // Preview pane dimensions
        static let previewPaneMaxWidth: CGFloat = 380
        static let previewPaneMinHeight: CGFloat = 200
    }
    
    // MARK: - Animation Durations
    /// Standard animation timing for consistent feel with accessibility support
    enum Animations {
        static let fast: Double = 0.1
        static let normal: Double = 0.2
        static let slow: Double = 0.3
        static let ledPulse: Double = 1.0
        
        // Accessibility-aware animations
        static var accessibleFast: Double {
            UIAccessibility.isReduceMotionEnabled ? 0.05 : fast
        }
        
        static var accessibleNormal: Double {
            UIAccessibility.isReduceMotionEnabled ? 0.1 : normal
        }
        
        static var accessibleSlow: Double {
            UIAccessibility.isReduceMotionEnabled ? 0.15 : slow
        }
        
        // Spring animations with accessibility support
        static var buttonPress: Animation {
            UIAccessibility.isReduceMotionEnabled ? 
                .easeInOut(duration: accessibleFast) : 
                .easeInOut(duration: fast)
        }
        
        static var stateChange: Animation {
            UIAccessibility.isReduceMotionEnabled ? 
                .easeInOut(duration: accessibleNormal) : 
                .easeInOut(duration: normal)
        }
        
        static var layoutChange: Animation {
            UIAccessibility.isReduceMotionEnabled ? 
                .easeInOut(duration: accessibleSlow) : 
                .easeInOut(duration: slow)
        }
        
        static var ledGlow: Animation {
            UIAccessibility.isReduceMotionEnabled ? 
                .easeInOut(duration: 0.5) : 
                .easeInOut(duration: ledPulse).repeatForever(autoreverses: true)
        }
    }
    
    // MARK: - Z-Index Values
    /// Layer ordering for proper visual hierarchy
    enum ZIndex {
        static let background: Double = 0
        static let surface: Double = 1
        static let component: Double = 2
        static let button: Double = 3
        static let led: Double = 4
        static let overlay: Double = 5
        static let preview: Double = 10
        static let modal: Double = 20
    }
}

// MARK: - Color Extensions for Appearance Mode Support
extension Color {
    /// Creates a color that adapts to light and dark appearance modes
    init(light: Color, dark: Color) {
        self = Color(UIColor { traitCollection in
            switch traitCollection.userInterfaceStyle {
            case .dark:
                return UIColor(dark)
            default:
                return UIColor(light)
            }
        })
    }
    
    /// Creates a high contrast version of the color for accessibility
    func highContrastVersion() -> Color {
        if UIAccessibility.isDarkerSystemColorsEnabled {
            return self.opacity(0.9) // Increase opacity for better contrast
        }
        return self
    }
}

// MARK: - Design Token Extensions
extension DesignTokens {
    /// Convenience methods for applying common styling patterns with accessibility support
    
    /// Standard component background with border and accessibility support
    static func componentBackground() -> some View {
        RoundedRectangle(cornerRadius: Radii.medium)
            .fill(Colors.surface)
            .overlay(
                RoundedRectangle(cornerRadius: Radii.medium)
                    .stroke(
                        Colors.border, 
                        lineWidth: UIAccessibility.isDarkerSystemColorsEnabled ? 
                            Accessibility.highContrastBorderWidth : 1
                    )
            )
    }
    
    /// Standard button styling with accessibility enhancements
    static func buttonStyle(isPressed: Bool = false, isFocused: Bool = false) -> some View {
        RoundedRectangle(cornerRadius: Radii.small)
            .fill(isPressed ? Colors.buttonPressed : Colors.buttonDefault)
            .overlay(
                RoundedRectangle(cornerRadius: Radii.small)
                    .stroke(
                        isFocused ? Colors.focusRing : Colors.border, 
                        lineWidth: isFocused ? Accessibility.focusRingWidth : 1
                    )
            )
    }
    
    /// LED indicator styling with accessibility compliance
    static func ledStyle(isActive: Bool) -> some View {
        Circle()
            .fill(isActive ? Colors.ledActive : Colors.ledInactive)
            .frame(width: Dimensions.pedalLEDSize, height: Dimensions.pedalLEDSize)
            .overlay(
                Circle()
                    .stroke(
                        Colors.border, 
                        lineWidth: UIAccessibility.isDarkerSystemColorsEnabled ? 2 : 1
                    )
            )
            .shadow(
                color: isActive && !UIAccessibility.isReduceTransparencyEnabled ? 
                    Shadows.ledGlow.color : .clear,
                radius: isActive && !UIAccessibility.isReduceTransparencyEnabled ? 
                    Shadows.ledGlow.radius : 0,
                x: Shadows.ledGlow.x,
                y: Shadows.ledGlow.y
            )
    }
    
    /// Focus ring for keyboard navigation
    static func focusRing(isVisible: Bool) -> some View {
        RoundedRectangle(cornerRadius: Radii.medium + Accessibility.focusRingOffset)
            .stroke(Colors.focusRing, lineWidth: Accessibility.focusRingWidth)
            .opacity(isVisible ? 1.0 : 0.0)
            .animation(.easeInOut(duration: 0.2), value: isVisible)
    }
}