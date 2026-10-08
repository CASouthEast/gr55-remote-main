import SwiftUI

// MARK: - SoundStylePanel
/// Sound style selection panel with LED indicators
/// Provides style buttons for LEAD, RHYTHM, OTHER, USER with V-LINK and EZ EDIT controls
/// Follows Swift 6.2 concurrency patterns and SwiftUI best practices
struct SoundStylePanel: View {
    @ObservedObject var stateManager: GR55StateManager
    
    var body: some View {
        VStack(spacing: DesignTokens.Spacing.medium) {
            // Section header with border
            ZStack {
                // Top border line
                Rectangle()
                    .fill(DesignTokens.Colors.border)
                    .frame(height: 1)
                
                // Section label with background
                HStack {
                    Spacer()
                    Text("SOUND STYLE")
                        .font(DesignTokens.Fonts.statusText)
                        .foregroundColor(DesignTokens.Colors.textMuted)
                        .padding(.horizontal, DesignTokens.Spacing.small)
                        .background(DesignTokens.Colors.surface)
                    Spacer()
                }
            }
            
            // Style buttons row
            HStack(spacing: DesignTokens.Spacing.small) {
                // V-LINK button (always inactive for now)
                SoundStyleButton(
                    label: "V-LINK",
                    isActive: false,
                    onTap: {
                        // V-LINK functionality placeholder
                        // Will be implemented in future tasks
                    }
                )
                
                // Main style buttons
                ForEach(SoundStyle.allCases, id: \.self) { style in
                    SoundStyleButton(
                        label: style.rawValue,
                        isActive: stateManager.currentState.activeStyle == style,
                        onTap: {
                            stateManager.setActiveStyle(style)
                        }
                    )
                }
                
                Spacer()
                
                // EZ EDIT section
                VStack(spacing: DesignTokens.Spacing.extraSmall) {
                    Text("EZ EDIT")
                        .font(DesignTokens.Fonts.statusText)
                        .foregroundColor(DesignTokens.Colors.textPrimary)
                        .letterSpacing(1.2)
                    
                    Button(action: {
                        // EZ EDIT functionality placeholder
                        // Will be implemented in future tasks
                    }) {
                        Rectangle()
                            .fill(DesignTokens.Colors.buttonDefault)
                            .frame(width: 64, height: 32)
                            .overlay(
                                Rectangle()
                                    .stroke(DesignTokens.Colors.border, lineWidth: 2)
                            )
                            .cornerRadius(DesignTokens.Radii.small)
                    }
                    .buttonStyle(PlainButtonStyle())
                }
            }
        }
        .padding(.top, DesignTokens.Spacing.medium)
    }
}

// MARK: - SoundStyleButton
/// Individual sound style button with LED indicator
/// Provides visual feedback for active/inactive states with proper LED glow effects
private struct SoundStyleButton: View {
    let label: String
    let isActive: Bool
    let onTap: () -> Void
    
    @State private var isPressed = false
    
    var body: some View {
        VStack(spacing: DesignTokens.Spacing.extraSmall) {
            // Label container with border
            Text(label)
                .font(DesignTokens.Fonts.statusText)
                .foregroundColor(DesignTokens.Colors.textPrimary)
                .letterSpacing(1.2)
                .padding(.horizontal, DesignTokens.Spacing.medium)
                .padding(.vertical, 2)
                .background(
                    RoundedRectangle(cornerRadius: DesignTokens.Radii.small)
                        .fill(DesignTokens.Colors.chassis.opacity(0.5))
                        .overlay(
                            RoundedRectangle(cornerRadius: DesignTokens.Radii.small)
                                .stroke(DesignTokens.Colors.border, lineWidth: 1)
                        )
                )
            
            // Button with LED indicator
            Button(action: onTap) {
                ZStack {
                    // Button body
                    Rectangle()
                        .fill(isPressed ? DesignTokens.Colors.buttonPressed : DesignTokens.Colors.buttonDefault)
                        .frame(width: 64, height: 32)
                        .overlay(
                            Rectangle()
                                .stroke(DesignTokens.Colors.border, lineWidth: 2)
                        )
                        .cornerRadius(DesignTokens.Radii.small)
                        .shadow(
                            color: DesignTokens.Shadows.button.color,
                            radius: DesignTokens.Shadows.button.radius,
                            x: DesignTokens.Shadows.button.x,
                            y: DesignTokens.Shadows.button.y
                        )
                    
                    // LED indicator
                    VStack {
                        Spacer()
                        Rectangle()
                            .fill(isActive ? DesignTokens.Colors.ledActive : DesignTokens.Colors.ledInactive)
                            .frame(width: 16, height: 8)
                            .cornerRadius(DesignTokens.Radii.small)
                            .shadow(
                                color: isActive ? DesignTokens.Colors.ledActive.opacity(0.8) : .clear,
                                radius: isActive ? 10 : 0,
                                x: 0,
                                y: 0
                            )
                            .padding(.bottom, DesignTokens.Spacing.extraSmall)
                    }
                }
            }
            .buttonStyle(PlainButtonStyle())
            .scaleEffect(isPressed ? 0.95 : 1.0)
            .animation(DesignTokens.Animations.buttonPress, value: isPressed)
            .onLongPressGesture(minimumDuration: 0, maximumDistance: .infinity, pressing: { pressing in
                isPressed = pressing
            }, perform: {})
        }
    }
}

// MARK: - Preview
#if DEBUG
struct SoundStylePanel_Previews: PreviewProvider {
    static var previews: some View {
        VStack {
            SoundStylePanel(stateManager: GR55StateManager())
                .padding()
                .background(DesignTokens.Colors.surface)
        }
        .background(DesignTokens.Colors.background)
        .previewLayout(.sizeThatFits)
        .previewDisplayName("Sound Style Panel")
    }
}
#endif