import Foundation
import SwiftUI
import Combine

// MARK: - MIDI Integration Protocol
/// Protocol defining the interface for MIDI communication
/// Designed for integration with existing Swift MIDI layer
@MainActor
protocol MIDIIntegrationInterface: Sendable {
    /// Sends a MIDI command asynchronously
    func sendMIDICommand(_ command: MIDICommand) async throws
    
    /// Receives MIDI data as an async stream
    func receiveMIDIData() -> AsyncStream<Data>
    
    /// Checks if MIDI connection is active
    var isConnected: Bool { get async }
}

// MARK: - MIDI Command Types
/// Represents different types of MIDI commands for the GR-55
enum MIDICommand: Sendable {
    case pedalSelection(Int)
    case ctlToggle(Bool)
    case expSwToggle(Bool)
    case patchNameChange(String)
    case patchLevelChange(Int)
    case styleChange(SoundStyle)
    case bankChange(Int)
    case effectToggle(String, Bool)
    case toneSourceToggle(String, Bool)
    case assignToggle(Int, Bool)
    
    /// Raw MIDI data representation (to be implemented in MIDI integration task)
    var midiData: Data {
        // This will be implemented in the MIDI integration task
        // For now, return empty data
        return Data()
    }
}

// MARK: - GR55StateManager
/// Central state management for the GR55 hardware interface
/// Implements ObservableObject pattern for SwiftUI integration
/// Follows Swift 6.2 concurrency patterns with @MainActor
@MainActor
final class GR55StateManager: ObservableObject {
    
    // MARK: - Published State
    @Published private(set) var state: GR55State
    
    // MARK: - Private Properties
    private var cancellables = Set<AnyCancellable>()
    private let midiInterface: MIDIIntegrationInterface?
    
    // MARK: - Initialization
    init(initialState: GR55State = GR55State(), midiInterface: MIDIIntegrationInterface? = nil) {
        self.state = initialState
        self.midiInterface = midiInterface
        setupMIDIIntegration()
    }
    
    // MARK: - Public State Access
    /// Provides read-only access to current state
    var currentState: GR55State {
        return state
    }
    
    // MARK: - Pedal Actions
    /// Sets the active pedal and updates related state
    func setActivePedal(_ pedal: Int) {
        guard pedal >= 1 && pedal <= 3 else { return }
        
        state.activePedal = pedal
        
        // Update patch name based on bank slots if available
        if let bankSlots = state.bankSlots,
           pedal <= bankSlots.count {
            state.patchName = bankSlots[pedal - 1].name
        }
        
        // Send MIDI command for pedal selection asynchronously
        Task {
            await sendMIDIPedalSelection(pedal)
        }
    }
    
    /// Toggles CTL pedal status
    func toggleCtlPedal() {
        state.ctlStatus.toggle()
        
        // Update CTL function display based on status
        state.ctlFunction = state.ctlStatus ? "ACTIVE" : "REC/PLAY/DUB"
        
        // Send MIDI command for CTL toggle asynchronously
        Task {
            await sendMIDICtlToggle(state.ctlStatus)
        }
    }
    
    /// Toggles expression switch status
    func toggleExpSw() {
        state.expSwStatus.toggle()
        
        // Update EXP SW function display
        state.expSwFunction = state.expSwStatus ? "ACTIVE" : "EXP SW"
        
        // Send MIDI command for EXP SW toggle asynchronously
        Task {
            await sendMIDIExpSwToggle(state.expSwStatus)
        }
    }
    
    // MARK: - Patch Management
    /// Updates the current patch name
    func setPatchName(_ name: String) {
        state.patchName = name
        
        // Send MIDI command for patch name change asynchronously
        Task {
            await sendMIDIPatchNameChange(name)
        }
    }
    
    /// Sets the patch level (0-100)
    func setPatchLevel(_ level: Int) {
        let clampedLevel = max(0, min(100, level))
        state.patchLevel = clampedLevel
        
        // Send MIDI command for patch level change asynchronously
        Task {
            await sendMIDIPatchLevelChange(clampedLevel)
        }
    }
    
    // MARK: - Style Management
    /// Sets the active sound style
    func setActiveStyle(_ style: SoundStyle) {
        state.activeStyle = style
        
        // Update bank slots for new style
        updateBankSlotsForStyle(style)
        
        // Send MIDI command for style change asynchronously
        Task {
            await sendMIDIStyleChange(style)
        }
    }
    
    // MARK: - Bank Navigation
    /// Navigates to the next bank
    func gotoNextBank() {
        let currentBankNumber = extractBankNumber(from: state.bank)
        let nextBankNumber = min(currentBankNumber + 1, 99) // Assuming max 99 banks
        
        state.bank = formatBankString(nextBankNumber, ordinal: state.activePedal)
        updateBankSlotsForCurrentBank()
        
        // Send MIDI command for bank change asynchronously
        Task {
            await sendMIDIBankChange(nextBankNumber)
        }
    }
    
    /// Navigates to the previous bank
    func gotoPrevBank() {
        let currentBankNumber = extractBankNumber(from: state.bank)
        let prevBankNumber = max(currentBankNumber - 1, 1) // Assuming min bank 1
        
        state.bank = formatBankString(prevBankNumber, ordinal: state.activePedal)
        updateBankSlotsForCurrentBank()
        
        // Send MIDI command for bank change asynchronously
        Task {
            await sendMIDIBankChange(prevBankNumber)
        }
    }
    
    /// Selects an ordinal within the current bank
    func selectOrdinalInCurrentBank(_ ordinal: Int) {
        guard ordinal >= 1 && ordinal <= 3 else { return }
        
        let bankNumber = extractBankNumber(from: state.bank)
        state.bank = formatBankString(bankNumber, ordinal: ordinal)
        setActivePedal(ordinal)
    }
    
    // MARK: - Data Wheel Interactions
    /// Handles data wheel rotation
    func handleDataWheelRotate(_ direction: WheelDirection) {
        switch direction {
        case .left:
            // Rotate to previous pedal
            let newPedal = state.activePedal > 1 ? state.activePedal - 1 : 3
            setActivePedal(newPedal)
        case .right:
            // Rotate to next pedal
            let newPedal = state.activePedal < 3 ? state.activePedal + 1 : 1
            setActivePedal(newPedal)
        }
    }
    
    /// Handles data wheel directional press
    func handleDataWheelPress(_ direction: WheelPressDirection) {
        switch direction {
        case .up:
            // Navigate to next style
            navigateToNextStyle()
        case .down:
            // Navigate to previous style
            navigateToPreviousStyle()
        case .left:
            gotoPrevBank()
        case .right:
            gotoNextBank()
        }
    }
    
    // MARK: - Effect Management
    /// Toggles an effect on/off
    func toggleEffect(_ effectName: String) {
        switch effectName.lowercased() {
        case "mfx":
            state.mfxOn.toggle()
        case "delay":
            state.delayOn.toggle()
        case "chorus":
            state.chorusOn.toggle()
        case "reverb":
            state.reverbOn.toggle()
        case "amp":
            state.ampOn.toggle()
        case "ns":
            state.nsOn.toggle()
        case "mod":
            state.modOn.toggle()
        case "eq":
            state.eqOn.toggle()
        default:
            break
        }
        
        // Send MIDI command for effect toggle asynchronously
        Task {
            await sendMIDIEffectToggle(effectName, isOn: getEffectState(effectName))
        }
    }
    
    /// Toggles a tone source mute state
    func toggleToneSource(_ toneName: String) {
        switch toneName.lowercased() {
        case "pcm1":
            state.pcm1Muted.toggle()
        case "pcm2":
            state.pcm2Muted.toggle()
        case "model":
            state.modelMuted.toggle()
        case "guitar", "normal":
            state.normalPuMuted.toggle()
        default:
            break
        }
        
        // Send MIDI command for tone source toggle asynchronously
        Task {
            await sendMIDIToneSourceToggle(toneName, isMuted: getToneSourceMuteState(toneName))
        }
    }
    
    /// Toggles an assign switch
    func toggleAssign(_ assignNumber: Int) {
        guard assignNumber >= 1 && assignNumber <= 8 else { return }
        
        let index = assignNumber - 1
        state.assignStates[index].toggle()
        
        // Send MIDI command for assign toggle asynchronously
        Task {
            await sendMIDIAssignToggle(assignNumber, isOn: state.assignStates[index])
        }
    }
    
    // MARK: - MIDI Integration Interface
    /// Sets up MIDI integration with existing Swift layer
    private func setupMIDIIntegration() {
        // Set up MIDI data reception if interface is available
        guard let midiInterface = midiInterface else { return }
        
        // Start listening for incoming MIDI data
        Task {
            for await update in midiInterface.receiveMIDIData() {
                await processMIDIUpdate(update)
            }
        }
        
        // Start monitoring connection state
        Task {
            for await connectionState in midiInterface.connectionState {
                await handleConnectionStateChange(connectionState)
            }
        }
    }
    
    /// Configures MIDI integration with existing Swift MIDI layer contexts
    func configureMIDIIntegration(
        dataTransfer: Any?, // RolandDataTransferContext
        ioSetup: Any?,      // RolandIoSetupContext
        patchContext: Any?  // RolandRemotePatchContext
    ) async {
        guard let midiInterface = midiInterface else { return }
        
        await midiInterface.configureWithExistingMIDILayer(
            dataTransfer: dataTransfer,
            ioSetup: ioSetup,
            patchContext: patchContext
        )
    }
    
    /// Processes incoming MIDI data updates and updates state
    /// Uses async/await for Swift 6.2 compliance
    func processMIDIUpdate(_ update: MIDIDataUpdate) async {
        // Process different types of MIDI updates
        switch update.updateType {
        case .patchChange:
            await handlePatchChangeUpdate(update)
        case .parameterChange(let parameterName):
            await handleParameterChangeUpdate(update, parameterName: parameterName)
        case .effectChange(let effectName):
            await handleEffectChangeUpdate(update, effectName: effectName)
        case .toneSourceChange(let toneName):
            await handleToneSourceChangeUpdate(update, toneName: toneName)
        case .assignChange(let assignNumber):
            await handleAssignChangeUpdate(update, assignNumber: assignNumber)
        case .levelChange:
            await handleLevelChangeUpdate(update)
        case .styleChange:
            await handleStyleChangeUpdate(update)
        case .systemChange:
            await handleSystemChangeUpdate(update)
        case .connectionChange:
            await handleConnectionChangeUpdate(update)
        }
    }
    
    /// Handles connection state changes from MIDI interface
    func handleConnectionStateChange(_ connectionState: MIDIConnectionState) async {
        // Update UI based on connection state
        await MainActor.run {
            // Update connection-related UI state
            // This could involve showing/hiding connection indicators
            // or enabling/disabling controls based on connection status
        }
        
        // Handle specific connection states
        switch connectionState {
        case .connected:
            // Synchronize state when connection is established
            await synchronizeWithMIDI()
        case .disconnected:
            // Handle disconnection gracefully
            await handleMIDIDisconnection()
        case .error(let error):
            // Handle connection errors
            await handleMIDIConnectionError(error)
        case .connecting, .reconnecting:
            // Show appropriate UI feedback
            break
        }
    }
    
    // MARK: - MIDI Update Handlers
    private func handlePatchChangeUpdate(_ update: MIDIDataUpdate) async {
        // Extract patch information from MIDI data
        let bankMSB = update.address.count > 1 ? update.address[1] : 0
        let pc = update.value
        
        await updateFromMIDIPatchChange(bankMSB: bankMSB, pc: pc)
    }
    
    private func handleParameterChangeUpdate(_ update: MIDIDataUpdate, parameterName: String) async {
        await MainActor.run {
            // Update specific parameter based on name and value
            switch parameterName.lowercased() {
            case "patch level":
                state.patchLevel = Int(update.value)
            case "ctl status":
                state.ctlStatus = update.value > 0
            case "exp sw status":
                state.expSwStatus = update.value > 0
            default:
                break
            }
        }
    }
    
    private func handleEffectChangeUpdate(_ update: MIDIDataUpdate, effectName: String) async {
        await MainActor.run {
            let isOn = update.value > 0
            switch effectName.lowercased() {
            case "mfx":
                state.mfxOn = isOn
            case "delay":
                state.delayOn = isOn
            case "chorus":
                state.chorusOn = isOn
            case "reverb":
                state.reverbOn = isOn
            case "amp":
                state.ampOn = isOn
            case "ns":
                state.nsOn = isOn
            case "mod":
                state.modOn = isOn
            case "eq":
                state.eqOn = isOn
            default:
                break
            }
        }
    }
    
    private func handleToneSourceChangeUpdate(_ update: MIDIDataUpdate, toneName: String) async {
        await MainActor.run {
            let isMuted = update.value == 0 // Inverted logic for mute
            switch toneName.lowercased() {
            case "pcm1":
                state.pcm1Muted = isMuted
            case "pcm2":
                state.pcm2Muted = isMuted
            case "model":
                state.modelMuted = isMuted
            case "guitar", "normal":
                state.normalPuMuted = isMuted
            default:
                break
            }
        }
    }
    
    private func handleAssignChangeUpdate(_ update: MIDIDataUpdate, assignNumber: Int) async {
        await MainActor.run {
            guard assignNumber >= 1 && assignNumber <= 8 else { return }
            let index = assignNumber - 1
            state.assignStates[index] = update.value > 0
        }
    }
    
    private func handleLevelChangeUpdate(_ update: MIDIDataUpdate) async {
        await MainActor.run {
            state.patchLevel = Int(update.value)
        }
    }
    
    private func handleStyleChangeUpdate(_ update: MIDIDataUpdate) async {
        await MainActor.run {
            switch update.value {
            case 0:
                state.activeStyle = .lead
            case 1:
                state.activeStyle = .rhythm
            case 2:
                state.activeStyle = .other
            case 3:
                state.activeStyle = .user
            default:
                break
            }
        }
    }
    
    private func handleSystemChangeUpdate(_ update: MIDIDataUpdate) async {
        // Handle system-level changes
        // This could involve updating system parameters or configuration
    }
    
    private func handleConnectionChangeUpdate(_ update: MIDIDataUpdate) async {
        // Handle connection-related changes
        // This could involve updating connection quality or status
    }
    
    // MARK: - MIDI Error Handling
    private func handleMIDIDisconnection() async {
        // Handle MIDI disconnection gracefully
        await MainActor.run {
            // Update UI to show disconnected state
            // Disable controls that require MIDI connection
        }
    }
    
    private func handleMIDIConnectionError(_ error: MIDIError) async {
        // Handle MIDI connection errors
        await MainActor.run {
            // Show error message to user
            // Provide recovery options
        }
        
        // Log error for debugging
        print("MIDI Connection Error: \(error.localizedDescription)")
    }
    
    /// Sends a MIDI command using the integration interface
    private func sendMIDICommand(_ command: MIDICommand) async {
        guard let midiInterface = midiInterface else { return }
        
        do {
            try await midiInterface.sendMIDICommand(command)
        } catch {
            // Handle MIDI communication errors
            print("MIDI command failed: \(error)")
        }
    }
    
    /// Sends MIDI command for pedal selection
    /// Uses async/await for Swift 6.2 compliance
    private func sendMIDIPedalSelection(_ pedal: Int) async {
        await sendMIDICommand(.pedalSelection(pedal))
    }
    
    /// Sends MIDI command for CTL toggle
    /// Uses async/await for Swift 6.2 compliance
    private func sendMIDICtlToggle(_ isActive: Bool) async {
        await sendMIDICommand(.ctlToggle(isActive))
    }
    
    /// Sends MIDI command for EXP SW toggle
    /// Uses async/await for Swift 6.2 compliance
    private func sendMIDIExpSwToggle(_ isActive: Bool) async {
        await sendMIDICommand(.expSwToggle(isActive))
    }
    
    /// Sends MIDI command for patch name change
    /// Uses async/await for Swift 6.2 compliance
    private func sendMIDIPatchNameChange(_ name: String) async {
        await sendMIDICommand(.patchNameChange(name))
    }
    
    /// Sends MIDI command for patch level change
    /// Uses async/await for Swift 6.2 compliance
    private func sendMIDIPatchLevelChange(_ level: Int) async {
        await sendMIDICommand(.patchLevelChange(level))
    }
    
    /// Sends MIDI command for style change
    /// Uses async/await for Swift 6.2 compliance
    private func sendMIDIStyleChange(_ style: SoundStyle) async {
        await sendMIDICommand(.styleChange(style))
    }
    
    /// Sends MIDI command for bank change
    /// Uses async/await for Swift 6.2 compliance
    private func sendMIDIBankChange(_ bankNumber: Int) async {
        await sendMIDICommand(.bankChange(bankNumber))
    }
    
    /// Sends MIDI command for effect toggle
    /// Uses async/await for Swift 6.2 compliance
    private func sendMIDIEffectToggle(_ effectName: String, isOn: Bool) async {
        await sendMIDICommand(.effectToggle(effectName, isOn))
    }
    
    /// Sends MIDI command for tone source toggle
    /// Uses async/await for Swift 6.2 compliance
    private func sendMIDIToneSourceToggle(_ toneName: String, isMuted: Bool) async {
        await sendMIDICommand(.toneSourceToggle(toneName, isMuted))
    }
    
    /// Sends MIDI command for assign toggle
    /// Uses async/await for Swift 6.2 compliance
    private func sendMIDIAssignToggle(_ assignNumber: Int, isOn: Bool) async {
        await sendMIDICommand(.assignToggle(assignNumber, isOn))
    }
    
    // MARK: - Helper Methods
    /// Extracts bank number from bank string (e.g., "01-1" -> 1)
    private func extractBankNumber(from bankString: String) -> Int {
        let components = bankString.split(separator: "-")
        if let bankPart = components.first,
           let bankNumber = Int(bankPart) {
            return bankNumber
        }
        return 1 // Default to bank 1
    }
    
    /// Formats bank string from number and ordinal
    private func formatBankString(_ bankNumber: Int, ordinal: Int) -> String {
        return String(format: "%02d-%d", bankNumber, ordinal)
    }
    
    /// Updates bank slots for the current style
    private func updateBankSlotsForStyle(_ style: SoundStyle) {
        // Generate sample bank slots for the style
        // In real implementation, this would fetch from MIDI data
        state.bankSlots = generateSampleBankSlots(for: style)
    }
    
    /// Updates bank slots for current bank
    private func updateBankSlotsForCurrentBank() {
        // Update bank slots based on current bank and style
        updateBankSlotsForStyle(state.activeStyle)
    }
    
    /// Generates sample bank slots for a style
    private func generateSampleBankSlots(for style: SoundStyle) -> [BankSlot] {
        let baseNames = [
            "LEAD GUITAR",
            "RHYTHM GUITAR", 
            "BASS GUITAR"
        ]
        
        return baseNames.enumerated().map { index, name in
            BankSlot(
                ordinal: index + 1,
                name: "\(style.rawValue) \(name)",
                style: style
            )
        }
    }
    
    /// Navigates to next style in sequence
    private func navigateToNextStyle() {
        let allStyles = SoundStyle.allCases
        if let currentIndex = allStyles.firstIndex(of: state.activeStyle) {
            let nextIndex = (currentIndex + 1) % allStyles.count
            setActiveStyle(allStyles[nextIndex])
        }
    }
    
    /// Navigates to previous style in sequence
    private func navigateToPreviousStyle() {
        let allStyles = SoundStyle.allCases
        if let currentIndex = allStyles.firstIndex(of: state.activeStyle) {
            let prevIndex = currentIndex > 0 ? currentIndex - 1 : allStyles.count - 1
            setActiveStyle(allStyles[prevIndex])
        }
    }
    
    /// Gets current effect state
    private func getEffectState(_ effectName: String) -> Bool {
        switch effectName.lowercased() {
        case "mfx": return state.mfxOn
        case "delay": return state.delayOn
        case "chorus": return state.chorusOn
        case "reverb": return state.reverbOn
        case "amp": return state.ampOn
        case "ns": return state.nsOn
        case "mod": return state.modOn
        case "eq": return state.eqOn
        default: return false
        }
    }
    
    /// Gets current tone source mute state
    private func getToneSourceMuteState(_ toneName: String) -> Bool {
        switch toneName.lowercased() {
        case "pcm1": return state.pcm1Muted
        case "pcm2": return state.pcm2Muted
        case "model": return state.modelMuted
        case "guitar", "normal": return state.normalPuMuted
        default: return false
        }
    }
    
    /// Resets all state to default values
    func resetToDefaults() {
        state = GR55State()
        
        // Synchronize with MIDI hardware
        Task {
            await synchronizeWithMIDI()
        }
    }
    
    /// Updates multiple state properties atomically
    func updateState(_ updates: (inout GR55State) -> Void) {
        updates(&state)
    }
    
    /// Gets a read-only copy of the current state
    func getStateSnapshot() -> GR55State {
        return state
    }
}

// MARK: - MIDI Integration Extensions
extension GR55StateManager {
    /// Updates state from MIDI patch change
    func updateFromMIDIPatchChange(bankMSB: UInt8, pc: UInt8) async {
        // Convert MIDI values to internal state
        let bankNumber = Int(bankMSB) + 1
        let ordinal = Int(pc % 3) + 1
        
        // Ensure UI updates happen on main actor
        await MainActor.run {
            state.bank = formatBankString(bankNumber, ordinal: ordinal)
            state.activePedal = ordinal
            
            // Update patch name from MIDI data
            // This would typically involve a lookup table or MIDI query
            updateBankSlotsForCurrentBank()
        }
    }
    
    /// Updates state from MIDI parameter change
    func updateFromMIDIParameter(address: [UInt8], value: UInt8) async {
        // Parse MIDI address and update corresponding state
        // Implementation depends on GR-55 MIDI specification
        
        await MainActor.run {
            // Update specific state properties based on MIDI address
            // This will be implemented in the MIDI integration task
        }
    }
    
    /// Gets MIDI patch selection for current state
    func getCurrentMIDIPatchSelection() -> PatchSelection {
        let bankNumber = extractBankNumber(from: state.bank)
        let bankMSB = UInt8(max(0, min(127, bankNumber - 1)))
        let pc = UInt8(max(0, min(127, state.activePedal - 1)))
        
        return PatchSelection(bankSelectMSB: bankMSB, pc: pc)
    }
    
    /// Checks if MIDI interface is connected
    var isMIDIConnected: Bool {
        get async {
            guard let midiInterface = midiInterface else { return false }
            return await midiInterface.isConnected
        }
    }
    
    /// Synchronizes current state with MIDI hardware
    func synchronizeWithMIDI() async {
        // Send all current state values to MIDI hardware
        await sendMIDIPedalSelection(state.activePedal)
        await sendMIDIPatchLevelChange(state.patchLevel)
        await sendMIDIStyleChange(state.activeStyle)
        
        // Sync all effect states
        await sendMIDIEffectToggle("mfx", isOn: state.mfxOn)
        await sendMIDIEffectToggle("delay", isOn: state.delayOn)
        await sendMIDIEffectToggle("chorus", isOn: state.chorusOn)
        await sendMIDIEffectToggle("reverb", isOn: state.reverbOn)
        await sendMIDIEffectToggle("amp", isOn: state.ampOn)
        await sendMIDIEffectToggle("ns", isOn: state.nsOn)
        await sendMIDIEffectToggle("mod", isOn: state.modOn)
        await sendMIDIEffectToggle("eq", isOn: state.eqOn)
        
        // Sync tone source states
        await sendMIDIToneSourceToggle("pcm1", isMuted: state.pcm1Muted)
        await sendMIDIToneSourceToggle("pcm2", isMuted: state.pcm2Muted)
        await sendMIDIToneSourceToggle("model", isMuted: state.modelMuted)
        await sendMIDIToneSourceToggle("guitar", isMuted: state.normalPuMuted)
        
        // Sync assign states
        for (index, isOn) in state.assignStates.enumerated() {
            await sendMIDIAssignToggle(index + 1, isOn: isOn)
        }
    }
}