import SwiftUI

// MARK: - NavigationCluster
/// Navigation controls section with data wheel, page buttons, and GK controls
/// Replicates the navigation cluster from the React Native implementation
/// Follows Swift 6.2 patterns with proper concurrency handling
struct NavigationCluster: View {
    @ObservedObject var stateManager: GR55StateManager
    
    var body: some View {
        VStack(spacing: DesignTokens.Spacing.large) {
            // Output Level knob
            OutputLevelKnob()
            
            // Data wheel with directional controls
            DataWheel(
                onRotate: stateManager.handleDataWheelRotate,
                onPress: stateManager.handleDataWheelPress
            )
            
            // Navigation buttons
            NavigationButtons()
            
            // GK controls row
            GKControlsRow(stateManager: stateManager)
        }
        .padding(.top, DesignTokens.Spacing.small)
    }
}

// MARK: - OutputLevelKnob
/// Output level control knob with visual indicator
/// Matches the styling from the React Native implementation
struct OutputLevelKnob: View {
    @State private var rotation: Double = 45
    
    var body: some View {
        VStack(spacing: DesignTokens.Spacing.extraSmall) {
            Text("OUTPUT LEVEL")
                .font(DesignTokens.Fonts.navigationLabel)
                .foregroundColor(DesignTokens.Colors.textMuted)
                .textCase(.uppercase)
            
            ZStack {
                // Knob body
                Circle()
                    .fill(DesignTokens.Colors.surface)
                    .frame(width: 40, height: 40)
                    .overlay(
                        Circle()
                            .stroke(DesignTokens.Colors.border, lineWidth: 2)
                    )
                    .shadow(
                        color: DesignTokens.Shadows.button.color,
                        radius: DesignTokens.Shadows.button.radius,
                        x: DesignTokens.Shadows.button.x,
                        y: DesignTokens.Shadows.button.y
                    )
                
                // Indicator line
                Rectangle()
                    .fill(DesignTokens.Colors.textPrimary)
                    .frame(width: 4, height: 16)
                    .cornerRadius(2)
                    .offset(y: -8)
                    .rotationEffect(.degrees(rotation))
            }
            .rotationEffect(.degrees(45)) // Base rotation to match React Native styling
        }
    }
}

// MARK: - DataWheel
/// Large rotary encoder with directional buttons
/// Replicates the complex navigation wheel of the GR-55
struct DataWheel: View {
    let onRotate: (WheelDirection) -> Void
    let onPress: (WheelPressDirection) -> Void
    
    @State private var rotation: Double = 0
    @State private var isDragging = false
    
    var body: some View {
        ZStack {
            // Button ring background
            Circle()
                .fill(DesignTokens.Colors.chassis)
                .frame(width: 220, height: 220)
                .overlay(
                    Circle()
                        .stroke(DesignTokens.Colors.surface, lineWidth: 1)
                )
                .shadow(
                    color: DesignTokens.Shadows.chassis.color,
                    radius: DesignTokens.Shadows.chassis.radius,
                    x: DesignTokens.Shadows.chassis.x,
                    y: DesignTokens.Shadows.chassis.y
                )
            
            // Directional buttons
            DirectionalButtons(onPress: onPress)
            
            // Center wheel
            CenterWheel(
                rotation: $rotation,
                isDragging: $isDragging,
                onRotate: onRotate
            )
        }
    }
}

// MARK: - DirectionalButtons
/// Four directional buttons around the data wheel
struct DirectionalButtons: View {
    let onPress: (WheelPressDirection) -> Void
    
    var body: some View {
        ZStack {
            // Up button
            DirectionalButton(
                direction: .up,
                position: .top,
                onPress: onPress
            )
            
            // Down button
            DirectionalButton(
                direction: .down,
                position: .bottom,
                onPress: onPress
            )
            
            // Left button
            DirectionalButton(
                direction: .left,
                position: .leading,
                onPress: onPress
            )
            
            // Right button
            DirectionalButton(
                direction: .right,
                position: .trailing,
                onPress: onPress
            )
        }
    }
}

// MARK: - DirectionalButton
/// Individual directional button with triangle indicator
struct DirectionalButton: View {
    let direction: WheelPressDirection
    let position: ButtonPosition
    let onPress: (WheelPressDirection) -> Void
    
    @State private var isPressed = false
    
    enum ButtonPosition {
        case top, bottom, leading, trailing
    }
    
    var body: some View {
        Button(action: {
            onPress(direction)
        }) {
            ZStack {
                // Button background
                RoundedRectangle(cornerRadius: buttonCornerRadius)
                    .fill(isPressed ? DesignTokens.Colors.buttonPressed : DesignTokens.Colors.buttonDefault)
                    .frame(width: buttonWidth, height: buttonHeight)
                    .shadow(
                        color: DesignTokens.Shadows.button.color,
                        radius: DesignTokens.Shadows.button.radius,
                        x: DesignTokens.Shadows.button.x,
                        y: DesignTokens.Shadows.button.y
                    )
                
                // Triangle indicator
                TriangleShape()
                    .fill(DesignTokens.Colors.textMuted)
                    .frame(width: 12, height: 12)
                    .rotationEffect(.degrees(triangleRotation))
            }
        }
        .buttonStyle(PlainButtonStyle())
        .scaleEffect(isPressed ? 0.95 : 1.0)
        .animation(DesignTokens.Animations.buttonPress, value: isPressed)
        .onLongPressGesture(minimumDuration: 0, maximumDistance: .infinity, pressing: { pressing in
            isPressed = pressing
        }, perform: {})
        .position(buttonPosition)
    }
    
    private var buttonWidth: CGFloat {
        switch position {
        case .top, .bottom: return 32
        case .leading, .trailing: return 24
        }
    }
    
    private var buttonHeight: CGFloat {
        switch position {
        case .top, .bottom: return 24
        case .leading, .trailing: return 32
        }
    }
    
    private var buttonCornerRadius: CGFloat {
        switch position {
        case .top: return 8
        case .bottom: return 8
        case .leading: return 8
        case .trailing: return 8
        }
    }
    
    private var buttonPosition: CGPoint {
        let radius: CGFloat = 108 // Half of 220 - button size
        switch position {
        case .top: return CGPoint(x: 110, y: 4 + buttonHeight/2)
        case .bottom: return CGPoint(x: 110, y: 216 - buttonHeight/2)
        case .leading: return CGPoint(x: 4 + buttonWidth/2, y: 110)
        case .trailing: return CGPoint(x: 216 - buttonWidth/2, y: 110)
        }
    }
    
    private var triangleRotation: Double {
        switch direction {
        case .up: return 0
        case .down: return 180
        case .left: return -90
        case .right: return 90
        }
    }
}

// MARK: - CenterWheel
/// Central rotatable wheel with texture and divot
struct CenterWheel: View {
    @Binding var rotation: Double
    @Binding var isDragging: Bool
    let onRotate: (WheelDirection) -> Void
    
    @State private var lastDragValue: CGSize = .zero
    
    var body: some View {
        ZStack {
            // Wheel body
            Circle()
                .fill(DesignTokens.Colors.buttonDefault)
                .frame(width: 141, height: 141)
                .overlay(
                    Circle()
                        .stroke(DesignTokens.Colors.chassis, lineWidth: 4)
                )
                .shadow(
                    color: Color.black.opacity(0.5),
                    radius: 10,
                    x: 0,
                    y: 4
                )
            
            // Wheel texture (dashed circle)
            Circle()
                .stroke(DesignTokens.Colors.border, style: StrokeStyle(lineWidth: 2, dash: [5, 5]))
                .frame(width: 102, height: 102)
                .opacity(0.3)
            
            // Inner circle
            Circle()
                .fill(Color.black.opacity(0.5))
                .frame(width: 77, height: 77)
            
            // Spinner divot (indicator)
            Circle()
                .fill(DesignTokens.Colors.chassis)
                .frame(width: 19, height: 19)
                .overlay(
                    Circle()
                        .stroke(DesignTokens.Colors.surface, lineWidth: 1)
                )
                .offset(y: -51) // Position at top of wheel
        }
        .rotationEffect(.degrees(rotation))
        .scaleEffect(isDragging ? 0.98 : 1.0)
        .animation(DesignTokens.Animations.buttonPress, value: isDragging)
        .gesture(
            DragGesture()
                .onChanged { value in
                    if !isDragging {
                        isDragging = true
                        lastDragValue = value.translation
                    }
                    
                    let deltaX = value.translation.x - lastDragValue.x
                    let deltaY = value.translation.y - lastDragValue.y
                    let totalDelta = deltaX + deltaY
                    
                    if abs(totalDelta) > 10 {
                        let newRotation = rotation + Double(totalDelta * 0.5)
                        rotation = newRotation
                        
                        if totalDelta > 0 {
                            onRotate(.right)
                        } else {
                            onRotate(.left)
                        }
                        
                        lastDragValue = value.translation
                    }
                }
                .onEnded { _ in
                    isDragging = false
                    lastDragValue = .zero
                }
        )
        .onTapGesture {
            // Fallback tap gesture for simple rotation
            let newRotation = rotation + 30
            rotation = newRotation
            onRotate(.right)
        }
    }
}

// MARK: - NavigationButtons
/// Page navigation and control buttons
struct NavigationButtons: View {
    var body: some View {
        HStack(spacing: DesignTokens.Spacing.medium) {
            // PAGE left button
            NavigationButtonGroup(label: "PAGE", buttonLabel: "◄") {
                // Handle page left
            }
            
            // PAGE right button
            NavigationButtonGroup(label: "PAGE", buttonLabel: "►") {
                // Handle page right
            }
            
            // EDIT button
            NavigationButtonGroup(label: "EDIT", buttonLabel: "") {
                // Handle edit
            }
            
            Spacer()
            
            // EXIT button
            StandardNavigationButton(label: "EXIT") {
                // Handle exit
            }
            
            // ENTER button
            StandardNavigationButton(label: "ENTER") {
                // Handle enter
            }
            
            // WRITE button
            StandardNavigationButton(label: "WRITE") {
                // Handle write
            }
        }
        .padding(.horizontal, DesignTokens.Spacing.small)
    }
}

// MARK: - NavigationButtonGroup
/// Navigation button with label above
struct NavigationButtonGroup: View {
    let label: String
    let buttonLabel: String
    let action: () -> Void
    
    var body: some View {
        VStack(spacing: DesignTokens.Spacing.extraSmall) {
            Text(label)
                .font(DesignTokens.Fonts.navigationLabel)
                .foregroundColor(DesignTokens.Colors.textMuted)
                .textCase(.uppercase)
            
            Button(action: action) {
                Text(buttonLabel)
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(DesignTokens.Colors.textPrimary)
                    .frame(width: DesignTokens.Dimensions.smallButtonWidth, height: DesignTokens.Dimensions.smallButtonHeight)
                    .background(
                        RoundedRectangle(cornerRadius: DesignTokens.Radii.small)
                            .fill(DesignTokens.Colors.buttonDefault)
                            .overlay(
                                RoundedRectangle(cornerRadius: DesignTokens.Radii.small)
                                    .stroke(DesignTokens.Colors.border, lineWidth: 1)
                            )
                    )
                    .shadow(
                        color: DesignTokens.Shadows.button.color,
                        radius: DesignTokens.Shadows.button.radius,
                        x: DesignTokens.Shadows.button.x,
                        y: DesignTokens.Shadows.button.y
                    )
            }
            .buttonStyle(PlainButtonStyle())
        }
    }
}

// MARK: - StandardNavigationButton
/// Standard navigation button without label
struct StandardNavigationButton: View {
    let label: String
    let action: () -> Void
    
    @State private var isPressed = false
    
    var body: some View {
        Button(action: action) {
            Text(label)
                .font(DesignTokens.Fonts.navigationLabel)
                .foregroundColor(DesignTokens.Colors.textPrimary)
                .textCase(.uppercase)
                .frame(width: DesignTokens.Dimensions.smallButtonWidth, height: DesignTokens.Dimensions.smallButtonHeight)
                .background(
                    RoundedRectangle(cornerRadius: DesignTokens.Radii.small)
                        .fill(isPressed ? DesignTokens.Colors.buttonPressed : DesignTokens.Colors.buttonDefault)
                        .overlay(
                            RoundedRectangle(cornerRadius: DesignTokens.Radii.small)
                                .stroke(DesignTokens.Colors.border, lineWidth: 1)
                        )
                )
                .shadow(
                    color: DesignTokens.Shadows.button.color,
                    radius: DesignTokens.Shadows.button.radius,
                    x: DesignTokens.Shadows.button.x,
                    y: DesignTokens.Shadows.button.y
                )
        }
        .buttonStyle(PlainButtonStyle())
        .scaleEffect(isPressed ? 0.95 : 1.0)
        .animation(DesignTokens.Animations.buttonPress, value: isPressed)
        .onLongPressGesture(minimumDuration: 0, maximumDistance: .infinity, pressing: { pressing in
            isPressed = pressing
        }, perform: {})
    }
}

// MARK: - GKControlsRow
/// GK controls showing S1, S2, and VOL function values
struct GKControlsRow: View {
    @ObservedObject var stateManager: GR55StateManager
    
    var body: some View {
        HStack(spacing: DesignTokens.Spacing.medium) {
            // GK S1 control
            GKControl(
                value: stateManager.currentState.gkS1Value,
                label: "GK S1",
                isKnob: false
            ) {
                // Handle GK S1 interaction
            }
            
            // GK S2 control
            GKControl(
                value: stateManager.currentState.gkS2Value,
                label: "GK S2",
                isKnob: false
            ) {
                // Handle GK S2 interaction
            }
            
            // GK VOL control (knob style)
            GKControl(
                value: stateManager.currentState.gkVolValue,
                label: "GK VOL",
                isKnob: true
            ) {
                // Handle GK VOL interaction
            }
        }
        .padding(.horizontal, DesignTokens.Spacing.small)
        .offset(y: -15) // Match React Native styling
    }
}

// MARK: - GKControl
/// Individual GK control with value display and button/knob
struct GKControl: View {
    let value: String
    let label: String
    let isKnob: Bool
    let action: () -> Void
    
    @State private var isPressed = false
    
    var body: some View {
        VStack(spacing: 6) {
            // Value display
            Text(value)
                .font(DesignTokens.Fonts.gkValue)
                .foregroundColor(DesignTokens.Colors.accent)
                .textCase(.uppercase)
            
            // Control (button or knob)
            if isKnob {
                GKKnob(action: action, isPressed: $isPressed)
            } else {
                GKButton(action: action, isPressed: $isPressed)
            }
            
            // Label
            Text(label)
                .font(DesignTokens.Fonts.navigationLabel)
                .foregroundColor(DesignTokens.Colors.textMuted)
                .textCase(.uppercase)
        }
    }
}

// MARK: - GKButton
/// GK button control
struct GKButton: View {
    let action: () -> Void
    @Binding var isPressed: Bool
    
    var body: some View {
        Button(action: action) {
            Rectangle()
                .fill(isPressed ? DesignTokens.Colors.buttonPressed : DesignTokens.Colors.buttonDefault)
                .frame(width: 48, height: 32)
                .cornerRadius(DesignTokens.Radii.small)
                .overlay(
                    RoundedRectangle(cornerRadius: DesignTokens.Radii.small)
                        .stroke(DesignTokens.Colors.border, lineWidth: 1)
                )
                .shadow(
                    color: DesignTokens.Shadows.button.color,
                    radius: DesignTokens.Shadows.button.radius,
                    x: DesignTokens.Shadows.button.x,
                    y: DesignTokens.Shadows.button.y
                )
        }
        .buttonStyle(PlainButtonStyle())
        .scaleEffect(isPressed ? 0.95 : 1.0)
        .animation(DesignTokens.Animations.buttonPress, value: isPressed)
        .onLongPressGesture(minimumDuration: 0, maximumDistance: .infinity, pressing: { pressing in
            isPressed = pressing
        }, perform: {})
    }
}

// MARK: - GKKnob
/// GK knob control with indicator
struct GKKnob: View {
    let action: () -> Void
    @Binding var isPressed: Bool
    
    @State private var rotation: Double = 45
    
    var body: some View {
        Button(action: action) {
            ZStack {
                // Knob body
                Circle()
                    .fill(isPressed ? DesignTokens.Colors.buttonPressed : DesignTokens.Colors.surface)
                    .frame(width: 36, height: 36)
                    .overlay(
                        Circle()
                            .stroke(DesignTokens.Colors.border, lineWidth: 2)
                    )
                
                // Indicator line
                Rectangle()
                    .fill(DesignTokens.Colors.textPrimary)
                    .frame(width: 3, height: 12)
                    .cornerRadius(2)
                    .offset(y: -6)
                    .rotationEffect(.degrees(rotation))
            }
            .rotationEffect(.degrees(45)) // Base rotation to match React Native styling
        }
        .buttonStyle(PlainButtonStyle())
        .scaleEffect(isPressed ? 0.95 : 1.0)
        .animation(DesignTokens.Animations.buttonPress, value: isPressed)
        .onLongPressGesture(minimumDuration: 0, maximumDistance: .infinity, pressing: { pressing in
            isPressed = pressing
        }, perform: {})
    }
}

// MARK: - TriangleShape
/// Custom triangle shape for directional buttons
struct TriangleShape: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        
        path.move(to: CGPoint(x: rect.midX, y: rect.minY))
        path.addLine(to: CGPoint(x: rect.minX, y: rect.maxY))
        path.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY))
        path.closeSubpath()
        
        return path
    }
}

// MARK: - Preview
#if DEBUG
struct NavigationCluster_Previews: PreviewProvider {
    static var previews: some View {
        NavigationCluster(stateManager: GR55StateManager())
            .background(DesignTokens.Colors.background)
            .previewLayout(.sizeThatFits)
            .padding()
    }
}
#endif