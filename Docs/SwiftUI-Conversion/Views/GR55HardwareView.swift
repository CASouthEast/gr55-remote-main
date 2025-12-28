import SwiftUI

// Import the DisplayComponent and other components
// Note: In a real Xcode project, this would be handled by the module system

// MARK: - GR55HardwareView
/// Main container view for the GR55 hardware interface
/// Follows Swift 6.2 concurrency patterns with @MainActor
@MainActor
struct GR55HardwareView: View {
    @StateObject private var stateManager = GR55StateManager()
    @State private var hoveredItem: HoveredItem = .none
    @State private var isEditMode = false
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Main chassis background
                chassisBackground
                
                // Hardware layout
                hardwareLayout
                    .padding(DesignTokens.Spacing.large)
            }
            .overlay(
                PreviewPane(
                    hoveredItem: hoveredItem,
                    isEditMode: isEditMode
                )
                .allowsHitTesting(false)
            )
        }
        .background(DesignTokens.Colors.background)
        .preferredColorScheme(.dark) // Hardware aesthetic works best in dark mode
    }
    
    // MARK: - Chassis Background
    private var chassisBackground: some View {
        RoundedRectangle(cornerRadius: DesignTokens.Radii.large)
            .fill(DesignTokens.Colors.chassis)
            .shadow(
                color: DesignTokens.Shadows.chassis.color,
                radius: DesignTokens.Shadows.chassis.radius,
                x: DesignTokens.Shadows.chassis.x,
                y: DesignTokens.Shadows.chassis.y
            )
    }
    
    // MARK: - Hardware Layout
    private var hardwareLayout: some View {
        VStack(spacing: DesignTokens.Spacing.large) {
            // Top ports bar
            PortsBar(guitarOutSource: stateManager.state.guitarOutSource)
            
            // Main hardware sections
            HStack(spacing: DesignTokens.Spacing.extraLarge) {
                // Left section - Main controls
                leftSection
                
                // Right section - Expression pedal
                rightSection
            }
        }
    }
    
    // MARK: - Left Section
    private var leftSection: some View {
        VStack(spacing: DesignTokens.Spacing.large) {
            // Header with branding
            HeaderView()
            
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
            // LCD Display
            DisplayComponent(stateManager: stateManager)
                .onHover { item in
                    hoveredItem = item
                }
                .onEditModeChange { isEdit in
                    isEditMode = isEdit
                }
            
            // Sound style panel
            SoundStylePanel(stateManager: stateManager)
            
            // Foot pedals
            PedalCluster(stateManager: stateManager)
        }
    }
    
    // MARK: - Right Column
    private var rightColumn: some View {
        NavigationCluster(stateManager: stateManager)
    }
    
    // MARK: - Right Section
    private var rightSection: some View {
        ExpressionPedal(stateManager: stateManager)
    }
}

// MARK: - Placeholder Views
/// These are placeholder views that will be implemented in subsequent tasks

struct PortsBar: View {
    let guitarOutSource: String
    
    var body: some View {
        HStack {
            Text("GUITAR OUT: \(guitarOutSource)")
                .font(DesignTokens.Fonts.statusText)
                .foregroundColor(DesignTokens.Colors.textMuted)
            
            Spacer()
            
            Text("MIDI IN/OUT")
                .font(DesignTokens.Fonts.statusText)
                .foregroundColor(DesignTokens.Colors.textMuted)
        }
        .padding(.horizontal, DesignTokens.Spacing.medium)
        .frame(height: 30)
        .background(DesignTokens.Colors.surface)
        .cornerRadius(DesignTokens.Radii.small)
    }
}

struct HeaderView: View {
    var body: some View {
        HStack {
            Text("ROLAND")
                .font(DesignTokens.Fonts.previewTitle)
                .foregroundColor(DesignTokens.Colors.accent)
            
            Spacer()
            
            Text("GR-55")
                .font(DesignTokens.Fonts.previewTitle)
                .foregroundColor(DesignTokens.Colors.textPrimary)
        }
        .padding(.horizontal, DesignTokens.Spacing.medium)
    }
}

// DisplayComponent is now implemented in separate file

struct SoundStylePanel: View {
    @ObservedObject var stateManager: GR55StateManager
    
    var body: some View {
        HStack(spacing: DesignTokens.Spacing.medium) {
            ForEach(SoundStyle.allCases, id: \.self) { style in
                Button(style.displayName) {
                    stateManager.setActiveStyle(style)
                }
                .font(DesignTokens.Fonts.parameterLabel)
                .foregroundColor(
                    stateManager.state.activeStyle == style ?
                    DesignTokens.Colors.accent : DesignTokens.Colors.textMuted
                )
                .padding(.horizontal, DesignTokens.Spacing.small)
                .padding(.vertical, DesignTokens.Spacing.extraSmall)
                .background(
                    stateManager.state.activeStyle == style ?
                    DesignTokens.Colors.buttonPressed : DesignTokens.Colors.buttonDefault
                )
                .cornerRadius(DesignTokens.Radii.small)
            }
        }
    }
}

// PedalCluster is now implemented in separate file

// FootPedal is now implemented in separate file

// NavigationCluster is now implemented in separate file

struct ExpressionPedal: View {
    @ObservedObject var stateManager: GR55StateManager
    
    var body: some View {
        VStack(spacing: DesignTokens.Spacing.medium) {
            Text("EXP PEDAL")
                .font(DesignTokens.Fonts.expressionLabel)
                .foregroundColor(DesignTokens.Colors.accent)
            
            RoundedRectangle(cornerRadius: DesignTokens.Radii.large)
                .fill(DesignTokens.Colors.expressionPedalBody)
                .frame(
                    width: DesignTokens.Dimensions.expressionPedalWidth,
                    height: DesignTokens.Dimensions.expressionPedalHeight
                )
                .overlay(
                    VStack {
                        Text("PATCH LEVEL")
                            .font(DesignTokens.Fonts.expressionLabel)
                            .foregroundColor(DesignTokens.Colors.accent)
                        
                        Text("\(stateManager.state.patchLevel)")
                            .font(DesignTokens.Fonts.expressionValue)
                            .foregroundColor(DesignTokens.Colors.textPrimary)
                        
                        Spacer()
                    }
                    .padding(DesignTokens.Spacing.medium)
                )
        }
    }
}

struct PreviewPane: View {
    let hoveredItem: HoveredItem
    let isEditMode: Bool
    
    var body: some View {
        Group {
            if hoveredItem != .none || isEditMode {
                VStack {
                    Spacer()
                    
                    HStack {
                        Spacer()
                        
                        RoundedRectangle(cornerRadius: DesignTokens.Radii.medium)
                            .fill(DesignTokens.Colors.surface)
                            .frame(
                                maxWidth: DesignTokens.Dimensions.previewPaneMaxWidth,
                                minHeight: DesignTokens.Dimensions.previewPaneMinHeight
                            )
                            .overlay(
                                VStack {
                                    Text(isEditMode ? "EDIT MODE" : "PREVIEW")
                                        .font(DesignTokens.Fonts.previewTitle)
                                        .foregroundColor(DesignTokens.Colors.accent)
                                    
                                    Text(hoveredItem.description)
                                        .font(DesignTokens.Fonts.previewBody)
                                        .foregroundColor(DesignTokens.Colors.textPrimary)
                                    
                                    Spacer()
                                }
                                .padding(DesignTokens.Spacing.medium)
                            )
                            .shadow(
                                color: DesignTokens.Shadows.preview.color,
                                radius: DesignTokens.Shadows.preview.radius,
                                x: DesignTokens.Shadows.preview.x,
                                y: DesignTokens.Shadows.preview.y
                            )
                        
                        Spacer()
                    }
                    
                    Spacer()
                }
                .transition(.opacity.combined(with: .scale))
                .animation(DesignTokens.Animations.stateChange, value: hoveredItem)
            }
        }
    }
}

// MARK: - Preview
#Preview {
    GR55HardwareView()
        .frame(width: 1200, height: 800)
}