# GR55 SwiftUI User Workflows Guide

## Overview

This guide documents the complete user workflows for the GR55 SwiftUI hardware interface, providing detailed interaction patterns, user experience flows, and implementation examples for each major workflow.

## Table of Contents

1. [Patch Selection Workflow](#patch-selection-workflow)
2. [Parameter Editing Workflow](#parameter-editing-workflow)
3. [Bank Navigation Workflow](#bank-navigation-workflow)
4. [Expression Control Workflow](#expression-control-workflow)
5. [Style Selection Workflow](#style-selection-workflow)
6. [MIDI Connection Workflow](#midi-connection-workflow)
7. [Error Recovery Workflows](#error-recovery-workflows)

## Patch Selection Workflow

### Overview

The patch selection workflow allows users to browse, search, and select patches from the GR-55's extensive patch library. This workflow supports multiple interaction methods for different user preferences and contexts.

### Primary Interaction Methods

#### 1. Direct Pedal Selection

**User Flow:**

1. User views current bank display showing patches 1-3
2. User taps pedal 1, 2, or 3 to select corresponding patch
3. LED illuminates on selected pedal
4. Display updates to show new patch name and parameters
5. MIDI command sent to hardware
6. Audio output changes to selected patch

**Implementation:**

```swift
struct PedalSelectionWorkflow: View {
    @ObservedObject var stateManager: GR55StateManager

    var body: some View {
        HStack(spacing: DesignTokens.Spacing.large) {
            ForEach(1...3, id: \.self) { pedalNumber in
                FootPedal(
                    number: pedalNumber,
                    isActive: stateManager.currentState.activePedal == pedalNumber,
                    topLabel: stateManager.currentState.bankSlots?[pedalNumber - 1]?.name ?? "EMPTY",
                    onSingleTap: {
                        Task {
                            await stateManager.selectOrdinalInCurrentBank(pedalNumber)
                        }
                    }
                )
                .accessibilityLabel("Patch \(pedalNumber)")
                .accessibilityValue(stateManager.currentState.activePedal == pedalNumber ? "Selected" : "Available")
                .accessibilityHint("Tap to select this patch")
            }
        }
    }
}
```

#### 2. Patch Browser Selection

**User Flow:**

1. User taps current patch name in display
2. Patch selector sheet slides up from bottom
3. User browses patches by category (LEAD, RHYTHM, OTHER, USER)
4. User can search patches by name or filter by characteristics
5. User taps desired patch to select
6. Sheet dismisses and display updates
7. MIDI command sent to hardware

**Implementation:**

```swift
struct PatchBrowserWorkflow: View {
    @ObservedObject var stateManager: GR55StateManager
    @State private var showPatchSelector = false
    @State private var searchText = ""
    @State private var selectedCategory: SoundStyle = .lead

    var body: some View {
        VStack {
            // Current patch display
            Button(action: { showPatchSelector = true }) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(stateManager.currentState.bank)
                        .font(DesignTokens.Fonts.bankDisplay)
                        .foregroundColor(DesignTokens.Colors.lcdText)

                    Text(stateManager.currentState.patchName)
                        .font(DesignTokens.Fonts.patchName)
                        .foregroundColor(DesignTokens.Colors.lcdText)
                        .lineLimit(1)
                }
            }
            .accessibilityLabel("Current patch: \(stateManager.currentState.patchName)")
            .accessibilityHint("Tap to open patch browser")
        }
        .sheet(isPresented: $showPatchSelector) {
            PatchSelectorView(
                stateManager: stateManager,
                searchText: $searchText,
                selectedCategory: $selectedCategory
            )
        }
    }
}

struct PatchSelectorView: View {
    @ObservedObject var stateManager: GR55StateManager
    @Binding var searchText: String
    @Binding var selectedCategory: SoundStyle
    @Environment(\.dismiss) private var dismiss

    var filteredPatches: [PatchInfo] {
        stateManager.availablePatches
            .filter { patch in
                if !searchText.isEmpty {
                    return patch.name.localizedCaseInsensitiveContains(searchText)
                }
                return patch.style == selectedCategory
            }
    }

    var body: some View {
        NavigationView {
            VStack {
                // Category picker
                Picker("Category", selection: $selectedCategory) {
                    ForEach(SoundStyle.allCases, id: \.self) { style in
                        Text(style.rawValue).tag(style)
                    }
                }
                .pickerStyle(SegmentedPickerStyle())
                .padding()

                // Search bar
                SearchBar(text: $searchText)
                    .padding(.horizontal)

                // Patch list
                List(filteredPatches) { patch in
                    PatchRow(
                        patch: patch,
                        isSelected: patch.id == stateManager.currentState.patchId
                    ) {
                        Task {
                            await stateManager.selectPatch(patch)
                            dismiss()
                        }
                    }
                }
            }
            .navigationTitle("Select Patch")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
        }
    }
}
```

#### 3. Data Wheel Navigation

**User Flow:**

1. User rotates data wheel left or right
2. Active pedal selection cycles through 1-3
3. LED indicators update to show new selection
4. User can press data wheel to confirm selection
5. MIDI command sent to hardware

**Implementation:**

```swift
struct DataWheelNavigationWorkflow: View {
    @ObservedObject var stateManager: GR55StateManager

    var body: some View {
        DataWheel(
            onRotate: { direction in
                Task {
                    await stateManager.handleDataWheelRotate(direction)
                }
            },
            onPress: { direction in
                Task {
                    await stateManager.handleDataWheelPress(direction)
                }
            }
        )
        .accessibilityLabel("Data wheel")
        .accessibilityHint("Rotate to navigate patches, press to select")
    }
}
```

### Patch Selection State Management

```swift
extension GR55StateManager {
    @MainActor
    func selectOrdinalInCurrentBank(_ ordinal: Int) async {
        guard ordinal >= 1 && ordinal <= 3 else { return }

        // Update local state
        currentState.activePedal = ordinal

        // Get patch info for this ordinal
        if let bankSlots = currentState.bankSlots,
           ordinal <= bankSlots.count {
            let selectedPatch = bankSlots[ordinal - 1]
            currentState.patchName = selectedPatch.name
        }

        // Send MIDI command
        await sendPatchChangeCommand(bank: currentState.bank, ordinal: ordinal)

        // Update UI feedback
        providePatchSelectionFeedback()
    }

    @MainActor
    func selectPatch(_ patch: PatchInfo) async {
        // Update state
        currentState.patchName = patch.name
        currentState.bank = patch.bank
        currentState.activeStyle = patch.style
        currentState.activePedal = patch.ordinal

        // Send MIDI command
        await sendPatchChangeCommand(bank: patch.bank, ordinal: patch.ordinal)

        // Update bank slots if needed
        await loadBankSlots(for: patch.bank)
    }

    private func providePatchSelectionFeedback() {
        // Haptic feedback
        let impactFeedback = UIImpactFeedbackGenerator(style: .medium)
        impactFeedback.impactOccurred()

        // Audio feedback (if enabled)
        // Visual feedback is automatic through @Published properties
    }
}
```

## Parameter Editing Workflow

### Overview

The parameter editing workflow allows users to modify effect settings, tone parameters, and assign controls through an intuitive preview and edit system.

### Interaction Flow

#### 1. Parameter Preview

**User Flow:**

1. User hovers over or focuses on parameter button (MFX, DELAY, etc.)
2. Preview pane appears showing current parameter values
3. Preview shows effect type, key parameters, and current settings
4. User can see parameter information without entering edit mode

**Implementation:**

```swift
struct ParameterPreviewWorkflow: View {
    @ObservedObject var stateManager: GR55StateManager
    @State private var hoveredParameter: ParameterType?

    var body: some View {
        ZStack {
            // Parameter grid
            ParameterGrid(stateManager: stateManager) { parameter in
                hoveredParameter = parameter
            }

            // Preview pane
            if let parameter = hoveredParameter {
                PreviewPane(
                    parameter: parameter,
                    stateManager: stateManager
                )
                .transition(.opacity.combined(with: .scale))
                .animation(.easeInOut(duration: 0.2), value: hoveredParameter)
            }
        }
        .onTapGesture {
            hoveredParameter = nil
        }
    }
}

struct PreviewPane: View {
    let parameter: ParameterType
    @ObservedObject var stateManager: GR55StateManager

    var body: some View {
        VStack {
            Spacer()

            HStack {
                Spacer()

                PreviewCard(
                    title: parameter.displayName,
                    content: parameterPreviewContent,
                    isActive: stateManager.isParameterActive(parameter)
                )
                .frame(maxWidth: 320)

                Spacer()
            }

            Spacer()
        }
    }

    @ViewBuilder
    private var parameterPreviewContent: some View {
        switch parameter {
        case .mfx:
            MFXPreviewContent(stateManager: stateManager)
        case .delay:
            DelayPreviewContent(stateManager: stateManager)
        case .chorus:
            ChorusPreviewContent(stateManager: stateManager)
        case .reverb:
            ReverbPreviewContent(stateManager: stateManager)
        default:
            GenericParameterPreview(parameter: parameter, stateManager: stateManager)
        }
    }
}
```

#### 2. Parameter Toggle

**User Flow:**

1. User single-taps parameter button
2. Parameter toggles on/off
3. LED indicator updates to reflect new state
4. MIDI command sent to hardware
5. Audio output reflects parameter change

**Implementation:**

```swift
struct ParameterToggleWorkflow: View {
    @ObservedObject var stateManager: GR55StateManager

    var body: some View {
        ParameterButton(
            parameter: .mfx,
            isActive: stateManager.currentState.mfxOn,
            onTap: {
                Task {
                    await stateManager.toggleParameter(.mfx)
                }
            }
        )
    }
}

extension GR55StateManager {
    @MainActor
    func toggleParameter(_ parameter: ParameterType) async {
        switch parameter {
        case .mfx:
            currentState.mfxOn.toggle()
            await sendParameterToggle(.mfx, isOn: currentState.mfxOn)
        case .delay:
            currentState.delayOn.toggle()
            await sendParameterToggle(.delay, isOn: currentState.delayOn)
        // ... other parameters
        }

        provideToggleFeedback()
    }

    private func provideToggleFeedback() {
        let impactFeedback = UIImpactFeedbackGenerator(style: .light)
        impactFeedback.impactOccurred()
    }
}
```

#### 3. Parameter Editing

**User Flow:**

1. User double-taps parameter button
2. Edit mode overlay appears
3. User sees detailed parameter controls
4. User adjusts values using sliders, pickers, or input fields
5. Changes are applied in real-time
6. User taps Save to commit or Cancel to revert
7. Edit overlay dismisses

**Implementation:**

```swift
struct ParameterEditingWorkflow: View {
    @ObservedObject var stateManager: GR55StateManager
    @State private var editingParameter: ParameterType?
    @State private var editingValues: [String: Any] = [:]

    var body: some View {
        ZStack {
            // Main parameter interface
            ParameterGrid(stateManager: stateManager) { parameter in
                // Single tap handler
            } onDoubleTap: { parameter in
                startEditing(parameter)
            }

            // Edit mode overlay
            if let parameter = editingParameter {
                ParameterEditOverlay(
                    parameter: parameter,
                    initialValues: getParameterValues(parameter),
                    onValueChange: { key, value in
                        editingValues[key] = value
                        Task {
                            await stateManager.updateParameterValue(parameter, key: key, value: value)
                        }
                    },
                    onSave: {
                        Task {
                            await stateManager.commitParameterChanges(parameter, values: editingValues)
                            editingParameter = nil
                            editingValues.removeAll()
                        }
                    },
                    onCancel: {
                        Task {
                            await stateManager.revertParameterChanges(parameter)
                            editingParameter = nil
                            editingValues.removeAll()
                        }
                    }
                )
                .transition(.move(edge: .trailing))
                .animation(.easeInOut(duration: 0.3), value: editingParameter)
            }
        }
    }

    private func startEditing(_ parameter: ParameterType) {
        editingParameter = parameter
        editingValues = getParameterValues(parameter)
    }

    private func getParameterValues(_ parameter: ParameterType) -> [String: Any] {
        // Return current parameter values as dictionary
        return stateManager.getParameterValues(parameter)
    }
}

struct ParameterEditOverlay: View {
    let parameter: ParameterType
    let initialValues: [String: Any]
    let onValueChange: (String, Any) -> Void
    let onSave: () -> Void
    let onCancel: () -> Void

    var body: some View {
        VStack {
            Spacer()

            HStack {
                Spacer()

                VStack(spacing: DesignTokens.Spacing.medium) {
                    // Header
                    HStack {
                        Text(parameter.displayName)
                            .font(DesignTokens.Fonts.editTitle)
                            .foregroundColor(DesignTokens.Colors.textPrimary)

                        Spacer()

                        Button("Cancel", action: onCancel)
                            .foregroundColor(DesignTokens.Colors.textMuted)
                    }

                    Divider()

                    // Parameter controls
                    parameterControls

                    // Action buttons
                    HStack {
                        Button("Cancel", action: onCancel)
                            .buttonStyle(SecondaryButtonStyle())

                        Spacer()

                        Button("Save", action: onSave)
                            .buttonStyle(PrimaryButtonStyle())
                    }
                }
                .padding(DesignTokens.Spacing.large)
                .background(DesignTokens.Colors.surface)
                .cornerRadius(DesignTokens.Radii.large)
                .shadow(color: .black.opacity(0.3), radius: 20, x: 0, y: 10)
                .frame(maxWidth: 400)

                Spacer()
            }

            Spacer()
        }
        .background(Color.black.opacity(0.5))
    }

    @ViewBuilder
    private var parameterControls: some View {
        switch parameter {
        case .mfx:
            MFXEditControls(
                initialValues: initialValues,
                onValueChange: onValueChange
            )
        case .delay:
            DelayEditControls(
                initialValues: initialValues,
                onValueChange: onValueChange
            )
        // ... other parameter types
        default:
            GenericParameterControls(
                parameter: parameter,
                initialValues: initialValues,
                onValueChange: onValueChange
            )
        }
    }
}
```

## Bank Navigation Workflow

### Overview

Bank navigation allows users to browse through different patch banks and styles, providing access to the full range of available patches.

### Navigation Methods

#### 1. Pedal Double-Tap Navigation

**User Flow:**

1. User double-taps pedal 1 to go to next bank
2. User double-taps pedal 2 to go to previous bank
3. Bank display updates to show new bank number
4. Pedal labels update to show new patch names
5. MIDI commands sent to load new bank

**Implementation:**

```swift
struct PedalBankNavigationWorkflow: View {
    @ObservedObject var stateManager: GR55StateManager

    var body: some View {
        HStack(spacing: DesignTokens.Spacing.large) {
            // Pedal 1 - Next bank on double-tap
            FootPedal(
                number: 1,
                isActive: stateManager.currentState.activePedal == 1,
                topLabel: stateManager.currentState.bankSlots?[0]?.name,
                onSingleTap: {
                    Task {
                        await stateManager.selectOrdinalInCurrentBank(1)
                    }
                },
                onDoubleTap: {
                    Task {
                        await stateManager.gotoNextBank()
                    }
                }
            )
            .accessibilityHint("Single tap to select patch, double tap to go to next bank")

            // Pedal 2 - Previous bank on double-tap
            FootPedal(
                number: 2,
                isActive: stateManager.currentState.activePedal == 2,
                topLabel: stateManager.currentState.bankSlots?[1]?.name,
                onSingleTap: {
                    Task {
                        await stateManager.selectOrdinalInCurrentBank(2)
                    }
                },
                onDoubleTap: {
                    Task {
                        await stateManager.gotoPrevBank()
                    }
                }
            )
            .accessibilityHint("Single tap to select patch, double tap to go to previous bank")

            // Pedal 3 - Patch selection only
            FootPedal(
                number: 3,
                isActive: stateManager.currentState.activePedal == 3,
                topLabel: stateManager.currentState.bankSlots?[2]?.name,
                onSingleTap: {
                    Task {
                        await stateManager.selectOrdinalInCurrentBank(3)
                    }
                }
            )
        }
    }
}
```

#### 2. Data Wheel Bank Navigation

**User Flow:**

1. User presses data wheel up to go to next style
2. User presses data wheel down to go to previous style
3. Style LED indicators update
4. Bank display updates to show first bank of new style
5. Patch names update for new style

**Implementation:**

```swift
struct DataWheelBankNavigationWorkflow: View {
    @ObservedObject var stateManager: GR55StateManager

    var body: some View {
        DataWheel(
            onRotate: { direction in
                Task {
                    await stateManager.handleDataWheelRotate(direction)
                }
            },
            onPress: { direction in
                Task {
                    switch direction {
                    case .up:
                        await stateManager.gotoNextStyle()
                    case .down:
                        await stateManager.gotoPrevStyle()
                    case .left:
                        await stateManager.gotoPrevBank()
                    case .right:
                        await stateManager.gotoNextBank()
                    }
                }
            }
        )
    }
}
```

#### 3. Style Button Navigation

**User Flow:**

1. User taps style button (LEAD, RHYTHM, OTHER, USER)
2. Style LED illuminates for selected style
3. Bank display updates to show first bank of selected style
4. Patch names update for new style
5. Active pedal resets to pedal 1

**Implementation:**

```swift
struct StyleButtonNavigationWorkflow: View {
    @ObservedObject var stateManager: GR55StateManager

    var body: some View {
        HStack(spacing: DesignTokens.Spacing.medium) {
            ForEach(SoundStyle.allCases, id: \.self) { style in
                StyleButton(
                    style: style,
                    isActive: stateManager.currentState.activeStyle == style,
                    onTap: {
                        Task {
                            await stateManager.setActiveStyle(style)
                        }
                    }
                )
            }
        }
    }
}

struct StyleButton: View {
    let style: SoundStyle
    let isActive: Bool
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            VStack(spacing: 4) {
                // LED indicator
                Circle()
                    .fill(isActive ? DesignTokens.Colors.ledActive : DesignTokens.Colors.ledInactive)
                    .frame(width: 8, height: 8)
                    .shadow(color: isActive ? DesignTokens.Colors.ledActive : .clear, radius: 4)

                // Style label
                Text(style.rawValue)
                    .font(DesignTokens.Fonts.styleButton)
                    .foregroundColor(DesignTokens.Colors.textPrimary)
            }
        }
        .accessibilityLabel("\(style.rawValue) style")
        .accessibilityValue(isActive ? "Selected" : "Available")
    }
}
```

### Bank Navigation State Management

```swift
extension GR55StateManager {
    @MainActor
    func gotoNextBank() async {
        let currentBankNumber = parseBankNumber(currentState.bank)
        let maxBankForStyle = getMaxBankForStyle(currentState.activeStyle)

        let nextBank = currentBankNumber < maxBankForStyle ? currentBankNumber + 1 : 1
        let newBankString = formatBankString(nextBank, style: currentState.activeStyle)

        currentState.bank = newBankString
        currentState.activePedal = 1 // Reset to first pedal

        await loadBankSlots(for: newBankString)
        await sendBankChangeCommand(newBankString)

        provideBankNavigationFeedback()
    }

    @MainActor
    func gotoPrevBank() async {
        let currentBankNumber = parseBankNumber(currentState.bank)
        let maxBankForStyle = getMaxBankForStyle(currentState.activeStyle)

        let prevBank = currentBankNumber > 1 ? currentBankNumber - 1 : maxBankForStyle
        let newBankString = formatBankString(prevBank, style: currentState.activeStyle)

        currentState.bank = newBankString
        currentState.activePedal = 1 // Reset to first pedal

        await loadBankSlots(for: newBankString)
        await sendBankChangeCommand(newBankString)

        provideBankNavigationFeedback()
    }

    @MainActor
    func setActiveStyle(_ style: SoundStyle) async {
        currentState.activeStyle = style
        currentState.bank = getFirstBankForStyle(style)
        currentState.activePedal = 1 // Reset to first pedal

        await loadBankSlots(for: currentState.bank)
        await sendStyleChangeCommand(style)

        provideStyleChangeFeedback()
    }

    private func provideBankNavigationFeedback() {
        let impactFeedback = UIImpactFeedbackGenerator(style: .medium)
        impactFeedback.impactOccurred()
    }

    private func provideStyleChangeFeedback() {
        let impactFeedback = UIImpactFeedbackGenerator(style: .heavy)
        impactFeedback.impactOccurred()
    }
}
```

## Expression Control Workflow

### Overview

The expression control workflow allows users to adjust patch levels and control expression parameters through the large expression pedal interface.

### Expression Pedal Control

**User Flow:**

1. User sees current patch level displayed prominently
2. User drags vertically on expression pedal surface
3. Level bar updates in real-time during drag
4. Patch level value updates (0-100)
5. MIDI control change commands sent continuously
6. Audio output level changes in real-time

**Implementation:**

```swift
struct ExpressionControlWorkflow: View {
    @ObservedObject var stateManager: GR55StateManager
    @State private var isDragging = false
    @State private var dragStartValue: Int = 0

    var body: some View {
        VStack(spacing: DesignTokens.Spacing.medium) {
            // EXP SW button
            ExpSwButton(stateManager: stateManager)

            // Expression pedal surface
            GeometryReader { geometry in
                ZStack {
                    // Pedal background
                    expressionPedalBackground

                    // Level display overlay
                    VStack(spacing: DesignTokens.Spacing.small) {
                        Text("PATCH LEVEL")
                            .font(DesignTokens.Fonts.expressionLabel)
                            .foregroundColor(DesignTokens.Colors.accent)

                        Text("\(stateManager.currentState.patchLevel)")
                            .font(DesignTokens.Fonts.expressionValue)
                            .foregroundColor(.white)
                            .shadow(color: .black.opacity(0.5), radius: 2)

                        Spacer()

                        // Level bar
                        LevelBar(
                            level: stateManager.currentState.patchLevel,
                            isAnimating: isDragging
                        )
                        .frame(height: 200)
                    }
                    .padding(DesignTokens.Spacing.medium)
                }
                .gesture(
                    DragGesture()
                        .onChanged { value in
                            if !isDragging {
                                isDragging = true
                                dragStartValue = stateManager.currentState.patchLevel
                                provideExpressionStartFeedback()
                            }

                            let dragRange = geometry.size.height
                            let dragPercent = 1.0 - (value.location.y / dragRange)
                            let newLevel = Int(dragPercent * 100)
                            let clampedLevel = max(0, min(100, newLevel))

                            Task {
                                await stateManager.setPatchLevel(clampedLevel)
                            }
                        }
                        .onEnded { _ in
                            isDragging = false
                            provideExpressionEndFeedback()
                        }
                )
            }
            .frame(height: 300)
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Expression pedal")
        .accessibilityValue("Patch level \(stateManager.currentState.patchLevel) percent")
        .accessibilityAdjustableAction { direction in
            let currentLevel = stateManager.currentState.patchLevel
            let newLevel: Int

            switch direction {
            case .increment:
                newLevel = min(100, currentLevel + 5)
            case .decrement:
                newLevel = max(0, currentLevel - 5)
            @unknown default:
                return
            }

            Task {
                await stateManager.setPatchLevel(newLevel)
            }
        }
    }

    @ViewBuilder
    private var expressionPedalBackground: some View {
        RoundedRectangle(cornerRadius: 8)
            .fill(
                LinearGradient(
                    gradient: Gradient(colors: [
                        DesignTokens.Colors.expressionPedalTop,
                        DesignTokens.Colors.expressionPedalBottom
                    ]),
                    startPoint: .top,
                    endPoint: .bottom
                )
            )
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(DesignTokens.Colors.expressionPedalBorder, lineWidth: 2)
            )
            .shadow(color: .black.opacity(0.3), radius: 8, x: 0, y: 4)
    }

    private func provideExpressionStartFeedback() {
        let impactFeedback = UIImpactFeedbackGenerator(style: .light)
        impactFeedback.impactOccurred()
    }

    private func provideExpressionEndFeedback() {
        let impactFeedback = UIImpactFeedbackGenerator(style: .medium)
        impactFeedback.impactOccurred()
    }
}

struct LevelBar: View {
    let level: Int
    let isAnimating: Bool

    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .bottom) {
                // Background
                RoundedRectangle(cornerRadius: 4)
                    .fill(DesignTokens.Colors.levelBarBackground)
                    .frame(width: 20)

                // Level fill
                RoundedRectangle(cornerRadius: 4)
                    .fill(levelGradient)
                    .frame(
                        width: 20,
                        height: geometry.size.height * CGFloat(level) / 100
                    )
                    .animation(
                        isAnimating ? .none : .easeInOut(duration: 0.2),
                        value: level
                    )
            }
            .frame(maxWidth: .infinity)
        }
    }

    private var levelGradient: LinearGradient {
        LinearGradient(
            gradient: Gradient(colors: [
                DesignTokens.Colors.levelBarLow,
                DesignTokens.Colors.levelBarMid,
                DesignTokens.Colors.levelBarHigh
            ]),
            startPoint: .bottom,
            endPoint: .top
        )
    }
}
```

### EXP SW Button Control

**User Flow:**

1. User sees current EXP SW function displayed
2. User taps EXP SW button
3. Button LED toggles on/off
4. Function display updates
5. MIDI command sent to hardware
6. Expression pedal behavior changes based on new function

**Implementation:**

```swift
struct ExpSwButtonWorkflow: View {
    @ObservedObject var stateManager: GR55StateManager

    var body: some View {
        Button(action: {
            Task {
                await stateManager.toggleExpSw()
            }
        }) {
            VStack(spacing: 4) {
                // LED indicator
                Circle()
                    .fill(stateManager.currentState.expSwStatus ? DesignTokens.Colors.ledActive : DesignTokens.Colors.ledInactive)
                    .frame(width: 12, height: 12)
                    .shadow(
                        color: stateManager.currentState.expSwStatus ? DesignTokens.Colors.ledActive : .clear,
                        radius: 6
                    )

                // Button label
                Text("EXP SW")
                    .font(DesignTokens.Fonts.expSwLabel)
                    .foregroundColor(DesignTokens.Colors.textPrimary)

                // Function display
                Text(stateManager.currentState.expSwFunction)
                    .font(DesignTokens.Fonts.expSwFunction)
                    .foregroundColor(DesignTokens.Colors.textMuted)
                    .lineLimit(1)
            }
        }
        .accessibilityLabel("Expression switch")
        .accessibilityValue(stateManager.currentState.expSwStatus ? "On" : "Off")
        .accessibilityHint("Tap to toggle expression switch function")
    }
}
```

## Style Selection Workflow

### Overview

The style selection workflow allows users to switch between different sound categories (LEAD, RHYTHM, OTHER, USER) to access different types of patches.

### Style Selection Flow

**User Flow:**

1. User sees current style indicated by LED
2. User taps desired style button
3. LED moves to selected style
4. Bank display updates to first bank of new style
5. Patch names update for new style
6. MIDI command sent to hardware

**Implementation:**

```swift
struct StyleSelectionWorkflow: View {
    @ObservedObject var stateManager: GR55StateManager

    var body: some View {
        VStack(spacing: DesignTokens.Spacing.medium) {
            // Style buttons
            HStack(spacing: DesignTokens.Spacing.small) {
                ForEach(SoundStyle.allCases, id: \.self) { style in
                    StyleSelectionButton(
                        style: style,
                        isActive: stateManager.currentState.activeStyle == style,
                        onTap: {
                            Task {
                                await stateManager.setActiveStyle(style)
                            }
                        }
                    )
                }
            }

            // Additional buttons
            HStack(spacing: DesignTokens.Spacing.small) {
                AdditionalButton(title: "V-LINK", isActive: false) {
                    // V-LINK functionality
                }

                AdditionalButton(title: "EZ EDIT", isActive: false) {
                    // EZ EDIT functionality
                }
            }
        }
        .padding(DesignTokens.Spacing.medium)
        .background(DesignTokens.Colors.stylePanelBackground)
        .cornerRadius(DesignTokens.Radii.medium)
    }
}

struct StyleSelectionButton: View {
    let style: SoundStyle
    let isActive: Bool
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            VStack(spacing: 6) {
                // LED indicator
                Circle()
                    .fill(isActive ? DesignTokens.Colors.ledActive : DesignTokens.Colors.ledInactive)
                    .frame(width: 10, height: 10)
                    .shadow(color: isActive ? DesignTokens.Colors.ledActive : .clear, radius: 4)

                // Style label
                Text(style.rawValue)
                    .font(DesignTokens.Fonts.styleButton)
                    .foregroundColor(DesignTokens.Colors.textPrimary)
                    .multilineTextAlignment(.center)
            }
        }
        .frame(minWidth: 60, minHeight: 50)
        .background(
            RoundedRectangle(cornerRadius: 6)
                .fill(isActive ? DesignTokens.Colors.buttonActiveBackground : DesignTokens.Colors.buttonBackground)
        )
        .scaleEffect(isActive ? 1.05 : 1.0)
        .animation(.easeInOut(duration: 0.1), value: isActive)
        .accessibilityLabel("\(style.rawValue) style")
        .accessibilityValue(isActive ? "Selected" : "Available")
    }
}
```

## MIDI Connection Workflow

### Overview

The MIDI connection workflow manages the connection state between the SwiftUI interface and the GR-55 hardware, providing user feedback and error handling.

### Connection States and Flows

#### 1. Initial Connection

**User Flow:**

1. App launches with disconnected state
2. User sees connection status indicator
3. App attempts automatic connection to GR-55
4. Connection status updates to "Connecting"
5. If successful, status shows "Connected" with green indicator
6. If failed, status shows "Disconnected" with red indicator

#### 2. Connection Monitoring

**User Flow:**

1. App continuously monitors MIDI connection
2. If connection lost, status immediately updates
3. User sees visual feedback of disconnection
4. App attempts automatic reconnection
5. User can manually retry connection

#### 3. Error Handling

**User Flow:**

1. Connection error occurs
2. Error status displayed to user
3. User can tap status to see error details
4. User can retry connection
5. App provides troubleshooting suggestions

**Implementation:**

```swift
struct MIDIConnectionWorkflow: View {
    @ObservedObject var stateManager: GR55StateManager
    @State private var showConnectionDetails = false

    var body: some View {
        VStack {
            // Connection status indicator
            Button(action: { showConnectionDetails = true }) {
                HStack(spacing: 8) {
                    connectionStatusIcon

                    Text(connectionStatusText)
                        .font(.caption)
                        .foregroundColor(connectionStatusColor)
                }
            }
            .accessibilityLabel("MIDI connection status")
            .accessibilityValue(connectionStatusText)
            .accessibilityHint("Tap for connection details")
        }
        .sheet(isPresented: $showConnectionDetails) {
            ConnectionDetailsView(stateManager: stateManager)
        }
    }

    @ViewBuilder
    private var connectionStatusIcon: some View {
        Circle()
            .fill(connectionStatusColor)
            .frame(width: 8, height: 8)
            .overlay(
                Circle()
                    .stroke(connectionStatusColor.opacity(0.3), lineWidth: 2)
                    .scaleEffect(stateManager.connectionStatus == .connecting ? 1.5 : 1.0)
                    .opacity(stateManager.connectionStatus == .connecting ? 0 : 1)
                    .animation(
                        stateManager.connectionStatus == .connecting ?
                        .easeInOut(duration: 1.0).repeatForever(autoreverses: false) : .none,
                        value: stateManager.connectionStatus
                    )
            )
    }

    private var connectionStatusColor: Color {
        switch stateManager.connectionStatus {
        case .connected:
            return .green
        case .connecting:
            return .yellow
        case .disconnected:
            return .red
        case .error:
            return .red
        }
    }

    private var connectionStatusText: String {
        switch stateManager.connectionStatus {
        case .connected:
            return "Connected"
        case .connecting:
            return "Connecting..."
        case .disconnected:
            return "Disconnected"
        case .error(let error):
            return "Error: \(error.localizedDescription)"
        }
    }
}

struct ConnectionDetailsView: View {
    @ObservedObject var stateManager: GR55StateManager
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationView {
            VStack(spacing: DesignTokens.Spacing.large) {
                // Connection status
                connectionStatusSection

                // Connection actions
                connectionActionsSection

                // Troubleshooting
                troubleshootingSection

                Spacer()
            }
            .padding()
            .navigationTitle("MIDI Connection")
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

    @ViewBuilder
    private var connectionStatusSection: some View {
        VStack(spacing: DesignTokens.Spacing.medium) {
            Text("Connection Status")
                .font(.headline)

            HStack {
                Circle()
                    .fill(connectionStatusColor)
                    .frame(width: 16, height: 16)

                Text(connectionStatusText)
                    .font(.body)
            }

            if case .error(let error) = stateManager.connectionStatus {
                Text(error.localizedDescription)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }
        }
        .padding()
        .background(Color.secondary.opacity(0.1))
        .cornerRadius(8)
    }

    @ViewBuilder
    private var connectionActionsSection: some View {
        VStack(spacing: DesignTokens.Spacing.small) {
            if stateManager.connectionStatus != .connected {
                Button("Connect to GR-55") {
                    Task {
                        await stateManager.connectToMIDI()
                    }
                }
                .buttonStyle(.borderedProminent)
            } else {
                Button("Disconnect") {
                    Task {
                        await stateManager.disconnectFromMIDI()
                    }
                }
                .buttonStyle(.bordered)
            }

            Button("Refresh Connection") {
                Task {
                    await stateManager.refreshMIDIConnection()
                }
            }
            .buttonStyle(.bordered)
        }
    }

    @ViewBuilder
    private var troubleshootingSection: some View {
        VStack(alignment: .leading, spacing: DesignTokens.Spacing.small) {
            Text("Troubleshooting")
                .font(.headline)

            VStack(alignment: .leading, spacing: 4) {
                Text("• Ensure GR-55 is powered on")
                Text("• Check USB/MIDI cable connection")
                Text("• Verify GR-55 MIDI settings")
                Text("• Try disconnecting and reconnecting")
                Text("• Restart the app if issues persist")
            }
            .font(.caption)
            .foregroundColor(.secondary)
        }
        .padding()
        .background(Color.secondary.opacity(0.1))
        .cornerRadius(8)
    }
}
```

## Error Recovery Workflows

### Overview

Error recovery workflows handle various error conditions and provide users with clear paths to resolve issues and restore functionality.

### Connection Error Recovery

**User Flow:**

1. Connection error detected
2. User sees error status indicator
3. App attempts automatic reconnection
4. If automatic recovery fails, user sees manual options
5. User can retry connection or access troubleshooting

### State Corruption Recovery

**User Flow:**

1. Invalid state detected
2. App automatically resets to safe default state
3. User sees notification of state reset
4. User can continue with default state or reload from hardware

### MIDI Communication Error Recovery

**User Flow:**

1. MIDI command fails to send
2. Command is queued for retry
3. User sees temporary "sending" indicator
4. If retry fails, user sees error notification
5. User can manually retry or skip the command

**Implementation:**

```swift
struct ErrorRecoveryWorkflow: View {
    @ObservedObject var stateManager: GR55StateManager
    @State private var showErrorAlert = false
    @State private var currentError: GR55Error?

    var body: some View {
        EmptyView()
            .onReceive(stateManager.$lastError) { error in
                if let error = error {
                    currentError = error
                    showErrorAlert = true
                }
            }
            .alert("Error", isPresented: $showErrorAlert, presenting: currentError) { error in
                errorAlertButtons(for: error)
            } message: { error in
                Text(error.localizedDescription)
            }
    }

    @ViewBuilder
    private func errorAlertButtons(for error: GR55Error) -> some View {
        switch error {
        case .connectionLost:
            Button("Retry Connection") {
                Task {
                    await stateManager.connectToMIDI()
                }
            }
            Button("Continue Offline") {
                stateManager.clearError()
            }

        case .midiCommandFailed(let command):
            Button("Retry Command") {
                Task {
                    await stateManager.retryCommand(command)
                }
            }
            Button("Skip") {
                stateManager.clearError()
            }

        case .stateCorruption:
            Button("Reset to Default") {
                Task {
                    await stateManager.resetToDefaultState()
                }
            }
            Button("Reload from Hardware") {
                Task {
                    await stateManager.reloadStateFromHardware()
                }
            }

        default:
            Button("OK") {
                stateManager.clearError()
            }
        }
    }
}

enum GR55Error: Error, LocalizedError {
    case connectionLost
    case midiCommandFailed(MIDICommand)
    case stateCorruption
    case hardwareNotResponding
    case invalidParameter(String)

    var errorDescription: String? {
        switch self {
        case .connectionLost:
            return "Connection to GR-55 was lost. Please check your MIDI connection."
        case .midiCommandFailed:
            return "Failed to send MIDI command. The hardware may not be responding."
        case .stateCorruption:
            return "The application state became corrupted. You can reset to defaults or reload from hardware."
        case .hardwareNotResponding:
            return "The GR-55 hardware is not responding. Please check the connection and power."
        case .invalidParameter(let param):
            return "Invalid parameter value for \(param). Please try again."
        }
    }
}
```

This comprehensive user workflows guide provides detailed implementation examples and user experience flows for all major interactions in the GR55 SwiftUI hardware interface, ensuring a smooth and intuitive user experience that matches the functionality of the original React Native implementation.
