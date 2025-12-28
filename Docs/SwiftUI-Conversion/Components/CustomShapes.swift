import SwiftUI

// MARK: - Custom Shapes for Hardware Components
/// Collection of custom SwiftUI shapes that replicate hardware elements
/// Follows Swift 6.2 patterns with proper Shape protocol conformance

// MARK: - PedalShape
/// Trapezoidal shape for foot pedals with realistic proportions
struct PedalShape: Shape {
    /// Creates a trapezoidal path representing a foot pedal
    func path(in rect: CGRect) -> Path {
        var path = Path()
        
        // Calculate trapezoid dimensions for realistic pedal appearance
        let topWidth = rect.width * 0.9
        let bottomWidth = rect.width * 0.8
        let height = rect.height
        
        // Start from top-left corner
        let topLeft = CGPoint(x: (rect.width - topWidth) / 2, y: 0)
        let topRight = CGPoint(x: (rect.width + topWidth) / 2, y: 0)
        let bottomRight = CGPoint(x: (rect.width + bottomWidth) / 2, y: height)
        let bottomLeft = CGPoint(x: (rect.width - bottomWidth) / 2, y: height)
        
        // Create trapezoid path
        path.move(to: topLeft)
        path.addLine(to: topRight)
        path.addLine(to: bottomRight)
        path.addLine(to: bottomLeft)
        path.closeSubpath()
        
        return path
    }
}

// MARK: - DataWheelShape
/// Circular shape with notches around the circumference for data wheel
struct DataWheelShape: Shape {
    let notchCount: Int
    let notchLength: CGFloat
    
    init(notchCount: Int = 24, notchLength: CGFloat = 8) {
        self.notchCount = notchCount
        self.notchLength = notchLength
    }
    
    func path(in rect: CGRect) -> Path {
        var path = Path()
        
        // Main circle
        path.addEllipse(in: rect)
        
        // Add notches around the circumference
        let center = CGPoint(x: rect.midX, y: rect.midY)
        let radius = min(rect.width, rect.height) / 2
        
        for i in 0..<notchCount {
            let angle = Double(i) * 2.0 * .pi / Double(notchCount)
            
            let startPoint = CGPoint(
                x: center.x + cos(angle) * (radius - notchLength),
                y: center.y + sin(angle) * (radius - notchLength)
            )
            let endPoint = CGPoint(
                x: center.x + cos(angle) * radius,
                y: center.y + sin(angle) * radius
            )
            
            path.move(to: startPoint)
            path.addLine(to: endPoint)
        }
        
        return path
    }
}

// MARK: - LevelBarShape
/// Vertical level indicator with gradient fill capability
struct LevelBarShape: Shape {
    let level: Double // 0.0 to 1.0
    
    init(level: Double) {
        self.level = max(0.0, min(1.0, level))
    }
    
    func path(in rect: CGRect) -> Path {
        var path = Path()
        
        // Calculate fill height based on level
        let fillHeight = rect.height * level
        let fillRect = CGRect(
            x: rect.minX,
            y: rect.maxY - fillHeight,
            width: rect.width,
            height: fillHeight
        )
        
        path.addRoundedRect(
            in: fillRect,
            cornerSize: CGSize(width: 4, height: 4)
        )
        
        return path
    }
}

// MARK: - ButtonShape
/// Rounded rectangle with customizable corner radius and inset for pressed state
struct ButtonShape: Shape {
    let cornerRadius: CGFloat
    let isPressed: Bool
    
    init(cornerRadius: CGFloat = 8, isPressed: Bool = false) {
        self.cornerRadius = cornerRadius
        self.isPressed = isPressed
    }
    
    func path(in rect: CGRect) -> Path {
        var path = Path()
        
        // Adjust rect for pressed state (slight inset)
        let adjustedRect = isPressed ? rect.insetBy(dx: 1, dy: 1) : rect
        
        path.addRoundedRect(
            in: adjustedRect,
            cornerSize: CGSize(width: cornerRadius, height: cornerRadius)
        )
        
        return path
    }
}

// MARK: - LEDShape
/// Circular LED indicator with optional glow ring
struct LEDShape: Shape {
    let hasGlowRing: Bool
    
    init(hasGlowRing: Bool = false) {
        self.hasGlowRing = hasGlowRing
    }
    
    func path(in rect: CGRect) -> Path {
        var path = Path()
        
        // Main LED circle
        path.addEllipse(in: rect)
        
        // Add glow ring if specified
        if hasGlowRing {
            let glowRect = rect.insetBy(dx: -4, dy: -4)
            path.addEllipse(in: glowRect)
        }
        
        return path
    }
}

// MARK: - KnobShape
/// Circular knob with indicator line
struct KnobShape: Shape {
    let angle: Double // Rotation angle in radians
    let indicatorLength: CGFloat
    
    init(angle: Double = 0, indicatorLength: CGFloat = 0.3) {
        self.angle = angle
        self.indicatorLength = indicatorLength
    }
    
    func path(in rect: CGRect) -> Path {
        var path = Path()
        
        // Main knob circle
        path.addEllipse(in: rect)
        
        // Add indicator line
        let center = CGPoint(x: rect.midX, y: rect.midY)
        let radius = min(rect.width, rect.height) / 2
        let indicatorRadius = radius * indicatorLength
        
        let startPoint = CGPoint(
            x: center.x + cos(angle) * indicatorRadius,
            y: center.y + sin(angle) * indicatorRadius
        )
        let endPoint = CGPoint(
            x: center.x + cos(angle) * (radius - 4),
            y: center.y + sin(angle) * (radius - 4)
        )
        
        path.move(to: startPoint)
        path.addLine(to: endPoint)
        
        return path
    }
}

// MARK: - DisplayBezelShape
/// Rectangular bezel with rounded corners and inner border
struct DisplayBezelShape: Shape {
    let borderWidth: CGFloat
    let cornerRadius: CGFloat
    
    init(borderWidth: CGFloat = 12, cornerRadius: CGFloat = 8) {
        self.borderWidth = borderWidth
        self.cornerRadius = cornerRadius
    }
    
    func path(in rect: CGRect) -> Path {
        var path = Path()
        
        // Outer bezel
        path.addRoundedRect(
            in: rect,
            cornerSize: CGSize(width: cornerRadius, height: cornerRadius)
        )
        
        // Inner cutout
        let innerRect = rect.insetBy(dx: borderWidth, dy: borderWidth)
        let innerPath = Path(
            roundedRect: innerRect,
            cornerSize: CGSize(width: cornerRadius / 2, height: cornerRadius / 2)
        )
        
        // Subtract inner path to create bezel effect
        path = path.subtracting(innerPath)
        
        return path
    }
}

// MARK: - ExpressionPedalShape
/// Large rectangular pedal with rounded corners and surface texture
struct ExpressionPedalShape: Shape {
    let cornerRadius: CGFloat
    let hasTexture: Bool
    
    init(cornerRadius: CGFloat = 16, hasTexture: Bool = true) {
        self.cornerRadius = cornerRadius
        self.hasTexture = hasTexture
    }
    
    func path(in rect: CGRect) -> Path {
        var path = Path()
        
        // Main pedal shape
        path.addRoundedRect(
            in: rect,
            cornerSize: CGSize(width: cornerRadius, height: cornerRadius)
        )
        
        // Add texture lines if specified
        if hasTexture {
            let lineSpacing: CGFloat = 20
            let lineCount = Int(rect.height / lineSpacing)
            
            for i in 0..<lineCount {
                let y = rect.minY + CGFloat(i) * lineSpacing + lineSpacing / 2
                let startX = rect.minX + 10
                let endX = rect.maxX - 10
                
                path.move(to: CGPoint(x: startX, y: y))
                path.addLine(to: CGPoint(x: endX, y: y))
            }
        }
        
        return path
    }
}

// MARK: - Shape Extensions
extension Shape {
    /// Applies hardware-style styling with shadow and border
    func hardwareStyle(
        fillColor: Color = DesignTokens.Colors.surface,
        borderColor: Color = DesignTokens.Colors.border,
        shadowColor: Color = Color.black.opacity(0.2)
    ) -> some View {
        self
            .fill(fillColor)
            .overlay(
                self.stroke(borderColor, lineWidth: 1)
            )
            .shadow(color: shadowColor, radius: 4, x: 0, y: 2)
    }
    
    /// Applies LED styling with glow effect
    func ledStyle(
        isActive: Bool,
        activeColor: Color = DesignTokens.Colors.ledActive,
        inactiveColor: Color = DesignTokens.Colors.ledInactive
    ) -> some View {
        self
            .fill(isActive ? activeColor : inactiveColor)
            .shadow(
                color: isActive ? activeColor.opacity(0.8) : .clear,
                radius: isActive ? 8 : 0,
                x: 0,
                y: 0
            )
    }
    
    /// Applies button styling with press state
    func buttonStyle(
        isPressed: Bool,
        normalColor: Color = DesignTokens.Colors.buttonDefault,
        pressedColor: Color = DesignTokens.Colors.buttonPressed
    ) -> some View {
        self
            .fill(isPressed ? pressedColor : normalColor)
            .overlay(
                self.stroke(DesignTokens.Colors.border, lineWidth: 1)
            )
            .scaleEffect(isPressed ? 0.98 : 1.0)
            .animation(DesignTokens.Animations.buttonPress, value: isPressed)
    }
}

// MARK: - Preview Helpers
#if DEBUG
struct CustomShapesPreview: View {
    var body: some View {
        VStack(spacing: 20) {
            HStack(spacing: 20) {
                PedalShape()
                    .hardwareStyle()
                    .frame(width: 80, height: 120)
                
                DataWheelShape()
                    .hardwareStyle()
                    .frame(width: 80, height: 80)
                
                LevelBarShape(level: 0.7)
                    .fill(DesignTokens.Colors.accent)
                    .frame(width: 20, height: 100)
            }
            
            HStack(spacing: 20) {
                LEDShape()
                    .ledStyle(isActive: true)
                    .frame(width: 16, height: 16)
                
                KnobShape(angle: .pi / 4)
                    .hardwareStyle()
                    .frame(width: 60, height: 60)
                
                ButtonShape(isPressed: false)
                    .buttonStyle(isPressed: false)
                    .frame(width: 80, height: 30)
            }
        }
        .padding()
        .background(DesignTokens.Colors.chassis)
    }
}

#Preview {
    CustomShapesPreview()
}
#endif