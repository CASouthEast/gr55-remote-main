import SwiftUI

// MARK: - ExpressionPedal Component
/// Large expression pedal with level control and EXP SW button
/// Provides vertical drag gesture for patch level adjustment (0-100)
/// Includes realistic 3D appearance with textures and visual feedback
struct ExpressionPedal: View {
    @ObservedObject var stateManager: GR55StateManager
    @State private var isDragging = false
    @State private var dragOffset: CGFloat = 0
    
    var body: some View {
        VStack(spacing: DesignTokens.Spacing.medium) {
            // EXP SW Button at top
            ExpSwButton(stateManager: stateManager)
            
            // Main expression pedal surface
            GeometryReader { geometry in
                ZStack {
                    // Pedal background with realistic appearance
                    ExpressionPedalShape(hasTexture: true)
                        .expressionPedalStyle()
                    
                    // Level control overlay
                    LevelControlOverlay(
                        stateManager: stateManager,
                        geometry: geometry,
                        isDragging: $isDragging,
                        dragOffset: $dragOffset
                    )
                }
            }
            .frame(
                width: DesignTokens.Dimensions.expressionPedalWidth,
                height: DesignTokens.Dimensions.expressionPedalHeight
            )
        }
        .padding(DesignTokens.Spacing.small)
        .background(DesignTokens.Colors.expressionPedalSurface)
        .clipShape(RoundedRectangle(cornerRadius: DesignTokens.Radii.medium))
    }
}

// MARK: - ExpSwButton Component
/// Expression switch button with LED indicator and function display
struct ExpSwButton: View {
    @ObservedObject var stateManager: GR55StateManager
    @State private var isPressed = false
    
    var body: some View {
        VStack(spacing: DesignTokens.Spacing.small) {
            // Function label above button
            if !stateManager.currentState.expSwFunction.isEmpty {
                Text(stateManager.currentState.expSwFunction)
                    .font(DesignTokens.Fonts.expressionFunction)
                    .foregroundColor(DesignTokens.Colors.accent)
                    .lineLimit(1)
                    .frame(maxWidth: 100)
            }
            
            // EXP SW Button
            Button(action: {
                stateManager.toggleExpSw()
            }) {
                ZStack {
                    // Button background
                    RoundedRectangle(cornerRadius: DesignTokens.Radii.small)
                        .fill(isPressed ? DesignTokens.Colors.buttonPressed : DesignTokens.Colors.buttonDefault)
                        .overlay(
                            RoundedRectangle(cornerRadius: DesignTokens.Radii.small)
                                .stroke(DesignTokens.Colors.border, lineWidth: 2)
                        )
                        .frame(width: 64, height: DesignTokens.Dimensions.expressionButtonHeight)
                    
                    // LED indicator
                    VStack {
                        Spacer()
                        
                        Rectangle()
                            .fill(stateManager.currentState.expSwStatus ? DesignTokens.Colors.ledActive : DesignTokens.Colors.ledInactive)
                            .frame(width: 16, height: 8)
                            .cornerRadius(2)
                            .shadow(
                                color: stateManager.currentState.expSwStatus ? DesignTokens.Colors.ledGlow : .clear,
                                radius: stateManager.currentState.expSwStatus ? 8 : 0
                            )
                        
                        Spacer().frame(height: 6)
                    }
                }
            }
            .scaleEffect(isPressed ? 0.98 : 1.0)
            .animation(DesignTokens.Animations.buttonPress, value: isPressed)
            .onLongPressGesture(minimumDuration: 0, maximumDistance: .infinity, pressing: { pressing in
                isPressed = pressing
            }, perform: {})
            
            // EXP SW label below button
            Text("EXP SW")
                .font(DesignTokens.Fonts.expressionFunction)
                .foregroundColor(DesignTokens.Colors.textSecondary)
                .padding(.horizontal, DesignTokens.Spacing.small)
                .padding(.vertical, 2)
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

// MARK: - LevelControlOverlay Component
/// Overlay component for patch level control with drag gesture
struct LevelControlOverlay: View {
    @ObservedObject var stateManager: GR55StateManager
    let geometry: GeometryProxy
    @Binding var isDragging: Bool
    @Binding var dragOffset: CGFloat
    
    var body: some View {
        VStack(spacing: DesignTokens.Spacing.medium) {
            // PATCH LEVEL label
            Text("PATCH LEVEL")
                .font(DesignTokens.Fonts.expressionLabel)
                .foregroundColor(DesignTokens.Colors.accent)
                .fontWeight(.heavy)
            
            // Current level value
            Text("\(stateManager.currentState.patchLevel)")
                .font(DesignTokens.Fonts.expressionValue)
                .foregroundColor(DesignTokens.Colors.textPrimary)
                .fontWeight(.black)
                .shadow(color: .black.opacity(0.8), radius: 2, x: 0, y: 1)
            
            Spacer()
            
            // Level bar visualization
            LevelBar(level: stateManager.currentState.patchLevel)
                .frame(
                    width: DesignTokens.Dimensions.levelBarWidth,
                    height: DesignTokens.Dimensions.levelBarHeight
                )
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
                }
        )
        .scaleEffect(isDragging ? 1.02 : 1.0)
        .animation(DesignTokens.Animations.stateChange, value: isDragging)
    }
}

// MARK: - LevelBar Component
/// Visual level indicator with gradient and smooth updates
struct LevelBar: View {
    let level: Int
    
    private var normalizedLevel: Double {
        Double(level) / 100.0
    }
    
    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .bottom) {
                // Background container
                RoundedRectangle(cornerRadius: DesignTokens.Radii.small)
                    .fill(Color.black)
                    .overlay(
                        RoundedRectangle(cornerRadius: DesignTokens.Radii.small)
                            .stroke(DesignTokens.Colors.border, lineWidth: 1)
                    )
                
                // Gradient fill based on level
                RoundedRectangle(cornerRadius: DesignTokens.Radii.small)
                    .fill(
                        LinearGradient(
                            gradient: Gradient(stops: [
                                .init(color: .green, location: 0.0),
                                .init(color: .yellow, location: 0.4),
                                .init(color: .orange, location: 0.7),
                                .init(color: .red, location: 1.0)
                            ]),
                            startPoint: .bottom,
                            endPoint: .top
                        )
                    )
                    .frame(height: geometry.size.height * normalizedLevel)
                    .animation(DesignTokens.Animations.stateChange, value: level)
                
                // Level indicator marks (optional visual enhancement)
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