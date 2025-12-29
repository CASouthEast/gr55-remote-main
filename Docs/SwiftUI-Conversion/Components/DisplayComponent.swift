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
/// Comprehensive modal view for patch selection with search and filtering capabilities
/// Implements requirement 3.7 for patch selection interface
@MainActor
struct PatchSelectorView: View {
    @ObservedObject var stateManager: GR55StateManager
    @Environment(\.dismiss) private var dismiss
    
    // Search and filtering state
    @State private var searchText = ""
    @State private var selectedCategory: PatchCategory = .all
    @State private var selectedStyle: SoundStyle? = nil
    @State private var isLoading = false
    
    // Patch data
    @State private var patches: [PatchInfo] = []
    @State private var filteredPatches: [PatchInfo] = []
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Header with search and filters
                headerSection
                
                // Category filter tabs
                categoryFilterSection
                
                // Style filter (if applicable)
                if selectedCategory != .all {
                    styleFilterSection
                }
                
                // Patch list
                patchListSection
            }
            .background(DesignTokens.Colors.background)
            .navigationTitle("Select Patch")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                    .foregroundColor(DesignTokens.Colors.accent)
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                    .foregroundColor(DesignTokens.Colors.accent)
                    .fontWeight(.semibold)
                }
            }
        }
        .task {
            await loadPatches()
        }
        .onChange(of: searchText) { _ in
            filterPatches()
        }
        .onChange(of: selectedCategory) { _ in
            filterPatches()
        }
        .onChange(of: selectedStyle) { _ in
            filterPatches()
        }
    }
    
    // MARK: - Header Section
    private var headerSection: some View {
        VStack(spacing: DesignTokens.Spacing.medium) {
            // Search bar
            HStack {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(DesignTokens.Colors.textMuted)
                    .font(.system(size: 16, weight: .medium))
                
                TextField("Search patches...", text: $searchText)
                    .textFieldStyle(PlainTextFieldStyle())
                    .font(DesignTokens.Fonts.previewBody)
                    .foregroundColor(DesignTokens.Colors.textPrimary)
                
                if !searchText.isEmpty {
                    Button("Clear") {
                        searchText = ""
                    }
                    .foregroundColor(DesignTokens.Colors.accent)
                    .font(DesignTokens.Fonts.previewCaption)
                }
            }
            .padding(DesignTokens.Spacing.medium)
            .background(DesignTokens.Colors.surface)
            .cornerRadius(DesignTokens.Radii.medium)
            
            // Current selection info
            HStack {
                VStack(alignment: .leading, spacing: DesignTokens.Spacing.extraSmall) {
                    Text("Current Patch")
                        .font(DesignTokens.Fonts.previewCaption)
                        .foregroundColor(DesignTokens.Colors.textMuted)
                    
                    Text(stateManager.state.patchName)
                        .font(DesignTokens.Fonts.previewBody)
                        .foregroundColor(DesignTokens.Colors.textPrimary)
                        .fontWeight(.semibold)
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: DesignTokens.Spacing.extraSmall) {
                    Text("Bank")
                        .font(DesignTokens.Fonts.previewCaption)
                        .foregroundColor(DesignTokens.Colors.textMuted)
                    
                    Text(stateManager.state.bank)
                        .font(DesignTokens.Fonts.previewBody)
                        .foregroundColor(DesignTokens.Colors.accent)
                        .fontWeight(.semibold)
                }
            }
        }
        .padding(DesignTokens.Spacing.large)
        .background(DesignTokens.Colors.background)
    }
    
    // MARK: - Category Filter Section
    private var categoryFilterSection: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: DesignTokens.Spacing.medium) {
                ForEach(PatchCategory.allCases, id: \.self) { category in
                    CategoryFilterButton(
                        category: category,
                        isSelected: selectedCategory == category,
                        onTap: { selectedCategory = category }
                    )
                }
            }
            .padding(.horizontal, DesignTokens.Spacing.large)
        }
        .padding(.vertical, DesignTokens.Spacing.small)
        .background(DesignTokens.Colors.surface.opacity(0.5))
    }
    
    // MARK: - Style Filter Section
    private var styleFilterSection: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: DesignTokens.Spacing.small) {
                // All styles button
                StyleFilterButton(
                    style: nil,
                    isSelected: selectedStyle == nil,
                    onTap: { selectedStyle = nil }
                )
                
                ForEach(SoundStyle.allCases, id: \.self) { style in
                    StyleFilterButton(
                        style: style,
                        isSelected: selectedStyle == style,
                        onTap: { selectedStyle = style }
                    )
                }
            }
            .padding(.horizontal, DesignTokens.Spacing.large)
        }
        .padding(.vertical, DesignTokens.Spacing.small)
        .background(DesignTokens.Colors.chassis.opacity(0.3))
    }
    
    // MARK: - Patch List Section
    private var patchListSection: some View {
        Group {
            if isLoading {
                loadingView
            } else if filteredPatches.isEmpty {
                emptyStateView
            } else {
                patchList
            }
        }
    }
    
    private var loadingView: some View {
        VStack(spacing: DesignTokens.Spacing.large) {
            ProgressView()
                .scaleEffect(1.2)
                .tint(DesignTokens.Colors.accent)
            
            Text("Loading patches...")
                .font(DesignTokens.Fonts.previewBody)
                .foregroundColor(DesignTokens.Colors.textMuted)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(DesignTokens.Colors.background)
    }
    
    private var emptyStateView: some View {
        VStack(spacing: DesignTokens.Spacing.large) {
            Image(systemName: "music.note.list")
                .font(.system(size: 48, weight: .light))
                .foregroundColor(DesignTokens.Colors.textMuted)
            
            VStack(spacing: DesignTokens.Spacing.small) {
                Text("No patches found")
                    .font(DesignTokens.Fonts.previewTitle)
                    .foregroundColor(DesignTokens.Colors.textPrimary)
                
                Text("Try adjusting your search or filter criteria")
                    .font(DesignTokens.Fonts.previewBody)
                    .foregroundColor(DesignTokens.Colors.textMuted)
                    .multilineTextAlignment(.center)
            }
            
            Button("Clear Filters") {
                searchText = ""
                selectedCategory = .all
                selectedStyle = nil
            }
            .font(DesignTokens.Fonts.previewBody)
            .foregroundColor(DesignTokens.Colors.accent)
            .padding(.horizontal, DesignTokens.Spacing.large)
            .padding(.vertical, DesignTokens.Spacing.medium)
            .background(DesignTokens.Colors.accent.opacity(0.1))
            .cornerRadius(DesignTokens.Radii.medium)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(DesignTokens.Colors.background)
    }
    
    private var patchList: some View {
        ScrollView {
            LazyVStack(spacing: DesignTokens.Spacing.small) {
                ForEach(filteredPatches) { patch in
                    PatchListItem(
                        patch: patch,
                        isSelected: patch.name == stateManager.state.patchName,
                        onSelect: {
                            selectPatch(patch)
                        }
                    )
                }
            }
            .padding(DesignTokens.Spacing.large)
        }
        .background(DesignTokens.Colors.background)
    }
    
    // MARK: - Data Loading and Filtering
    @MainActor
    private func loadPatches() async {
        isLoading = true
        
        // Simulate async loading with sample data
        // In real implementation, this would load from MIDI data or local storage
        try? await Task.sleep(nanoseconds: 500_000_000) // 0.5 seconds
        
        patches = generateSamplePatches()
        filterPatches()
        
        isLoading = false
    }
    
    private func filterPatches() {
        var filtered = patches
        
        // Apply category filter
        if selectedCategory != .all {
            filtered = filtered.filter { $0.category == selectedCategory }
        }
        
        // Apply style filter
        if let style = selectedStyle {
            filtered = filtered.filter { $0.style == style }
        }
        
        // Apply search filter
        if !searchText.isEmpty {
            filtered = filtered.filter { patch in
                patch.name.localizedCaseInsensitiveContains(searchText) ||
                patch.description.localizedCaseInsensitiveContains(searchText) ||
                patch.tags.contains { $0.localizedCaseInsensitiveContains(searchText) }
            }
        }
        
        filteredPatches = filtered.sorted { $0.name < $1.name }
    }
    
    private func selectPatch(_ patch: PatchInfo) {
        // Update state manager with selected patch
        stateManager.setPatchName(patch.name)
        stateManager.setActiveStyle(patch.style)
        
        // Update bank if different
        if patch.bank != stateManager.state.bank {
            // Extract bank number and update
            let bankComponents = patch.bank.split(separator: "-")
            if let bankNumberStr = bankComponents.first,
               let bankNumber = Int(bankNumberStr) {
                // This would typically involve MIDI communication
                // For now, just update the display
                stateManager.updateState { state in
                    state.bank = patch.bank
                }
            }
        }
        
        dismiss()
    }
    
    // MARK: - Sample Data Generation
    private func generateSamplePatches() -> [PatchInfo] {
        var patches: [PatchInfo] = []
        
        // Generate patches for each style and category
        for style in SoundStyle.allCases {
            for category in PatchCategory.allCases where category != .all {
                let patchesForCategory = generatePatchesForCategory(style: style, category: category)
                patches.append(contentsOf: patchesForCategory)
            }
        }
        
        return patches
    }
    
    private func generatePatchesForCategory(style: SoundStyle, category: PatchCategory) -> [PatchInfo] {
        let baseNames = getPatchNamesForCategory(category)
        let bankStart = getBankStartForStyle(style)
        
        return baseNames.enumerated().map { index, baseName in
            let bankNumber = bankStart + (index / 3)
            let ordinal = (index % 3) + 1
            let bank = String(format: "%02d-%d", bankNumber, ordinal)
            
            return PatchInfo(
                id: UUID(),
                name: "\(style.rawValue) \(baseName)",
                description: generatePatchDescription(style: style, category: category, baseName: baseName),
                style: style,
                category: category,
                bank: bank,
                tags: generatePatchTags(style: style, category: category, baseName: baseName)
            )
        }
    }
    
    private func getPatchNamesForCategory(_ category: PatchCategory) -> [String] {
        switch category {
        case .all:
            return []
        case .guitar:
            return ["CLEAN", "CRUNCH", "OVERDRIVE", "DISTORTION", "FUZZ", "VINTAGE"]
        case .bass:
            return ["FINGER", "PICK", "SLAP", "FRETLESS", "SYNTH", "VINTAGE"]
        case .synth:
            return ["PAD", "LEAD", "BRASS", "STRINGS", "CHOIR", "BELL"]
        case .organ:
            return ["HAMMOND", "CHURCH", "ROCK", "JAZZ", "PIPE", "COMBO"]
        case .effects:
            return ["CHORUS", "DELAY", "REVERB", "FLANGER", "PHASER", "TREMOLO"]
        case .user:
            return ["CUSTOM 1", "CUSTOM 2", "CUSTOM 3", "CUSTOM 4", "CUSTOM 5", "CUSTOM 6"]
        }
    }
    
    private func getBankStartForStyle(_ style: SoundStyle) -> Int {
        switch style {
        case .lead: return 1
        case .rhythm: return 21
        case .other: return 41
        case .user: return 61
        }
    }
    
    private func generatePatchDescription(style: SoundStyle, category: PatchCategory, baseName: String) -> String {
        return "A \(style.rawValue.lowercased()) \(category.displayName.lowercased()) patch with \(baseName.lowercased()) characteristics"
    }
    
    private func generatePatchTags(style: SoundStyle, category: PatchCategory, baseName: String) -> [String] {
        var tags = [style.rawValue.lowercased(), category.displayName.lowercased()]
        tags.append(contentsOf: baseName.lowercased().split(separator: " ").map(String.init))
        return tags
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

// MARK: - Supporting Data Models for Patch Selection

/// Patch information model for the patch selector
struct PatchInfo: Identifiable, Sendable {
    let id: UUID
    let name: String
    let description: String
    let style: SoundStyle
    let category: PatchCategory
    let bank: String
    let tags: [String]
    
    init(id: UUID = UUID(), name: String, description: String, style: SoundStyle, category: PatchCategory, bank: String, tags: [String] = []) {
        self.id = id
        self.name = name
        self.description = description
        self.style = style
        self.category = category
        self.bank = bank
        self.tags = tags
    }
}

/// Patch categories for filtering
enum PatchCategory: String, CaseIterable, Sendable {
    case all = "ALL"
    case guitar = "GUITAR"
    case bass = "BASS"
    case synth = "SYNTH"
    case organ = "ORGAN"
    case effects = "EFFECTS"
    case user = "USER"
    
    var displayName: String {
        return rawValue
    }
    
    var icon: String {
        switch self {
        case .all: return "music.note.list"
        case .guitar: return "guitars"
        case .bass: return "guitars.fill"
        case .synth: return "waveform"
        case .organ: return "pianokeys"
        case .effects: return "waveform.path.ecg"
        case .user: return "person.crop.circle"
        }
    }
}

// MARK: - Category Filter Button
/// Individual category filter button
struct CategoryFilterButton: View {
    let category: PatchCategory
    let isSelected: Bool
    let onTap: () -> Void
    
    @State private var isPressed = false
    
    var body: some View {
        Button(action: onTap) {
            HStack(spacing: DesignTokens.Spacing.small) {
                Image(systemName: category.icon)
                    .font(.system(size: 14, weight: .medium))
                
                Text(category.displayName)
                    .font(DesignTokens.Fonts.previewCaption)
                    .fontWeight(.semibold)
            }
            .foregroundColor(isSelected ? DesignTokens.Colors.background : DesignTokens.Colors.textPrimary)
            .padding(.horizontal, DesignTokens.Spacing.medium)
            .padding(.vertical, DesignTokens.Spacing.small)
            .background(
                RoundedRectangle(cornerRadius: DesignTokens.Radii.medium)
                    .fill(isSelected ? DesignTokens.Colors.accent : DesignTokens.Colors.surface)
                    .overlay(
                        RoundedRectangle(cornerRadius: DesignTokens.Radii.medium)
                            .stroke(
                                isSelected ? DesignTokens.Colors.accent : DesignTokens.Colors.border,
                                lineWidth: isSelected ? 2 : 1
                            )
                    )
            )
            .scaleEffect(isPressed ? 0.95 : 1.0)
            .animation(DesignTokens.Animations.buttonPress, value: isPressed)
        }
        .buttonStyle(PlainButtonStyle())
        .onLongPressGesture(minimumDuration: 0, maximumDistance: .infinity, pressing: { pressing in
            isPressed = pressing
        }, perform: {})
    }
}

// MARK: - Style Filter Button
/// Individual style filter button
struct StyleFilterButton: View {
    let style: SoundStyle?
    let isSelected: Bool
    let onTap: () -> Void
    
    @State private var isPressed = false
    
    private var displayText: String {
        style?.rawValue ?? "ALL"
    }
    
    private var displayColor: Color {
        style?.associatedColor ?? DesignTokens.Colors.textMuted
    }
    
    var body: some View {
        Button(action: onTap) {
            Text(displayText)
                .font(DesignTokens.Fonts.previewCaption)
                .fontWeight(.bold)
                .foregroundColor(isSelected ? DesignTokens.Colors.background : DesignTokens.Colors.textPrimary)
                .padding(.horizontal, DesignTokens.Spacing.medium)
                .padding(.vertical, DesignTokens.Spacing.small)
                .background(
                    RoundedRectangle(cornerRadius: DesignTokens.Radii.small)
                        .fill(isSelected ? displayColor : DesignTokens.Colors.surface)
                        .overlay(
                            RoundedRectangle(cornerRadius: DesignTokens.Radii.small)
                                .stroke(
                                    isSelected ? displayColor : DesignTokens.Colors.border,
                                    lineWidth: 1
                                )
                        )
                )
                .scaleEffect(isPressed ? 0.95 : 1.0)
                .animation(DesignTokens.Animations.buttonPress, value: isPressed)
        }
        .buttonStyle(PlainButtonStyle())
        .onLongPressGesture(minimumDuration: 0, maximumDistance: .infinity, pressing: { pressing in
            isPressed = pressing
        }, perform: {})
    }
}

// MARK: - Patch List Item
/// Individual patch item in the list
struct PatchListItem: View {
    let patch: PatchInfo
    let isSelected: Bool
    let onSelect: () -> Void
    
    @State private var isPressed = false
    
    var body: some View {
        Button(action: onSelect) {
            HStack(spacing: DesignTokens.Spacing.medium) {
                // Style indicator
                RoundedRectangle(cornerRadius: DesignTokens.Radii.small)
                    .fill(patch.style.associatedColor)
                    .frame(width: 4, height: 60)
                
                // Patch information
                VStack(alignment: .leading, spacing: DesignTokens.Spacing.extraSmall) {
                    // Patch name
                    Text(patch.name)
                        .font(DesignTokens.Fonts.previewBody)
                        .fontWeight(.semibold)
                        .foregroundColor(DesignTokens.Colors.textPrimary)
                        .lineLimit(1)
                    
                    // Patch description
                    Text(patch.description)
                        .font(DesignTokens.Fonts.previewCaption)
                        .foregroundColor(DesignTokens.Colors.textMuted)
                        .lineLimit(2)
                    
                    // Tags
                    HStack(spacing: DesignTokens.Spacing.extraSmall) {
                        ForEach(Array(patch.tags.prefix(3)), id: \.self) { tag in
                            Text(tag.uppercased())
                                .font(.system(size: 9, weight: .bold))
                                .foregroundColor(DesignTokens.Colors.textMuted)
                                .padding(.horizontal, 6)
                                .padding(.vertical, 2)
                                .background(DesignTokens.Colors.surface)
                                .cornerRadius(4)
                        }
                        
                        if patch.tags.count > 3 {
                            Text("+\(patch.tags.count - 3)")
                                .font(.system(size: 9, weight: .bold))
                                .foregroundColor(DesignTokens.Colors.textMuted)
                        }
                    }
                }
                
                Spacer()
                
                // Bank and selection indicator
                VStack(alignment: .trailing, spacing: DesignTokens.Spacing.extraSmall) {
                    Text(patch.bank)
                        .font(DesignTokens.Fonts.statusText)
                        .foregroundColor(DesignTokens.Colors.accent)
                        .fontWeight(.bold)
                    
                    if isSelected {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 20, weight: .medium))
                            .foregroundColor(DesignTokens.Colors.success)
                    } else {
                        Image(systemName: "circle")
                            .font(.system(size: 20, weight: .light))
                            .foregroundColor(DesignTokens.Colors.border)
                    }
                }
            }
            .padding(DesignTokens.Spacing.medium)
            .background(
                RoundedRectangle(cornerRadius: DesignTokens.Radii.medium)
                    .fill(isSelected ? DesignTokens.Colors.accent.opacity(0.1) : DesignTokens.Colors.surface)
                    .overlay(
                        RoundedRectangle(cornerRadius: DesignTokens.Radii.medium)
                            .stroke(
                                isSelected ? DesignTokens.Colors.accent : DesignTokens.Colors.border,
                                lineWidth: isSelected ? 2 : 1
                            )
                    )
            )
            .scaleEffect(isPressed ? 0.98 : 1.0)
            .animation(DesignTokens.Animations.buttonPress, value: isPressed)
        }
        .buttonStyle(PlainButtonStyle())
        .onLongPressGesture(minimumDuration: 0, maximumDistance: .infinity, pressing: { pressing in
            isPressed = pressing
        }, perform: {})
    }
}