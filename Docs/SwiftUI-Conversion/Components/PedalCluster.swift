import SwiftUI

// MARK: - PedalCluster Component
/// Horizontal layout of four foot pedals with coordinated interactions
/// Implements single-tap vs double-tap behaviors for bank navigation
/// Includes AudioPlayerSection with branding elements
/// Follows Swift 6.2 patterns with proper state management
struct PedalCluster: View {
    // MARK: - Properties
    @ObservedObject var stateManager: GR55StateManager
    
    // MARK: - Body
    var body: some View {
        VStack(spacing: DesignTokens.Spacing.medium) {
            // Main pedal layout
            pedalLayout
            
            // Audio player section with branding
            AudioPlayerSection()
        }
    }
    
    // MARK: - Pedal Layout
    private var pedalLayout: some View {
        HStack(spacing: DesignTokens.Spacing.large) {
            // Pedals 1-3 with bank navigation
            ForEach(1...3, id: \.self) { pedalNumber in
                FootPedal(
                    number: pedalNumber,
                    isActive: stateManager.currentState.activePedal == pedalNumber,
                    topLabel: getPatchNameForPedal(pedalNumber),
                    subLabel: getSubLabelForPedal(pedalNumber),
                    onSingleTap: {
                        handlePedalSingleTap(pedalNumber)
                    },
                    onDoubleTap: getDoubleTapHandler(for: pedalNumber)
                )
            }
            
            // CTL Pedal with toggle functionality
            FootPedal(
                isCtlActive: stateManager.currentState.ctlStatus,
                ctlFunction: stateManager.currentState.ctlFunction,
                subLabel: "REC/PLAY/DUB",
                onCtlToggle: {
                    handleCtlPedalTap()
                }
            )
        }
    }
    
    // MARK: - Pedal Interaction Handlers
    
    /// Handles single tap on numbered pedals (1-3)
    /// Selects the corresponding ordinal in current bank
    private func handlePedalSingleTap(_ pedalNumber: Int) {
        // Select ordinal in current bank
        stateManager.selectOrdinalInCurrentBank(pedalNumber)
        
        // Provide haptic feedback
        let impactFeedback = UIImpactFeedbackGenerator(style: .medium)
        impactFeedback.impactOccurred()
    }
    
    /// Handles CTL pedal tap
    /// Toggles CTL status and updates function display
    private func handleCtlPedalTap() {
        stateManager.toggleCtlPedal()
        
        // Provide haptic feedback
        let impactFeedback = UIImpactFeedbackGenerator(style: .medium)
        impactFeedback.impactOccurred()
    }
    
    /// Returns double tap handler for pedals 1 and 2 (bank navigation)
    /// Pedal 3 doesn't have double tap functionality
    private func getDoubleTapHandler(for pedalNumber: Int) -> (() -> Void)? {
        switch pedalNumber {
        case 1:
            return {
                handlePedalDoubleTap(.next)
            }
        case 2:
            return {
                handlePedalDoubleTap(.previous)
            }
        case 3:
            return nil // Pedal 3 doesn't have double tap functionality
        default:
            return nil
        }
    }
    
    /// Handles double tap for bank navigation
    /// Pedal 1 double-tap: next bank, Pedal 2 double-tap: previous bank
    private func handlePedalDoubleTap(_ direction: BankNavigationDirection) {
        switch direction {
        case .next:
            stateManager.gotoNextBank()
        case .previous:
            stateManager.gotoPrevBank()
        }
        
        // Provide stronger haptic feedback for double tap
        let impactFeedback = UIImpactFeedbackGenerator(style: .heavy)
        impactFeedback.impactOccurred()
    }
    
    // MARK: - Label Generation
    
    /// Gets patch name for pedal from bank slots
    private func getPatchNameForPedal(_ pedalNumber: Int) -> String? {
        guard let bankSlots = stateManager.currentState.bankSlots,
              pedalNumber <= bankSlots.count else {
            return "PATCH \(pedalNumber)"
        }
        
        return bankSlots[pedalNumber - 1].name
    }
    
    /// Gets sub label for pedal based on patch type or special functions
    private func getSubLabelForPedal(_ pedalNumber: Int) -> String? {
        // Only pedal 3 typically has a sub label in the original design
        if pedalNumber == 3 {
            return "BASS GUITAR"
        }
        return nil
    }
}

// MARK: - AudioPlayerSection Component
/// Branding and audio player section below the pedals
/// Provides visual balance and additional hardware authenticity
struct AudioPlayerSection: View {
    var body: some View {
        HStack(spacing: DesignTokens.Spacing.large) {
            // Left branding
            brandingSection
            
            Spacer()
            
            // Right audio controls (placeholder for future implementation)
            audioControlsSection
        }
        .padding(.horizontal, DesignTokens.Spacing.medium)
        .padding(.vertical, DesignTokens.Spacing.small)
        .background(
            RoundedRectangle(cornerRadius: DesignTokens.Radii.small)
                .fill(DesignTokens.Colors.surface)
                .overlay(
                    RoundedRectangle(cornerRadius: DesignTokens.Radii.small)
                        .stroke(DesignTokens.Colors.border, lineWidth: 1)
                )
        )
    }
    
    // MARK: - Branding Section
    private var brandingSection: some View {
        HStack(spacing: DesignTokens.Spacing.medium) {
            // Roland logo area
            VStack(alignment: .leading, spacing: 2) {
                Text("ROLAND")
                    .font(DesignTokens.Fonts.parameterLabel)
                    .fontWeight(.black)
                    .foregroundColor(DesignTokens.Colors.accent)
                
                Text("GUITAR SYNTHESIZER")
                    .font(DesignTokens.Fonts.statusText)
                    .foregroundColor(DesignTokens.Colors.textMuted)
            }
            
            // Model designation
            VStack(alignment: .leading, spacing: 2) {
                Text("GR-55")
                    .font(DesignTokens.Fonts.parameterLabel)
                    .fontWeight(.black)
                    .foregroundColor(DesignTokens.Colors.textPrimary)
                
                Text("GUITAR SYNTHESIZER")
                    .font(DesignTokens.Fonts.statusText)
                    .foregroundColor(DesignTokens.Colors.textMuted)
            }
        }
    }
    
    // MARK: - Audio Controls Section
    private var audioControlsSection: some View {
        HStack(spacing: DesignTokens.Spacing.small) {
            // Audio player indicators (decorative)
            ForEach(0..<3, id: \.self) { index in
                Circle()
                    .fill(index == 1 ? DesignTokens.Colors.ledActive : DesignTokens.Colors.ledInactive)
                    .frame(width: 8, height: 8)
                    .shadow(
                        color: index == 1 ? DesignTokens.Colors.ledGlow : .clear,
                        radius: index == 1 ? 4 : 0
                    )
            }
            
            Text("AUDIO PLAYER")
                .font(DesignTokens.Fonts.statusText)
                .foregroundColor(DesignTokens.Colors.textMuted)
        }
    }
}

// MARK: - Supporting Types

/// Direction for bank navigation via double-tap
private enum BankNavigationDirection {
    case next
    case previous
}

// MARK: - Preview Support
#if DEBUG
struct PedalClusterPreview: View {
    @StateObject private var stateManager = GR55StateManager()
    
    var body: some View {
        VStack(spacing: DesignTokens.Spacing.large) {
            Text("PedalCluster Component Preview")
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(DesignTokens.Colors.textPrimary)
            
            PedalCluster(stateManager: stateManager)
            
            // Test controls
            VStack(spacing: DesignTokens.Spacing.medium) {
                Text("Test Controls")
                    .font(.headline)
                    .foregroundColor(DesignTokens.Colors.textSecondary)
                
                HStack(spacing: DesignTokens.Spacing.medium) {
                    Button("Next Bank") {
                        stateManager.gotoNextBank()
                    }
                    .buttonStyle(.bordered)
                    .tint(DesignTokens.Colors.accent)
                    
                    Button("Prev Bank") {
                        stateManager.gotoPrevBank()
                    }
                    .buttonStyle(.bordered)
                    .tint(DesignTokens.Colors.accent)
                    
                    Button("Toggle CTL") {
                        stateManager.toggleCtlPedal()
                    }
                    .buttonStyle(.bordered)
                    .tint(stateManager.currentState.ctlStatus ? DesignTokens.Colors.accent : DesignTokens.Colors.buttonDefault)
                }
                
                HStack(spacing: DesignTokens.Spacing.medium) {
                    ForEach(1...3, id: \.self) { pedal in
                        Button("Pedal \(pedal)") {
                            stateManager.selectOrdinalInCurrentBank(pedal)
                        }
                        .buttonStyle(.bordered)
                        .tint(stateManager.currentState.activePedal == pedal ? DesignTokens.Colors.accent : DesignTokens.Colors.buttonDefault)
                    }
                }
                
                // Current state display
                VStack(alignment: .leading, spacing: DesignTokens.Spacing.small) {
                    Text("Current State:")
                        .font(.headline)
                        .foregroundColor(DesignTokens.Colors.textPrimary)
                    
                    Text("Active Pedal: \(stateManager.currentState.activePedal)")
                        .font(.body)
                        .foregroundColor(DesignTokens.Colors.textSecondary)
                    
                    Text("Bank: \(stateManager.currentState.bank)")
                        .font(.body)
                        .foregroundColor(DesignTokens.Colors.textSecondary)
                    
                    Text("CTL Status: \(stateManager.currentState.ctlStatus ? "Active" : "Inactive")")
                        .font(.body)
                        .foregroundColor(DesignTokens.Colors.textSecondary)
                    
                    Text("Style: \(stateManager.currentState.activeStyle.rawValue)")
                        .font(.body)
                        .foregroundColor(DesignTokens.Colors.textSecondary)
                }
                .padding(DesignTokens.Spacing.medium)
                .background(
                    RoundedRectangle(cornerRadius: DesignTokens.Radii.medium)
                        .fill(DesignTokens.Colors.surface)
                        .overlay(
                            RoundedRectangle(cornerRadius: DesignTokens.Radii.medium)
                                .stroke(DesignTokens.Colors.border, lineWidth: 1)
                        )
                )
            }
        }
        .padding(DesignTokens.Spacing.large)
        .background(DesignTokens.Colors.chassis)
        .preferredColorScheme(.dark)
    }
}

#Preview {
    PedalClusterPreview()
}
#endif