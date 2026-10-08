import Foundation
import SwiftUI

// MARK: - MIDI Command Generation Interface
/// Generates MIDI commands for user interactions with the GR55 hardware interface
/// Integrates with existing RolandSysExProtocol for message formatting

/// Main interface for generating MIDI commands from user interactions
protocol MIDICommandGenerator: Sendable {
    /// Generates MIDI command for pedal selection
    func generatePedalSelectionCommand(_ pedal: Int) -> MIDICommand
    
    /// Generates MIDI command for bank navigation
    func generateBankNavigationCommand(_ direction: BankNavigationDirection) -> MIDICommand
    
    /// Generates MIDI command for patch level change
    func generatePatchLevelCommand(_ level: Int) -> MIDICommand
    
    /// Generates MIDI command for effect toggle
    func generateEffectToggleCommand(_ effectName: String, isOn: Bool) -> MIDICommand
    
    /// Generates MIDI command for tone source toggle
    func generateToneSourceToggleCommand(_ toneName: String, isMuted: Bool) -> MIDICommand
    
    /// Generates MIDI command for style change
    func generateStyleChangeCommand(_ style: SoundStyle) -> MIDICommand
    
    /// Generates MIDI command for assign toggle
    func generateAssignToggleCommand(_ assignNumber: Int, isOn: Bool) -> MIDICommand
    
    /// Generates MIDI command for CTL pedal toggle
    func generateCtlToggleCommand(_ isActive: Bool) -> MIDICommand
    
    /// Generates MIDI command for expression switch toggle
    func generateExpSwToggleCommand(_ isActive: Bool) -> MIDICommand
    
    /// Generates MIDI command for data wheel interaction
    func generateDataWheelCommand(_ interaction: DataWheelInteraction) -> MIDICommand
    
    /// Generates batch of MIDI commands for state synchronization
    func generateSynchronizationCommands(from state: GR55State) -> [MIDICommand]
}

// MARK: - Default Implementation
/// Default implementation of MIDI command generation
/// Uses existing GR-55 MIDI address mappings and protocol
final class DefaultMIDICommandGenerator: MIDICommandGenerator {
    
    // MARK: - Pedal and Navigation Commands
    func generatePedalSelectionCommand(_ pedal: Int) -> MIDICommand {
        guard pedal >= 1 && pedal <= 3 else {
            return .pedalSelection(1) // Default to pedal 1 for invalid input
        }
        return .pedalSelection(pedal)
    }
    
    func generateBankNavigationCommand(_ direction: BankNavigationDirection) -> MIDICommand {
        switch direction {
        case .next:
            return .bankNavigation(.nextBank)
        case .previous:
            return .bankNavigation(.previousBank)
        case .select(let bankNumber):
            return .bankNavigation(.selectBank(bankNumber))
        case .selectOrdinal(let ordinal):
            return .bankNavigation(.selectOrdinal(ordinal))
        }
    }
    
    func generateDataWheelCommand(_ interaction: DataWheelInteraction) -> MIDICommand {
        switch interaction {
        case .rotate(let direction):
            return .dataWheelRotation(direction)
        case .press(let direction):
            return .dataWheelPress(direction)
        }
    }
    
    // MARK: - Parameter Commands
    func generatePatchLevelCommand(_ level: Int) -> MIDICommand {
        let clampedLevel = max(0, min(100, level))
        return .patchLevelChange(clampedLevel)
    }
    
    func generateStyleChangeCommand(_ style: SoundStyle) -> MIDICommand {
        return .styleChange(style)
    }
    
    // MARK: - Effect Commands
    func generateEffectToggleCommand(_ effectName: String, isOn: Bool) -> MIDICommand {
        let normalizedName = normalizeEffectName(effectName)
        return .effectToggle(effectName: normalizedName, isOn: isOn)
    }
    
    func generateToneSourceToggleCommand(_ toneName: String, isMuted: Bool) -> MIDICommand {
        let normalizedName = normalizeToneSourceName(toneName)
        return .toneSourceToggle(toneName: normalizedName, isMuted: isMuted)
    }
    
    func generateAssignToggleCommand(_ assignNumber: Int, isOn: Bool) -> MIDICommand {
        guard assignNumber >= 1 && assignNumber <= 8 else {
            return .assignToggle(assignNumber: 1, isOn: false) // Default for invalid input
        }
        return .assignToggle(assignNumber: assignNumber, isOn: isOn)
    }
    
    // MARK: - Control Commands
    func generateCtlToggleCommand(_ isActive: Bool) -> MIDICommand {
        return .ctlToggle(isActive)
    }
    
    func generateExpSwToggleCommand(_ isActive: Bool) -> MIDICommand {
        return .expSwToggle(isActive)
    }
    
    // MARK: - Batch Commands
    func generateSynchronizationCommands(from state: GR55State) -> [MIDICommand] {
        var commands: [MIDICommand] = []
        
        // Pedal and patch commands
        commands.append(.pedalSelection(state.activePedal))
        commands.append(.patchLevelChange(state.patchLevel))
        commands.append(.styleChange(state.activeStyle))
        
        // Control commands
        commands.append(.ctlToggle(state.ctlStatus))
        commands.append(.expSwToggle(state.expSwStatus))
        
        // Effect commands
        commands.append(.effectToggle(effectName: "mfx", isOn: state.mfxOn))
        commands.append(.effectToggle(effectName: "delay", isOn: state.delayOn))
        commands.append(.effectToggle(effectName: "chorus", isOn: state.chorusOn))
        commands.append(.effectToggle(effectName: "reverb", isOn: state.reverbOn))
        commands.append(.effectToggle(effectName: "amp", isOn: state.ampOn))
        commands.append(.effectToggle(effectName: "ns", isOn: state.nsOn))
        commands.append(.effectToggle(effectName: "mod", isOn: state.modOn))
        commands.append(.effectToggle(effectName: "eq", isOn: state.eqOn))
        
        // Tone source commands
        commands.append(.toneSourceToggle(toneName: "pcm1", isMuted: state.pcm1Muted))
        commands.append(.toneSourceToggle(toneName: "pcm2", isMuted: state.pcm2Muted))
        commands.append(.toneSourceToggle(toneName: "model", isMuted: state.modelMuted))
        commands.append(.toneSourceToggle(toneName: "guitar", isMuted: state.normalPuMuted))
        
        // Assign commands
        for (index, isOn) in state.assignStates.enumerated() {
            commands.append(.assignToggle(assignNumber: index + 1, isOn: isOn))
        }
        
        return commands
    }
    
    // MARK: - Helper Methods
    private func normalizeEffectName(_ name: String) -> String {
        let lowercased = name.lowercased()
        switch lowercased {
        case "mfx", "multi-fx", "multifx":
            return "mfx"
        case "delay", "dly":
            return "delay"
        case "chorus", "cho":
            return "chorus"
        case "reverb", "rev":
            return "reverb"
        case "amp", "amplifier":
            return "amp"
        case "ns", "noise suppressor", "noisesuppressor":
            return "ns"
        case "mod", "modulation":
            return "mod"
        case "eq", "equalizer":
            return "eq"
        default:
            return lowercased
        }
    }
    
    private func normalizeToneSourceName(_ name: String) -> String {
        let lowercased = name.lowercased()
        switch lowercased {
        case "pcm1", "pcm 1":
            return "pcm1"
        case "pcm2", "pcm 2":
            return "pcm2"
        case "model", "modeling":
            return "model"
        case "guitar", "normal", "normal pu", "normalpu":
            return "guitar"
        default:
            return lowercased
        }
    }
}

// MARK: - Supporting Types
enum BankNavigationDirection: Sendable {
    case next
    case previous
    case select(Int)
    case selectOrdinal(Int)
}

enum DataWheelInteraction: Sendable {
    case rotate(WheelDirection)
    case press(WheelPressDirection)
}

// MARK: - MIDI Command Validation
/// Validates MIDI commands before transmission
/// Ensures commands are within valid ranges and formats
struct MIDICommandValidator {
    
    /// Validates a MIDI command
    static func validate(_ command: MIDICommand) -> ValidationResult {
        switch command {
        case .pedalSelection(let pedal):
            return validatePedalNumber(pedal)
        case .patchLevelChange(let level):
            return validatePatchLevel(level)
        case .assignToggle(let assignNumber, _):
            return validateAssignNumber(assignNumber)
        case .effectToggle(let effectName, _):
            return validateEffectName(effectName)
        case .toneSourceToggle(let toneName, _):
            return validateToneSourceName(toneName)
        case .styleChange(let style):
            return validateStyle(style)
        default:
            return .valid
        }
    }
    
    private static func validatePedalNumber(_ pedal: Int) -> ValidationResult {
        guard pedal >= 1 && pedal <= 3 else {
            return .invalid("Pedal number must be between 1 and 3")
        }
        return .valid
    }
    
    private static func validatePatchLevel(_ level: Int) -> ValidationResult {
        guard level >= 0 && level <= 100 else {
            return .invalid("Patch level must be between 0 and 100")
        }
        return .valid
    }
    
    private static func validateAssignNumber(_ assignNumber: Int) -> ValidationResult {
        guard assignNumber >= 1 && assignNumber <= 8 else {
            return .invalid("Assign number must be between 1 and 8")
        }
        return .valid
    }
    
    private static func validateEffectName(_ effectName: String) -> ValidationResult {
        let validEffects = ["mfx", "delay", "chorus", "reverb", "amp", "ns", "mod", "eq"]
        guard validEffects.contains(effectName.lowercased()) else {
            return .invalid("Invalid effect name: \(effectName)")
        }
        return .valid
    }
    
    private static func validateToneSourceName(_ toneName: String) -> ValidationResult {
        let validToneSources = ["pcm1", "pcm2", "model", "guitar"]
        guard validToneSources.contains(toneName.lowercased()) else {
            return .invalid("Invalid tone source name: \(toneName)")
        }
        return .valid
    }
    
    private static func validateStyle(_ style: SoundStyle) -> ValidationResult {
        // All SoundStyle cases are valid
        return .valid
    }
}

enum ValidationResult {
    case valid
    case invalid(String)
    
    var isValid: Bool {
        if case .valid = self {
            return true
        }
        return false
    }
    
    var errorMessage: String? {
        if case .invalid(let message) = self {
            return message
        }
        return nil
    }
}

// MARK: - MIDI Command Scheduling
/// Schedules MIDI commands with appropriate timing and priority
/// Integrates with existing queue system from RolandDataTransfer
final class MIDICommandScheduler: Sendable {
    
    private let minimumDelay: TimeInterval = 0.02 // 20ms like existing GAP_BETWEEN_MESSAGES_MS
    private var lastCommandTime: Date = Date.distantPast
    
    /// Schedules a single MIDI command with appropriate delay
    func scheduleCommand(_ command: MIDICommand) async throws {
        // Ensure minimum delay between commands
        let timeSinceLastCommand = Date().timeIntervalSince(lastCommandTime)
        if timeSinceLastCommand < minimumDelay {
            let delayNeeded = minimumDelay - timeSinceLastCommand
            try await Task.sleep(nanoseconds: UInt64(delayNeeded * 1_000_000_000))
        }
        
        lastCommandTime = Date()
    }
    
    /// Schedules multiple MIDI commands with appropriate delays
    func scheduleCommands(_ commands: [MIDICommand]) async throws {
        for command in commands {
            try await scheduleCommand(command)
            // Additional processing would happen here in actual implementation
        }
    }
    
    /// Gets the recommended delay for a command based on its priority
    func getRecommendedDelay(for command: MIDICommand) -> TimeInterval {
        switch command.priority {
        case .immediate:
            return minimumDelay
        case .high:
            return minimumDelay * 1.5
        case .normal:
            return minimumDelay * 2.0
        case .low:
            return minimumDelay * 3.0
        }
    }
}

// MARK: - MIDI Command History
/// Tracks MIDI command history for debugging and undo functionality
final class MIDICommandHistory: ObservableObject {
    
    @Published private(set) var commandHistory: [MIDICommandHistoryEntry] = []
    private let maxHistorySize = 100
    
    /// Adds a command to the history
    func addCommand(_ command: MIDICommand, result: MIDICommandResult) {
        let entry = MIDICommandHistoryEntry(
            command: command,
            result: result,
            timestamp: Date()
        )
        
        commandHistory.append(entry)
        
        // Limit history size
        if commandHistory.count > maxHistorySize {
            commandHistory.removeFirst()
        }
    }
    
    /// Gets recent commands of a specific type
    func getRecentCommands(ofType type: MIDICommandType, limit: Int = 10) -> [MIDICommandHistoryEntry] {
        return commandHistory
            .filter { $0.command.commandType == type }
            .suffix(limit)
            .reversed()
    }
    
    /// Clears the command history
    func clearHistory() {
        commandHistory.removeAll()
    }
    
    /// Gets statistics about command usage
    func getCommandStatistics() -> MIDICommandStatistics {
        let totalCommands = commandHistory.count
        let successfulCommands = commandHistory.filter { $0.result.isSuccess }.count
        let failedCommands = totalCommands - successfulCommands
        
        let commandTypeCounts = Dictionary(grouping: commandHistory, by: { $0.command.commandType })
            .mapValues { $0.count }
        
        return MIDICommandStatistics(
            totalCommands: totalCommands,
            successfulCommands: successfulCommands,
            failedCommands: failedCommands,
            commandTypeCounts: commandTypeCounts
        )
    }
}

// MARK: - Supporting Types for History
struct MIDICommandHistoryEntry: Identifiable, Sendable {
    let id = UUID()
    let command: MIDICommand
    let result: MIDICommandResult
    let timestamp: Date
}

enum MIDICommandResult: Sendable {
    case success
    case failure(MIDIError)
    case timeout
    
    var isSuccess: Bool {
        if case .success = self {
            return true
        }
        return false
    }
}

enum MIDICommandType: Sendable, Hashable {
    case pedalSelection
    case bankNavigation
    case patchLevel
    case effectToggle
    case toneSourceToggle
    case styleChange
    case assignToggle
    case controlToggle
    case dataWheel
    case systemCommand
}

extension MIDICommand {
    var commandType: MIDICommandType {
        switch self {
        case .pedalSelection:
            return .pedalSelection
        case .bankNavigation:
            return .bankNavigation
        case .patchLevelChange:
            return .patchLevel
        case .effectToggle:
            return .effectToggle
        case .toneSourceToggle:
            return .toneSourceToggle
        case .styleChange:
            return .styleChange
        case .assignToggle:
            return .assignToggle
        case .ctlToggle, .expSwToggle:
            return .controlToggle
        case .dataWheelRotation, .dataWheelPress:
            return .dataWheel
        case .requestPatchData, .requestSystemData, .saveUserPatch:
            return .systemCommand
        default:
            return .systemCommand
        }
    }
}

struct MIDICommandStatistics: Sendable {
    let totalCommands: Int
    let successfulCommands: Int
    let failedCommands: Int
    let commandTypeCounts: [MIDICommandType: Int]
    
    var successRate: Double {
        guard totalCommands > 0 else { return 0.0 }
        return Double(successfulCommands) / Double(totalCommands)
    }
}

// MARK: - MIDI Command Factory
/// Factory for creating MIDI commands with validation and optimization
final class MIDICommandFactory {
    
    private let generator: MIDICommandGenerator
    private let validator = MIDICommandValidator.self
    
    init(generator: MIDICommandGenerator = DefaultMIDICommandGenerator()) {
        self.generator = generator
    }
    
    /// Creates a validated MIDI command for pedal selection
    func createPedalSelectionCommand(_ pedal: Int) throws -> MIDICommand {
        let command = generator.generatePedalSelectionCommand(pedal)
        let validation = validator.validate(command)
        
        guard validation.isValid else {
            throw MIDIError.invalidCommand(validation.errorMessage ?? "Invalid pedal selection")
        }
        
        return command
    }
    
    /// Creates a validated MIDI command for patch level change
    func createPatchLevelCommand(_ level: Int) throws -> MIDICommand {
        let command = generator.generatePatchLevelCommand(level)
        let validation = validator.validate(command)
        
        guard validation.isValid else {
            throw MIDIError.valueOutOfRange(UInt8(level))
        }
        
        return command
    }
    
    /// Creates a validated MIDI command for effect toggle
    func createEffectToggleCommand(_ effectName: String, isOn: Bool) throws -> MIDICommand {
        let command = generator.generateEffectToggleCommand(effectName, isOn: isOn)
        let validation = validator.validate(command)
        
        guard validation.isValid else {
            throw MIDIError.invalidCommand(validation.errorMessage ?? "Invalid effect name")
        }
        
        return command
    }
    
    /// Creates a batch of validated MIDI commands for state synchronization
    func createSynchronizationCommands(from state: GR55State) throws -> [MIDICommand] {
        let commands = generator.generateSynchronizationCommands(from: state)
        
        // Validate all commands
        for command in commands {
            let validation = validator.validate(command)
            guard validation.isValid else {
                throw MIDIError.invalidCommand(validation.errorMessage ?? "Invalid synchronization command")
            }
        }
        
        return commands
    }
    
    /// Creates an optimized batch of commands by removing duplicates and unnecessary commands
    func createOptimizedCommandBatch(_ commands: [MIDICommand]) -> [MIDICommand] {
        var optimizedCommands: [MIDICommand] = []
        var seenCommands: Set<MIDICommand> = []
        
        // Remove duplicates while preserving order
        for command in commands {
            if !seenCommands.contains(command) {
                seenCommands.insert(command)
                optimizedCommands.append(command)
            }
        }
        
        return optimizedCommands
    }
}