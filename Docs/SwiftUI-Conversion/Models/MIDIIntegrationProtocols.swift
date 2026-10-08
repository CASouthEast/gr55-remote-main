import Foundation
import SwiftUI
import Combine

// MARK: - MIDI Integration Protocols
/// Core protocols for MIDI communication integration with existing Swift layer

/// Main interface for MIDI communication with GR-55 hardware
/// Designed to integrate with existing Swift MIDI layer without breaking changes
@MainActor
protocol MIDIIntegrationInterface: Sendable {
    /// Sends a MIDI command asynchronously
    /// Integrates with existing RolandDataTransfer.setField method
    func sendMIDICommand(_ command: MIDICommand) async throws
    
    /// Receives MIDI data as an async stream
    /// Integrates with existing MIDI message parsing
    func receiveMIDIData() -> AsyncStream<MIDIDataUpdate>
    
    /// Checks if MIDI connection is active
    /// Uses existing RolandIoSetupContext connection state
    var isConnected: Bool { get async }
    
    /// Connection state changes stream
    /// Monitors existing MIDI connection state
    var connectionState: AsyncStream<MIDIConnectionState> { get }
    
    /// Synchronizes current state with hardware
    /// Uses existing requestData methods
    func synchronizeWithHardware() async throws
    
    /// Requests current patch data from hardware
    /// Integrates with existing patch data loading
    func requestCurrentPatchData() async throws -> PatchData
    
    /// Sets up integration with existing MIDI contexts
    func configureWithExistingMIDILayer(
        dataTransfer: Any?, // RolandDataTransferContext
        ioSetup: Any?,      // RolandIoSetupContext
        patchContext: Any?  // RolandRemotePatchContext
    ) async
}

/// Processes high-level commands into MIDI data
/// Converts SwiftUI actions to existing MIDI protocol format
protocol MIDICommandProcessor: Sendable {
    /// Converts a MIDICommand to raw MIDI data using existing protocol
    /// Integrates with makeDataSetMessage from RolandSysExProtocol
    func processMIDICommand(_ command: MIDICommand) async throws -> Data
    
    /// Validates command before processing
    /// Uses existing field validation logic
    func validateCommand(_ command: MIDICommand) -> Bool
    
    /// Gets the expected response addresses for a command
    /// Uses existing address map definitions
    func getExpectedResponseAddresses(for command: MIDICommand) -> [UInt32]
    
    /// Converts command to existing FieldReference format
    func convertToFieldReference(_ command: MIDICommand) -> Any? // FieldReference
}

/// Parses incoming MIDI data into state updates
/// Integrates with existing MIDI data parsing logic
protocol MIDIDataParser: Sendable {
    /// Parses raw MIDI data into state updates
    /// Uses existing parseDataResponseMessage logic
    func parseMIDIData(_ data: Data) async throws -> [MIDIDataUpdate]
    
    /// Validates incoming MIDI data
    /// Uses existing checksum validation
    func validateMIDIData(_ data: Data) -> Bool
    
    /// Extracts patch information from MIDI data
    /// Integrates with existing patch description parsing
    func extractPatchInfo(from data: Data) async throws -> PatchInfo?
    
    /// Parses parameter changes from MIDI data
    /// Uses existing field decoding logic
    func parseParameterChange(from data: Data) async throws -> ParameterChange?
}

/// Manages MIDI connection state
/// Integrates with existing connection monitoring
protocol ConnectionStateManager: Sendable {
    /// Current connection state
    var currentState: MIDIConnectionState { get async }
    
    /// Monitors connection state changes
    /// Uses existing MIDI port monitoring
    func monitorConnectionState() -> AsyncStream<MIDIConnectionState>
    
    /// Checks if connected to hardware
    /// Uses existing device detection logic
    var isConnected: Bool { get async }
    
    /// Attempts to establish connection
    /// Uses existing connection setup
    func connect() async throws
    
    /// Disconnects from hardware
    /// Uses existing disconnection logic
    func disconnect() async
    
    /// Handles connection loss and recovery
    /// Integrates with existing error handling
    func handleConnectionLoss() async
}

/// Handles MIDI communication errors
/// Integrates with existing error handling patterns
protocol ErrorHandlingManager: Sendable {
    /// Handles various MIDI errors
    func handleMIDIError(_ error: MIDIError) async
    
    /// Recovers from connection errors
    /// Uses existing reconnection logic
    func recoverFromConnectionError() async throws
    
    /// Handles timeout errors
    /// Uses existing timeout handling
    func handleTimeout() async
    
    /// Handles checksum errors
    /// Uses existing validation error handling
    func handleChecksumError() async
    
    /// Provides user-friendly error messages
    func getUserFriendlyErrorMessage(for error: MIDIError) -> String
}

// MARK: - MIDI Command Types
/// Comprehensive MIDI command enumeration for GR-55
/// Maps to existing MIDI address space and field definitions
enum MIDICommand: Sendable, Hashable {
    // MARK: - Pedal and Navigation Commands
    case pedalSelection(Int)
    case bankNavigation(BankNavigationCommand)
    case dataWheelRotation(WheelDirection)
    case dataWheelPress(WheelPressDirection)
    
    // MARK: - Switch and Control Commands
    case ctlToggle(Bool)
    case expSwToggle(Bool)
    case assignToggle(assignNumber: Int, isOn: Bool)
    
    // MARK: - Patch and Level Commands
    case patchSelection(PatchSelection)
    case patchLevelChange(Int)
    case styleChange(SoundStyle)
    case patchNameChange(String)
    
    // MARK: - Effect Commands
    case effectToggle(effectName: String, isOn: Bool)
    case toneSourceToggle(toneName: String, isMuted: Bool)
    
    // MARK: - System Commands
    case requestPatchData
    case requestSystemData
    case saveUserPatch(userPatchNumber: Int)
    case requestBankData(bankNumber: Int)
    
    // MARK: - GK Control Commands
    case gkS1Change(String)
    case gkS2Change(String)
    case gkVolChange(String)
    
    /// Gets the MIDI address for this command
    /// Maps to existing GR55 address map constants
    var midiAddress: [UInt8] {
        switch self {
        case .pedalSelection:
            return [0x18, 0x00, 0x00, 0x00] // Temporary patch common area
        case .patchLevelChange:
            return [0x18, 0x00, 0x00, 0x07] // Patch level address
        case .ctlToggle:
            return [0x18, 0x00, 0x00, 0x15] // CTL status address
        case .expSwToggle:
            return [0x18, 0x00, 0x00, 0x17] // EXP SW status address
        case .effectToggle(let effectName, _):
            return getEffectAddress(effectName)
        case .toneSourceToggle(let toneName, _):
            return getToneSourceAddress(toneName)
        case .assignToggle(let assignNumber, _):
            return getAssignAddress(assignNumber)
        case .patchSelection:
            return [0x18, 0x00, 0x00, 0x00] // Patch selection area
        case .styleChange:
            return [0x18, 0x00, 0x00, 0x01] // Style selection area
        case .gkS1Change:
            return [0x18, 0x00, 0x00, 0x20] // GK S1 function address
        case .gkS2Change:
            return [0x18, 0x00, 0x00, 0x21] // GK S2 function address
        case .gkVolChange:
            return [0x18, 0x00, 0x00, 0x22] // GK Vol function address
        default:
            return [0x18, 0x00, 0x00, 0x00] // Default to common area
        }
    }
    
    /// Gets the MIDI value for this command
    /// Converts high-level values to MIDI format
    var midiValue: UInt8 {
        switch self {
        case .pedalSelection(let pedal):
            return UInt8(max(0, min(127, pedal - 1)))
        case .patchLevelChange(let level):
            return UInt8(max(0, min(127, level)))
        case .ctlToggle(let isOn):
            return isOn ? 1 : 0
        case .expSwToggle(let isOn):
            return isOn ? 1 : 0
        case .effectToggle(_, let isOn):
            return isOn ? 1 : 0
        case .toneSourceToggle(_, let isMuted):
            return isMuted ? 0 : 1 // Inverted logic for mute
        case .assignToggle(_, let isOn):
            return isOn ? 1 : 0
        case .styleChange(let style):
            return getStyleMIDIValue(style)
        default:
            return 0
        }
    }
    
    /// Gets the command priority for scheduling
    /// Integrates with existing queue priority system
    var priority: MIDICommandPriority {
        switch self {
        case .pedalSelection, .patchSelection:
            return .immediate // User interactions are time-sensitive
        case .effectToggle, .toneSourceToggle:
            return .immediate // Real-time parameter changes
        case .patchLevelChange:
            return .high // Level changes should be responsive
        case .requestPatchData, .requestSystemData:
            return .normal // Data requests can be queued
        case .saveUserPatch:
            return .low // Save operations can be deferred
        default:
            return .normal
        }
    }
    
    /// Gets the expected response type for this command
    var expectedResponse: MIDIResponseType {
        switch self {
        case .requestPatchData:
            return .patchData
        case .requestSystemData:
            return .systemData
        case .requestBankData:
            return .bankData
        default:
            return .acknowledgment
        }
    }
}

// MARK: - Supporting Enumerations
enum BankNavigationCommand: Sendable, Hashable {
    case nextBank
    case previousBank
    case selectBank(Int)
    case selectOrdinal(Int)
}

enum MIDICommandPriority: Int, Sendable {
    case immediate = 0
    case high = 1
    case normal = 2
    case low = 3
}

enum MIDIResponseType: Sendable {
    case acknowledgment
    case patchData
    case systemData
    case bankData
    case error
}

// MARK: - MIDI Data Update Types
/// Represents parsed MIDI data updates from hardware
struct MIDIDataUpdate: Sendable, Identifiable {
    let id = UUID()
    let updateType: MIDIUpdateType
    let address: [UInt8]
    let value: UInt8
    let rawData: Data
    let timestamp: Date
    
    init(updateType: MIDIUpdateType, address: [UInt8], value: UInt8, rawData: Data) {
        self.updateType = updateType
        self.address = address
        self.value = value
        self.rawData = rawData
        self.timestamp = Date()
    }
}

enum MIDIUpdateType: Sendable, Hashable {
    case patchChange
    case parameterChange(String) // Parameter name
    case systemChange
    case connectionChange
    case effectChange(String) // Effect name
    case toneSourceChange(String) // Tone source name
    case assignChange(Int) // Assign number
    case levelChange
    case styleChange
}

// MARK: - Connection State Types
enum MIDIConnectionState: Sendable, Hashable {
    case disconnected
    case connecting
    case connected
    case error(MIDIError)
    case reconnecting
    
    var isConnected: Bool {
        if case .connected = self {
            return true
        }
        return false
    }
    
    var displayName: String {
        switch self {
        case .disconnected:
            return "Disconnected"
        case .connecting:
            return "Connecting..."
        case .connected:
            return "Connected"
        case .error(let error):
            return "Error: \(error.localizedDescription)"
        case .reconnecting:
            return "Reconnecting..."
        }
    }
}

// MARK: - Error Types
enum MIDIError: Error, Sendable, Hashable {
    case connectionLost
    case invalidCommand(String)
    case invalidData(String)
    case timeout
    case hardwareError(String)
    case checksumError
    case addressOutOfRange([UInt8])
    case valueOutOfRange(UInt8)
    case deviceNotFound
    case permissionDenied
    case bufferOverflow
    case protocolError(String)
    
    var localizedDescription: String {
        switch self {
        case .connectionLost:
            return "MIDI connection lost"
        case .invalidCommand(let command):
            return "Invalid MIDI command: \(command)"
        case .invalidData(let data):
            return "Invalid MIDI data: \(data)"
        case .timeout:
            return "MIDI operation timed out"
        case .hardwareError(let error):
            return "Hardware error: \(error)"
        case .checksumError:
            return "MIDI checksum validation failed"
        case .addressOutOfRange(let address):
            return "MIDI address out of range: \(address.map { String(format: "%02X", $0) }.joined())"
        case .valueOutOfRange(let value):
            return "MIDI value out of range: \(value)"
        case .deviceNotFound:
            return "GR-55 device not found"
        case .permissionDenied:
            return "MIDI access permission denied"
        case .bufferOverflow:
            return "MIDI buffer overflow"
        case .protocolError(let error):
            return "MIDI protocol error: \(error)"
        }
    }
    
    var isRecoverable: Bool {
        switch self {
        case .connectionLost, .timeout, .deviceNotFound:
            return true // Can attempt reconnection
        case .permissionDenied, .protocolError:
            return false // Requires user intervention
        default:
            return true // Most errors are recoverable
        }
    }
}

// MARK: - Data Types for Integration
/// Patch data structure for MIDI communication
struct PatchData: Sendable {
    let bankMSB: UInt8
    let pc: UInt8
    let name: String
    let style: SoundStyle
    let parameters: [String: UInt8]
    let effectStates: [String: Bool]
    let toneSourceStates: [String: Bool]
    let assignStates: [Bool]
    let level: Int
    
    init(
        bankMSB: UInt8 = 0,
        pc: UInt8 = 0,
        name: String = "LEAD GUITAR",
        style: SoundStyle = .lead,
        parameters: [String: UInt8] = [:],
        effectStates: [String: Bool] = [:],
        toneSourceStates: [String: Bool] = [:],
        assignStates: [Bool] = Array(repeating: false, count: 8),
        level: Int = 100
    ) {
        self.bankMSB = bankMSB
        self.pc = pc
        self.name = name
        self.style = style
        self.parameters = parameters
        self.effectStates = effectStates
        self.toneSourceStates = toneSourceStates
        self.assignStates = assignStates
        self.level = level
    }
}

/// Patch information for display
struct PatchInfo: Sendable, Identifiable {
    let id = UUID()
    let name: String
    let style: SoundStyle
    let bankNumber: Int
    let ordinal: Int
    let description: String?
    
    init(name: String, style: SoundStyle, bankNumber: Int, ordinal: Int, description: String? = nil) {
        self.name = name
        self.style = style
        self.bankNumber = bankNumber
        self.ordinal = ordinal
        self.description = description
    }
}

/// Parameter change information
struct ParameterChange: Sendable {
    let parameterName: String
    let address: [UInt8]
    let oldValue: UInt8
    let newValue: UInt8
    let timestamp: Date
    
    init(parameterName: String, address: [UInt8], oldValue: UInt8, newValue: UInt8) {
        self.parameterName = parameterName
        self.address = address
        self.oldValue = oldValue
        self.newValue = newValue
        self.timestamp = Date()
    }
}

// MARK: - Helper Functions for Address Mapping
/// Gets MIDI address for effect parameters
/// Maps to existing GR55 address map definitions
private func getEffectAddress(_ effectName: String) -> [UInt8] {
    switch effectName.lowercased() {
    case "mfx":
        return [0x18, 0x00, 0x20, 0x00] // MFX block address
    case "delay":
        return [0x18, 0x00, 0x30, 0x00] // Delay block address
    case "chorus":
        return [0x18, 0x00, 0x40, 0x00] // Chorus block address
    case "reverb":
        return [0x18, 0x00, 0x50, 0x00] // Reverb block address
    case "amp":
        return [0x18, 0x00, 0x60, 0x00] // Amp block address
    case "ns":
        return [0x18, 0x00, 0x70, 0x00] // Noise Suppressor address
    case "mod":
        return [0x18, 0x00, 0x80, 0x00] // Modulation block address
    case "eq":
        return [0x18, 0x00, 0x90, 0x00] // EQ block address
    default:
        return [0x18, 0x00, 0x00, 0x00] // Default address
    }
}

/// Gets MIDI address for tone source parameters
/// Maps to existing tone source definitions
private func getToneSourceAddress(_ toneName: String) -> [UInt8] {
    switch toneName.lowercased() {
    case "pcm1":
        return [0x18, 0x00, 0x01, 0x00] // PCM1 tone address
    case "pcm2":
        return [0x18, 0x00, 0x02, 0x00] // PCM2 tone address
    case "model":
        return [0x18, 0x00, 0x03, 0x00] // Modeling tone address
    case "guitar", "normal":
        return [0x18, 0x00, 0x04, 0x00] // Normal pickup address
    default:
        return [0x18, 0x00, 0x00, 0x00] // Default address
    }
}

/// Gets MIDI address for assign parameters
/// Maps to existing assign definitions
private func getAssignAddress(_ assignNumber: Int) -> [UInt8] {
    let baseAddress: UInt8 = 0x10
    let assignOffset = UInt8(max(0, min(7, assignNumber - 1)))
    return [0x18, 0x00, baseAddress + assignOffset, 0x00]
}

/// Gets MIDI value for sound style
/// Maps to existing style definitions
private func getStyleMIDIValue(_ style: SoundStyle) -> UInt8 {
    switch style {
    case .lead:
        return 0
    case .rhythm:
        return 1
    case .other:
        return 2
    case .user:
        return 3
    }
}

// MARK: - Async Binding for SwiftUI Integration
/// Provides async binding for MIDI parameters
/// Integrates with SwiftUI's binding system
@propertyWrapper
struct AsyncMIDIBinding<T: Sendable>: DynamicProperty {
    private let getValue: () async -> T
    private let setValue: (T) async -> Void
    
    @State private var currentValue: T
    
    init(
        get: @escaping () async -> T,
        set: @escaping (T) async -> Void,
        initialValue: T
    ) {
        self.getValue = get
        self.setValue = set
        self._currentValue = State(initialValue: initialValue)
    }
    
    var wrappedValue: T {
        get { currentValue }
        nonmutating set {
            currentValue = newValue
            Task {
                await setValue(newValue)
            }
        }
    }
    
    var projectedValue: Binding<T> {
        Binding(
            get: { currentValue },
            set: { newValue in
                wrappedValue = newValue
            }
        )
    }
    
    func update() {
        Task {
            let newValue = await getValue()
            await MainActor.run {
                currentValue = newValue
            }
        }
    }
}