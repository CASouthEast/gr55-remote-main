import Foundation
import SwiftUI
import Combine

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
    
    // MARK: - Initialization
    init(initialState: GR55State = GR55State()) {
        self.state = initialState
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
        
        // Send MIDI command for pedal selection
        sendMIDIPedalSelection(pedal)
    }
    
    /// Toggles CTL pedal status
    func toggleCtlPedal() {
        state.ctlStatus.toggle()
        
        // Update CTL function display based on status
        state.ctlFunction = state.ctlStatus ? "ACTIVE" : "REC/PLAY/DUB"
        
        // Send MIDI command for CTL toggle
        sendMIDICtlToggle(state.ctlStatus)
    }
    
    /// Toggles expression switch status
    func toggleExpSw() {
        state.expSwStatus.toggle()
        
        // Update EXP SW function display
        state.expSwFunction = state.expSwStatus ? "ACTIVE" : "EXP SW"
        
        // Send MIDI command for EXP SW toggle
        sendMIDIExpSwToggle(state.expSwStatus)
    }
    
    // MARK: - Patch Management
    /// Updates the current patch name
    func setPatchName(_ name: String) {
        state.patchName = name
        
        // Send MIDI command for patch name change
        sendMIDIPatchNameChange(name)
    }
    
    /// Sets the patch level (0-100)
    func setPatchLevel(_ level: Int) {
        let clampedLevel = max(0, min(100, level))
        state.patchLevel = clampedLevel
        
        // Send MIDI command for patch level change
        sendMIDIPatchLevelChange(clampedLevel)
    }
    
    // MARK: - Style Management
    /// Sets the active sound style
    func setActiveStyle(_ style: SoundStyle) {
        state.activeStyle = style
        
        // Update bank slots for new style
        updateBankSlotsForStyle(style)
        
        // Send MIDI command for style change
        sendMIDIStyleChange(style)
    }
    
    // MARK: - Bank Navigation
    /// Navigates to the next bank
    func gotoNextBank() {
        let currentBankNumber = extractBankNumber(from: state.bank)
        let nextBankNumber = min(currentBankNumber + 1, 99) // Assuming max 99 banks
        
        state.bank = formatBankString(nextBankNumber, ordinal: state.activePedal)
        updateBankSlotsForCurrentBank()
        
        // Send MIDI command for bank change
        sendMIDIBankChange(nextBankNumber)
    }
    
    /// Navigates to the previous bank
    func gotoPrevBank() {
        let currentBankNumber = extractBankNumber(from: state.bank)
        let prevBankNumber = max(currentBankNumber - 1, 1) // Assuming min bank 1
        
        state.bank = formatBankString(prevBankNumber, ordinal: state.activePedal)
        updateBankSlotsForCurrentBank()
        
        // Send MIDI command for bank change
        sendMIDIBankChange(prevBankNumber)
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
        
        // Send MIDI command for effect toggle
        sendMIDIEffectToggle(effectName, isOn: getEffectState(effectName))
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
        
        // Send MIDI command for tone source toggle
        sendMIDIToneSourceToggle(toneName, isMuted: getToneSourceMuteState(toneName))
    }
    
    /// Toggles an assign switch
    func toggleAssign(_ assignNumber: Int) {
        guard assignNumber >= 1 && assignNumber <= 8 else { return }
        
        let index = assignNumber - 1
        state.assignStates[index].toggle()
        
        // Send MIDI command for assign toggle
        sendMIDIAssignToggle(assignNumber, isOn: state.assignStates[index])
    }
    
    // MARK: - MIDI Integration Interface
    /// Sets up MIDI integration with existing Swift layer
    private func setupMIDIIntegration() {
        // This will interface with the existing Swift MIDI communication layer
        // Implementation will be completed in the MIDI integration task
    }
    
    /// Processes incoming MIDI data and updates state
    func processMIDIData(_ data: Data) {
        // Parse MIDI data and update corresponding state properties
        // Implementation will be completed in the MIDI integration task
    }
    
    /// Sends MIDI command for pedal selection
    private func sendMIDIPedalSelection(_ pedal: Int) {
        // Implementation will interface with existing MIDI layer
    }
    
    /// Sends MIDI command for CTL toggle
    private func sendMIDICtlToggle(_ isActive: Bool) {
        // Implementation will interface with existing MIDI layer
    }
    
    /// Sends MIDI command for EXP SW toggle
    private func sendMIDIExpSwToggle(_ isActive: Bool) {
        // Implementation will interface with existing MIDI layer
    }
    
    /// Sends MIDI command for patch name change
    private func sendMIDIPatchNameChange(_ name: String) {
        // Implementation will interface with existing MIDI layer
    }
    
    /// Sends MIDI command for patch level change
    private func sendMIDIPatchLevelChange(_ level: Int) {
        // Implementation will interface with existing MIDI layer
    }
    
    /// Sends MIDI command for style change
    private func sendMIDIStyleChange(_ style: SoundStyle) {
        // Implementation will interface with existing MIDI layer
    }
    
    /// Sends MIDI command for bank change
    private func sendMIDIBankChange(_ bankNumber: Int) {
        // Implementation will interface with existing MIDI layer
    }
    
    /// Sends MIDI command for effect toggle
    private func sendMIDIEffectToggle(_ effectName: String, isOn: Bool) {
        // Implementation will interface with existing MIDI layer
    }
    
    /// Sends MIDI command for tone source toggle
    private func sendMIDIToneSourceToggle(_ toneName: String, isMuted: Bool) {
        // Implementation will interface with existing MIDI layer
    }
    
    /// Sends MIDI command for assign toggle
    private func sendMIDIAssignToggle(_ assignNumber: Int, isOn: Bool) {
        // Implementation will interface with existing MIDI layer
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
}

// MARK: - MIDI Integration Extensions
extension GR55StateManager {
    /// Updates state from MIDI patch change
    func updateFromMIDIPatchChange(bankMSB: UInt8, pc: UInt8) {
        // Convert MIDI values to internal state
        let bankNumber = Int(bankMSB) + 1
        let ordinal = Int(pc % 3) + 1
        
        state.bank = formatBankString(bankNumber, ordinal: ordinal)
        state.activePedal = ordinal
        
        // Update patch name from MIDI data
        // This would typically involve a lookup table or MIDI query
    }
    
    /// Updates state from MIDI parameter change
    func updateFromMIDIParameter(address: [UInt8], value: UInt8) {
        // Parse MIDI address and update corresponding state
        // Implementation depends on GR-55 MIDI specification
    }
    
    /// Gets MIDI patch selection for current state
    func getCurrentMIDIPatchSelection() -> PatchSelection {
        let bankNumber = extractBankNumber(from: state.bank)
        let bankMSB = UInt8(max(0, min(127, bankNumber - 1)))
        let pc = UInt8(max(0, min(127, state.activePedal - 1)))
        
        return PatchSelection(bankSelectMSB: bankMSB, pc: pc)
    }
}