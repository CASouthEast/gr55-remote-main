import Foundation
import SwiftUI

// MARK: - Core State Model
/// Main state model for the GR55 hardware interface
/// Follows Swift 6.2 concurrency patterns with Sendable conformance
struct GR55State: Sendable {
    var activePedal: Int
    var patchName: String
    var activeStyle: SoundStyle
    var bank: String
    var ctlStatus: Bool
    var ctlFunction: String
    var expSwStatus: Bool
    var expSwFunction: String
    var patchLevel: Int
    var guitarOutSource: String
    
    // Tone source states
    var pcm1Muted: Bool
    var pcm2Muted: Bool
    var modelMuted: Bool
    var normalPuMuted: Bool
    
    // Effect states
    var mfxOn: Bool
    var delayOn: Bool
    var chorusOn: Bool
    var reverbOn: Bool
    var ampOn: Bool
    var nsOn: Bool
    var modOn: Bool
    var eqOn: Bool
    
    // Assign states (1-8)
    var assignStates: [Bool]
    
    // Bank slots for current bank
    var bankSlots: [BankSlot]?
    
    // GK control values
    var gkS1Value: String
    var gkS2Value: String
    var gkVolValue: String
    
    // Default initializer with sensible defaults
    init(
        activePedal: Int = 1,
        patchName: String = "LEAD GUITAR",
        activeStyle: SoundStyle = .lead,
        bank: String = "01-1",
        ctlStatus: Bool = false,
        ctlFunction: String = "REC/PLAY/DUB",
        expSwStatus: Bool = false,
        expSwFunction: String = "EXP SW",
        patchLevel: Int = 100,
        guitarOutSource: String = "GUITAR OUT",
        pcm1Muted: Bool = false,
        pcm2Muted: Bool = false,
        modelMuted: Bool = false,
        normalPuMuted: Bool = false,
        mfxOn: Bool = true,
        delayOn: Bool = false,
        chorusOn: Bool = true,
        reverbOn: Bool = true,
        ampOn: Bool = true,
        nsOn: Bool = false,
        modOn: Bool = false,
        eqOn: Bool = true,
        assignStates: [Bool] = Array(repeating: false, count: 8),
        bankSlots: [BankSlot]? = nil,
        gkS1Value: String = "OFF",
        gkS2Value: String = "OFF",
        gkVolValue: String = "100"
    ) {
        self.activePedal = activePedal
        self.patchName = patchName
        self.activeStyle = activeStyle
        self.bank = bank
        self.ctlStatus = ctlStatus
        self.ctlFunction = ctlFunction
        self.expSwStatus = expSwStatus
        self.expSwFunction = expSwFunction
        self.patchLevel = patchLevel
        self.guitarOutSource = guitarOutSource
        self.pcm1Muted = pcm1Muted
        self.pcm2Muted = pcm2Muted
        self.modelMuted = modelMuted
        self.normalPuMuted = normalPuMuted
        self.mfxOn = mfxOn
        self.delayOn = delayOn
        self.chorusOn = chorusOn
        self.reverbOn = reverbOn
        self.ampOn = ampOn
        self.nsOn = nsOn
        self.modOn = modOn
        self.eqOn = eqOn
        self.assignStates = assignStates
        self.bankSlots = bankSlots
        self.gkS1Value = gkS1Value
        self.gkS2Value = gkS2Value
        self.gkVolValue = gkVolValue
    }
}

// MARK: - Sound Style Enumeration
/// Sound style categories for patch organization
/// Conforms to CaseIterable for UI iteration and Sendable for Swift 6.2 concurrency
enum SoundStyle: String, CaseIterable, Sendable {
    case lead = "LEAD"
    case rhythm = "RHYTHM"
    case other = "OTHER"
    case user = "USER"
    
    /// Display name for UI presentation
    var displayName: String {
        return rawValue
    }
    
    /// Color associated with each style for UI theming
    var associatedColor: Color {
        switch self {
        case .lead:
            return .red
        case .rhythm:
            return .blue
        case .other:
            return .green
        case .user:
            return .purple
        }
    }
}

// MARK: - Bank Slot Information
/// Represents a patch slot within a bank
/// Sendable for Swift 6.2 concurrency compliance
struct BankSlot: Sendable, Identifiable {
    let id = UUID()
    let ordinal: Int
    let name: String
    let style: SoundStyle
    
    init(ordinal: Int, name: String, style: SoundStyle = .lead) {
        self.ordinal = ordinal
        self.name = name
        self.style = style
    }
}

// MARK: - Hovered Item for Preview
/// Represents items that can be hovered for preview information
/// Sendable and Hashable for SwiftUI state management
enum HoveredItem: Sendable, Hashable {
    case effect(String)
    case tone(String)
    case assign(Int)
    case none
    
    /// Human-readable description for debugging
    var description: String {
        switch self {
        case .effect(let name):
            return "Effect: \(name)"
        case .tone(let name):
            return "Tone: \(name)"
        case .assign(let number):
            return "Assign: \(number)"
        case .none:
            return "None"
        }
    }
}

// MARK: - Data Wheel Interaction Types
/// Direction for data wheel rotation
enum WheelDirection: Sendable {
    case left
    case right
}

/// Direction for data wheel press gestures
enum WheelPressDirection: Sendable {
    case up
    case down
    case left
    case right
}

// MARK: - MIDI Integration Types
/// MIDI parameter representation for integration
/// Sendable for cross-actor communication
struct MIDIParameter: Sendable {
    let address: [UInt8]
    let value: UInt8
    let description: String
    
    init(address: [UInt8], value: UInt8, description: String) {
        self.address = address
        self.value = value
        self.description = description
    }
}

/// Patch selection for MIDI communication
struct PatchSelection: Sendable {
    let bankSelectMSB: UInt8
    let pc: UInt8
    
    init(bankSelectMSB: UInt8, pc: UInt8) {
        self.bankSelectMSB = bankSelectMSB
        self.pc = pc
    }
}

// MARK: - Patch Selection Data Models

/// Patch information model for the patch selector
/// Sendable for Swift 6.2 concurrency compliance
struct PatchInfo: Identifiable, Sendable, Hashable {
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
    
    // Hashable conformance
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
    
    // Equatable conformance
    static func == (lhs: PatchInfo, rhs: PatchInfo) -> Bool {
        return lhs.id == rhs.id
    }
}

/// Patch categories for filtering and organization
/// Sendable and CaseIterable for SwiftUI compatibility
enum PatchCategory: String, CaseIterable, Sendable, Hashable {
    case all = "ALL"
    case guitar = "GUITAR"
    case bass = "BASS"
    case synth = "SYNTH"
    case organ = "ORGAN"
    case effects = "EFFECTS"
    case user = "USER"
    
    /// Display name for UI presentation
    var displayName: String {
        return rawValue
    }
    
    /// SF Symbol icon for category
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
    
    /// Color associated with category
    var associatedColor: Color {
        switch self {
        case .all: return .gray
        case .guitar: return .orange
        case .bass: return .purple
        case .synth: return .blue
        case .organ: return .brown
        case .effects: return .green
        case .user: return .pink
        }
    }
}

// MARK: - MIDI Data Update Types
/// Types of MIDI updates that can be received
/// Sendable for cross-actor communication
enum MIDIUpdateType: Sendable {
    case patchChange
    case parameterChange(String)
    case effectChange(String)
    case toneSourceChange(String)
    case assignChange(Int)
    case levelChange
    case styleChange
    case systemChange
    case connectionChange
}

/// MIDI data update structure
/// Sendable for Swift 6.2 concurrency compliance
struct MIDIDataUpdate: Sendable {
    let updateType: MIDIUpdateType
    let address: [UInt8]
    let value: UInt8
    let timestamp: Date
    
    init(updateType: MIDIUpdateType, address: [UInt8], value: UInt8, timestamp: Date = Date()) {
        self.updateType = updateType
        self.address = address
        self.value = value
        self.timestamp = timestamp
    }
}

/// MIDI connection states
/// Sendable for cross-actor communication
enum MIDIConnectionState: Sendable {
    case disconnected
    case connecting
    case connected
    case reconnecting
    case error(MIDIError)
}

/// MIDI error types
/// Sendable and LocalizedError for proper error handling
struct MIDIError: Error, Sendable, LocalizedError {
    let code: Int
    let message: String
    
    var errorDescription: String? {
        return message
    }
    
    init(code: Int, message: String) {
        self.code = code
        self.message = message
    }
}

// MARK: - Extensions for SwiftUI Integration
extension SoundStyle {
    /// Returns all styles except for filtering purposes
    static var filterStyles: [SoundStyle] {
        return allCases
    }
}

extension BankSlot {
    /// Creates a sample bank slot for testing
    static func sample(ordinal: Int = 1, name: String = "Sample Patch", style: SoundStyle = .lead) -> BankSlot {
        return BankSlot(ordinal: ordinal, name: name, style: style)
    }
}

// MARK: - MIDI Integration Protocol Extensions
extension MIDIIntegrationInterface {
    /// Connection state as async stream
    var connectionState: AsyncStream<MIDIConnectionState> {
        return AsyncStream { continuation in
            // Implementation would depend on actual MIDI layer
            // For now, provide a placeholder
            continuation.yield(.disconnected)
            continuation.finish()
        }
    }
    
    /// Configure with existing MIDI layer contexts
    func configureWithExistingMIDILayer(
        dataTransfer: Any?,
        ioSetup: Any?,
        patchContext: Any?
    ) async {
        // Implementation would integrate with existing Swift MIDI layer
        // This is a placeholder for the interface design
    }
}