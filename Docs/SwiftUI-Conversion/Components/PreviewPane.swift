import SwiftUI

// MARK: - PreviewPane Component
/// Contextual information overlay for effects, tones, and assigns
/// Displays detailed parameter information when hovering over interface elements
/// Supports both preview mode and edit mode transitions
/// Follows Swift 6.2 patterns with proper concurrency support
@MainActor
struct PreviewPane: View {
    let hoveredItem: HoveredItem
    let isEditMode: Bool
    
    @State private var isVisible = false
    
    var body: some View {
        Group {
            if shouldShowPane {
                GeometryReader { geometry in
                    VStack {
                        Spacer()
                        
                        HStack {
                            Spacer()
                            
                            // Preview card positioned to the right
                            PreviewCard(
                                hoveredItem: hoveredItem,
                                isEditMode: isEditMode
                            )
                            .frame(
                                maxWidth: DesignTokens.Dimensions.previewPaneMaxWidth,
                                minHeight: DesignTokens.Dimensions.previewPaneMinHeight
                            )
                            .transition(.asymmetric(
                                insertion: .opacity.combined(with: .scale(scale: 0.95)),
                                removal: .opacity
                            ))
                            
                            Spacer()
                        }
                        
                        Spacer()
                    }
                }
                .animation(DesignTokens.Animations.stateChange, value: hoveredItem)
                .animation(DesignTokens.Animations.stateChange, value: isEditMode)
            }
        }
        .onChange(of: hoveredItem) { _, newValue in
            isVisible = newValue != .none || isEditMode
        }
        .onChange(of: isEditMode) { _, newValue in
            isVisible = newValue || hoveredItem != .none
        }
    }
    
    private var shouldShowPane: Bool {
        hoveredItem != .none || isEditMode
    }
}

// MARK: - Preview Card Component
/// Main card container for preview content
private struct PreviewCard: View {
    let hoveredItem: HoveredItem
    let isEditMode: Bool
    
    var body: some View {
        RoundedRectangle(cornerRadius: DesignTokens.Radii.medium)
            .fill(Color.white)
            .shadow(
                color: DesignTokens.Shadows.preview.color,
                radius: DesignTokens.Shadows.preview.radius,
                x: DesignTokens.Shadows.preview.x,
                y: DesignTokens.Shadows.preview.y
            )
            .overlay(
                ScrollView {
                    VStack(alignment: .leading, spacing: DesignTokens.Spacing.medium) {
                        // Header
                        PreviewHeader(hoveredItem: hoveredItem, isEditMode: isEditMode)
                        
                        // Content based on item type
                        PreviewContent(hoveredItem: hoveredItem, isEditMode: isEditMode)
                        
                        // Edit mode controls
                        if isEditMode {
                            EditModeControls()
                        }
                    }
                    .padding(DesignTokens.Spacing.large)
                }
            )
    }
}

// MARK: - Preview Header Component
/// Header section with title and status
private struct PreviewHeader: View {
    let hoveredItem: HoveredItem
    let isEditMode: Bool
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(isEditMode ? "EDIT MODE" : "PREVIEW")
                    .font(DesignTokens.Fonts.previewCaption)
                    .foregroundColor(.gray)
                    .textCase(.uppercase)
                
                Text(headerTitle)
                    .font(DesignTokens.Fonts.previewTitle)
                    .foregroundColor(.black)
                
                if let effectType = effectTypeBadge {
                    EffectTypeBadge(text: effectType)
                }
            }
            
            Spacer()
            
            // Status indicator
            HStack(spacing: 8) {
                Text("ON")
                    .font(DesignTokens.Fonts.previewCaption)
                    .foregroundColor(.gray)
                
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.gray.opacity(0.3))
                    .frame(width: 40, height: 24)
            }
        }
        .padding(.bottom, DesignTokens.Spacing.medium)
        .overlay(
            Rectangle()
                .fill(Color.gray.opacity(0.2))
                .frame(height: 1),
            alignment: .bottom
        )
    }
    
    private var headerTitle: String {
        switch hoveredItem {
        case .effect(let name):
            return name.uppercased()
        case .tone(let name):
            return name.uppercased()
        case .assign(let number):
            return "ASSIGN \(number)"
        case .none:
            return "PREVIEW"
        }
    }
    
    private var effectTypeBadge: String? {
        switch hoveredItem {
        case .effect(let name):
            return getEffectType(name)
        case .tone(let name):
            return getToneType(name)
        default:
            return nil
        }
    }
    
    private func getEffectType(_ effectName: String) -> String {
        switch effectName.uppercased() {
        case "MOD": return "PHASER"
        case "MFX": return "EQ"
        case "DELAY": return "STEREO"
        case "CHORUS": return "MONO"
        case "REVERB": return "HALL"
        case "AMP": return "JC-120"
        case "NS": return "NOISE SUPPRESSOR"
        case "EQ": return "EQUALIZER"
        default: return effectName
        }
    }
    
    private func getToneType(_ toneName: String) -> String {
        switch toneName.uppercased() {
        case "GUITAR": return "NORMAL PU"
        case "PCM1": return "A.PIANO 1"
        case "PCM2": return "STRINGS 1"
        case "MODEL": return "E.GTR"
        default: return toneName
        }
    }
}

// MARK: - Effect Type Badge Component
/// Badge showing effect or tone type
private struct EffectTypeBadge: View {
    let text: String
    
    var body: some View {
        Text(text)
            .font(DesignTokens.Fonts.previewCaption)
            .foregroundColor(DesignTokens.Colors.accent)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(
                RoundedRectangle(cornerRadius: 4)
                    .fill(DesignTokens.Colors.accent.opacity(0.1))
                    .overlay(
                        RoundedRectangle(cornerRadius: 4)
                            .stroke(DesignTokens.Colors.accent, lineWidth: 1)
                    )
            )
    }
}

// MARK: - Preview Content Component
/// Main content area showing parameters
private struct PreviewContent: View {
    let hoveredItem: HoveredItem
    let isEditMode: Bool
    
    var body: some View {
        VStack(alignment: .leading, spacing: DesignTokens.Spacing.medium) {
            switch hoveredItem {
            case .effect(let name):
                EffectPreviewContent(effectName: name, isEditMode: isEditMode)
            case .tone(let name):
                TonePreviewContent(toneName: name, isEditMode: isEditMode)
            case .assign(let number):
                AssignPreviewContent(assignNumber: number, isEditMode: isEditMode)
            case .none:
                EmptyPreviewContent()
            }
        }
    }
}

// MARK: - Effect Preview Content
/// Content for effect parameters
private struct EffectPreviewContent: View {
    let effectName: String
    let isEditMode: Bool
    
    var body: some View {
        VStack(alignment: .leading, spacing: DesignTokens.Spacing.small) {
            switch effectName.uppercased() {
            case "MOD":
                ParameterRow(label: "Type", value: "PHASER")
                ParameterRow(label: "Rate", value: "2.5 Hz")
                ParameterRow(label: "Depth", value: "75")
                ParameterRow(label: "Resonance", value: "50")
                ParameterRow(label: "Level", value: "85")
                
            case "MFX":
                ParameterRow(label: "Low Freq", value: "100 Hz")
                ParameterRow(label: "Low Gain", value: "+3 dB")
                ParameterRow(label: "Mid Freq", value: "800 Hz")
                ParameterRow(label: "Mid Gain", value: "-2 dB")
                ParameterRow(label: "High Freq", value: "5.0 kHz")
                ParameterRow(label: "High Gain", value: "+5 dB")
                ParameterRow(label: "Level", value: "90")
                
            case "DELAY":
                ParameterRow(label: "Type", value: "STEREO")
                ParameterRow(label: "Time", value: "450 ms")
                ParameterRow(label: "Feedback", value: "40")
                ParameterRow(label: "HF Damp", value: "6.3 kHz")
                ParameterRow(label: "Effect Level", value: "75")
                
            case "CHORUS":
                ParameterRow(label: "Type", value: "MONO")
                ParameterRow(label: "Rate", value: "1.5 Hz")
                ParameterRow(label: "Depth", value: "60")
                ParameterRow(label: "Effect Level", value: "70")
                
            case "REVERB":
                ParameterRow(label: "Type", value: "HALL")
                ParameterRow(label: "Time", value: "3.5 s")
                ParameterRow(label: "High Cut", value: "8.0 kHz")
                ParameterRow(label: "Effect Level", value: "65")
                
            case "AMP":
                ParameterRow(label: "Type", value: "JC-120")
                ParameterRow(label: "Gain", value: "50")
                ParameterRow(label: "Bass", value: "55")
                ParameterRow(label: "Middle", value: "60")
                ParameterRow(label: "Treble", value: "65")
                ParameterRow(label: "Presence", value: "50")
                ParameterRow(label: "Level", value: "80")
                
            case "NS":
                ParameterRow(label: "Threshold", value: "25")
                ParameterRow(label: "Release", value: "40 ms")
                
            case "EQ":
                ParameterRow(label: "Low Cutoff", value: "200 Hz")
                ParameterRow(label: "Low Gain", value: "+2 dB")
                ParameterRow(label: "Low Mid Freq", value: "800 Hz")
                ParameterRow(label: "Low Mid Gain", value: "-1 dB")
                ParameterRow(label: "High Mid Freq", value: "3.2 kHz")
                ParameterRow(label: "High Mid Gain", value: "+3 dB")
                ParameterRow(label: "High Gain", value: "+1 dB")
                
            default:
                ParameterRow(label: "Type", value: effectName)
                ParameterRow(label: "Level", value: "100")
            }
        }
    }
}

// MARK: - Tone Preview Content
/// Content for tone source parameters
private struct TonePreviewContent: View {
    let toneName: String
    let isEditMode: Bool
    
    var body: some View {
        VStack(alignment: .leading, spacing: DesignTokens.Spacing.small) {
            switch toneName.uppercased() {
            case "GUITAR":
                ParameterRow(label: "Level", value: "100")
                
            case "PCM1":
                ParameterRow(label: "Tone", value: "A.PIANO 1")
                ParameterRow(label: "Level", value: "90")
                ParameterRow(label: "Octave Shift", value: "0")
                ParameterRow(label: "Pan", value: "CENTER")
                ParameterRow(label: "Coarse Tune", value: "0")
                
            case "PCM2":
                ParameterRow(label: "Tone", value: "STRINGS 1")
                ParameterRow(label: "Level", value: "85")
                ParameterRow(label: "Octave Shift", value: "+1")
                ParameterRow(label: "Pan", value: "CENTER")
                ParameterRow(label: "Coarse Tune", value: "0")
                
            case "MODEL":
                ParameterRow(label: "Category", value: "E.GTR")
                ParameterRow(label: "Tone", value: "ST SINGLE 1")
                ParameterRow(label: "Level", value: "95")
                ParameterRow(label: "12-String", value: "OFF")
                
            default:
                ParameterRow(label: "Tone", value: toneName)
                ParameterRow(label: "Level", value: "100")
            }
        }
    }
}

// MARK: - Assign Preview Content
/// Content for assign parameters
private struct AssignPreviewContent: View {
    let assignNumber: Int
    let isEditMode: Bool
    
    var body: some View {
        VStack(alignment: .leading, spacing: DesignTokens.Spacing.small) {
            ParameterRow(label: "Target", value: "MFX Level")
            ParameterRow(label: "Target Min", value: "0")
            ParameterRow(label: "Target Max", value: "100")
            ParameterRow(label: "Source", value: "CC#11 (Expression)")
            ParameterRow(label: "Active Range Lo", value: "0")
            ParameterRow(label: "Active Range Hi", value: "127")
        }
    }
}

// MARK: - Empty Preview Content
/// Placeholder content when no item is hovered
private struct EmptyPreviewContent: View {
    var body: some View {
        VStack {
            Text("Hover over interface elements to see parameter details")
                .font(DesignTokens.Fonts.previewBody)
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
        }
        .frame(minHeight: 100)
    }
}

// MARK: - Parameter Row Component
/// Individual parameter display row
private struct ParameterRow: View {
    let label: String
    let value: String
    
    var body: some View {
        HStack {
            Text(label)
                .font(DesignTokens.Fonts.previewBody)
                .foregroundColor(.gray)
            
            Spacer()
            
            Text(value)
                .font(DesignTokens.Fonts.previewBody)
                .foregroundColor(DesignTokens.Colors.accent)
                .fontWeight(.semibold)
        }
        .padding(.vertical, 2)
    }
}

// MARK: - Edit Mode Controls
/// Controls shown in edit mode
private struct EditModeControls: View {
    var body: some View {
        VStack(spacing: DesignTokens.Spacing.medium) {
            Divider()
            
            HStack(spacing: DesignTokens.Spacing.medium) {
                Button("Cancel") {
                    // Handle cancel action
                }
                .font(DesignTokens.Fonts.previewBody)
                .foregroundColor(.gray)
                .padding(.horizontal, DesignTokens.Spacing.medium)
                .padding(.vertical, DesignTokens.Spacing.small)
                .background(
                    RoundedRectangle(cornerRadius: DesignTokens.Radii.small)
                        .stroke(Color.gray, lineWidth: 1)
                )
                
                Spacer()
                
                Button("Save") {
                    // Handle save action
                }
                .font(DesignTokens.Fonts.previewBody)
                .foregroundColor(.white)
                .padding(.horizontal, DesignTokens.Spacing.medium)
                .padding(.vertical, DesignTokens.Spacing.small)
                .background(
                    RoundedRectangle(cornerRadius: DesignTokens.Radii.small)
                        .fill(DesignTokens.Colors.accent)
                )
            }
        }
    }
}

// MARK: - Preview
#Preview {
    ZStack {
        Color.gray.opacity(0.3)
        
        VStack(spacing: 20) {
            PreviewPane(hoveredItem: .effect("MFX"), isEditMode: false)
            PreviewPane(hoveredItem: .tone("PCM1"), isEditMode: false)
            PreviewPane(hoveredItem: .assign(1), isEditMode: true)
        }
    }
    .frame(width: 800, height: 600)
}