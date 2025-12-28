import SwiftUI

// MARK: - DisplayComponent
/// LCD-style display component showing patch information and parameters
/// Implements requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
@MainActor
struct DisplayComponent: View {
    @ObservedObject var stateManager: GR55StateManager
    @State private var isPickerPresented = false
    @State private var isEditingTempo = false
    @State private var tempoInput = ""
    @State private var currentBPM: Int = 120
    @State private var hoveredItem: HoveredItem = .none
    @State private var isEditMode = false
    @State private var editingItem: HoveredItem = .none
    
    // Callbacks for parent view
    var onHover: ((HoveredItem) -> Void)?
    var onEditModeChange: ((Bool) -> Void)?
    
    var body: some View {
        ZStack {
            // LCD bezel and background
            lcdContainer
            
            // Main content
            VStack(spacing: DesignTokens.Spacing.medium) {
                // Status bar with tone sources
                StatusBar(
                    stateManager: stateManager,
                    onHover: handleHover,
                    onEdit: handleEdit
                )
                
                // Main patch information display
                patchInfoSection
                
                // BPM control section
                bpmControlSection
                
                // Parameter grid for effects and assigns
                ParameterGrid(
                    stateManager: stateManager,
                    onHover: handleHover,
                    onEdit: handleEdit
                )
            }
            .padding(DesignTokens.Spacing.large)
        }
        .frame(
            width: DesignTokens.Dimensions.displayWidth,
            height: DesignTokens.Dimensions.displayHeight
        )
        .sheet(isPresented: $isPickerPresented) {
            PatchSelectorView(stateManager: stateManager)
        }
        .onChange(of: hoveredItem) { newValue in
            onHover?(newValue)
        }
        .onChange(of: isEditMode) { newValue in
            onEditModeChange?(newValue)
        }
    }
    
    // MARK: - LCD Container
    private var lcdContainer: some View {
        RoundedRectangle(cornerRadius: DesignTokens.Radii.medium)
            .fill(DesignTokens.Colors.lcdBackground)
            .overlay(
                RoundedRectangle(cornerRadius: DesignTokens.Radii.medium)
                    .stroke(DesignTokens.Colors.lcdBorder, lineWidth: DesignTokens.Dimensions.displayBorderWidth)
            )
            .shadow(
                color: DesignTokens.Shadows.component.color,
                radius: DesignTokens.Shadows.component.radius,
                x: DesignTokens.Shadows.component.x,
                y: DesignTokens.Shadows.component.y
            )
    }
    
    // MARK: - Patch Information Section
    private var patchInfoSection: some View {
        HStack(spacing: DesignTokens.Spacing.large) {
            // Bank display
            VStack(alignment: .leading, spacing: DesignTokens.Spacing.extraSmall) {
                Text("BANK")
                    .font(DesignTokens.Fonts.statusText)
                    .foregroundColor(DesignTokens.Colors.lcdTextMuted)
                
                Text(stateManager.state.bank)
                    .font(DesignTokens.Fonts.bankDisplay)
                    .foregroundColor(DesignTokens.Colors.lcdText)
                    .fontWeight(.black)
            }
            
            Spacer()
            
            // Patch information
            VStack(alignment: .trailing, spacing: DesignTokens.Spacing.extraSmall) {
                Text(stateManager.state.activeStyle.rawValue)
                    .font(DesignTokens.Fonts.modeText)
                    .foregroundColor(DesignTokens.Colors.lcdTextMuted)
                
                Button(stateManager.state.patchName) {
                    isPickerPresented = true
                }
                .font(DesignTokens.Fonts.patchName)
                .foregroundColor(DesignTokens.Colors.lcdText)
                .fontWeight(.bold)
                .buttonStyle(PlainButtonStyle())
            }
        }
    }
    
    // MARK: - BPM Control Section
    private var bpmControlSection: some View {
        HStack(spacing: DesignTokens.Spacing.medium) {
            Text("BPM")
                .font(DesignTokens.Fonts.parameterLabel)
                .foregroundColor(DesignTokens.Colors.lcdTextMuted)
            
            Spacer()
            
            // BPM controls
            HStack(spacing: DesignTokens.Spacing.small) {
                // Decrement button
                Button("-") {
                    decrementBPM()
                }
                .font(DesignTokens.Fonts.parameterLabel)
                .foregroundColor(DesignTokens.Colors.lcdText)
                .frame(width: 30, height: 24)
                .background(DesignTokens.Colors.buttonDefault)
                .cornerRadius(DesignTokens.Radii.small)
                .buttonStyle(PlainButtonStyle())
                
                // BPM display/input
                if isEditingTempo {
                    TextField("BPM", text: $tempoInput)
                        .font(DesignTokens.Fonts.modeText)
                        .foregroundColor(DesignTokens.Colors.lcdText)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .frame(width: 60)
                        .onSubmit {
                            commitTempoEdit()
                        }
                        .onExitCommand {
                            cancelTempoEdit()
                        }
                } else {
                    Button("\(currentBPM)") {
                        startTempoEdit()
                    }
                    .font(DesignTokens.Fonts.modeText)
                    .foregroundColor(DesignTokens.Colors.lcdText)
                    .frame(width: 60, height: 24)
                    .background(DesignTokens.Colors.surface)
                    .cornerRadius(DesignTokens.Radii.small)
                    .buttonStyle(PlainButtonStyle())
                }
                
                // Increment button
                Button("+") {
                    incrementBPM()
                }
                .font(DesignTokens.Fonts.parameterLabel)
                .foregroundColor(DesignTokens.Colors.lcdText)
                .frame(width: 30, height: 24)
                .background(DesignTokens.Colors.buttonDefault)
                .cornerRadius(DesignTokens.Radii.small)
                .buttonStyle(PlainButtonStyle())
            }
        }
    }
    
    // MARK: - Event Handlers
    private func handleHover(_ item: HoveredItem) {
        hoveredItem = item
    }
    
    private func handleEdit(_ item: HoveredItem) {
        editingItem = item
        isEditMode = item != .none
    }
    
    // MARK: - BPM Control Methods
    private func incrementBPM() {
        currentBPM = min(currentBPM + 1, 300) // Max BPM 300
    }
    
    private func decrementBPM() {
        currentBPM = max(currentBPM - 1, 40) // Min BPM 40
    }
    
    private func startTempoEdit() {
        tempoInput = "\(currentBPM)"
        isEditingTempo = true
    }
    
    private func commitTempoEdit() {
        if let newBPM = Int(tempoInput), newBPM >= 40 && newBPM <= 300 {
            currentBPM = newBPM
        }
        isEditingTempo = false
    }
    
    private func cancelTempoEdit() {
        isEditingTempo = false
        tempoInput = ""
    }
}

// MARK: - StatusBar
/// Top status bar showing tone sources with mute states
struct StatusBar: View {
    @ObservedObject var stateManager: GR55StateManager
    let onHover: (HoveredItem) -> Void
    let onEdit: (HoveredItem) -> Void
    
    private let toneSourceNames = ["PCM1", "PCM2", "MODEL", "GUITAR"]
    
    var body: some View {
        HStack(spacing: DesignTokens.Spacing.medium) {
            ForEach(toneSourceNames, id: \.self) { toneName in
                ToneSourceButton(
                    name: toneName,
                    isMuted: getToneSourceMuteState(toneName),
                    onTap: { stateManager.toggleToneSource(toneName) },
                    onHover: { onHover(.tone(toneName)) },
                    onDoubleClick: { onEdit(.tone(toneName)) }
                )
            }
            
            Spacer()
            
            // Connection status indicator
            Circle()
                .fill(DesignTokens.Colors.success)
                .frame(width: 8, height: 8)
                .shadow(color: DesignTokens.Colors.success, radius: 2)
        }
    }
    
    private func getToneSourceMuteState(_ toneName: String) -> Bool {
        switch toneName {
        case "PCM1": return stateManager.state.pcm1Muted
        case "PCM2": return stateManager.state.pcm2Muted
        case "MODEL": return stateManager.state.modelMuted
        case "GUITAR": return stateManager.state.normalPuMuted
        default: return false
        }
    }
}

// MARK: - ToneSourceButton
/// Individual tone source button with mute state
struct ToneSourceButton: View {
    let name: String
    let isMuted: Bool
    let onTap: () -> Void
    let onHover: () -> Void
    let onDoubleClick: () -> Void
    
    @State private var isHovered = false
    
    var body: some View {
        Button(name) {
            onTap()
        }
        .font(DesignTokens.Fonts.statusText)
        .foregroundColor(isMuted ? DesignTokens.Colors.lcdTextMuted : DesignTokens.Colors.lcdText)
        .padding(.horizontal, DesignTokens.Spacing.small)
        .padding(.vertical, DesignTokens.Spacing.extraSmall)
        .background(
            RoundedRectangle(cornerRadius: DesignTokens.Radii.small)
                .fill(isMuted ? DesignTokens.Colors.error.opacity(0.2) : DesignTokens.Colors.success.opacity(0.2))
                .overlay(
                    RoundedRectangle(cornerRadius: DesignTokens.Radii.small)
                        .stroke(isMuted ? DesignTokens.Colors.error : DesignTokens.Colors.success, lineWidth: 1)
                )
        )
        .scaleEffect(isHovered ? 1.05 : 1.0)
        .animation(DesignTokens.Animations.buttonPress, value: isHovered)
        .onHover { hovering in
            isHovered = hovering
            if hovering {
                onHover()
            }
        }
        .onTapGesture(count: 2) {
            onDoubleClick()
        }
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - ParameterGrid
/// Grid of effect buttons and assign switches
struct ParameterGrid: View {
    @ObservedObject var stateManager: GR55StateManager
    let onHover: (HoveredItem) -> Void
    let onEdit: (HoveredItem) -> Void
    
    private let effectNames = ["MFX", "DELAY", "CHORUS", "REVERB", "AMP", "NS", "MOD", "EQ"]
    
    var body: some View {
        VStack(spacing: DesignTokens.Spacing.small) {
            // Effect buttons row
            HStack(spacing: DesignTokens.Spacing.small) {
                ForEach(effectNames, id: \.self) { effectName in
                    EffectButton(
                        name: effectName,
                        isOn: getEffectState(effectName),
                        onTap: { stateManager.toggleEffect(effectName) },
                        onHover: { onHover(.effect(effectName)) },
                        onDoubleClick: { onEdit(.effect(effectName)) }
                    )
                }
            }
            
            // Assign switches row
            HStack(spacing: DesignTokens.Spacing.small) {
                ForEach(1...8, id: \.self) { assignNumber in
                    AssignButton(
                        number: assignNumber,
                        isOn: stateManager.state.assignStates[assignNumber - 1],
                        onTap: { stateManager.toggleAssign(assignNumber) },
                        onHover: { onHover(.assign(assignNumber)) },
                        onDoubleClick: { onEdit(.assign(assignNumber)) }
                    )
                }
            }
        }
    }
    
    private func getEffectState(_ effectName: String) -> Bool {
        switch effectName {
        case "MFX": return stateManager.state.mfxOn
        case "DELAY": return stateManager.state.delayOn
        case "CHORUS": return stateManager.state.chorusOn
        case "REVERB": return stateManager.state.reverbOn
        case "AMP": return stateManager.state.ampOn
        case "NS": return stateManager.state.nsOn
        case "MOD": return stateManager.state.modOn
        case "EQ": return stateManager.state.eqOn
        default: return false
        }
    }
}

// MARK: - EffectButton
/// Individual effect button with on/off state
struct EffectButton: View {
    let name: String
    let isOn: Bool
    let onTap: () -> Void
    let onHover: () -> Void
    let onDoubleClick: () -> Void
    
    @State private var isHovered = false
    @State private var isPressed = false
    
    var body: some View {
        Button(name) {
            onTap()
        }
        .font(DesignTokens.Fonts.statusText)
        .foregroundColor(isOn ? DesignTokens.Colors.lcdText : DesignTokens.Colors.lcdTextMuted)
        .frame(width: 40, height: 20)
        .background(
            RoundedRectangle(cornerRadius: DesignTokens.Radii.small)
                .fill(isOn ? DesignTokens.Colors.accent.opacity(0.3) : DesignTokens.Colors.surface)
                .overlay(
                    RoundedRectangle(cornerRadius: DesignTokens.Radii.small)
                        .stroke(isOn ? DesignTokens.Colors.accent : DesignTokens.Colors.border, lineWidth: 1)
                )
        )
        .scaleEffect(isPressed ? 0.95 : (isHovered ? 1.05 : 1.0))
        .animation(DesignTokens.Animations.buttonPress, value: isPressed)
        .animation(DesignTokens.Animations.buttonPress, value: isHovered)
        .onHover { hovering in
            isHovered = hovering
            if hovering {
                onHover()
            }
        }
        .onTapGesture(count: 2) {
            onDoubleClick()
        }
        .onLongPressGesture(minimumDuration: 0, maximumDistance: .infinity, pressing: { pressing in
            isPressed = pressing
        }, perform: {})
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - AssignButton
/// Individual assign switch button
struct AssignButton: View {
    let number: Int
    let isOn: Bool
    let onTap: () -> Void
    let onHover: () -> Void
    let onDoubleClick: () -> Void
    
    @State private var isHovered = false
    @State private var isPressed = false
    
    var body: some View {
        Button("\(number)") {
            onTap()
        }
        .font(DesignTokens.Fonts.statusText)
        .foregroundColor(isOn ? DesignTokens.Colors.lcdText : DesignTokens.Colors.lcdTextMuted)
        .frame(width: 30, height: 20)
        .background(
            RoundedRectangle(cornerRadius: DesignTokens.Radii.small)
                .fill(isOn ? DesignTokens.Colors.success.opacity(0.3) : DesignTokens.Colors.surface)
                .overlay(
                    RoundedRectangle(cornerRadius: DesignTokens.Radii.small)
                        .stroke(isOn ? DesignTokens.Colors.success : DesignTokens.Colors.border, lineWidth: 1)
                )
        )
        .scaleEffect(isPressed ? 0.95 : (isHovered ? 1.05 : 1.0))
        .animation(DesignTokens.Animations.buttonPress, value: isPressed)
        .animation(DesignTokens.Animations.buttonPress, value: isHovered)
        .onHover { hovering in
            isHovered = hovering
            if hovering {
                onHover()
            }
        }
        .onTapGesture(count: 2) {
            onDoubleClick()
        }
        .onLongPressGesture(minimumDuration: 0, maximumDistance: .infinity, pressing: { pressing in
            isPressed = pressing
        }, perform: {})
        .buttonStyle(PlainButtonStyle())
    }
}

// MARK: - PatchSelectorView
/// Modal view for patch selection
struct PatchSelectorView: View {
    @ObservedObject var stateManager: GR55StateManager
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationView {
            VStack(spacing: DesignTokens.Spacing.large) {
                Text("Select Patch")
                    .font(DesignTokens.Fonts.previewTitle)
                    .foregroundColor(DesignTokens.Colors.textPrimary)
                
                // Placeholder for patch list
                ScrollView {
                    LazyVStack(spacing: DesignTokens.Spacing.small) {
                        ForEach(1...50, id: \.self) { patchNumber in
                            Button("Patch \(patchNumber)") {
                                stateManager.setPatchName("Patch \(patchNumber)")
                                dismiss()
                            }
                            .font(DesignTokens.Fonts.previewBody)
                            .foregroundColor(DesignTokens.Colors.textPrimary)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(DesignTokens.Spacing.medium)
                            .background(DesignTokens.Colors.surface)
                            .cornerRadius(DesignTokens.Radii.small)
                        }
                    }
                    .padding(DesignTokens.Spacing.medium)
                }
                
                Spacer()
            }
            .background(DesignTokens.Colors.background)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
}

// MARK: - DisplayComponent Extensions
extension DisplayComponent {
    /// Creates a DisplayComponent with hover callback
    func onHover(_ callback: @escaping (HoveredItem) -> Void) -> DisplayComponent {
        var component = self
        component.onHover = callback
        return component
    }
    
    /// Creates a DisplayComponent with edit mode callback
    func onEditModeChange(_ callback: @escaping (Bool) -> Void) -> DisplayComponent {
        var component = self
        component.onEditModeChange = callback
        return component
    }
}

// MARK: - Preview
#Preview {
    DisplayComponent(stateManager: GR55StateManager())
        .frame(width: 500, height: 300)
        .background(DesignTokens.Colors.chassis)
}