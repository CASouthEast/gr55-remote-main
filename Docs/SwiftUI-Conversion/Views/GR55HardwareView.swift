import SwiftUI

// MARK: - GR55HardwareView
/// Main container view for the GR55 hardware interface
/// Integrates all component views with state manager and provides responsive scaling
/// Follows Swift 6.2 concurrency patterns with @MainActor
@MainActor
struct GR55HardwareView: View {
    @StateObject private var stateManager = GR55StateManager()
    @State private var hoveredItem: HoveredItem = .none
    @State private var isEditMode = false
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Main chassis background with proper styling and shadows
                chassisBackground
                
                // Hardware layout with responsive scaling
                hardwareLayout(geometry: geometry)
                    .padding(DesignTokens.Spacing.large)
                    .scaleEffect(calculateScaleFactor(for: geometry.size))
                    .animation(DesignTokens.Animations.layoutChange, value: geometry.size)
            }
            .overlay(
                // Preview pane overlay system
                PreviewPane(
                    hoveredItem: hoveredItem,
                    isEditMode: isEditMode
                )
                .allowsHitTesting(false)
                .zIndex(DesignTokens.ZIndex.preview)
            )
        }
        .background(DesignTokens.Colors.background)
        .preferredColorScheme(.dark) // Hardware aesthetic works best in dark mode
        .clipped() // Ensure content doesn't overflow on smaller screens
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
            .overlay(
                // Subtle inner shadow for depth
                RoundedRectangle(cornerRadius: DesignTokens.Radii.large)
                    .stroke(
                        LinearGradient(
                            gradient: Gradient(colors: [
                                DesignTokens.Colors.border.opacity(0.5),
                                DesignTokens.Colors.border.opacity(0.1)
                            ]),
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 1
                    )
            )
    }
    
    // MARK: - Hardware Layout
    private func hardwareLayout(geometry: GeometryProxy) -> some View {
        VStack(spacing: DesignTokens.Spacing.large) {
            // Top ports bar
            PortsBar(guitarOutSource: stateManager.currentState.guitarOutSource)
            
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
                }
            
            // Sound style panel
            SoundStylePanel(stateManager: stateManager)
            
            // Foot pedals cluster
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
}

// MARK: - HeaderView
/// Header section with Roland branding and model designation
struct HeaderView: View {
    var body: some View {
        HStack {
            // Roland branding
            VStack(alignment: .leading, spacing: 2) {
                Text("ROLAND")
                    .font(DesignTokens.Fonts.previewTitle)
                    .fontWeight(.black)
                    .foregroundColor(DesignTokens.Colors.accent)
                    .kerning(2)
                
                Text("GUITAR SYNTHESIZER")
                    .font(DesignTokens.Fonts.statusText)
                    .foregroundColor(DesignTokens.Colors.textMuted)
                    .kerning(1)
            }
            
            Spacer()
            
            // Model designation
            VStack(alignment: .trailing, spacing: 2) {
                Text("GR-55")
                    .font(DesignTokens.Fonts.previewTitle)
                    .fontWeight(.black)
                    .foregroundColor(DesignTokens.Colors.textPrimary)
                    .kerning(2)
                
                Text("GUITAR SYNTHESIZER")
                    .font(DesignTokens.Fonts.statusText)
                    .foregroundColor(DesignTokens.Colors.textMuted)
                    .kerning(1)
            }
        }
        .padding(.horizontal, DesignTokens.Spacing.medium)
        .padding(.vertical, DesignTokens.Spacing.small)
        .background(
            RoundedRectangle(cornerRadius: DesignTokens.Radii.small)
                .fill(DesignTokens.Colors.surface.opacity(0.3))
                .overlay(
                    RoundedRectangle(cornerRadius: DesignTokens.Radii.small)
                        .stroke(DesignTokens.Colors.border.opacity(0.5), lineWidth: 1)
                )
        )
    }
}

// MARK: - Preview
#Preview {
    GR55HardwareView()
        .frame(width: 1200, height: 800)
        .background(DesignTokens.Colors.background)
}