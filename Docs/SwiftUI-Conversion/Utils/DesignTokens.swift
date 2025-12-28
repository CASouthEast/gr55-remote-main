import SwiftUI

// MARK: - Design Tokens
/// Centralized design system for the GR55 hardware interface
/// Provides consistent styling across all SwiftUI components
/// Follows Swift 6.2 patterns with static properties for performance
enum DesignTokens {
    
    // MARK: - Colors
    /// Color palette matching the original hardware aesthetic
    enum Colors {
        // Base colors - zinc palette
        static let background = Color(red: 0.894, green: 0.894, blue: 0.906) // zinc-200
        static let chassis = Color(red: 0.118, green: 0.125, blue: 0.141) // zinc-800
        static let surface = Color(red: 0.145, green: 0.157, blue: 0.180) // zinc-700
        static let border = Color(red: 0.322, green: 0.322, blue: 0.357) // zinc-600
        
        // Text colors
        static let textPrimary = Color(red: 0.957, green: 0.957, blue: 0.961) // zinc-100
        static let textSecondary = Color(red: 0.780, green: 0.780, blue: 0.804) // zinc-300
        static let textMuted = Color(red: 0.631, green: 0.631, blue: 0.667) // zinc-400
        
        // Accent colors
        static let accent = Color(red: 0.976, green: 0.451, blue: 0.086) // orange-500
        static let accentHover = Color(red: 0.992, green: 0.549, blue: 0.235) // orange-400
        
        // LED indicators
        static let ledActive = Color(red: 0.937, green: 0.267, blue: 0.267) // red-500
        static let ledInactive = Color(red: 0.094, green: 0.094, blue: 0.106) // zinc-900
        static let ledGlow = Color(red: 0.937, green: 0.267, blue: 0.267) // red-500 for glow effect
        
        // LCD Display colors
        static let lcdBackground = Color(red: 0.859, green: 0.914, blue: 0.996) // blue-100
        static let lcdBorder = Color(red: 0.153, green: 0.153, blue: 0.169) // zinc-800
        static let lcdText = Color(red: 0.118, green: 0.227, blue: 0.541) // blue-900
        static let lcdTextMuted = Color(red: 0.118, green: 0.227, blue: 0.541).opacity(0.6)
        
        // Pedal colors
        static let pedalBody = Color(red: 0.212, green: 0.220, blue: 0.235) // zinc-700
        static let pedalBorder = Color(red: 0.322, green: 0.322, blue: 0.357) // zinc-600
        static let pedalPressed = Color(red: 0.161, green: 0.169, blue: 0.184) // zinc-800
        
        // Expression pedal colors
        static let expressionPedalBody = Color(red: 0.145, green: 0.157, blue: 0.180) // zinc-700
        static let expressionPedalBorder = Color(red: 0.094, green: 0.094, blue: 0.106) // zinc-900
        static let expressionPedalSurface = Color(red: 0.212, green: 0.220, blue: 0.235) // zinc-700
        
        // Button colors
        static let buttonDefault = Color(red: 0.322, green: 0.322, blue: 0.357) // zinc-600
        static let buttonHover = Color(red: 0.404, green: 0.404, blue: 0.427) // zinc-500
        static let buttonPressed = Color(red: 0.244, green: 0.244, blue: 0.267) // zinc-700
        
        // Status colors
        static let success = Color(red: 0.133, green: 0.694, blue: 0.298) // green-600
        static let warning = Color(red: 0.918, green: 0.549, blue: 0.020) // amber-600
        static let error = Color(red: 0.863, green: 0.078, blue: 0.235) // rose-600
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
    /// Standard animation timing for consistent feel
    enum Animations {
        static let fast: Double = 0.1
        static let normal: Double = 0.2
        static let slow: Double = 0.3
        static let ledPulse: Double = 1.0
        
        // Spring animations
        static let buttonPress = Animation.easeInOut(duration: fast)
        static let stateChange = Animation.easeInOut(duration: normal)
        static let layoutChange = Animation.easeInOut(duration: slow)
        static let ledGlow = Animation.easeInOut(duration: ledPulse).repeatForever(autoreverses: true)
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

// MARK: - Design Token Extensions
extension DesignTokens {
    /// Convenience methods for applying common styling patterns
    
    /// Standard component background with border
    static func componentBackground() -> some View {
        RoundedRectangle(cornerRadius: Radii.medium)
            .fill(Colors.surface)
            .overlay(
                RoundedRectangle(cornerRadius: Radii.medium)
                    .stroke(Colors.border, lineWidth: 1)
            )
    }
    
    /// Standard button styling
    static func buttonStyle(isPressed: Bool = false) -> some View {
        RoundedRectangle(cornerRadius: Radii.small)
            .fill(isPressed ? Colors.buttonPressed : Colors.buttonDefault)
            .overlay(
                RoundedRectangle(cornerRadius: Radii.small)
                    .stroke(Colors.border, lineWidth: 1)
            )
    }
    
    /// LED indicator styling
    static func ledStyle(isActive: Bool) -> some View {
        Circle()
            .fill(isActive ? Colors.ledActive : Colors.ledInactive)
            .frame(width: Dimensions.pedalLEDSize, height: Dimensions.pedalLEDSize)
            .shadow(
                color: isActive ? Shadows.ledGlow.color : .clear,
                radius: isActive ? Shadows.ledGlow.radius : 0,
                x: Shadows.ledGlow.x,
                y: Shadows.ledGlow.y
            )
    }
}