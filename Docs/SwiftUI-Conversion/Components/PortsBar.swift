import SwiftUI

// MARK: - PortsBar Component
/// Top connection labels display for the GR55 hardware interface
/// Shows connection ports and guitar output source information
/// Follows Swift 6.2 patterns with proper concurrency support
@MainActor
struct PortsBar: View {
    let guitarOutSource: String
    
    var body: some View {
        HStack {
            // Left side - Connections label
            Text("Connections :")
                .font(DesignTokens.Fonts.statusText)
                .foregroundColor(DesignTokens.Colors.textMuted)
                .textCase(.uppercase)
                .kerning(1.2)
            
            Spacer()
            
            // Right side - Port labels
            HStack(spacing: DesignTokens.Spacing.extraLarge) {
                PortLabel(text: "DC IN")
                PortLabel(text: "POWER")
                PortLabel(text: "USB COMPUTER")
                PortLabel(text: "MIDI IN/OUT")
                PortLabel(text: "PHONES")
                PortLabel(text: "L/MONO OUTPUT R")
                
                // Guitar output with dynamic source
                GuitarOutputLabel(source: guitarOutSource)
                
                PortLabel(text: "GK IN")
            }
        }
        .padding(.horizontal, DesignTokens.Spacing.large)
        .frame(height: 30)
        .background(
            RoundedRectangle(cornerRadius: DesignTokens.Radii.small)
                .fill(DesignTokens.Colors.surface.opacity(0.3))
        )
    }
}

// MARK: - Port Label Component
/// Individual port label with consistent styling
private struct PortLabel: View {
    let text: String
    
    var body: some View {
        Text(text)
            .font(DesignTokens.Fonts.statusText)
            .foregroundColor(DesignTokens.Colors.textMuted)
            .textCase(.uppercase)
            .kerning(1.2)
    }
}

// MARK: - Guitar Output Label Component
/// Special label for guitar output with dynamic source display
private struct GuitarOutputLabel: View {
    let source: String
    
    var body: some View {
        VStack(spacing: 2) {
            // Dynamic source value
            Text(source.isEmpty ? "—" : source)
                .font(DesignTokens.Fonts.statusText)
                .foregroundColor(DesignTokens.Colors.accent)
                .textCase(.uppercase)
                .kerning(1.2)
            
            // Static label
            Text("GUITAR OUT")
                .font(DesignTokens.Fonts.statusText)
                .foregroundColor(DesignTokens.Colors.textMuted)
                .textCase(.uppercase)
                .kerning(1.2)
        }
    }
}

// MARK: - Preview
#Preview {
    VStack(spacing: 20) {
        PortsBar(guitarOutSource: "NORMAL PU")
        PortsBar(guitarOutSource: "MODEL")
        PortsBar(guitarOutSource: "")
    }
    .padding()
    .background(DesignTokens.Colors.chassis)
}