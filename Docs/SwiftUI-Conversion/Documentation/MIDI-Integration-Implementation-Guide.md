# MIDI Integration Implementation Guide

## Overview

This guide provides detailed implementation instructions for integrating the SwiftUI GR55StateManager with the existing Swift MIDI communication layer. The integration maintains compatibility with current MIDI functionality while providing modern SwiftUI patterns and Swift 6.2 concurrency support.

## Integration Architecture

### Current React Native MIDI Flow

```
useGR55ControllerState → useRemoteField → RolandRemotePageContext → RolandDataTransfer → MIDI Hardware
```

### New SwiftUI MIDI Flow

```
GR55StateManager → MIDIIntegrationInterface → SwiftMIDIBridge → Existing Swift MIDI Layer → MIDI Hardware
```

## Implementation Steps

### Step 1: Create SwiftMIDIBridge Implementation

The `SwiftMIDIBridge` class serves as the main integration point between SwiftUI and the existing MIDI layer.

```swift
import Foundation
import SwiftUI
import Combine

@MainActor
final class SwiftMIDIBridge: MIDIIntegrationInterface {

    // MARK: - Integration Properties
    private weak var rolandDataTransfer: RolandDataTransferContext?
    private weak var rolandIoSetup: RolandIoSetupContext?
    private weak var rolandPatchContext: RolandRemotePatchContext?

    // MARK: - MIDI Processing
    private let commandProcessor: MIDICommandProcessor
    private let dataParser: MIDIDataParser
    private let connectionManager: MIDIConnectionManager

    // MARK: - Data Streams
    private let midiDataSubject = PassthroughSubject<MIDIDataUpdate, Never>()
    private let connectionStateSubject = PassthroughSubject<MIDIConnectionState, Never>()

    // MARK: - Initialization
    init() {
        self.commandProcessor = SwiftMIDICommandProcessor()
        self.dataParser = SwiftMIDIDataParser()
        self.connectionManager = MIDIConnectionManager()

        setupMIDIIntegration()
    }

    // MARK: - Configuration
    func configureWithExistingMIDILayer(
        dataTransfer: Any?,
        ioSetup: Any?,
        patchContext: Any?
    ) async {
        // Cast to proper types (these would be the actual context types)
        self.rolandDataTransfer = dataTransfer as? RolandDataTransferContext
        self.rolandIoSetup = ioSetup as? RolandIoSetupContext
        self.rolandPatchContext = patchContext as? RolandRemotePatchContext

        // Configure connection manager
        await connectionManager.configureWithExistingMIDILayer(
            ioSetup: ioSetup,
            dataTransfer: dataTransfer
        )

        // Start monitoring existing layer
        await startExistingLayerMonitoring()
    }

    // MARK: - MIDIIntegrationInterface Implementation
    func sendMIDICommand(_ command: MIDICommand) async throws {
        guard await isConnected else {
            throw MIDIError.connectionLost
        }

        // Process command using existing MIDI layer
        try await processCommandWithExistingLayer(command)
    }

    func receiveMIDIData() -> AsyncStream<MIDIDataUpdate> {
        return AsyncStream { continuation in
            let cancellable = midiDataSubject.sink { update in
                continuation.yield(update)
            }

            continuation.onTermination = { _ in
                cancellable.cancel()
            }
        }
    }

    var isConnected: Bool {
        get async {
            return await connectionManager.isConnected
        }
    }

    var connectionState: AsyncStream<MIDIConnectionState> {
        return connectionManager.monitorConnectionState()
    }

    func synchronizeWithHardware() async throws {
        guard let dataTransfer = rolandDataTransfer,
              let patchContext = rolandPatchContext else {
            throw MIDIError.connectionLost
        }

        // Use existing requestData method to get current patch data
        try await requestCurrentPatchDataFromExistingLayer(
            dataTransfer: dataTransfer,
            patchContext: patchContext
        )
    }

    func requestCurrentPatchData() async throws -> PatchData {
        guard let dataTransfer = rolandDataTransfer,
              let patchContext = rolandPatchContext else {
            throw MIDIError.connectionLost
        }

        return try await requestPatchDataFromExistingLayer(
            dataTransfer: dataTransfer,
            patchContext: patchContext
        )
    }
}
```

### Step 2: Implement Command Processing Integration

The command processor converts SwiftUI commands to existing MIDI layer calls:

```swift
final class SwiftMIDICommandProcessor: MIDICommandProcessor {

    func processMIDICommand(_ command: MIDICommand) async throws -> Data {
        // Convert MIDICommand to existing field reference format
        guard let fieldReference = convertToFieldReference(command) else {
            throw MIDIError.invalidCommand("Cannot convert command to field reference")
        }

        // Use existing makeDataSetMessage from RolandSysExProtocol
        let midiData = createMIDIDataFromCommand(command, fieldReference: fieldReference)
        return midiData
    }

    func validateCommand(_ command: MIDICommand) -> Bool {
        // Use existing validation logic
        return MIDICommandValidator.validate(command).isValid
    }

    func getExpectedResponseAddresses(for command: MIDICommand) -> [UInt32] {
        // Map to existing address space
        return [UInt32(command.midiAddress.reduce(0) { $0 << 8 + UInt32($1) })]
    }

    func convertToFieldReference(_ command: MIDICommand) -> Any? {
        // Convert MIDICommand to existing FieldReference format
        // This maps SwiftUI commands to existing MIDI field definitions

        switch command {
        case .pedalSelection(let pedal):
            // Map to existing pedal selection field
            return createFieldReference(
                address: command.midiAddress,
                value: UInt8(pedal - 1),
                description: "Pedal Selection"
            )

        case .patchLevelChange(let level):
            // Map to existing patch level field
            return createFieldReference(
                address: command.midiAddress,
                value: UInt8(level),
                description: "Patch Level"
            )

        case .effectToggle(let effectName, let isOn):
            // Map to existing effect field
            return createFieldReference(
                address: command.midiAddress,
                value: isOn ? 1 : 0,
                description: "Effect \(effectName)"
            )

        default:
            return nil
        }
    }

    private func createFieldReference(address: [UInt8], value: UInt8, description: String) -> Any {
        // Create field reference compatible with existing system
        // This would return an actual FieldReference instance
        return FieldReferenceWrapper(address: address, value: value, description: description)
    }

    private func createMIDIDataFromCommand(_ command: MIDICommand, fieldReference: Any) -> Data {
        // Use existing makeDataSetMessage to create MIDI data
        // This integrates with RolandSysExProtocol

        let deviceConstants = RolandGR55SysExConfig // Use existing config
        let deviceId = 0x10 // Default device ID
        let address = command.midiAddress.reduce(0) { $0 << 8 + Int($1) }
        let valueBytes = [command.midiValue]

        let midiMessage = makeDataSetMessage(
            deviceConstants,
            deviceId,
            address,
            valueBytes
        )

        return Data(midiMessage)
    }
}
```

### Step 3: Implement Data Parsing Integration

The data parser converts existing MIDI data to SwiftUI updates:

```swift
final class SwiftMIDIDataParser: MIDIDataParser {

    func parseMIDIData(_ data: Data) async throws -> [MIDIDataUpdate] {
        var updates: [MIDIDataUpdate] = []

        // Use existing parseDataResponseMessage
        let deviceConstants = RolandGR55SysExConfig
        guard let parsed = parseDataResponseMessage(deviceConstants, data) else {
            throw MIDIError.invalidData("Cannot parse MIDI data")
        }

        // Validate using existing checksum validation
        guard isValidChecksum(parsed) else {
            throw MIDIError.checksumError
        }

        // Convert to MIDIDataUpdate format
        let update = MIDIDataUpdate(
            updateType: determineUpdateType(address: parsed.address),
            address: Array(parsed.addressBytes),
            value: parsed.valueBytes.first ?? 0,
            rawData: data
        )

        updates.append(update)
        return updates
    }

    func validateMIDIData(_ data: Data) -> Bool {
        let deviceConstants = RolandGR55SysExConfig
        guard let parsed = parseDataResponseMessage(deviceConstants, data) else {
            return false
        }

        return isValidChecksum(parsed)
    }

    func extractPatchInfo(from data: Data) async throws -> PatchInfo? {
        let updates = try await parseMIDIData(data)

        // Extract patch information from updates
        for update in updates {
            if case .patchChange = update.updateType {
                return createPatchInfoFromUpdate(update)
            }
        }

        return nil
    }

    func parseParameterChange(from data: Data) async throws -> ParameterChange? {
        let updates = try await parseMIDIData(data)

        for update in updates {
            if case .parameterChange(let parameterName) = update.updateType {
                return ParameterChange(
                    parameterName: parameterName,
                    address: update.address,
                    oldValue: 0, // Would need to track previous values
                    newValue: update.value
                )
            }
        }

        return nil
    }

    private func determineUpdateType(address: Int) -> MIDIUpdateType {
        // Map existing address space to update types
        let addressBytes = convertAddressToBytes(address)

        switch addressBytes {
        case [0x18, 0x00, 0x00, 0x00]:
            return .patchChange
        case [0x18, 0x00, 0x00, 0x07]:
            return .levelChange
        case let addr where addr.starts(with: [0x18, 0x00, 0x20]):
            return .effectChange("mfx")
        case let addr where addr.starts(with: [0x18, 0x00, 0x30]):
            return .effectChange("delay")
        default:
            return .parameterChange("unknown")
        }
    }

    private func createPatchInfoFromUpdate(_ update: MIDIDataUpdate) -> PatchInfo {
        // Create patch info from MIDI update
        return PatchInfo(
            name: "Patch \(update.value)",
            style: .lead, // Would need to determine from data
            bankNumber: 1, // Would need to extract from address
            ordinal: Int(update.value) + 1
        )
    }

    private func convertAddressToBytes(_ address: Int) -> [UInt8] {
        return [
            UInt8((address >> 24) & 0xFF),
            UInt8((address >> 16) & 0xFF),
            UInt8((address >> 8) & 0xFF),
            UInt8(address & 0xFF)
        ]
    }
}
```

### Step 4: Integrate with Existing Remote Field System

Create bindings between SwiftUI and existing remote fields:

```swift
extension SwiftMIDIBridge {

    /// Creates a binding to an existing remote field
    func bindToRemoteField<T>(
        _ field: FieldReference<FieldType<T>>,
        in context: RolandRemotePageContext
    ) -> AsyncBinding<T> {
        return AsyncBinding(
            get: { [weak self] in
                return await self?.getCurrentFieldValue(field, context: context) ?? field.definition.type.emptyValue
            },
            set: { [weak self] newValue in
                await self?.setFieldValue(field, value: newValue, context: context)
            }
        )
    }

    private func getCurrentFieldValue<T>(
        _ field: FieldReference<FieldType<T>>,
        context: RolandRemotePageContext
    ) async -> T {
        // Get current value from existing remote field system
        // This would use the existing useRemoteField logic

        guard let contextValue = await getContextValue(context) else {
            return field.definition.type.emptyValue
        }

        // Extract value from context data
        let valueBytes = contextValue.pageData?[field.address] ?? Data()
        return field.definition.type.decode(valueBytes, 0, field.definition.size)
    }

    private func setFieldValue<T>(
        _ field: FieldReference<FieldType<T>>,
        value: T,
        context: RolandRemotePageContext
    ) async {
        // Set value using existing remote field system
        guard let contextValue = await getContextValue(context) else { return }

        // Use existing setRemoteField method
        contextValue.setRemoteField(field, value)
    }

    private func getContextValue(_ context: RolandRemotePageContext) async -> RolandRemotePageState? {
        // Get context value from existing system
        // This would access the context provider
        return nil // Placeholder
    }
}
```

### Step 5: Implement Connection State Integration

Integrate with existing connection monitoring:

```swift
extension MIDIConnectionManager {

    private func startExistingLayerMonitoring() async {
        // Monitor existing MIDI layer connection state
        guard let ioSetup = existingIoSetup as? RolandIoSetupContext else { return }

        // Set up monitoring task
        Task {
            await monitorExistingConnectionState(ioSetup)
        }
    }

    private func monitorExistingConnectionState(_ ioSetup: RolandIoSetupContext) async {
        // Monitor existing connection state changes
        // This would integrate with existing connection monitoring

        // Placeholder implementation
        // In real implementation, this would:
        // 1. Subscribe to existing connection state changes
        // 2. Monitor MIDI port availability
        // 3. Track device selection changes
        // 4. Update SwiftUI connection state accordingly
    }

    private func performConnection() async throws {
        // Use existing connection logic
        guard let ioSetup = existingIoSetup as? RolandIoSetupContext else {
            throw MIDIError.connectionLost
        }

        // Integrate with existing connection setup
        // This would use existing device selection and port setup
        try await establishConnectionWithExistingLayer(ioSetup)
    }

    private func establishConnectionWithExistingLayer(_ ioSetup: RolandIoSetupContext) async throws {
        // Establish connection using existing layer
        // This would:
        // 1. Check device availability
        // 2. Set up MIDI ports
        // 3. Verify device identity
        // 4. Initialize communication

        throw MIDIError.connectionLost // Placeholder
    }
}
```

### Step 6: Create SwiftUI Integration Points

Integrate the MIDI bridge with SwiftUI views:

```swift
// In GR55StateManager initialization
extension GR55StateManager {

    convenience init(withExistingMIDILayer contexts: MIDILayerContexts) {
        let midiInterface = SwiftMIDIBridge()

        self.init(midiInterface: midiInterface)

        // Configure with existing contexts
        Task {
            await midiInterface.configureWithExistingMIDILayer(
                dataTransfer: contexts.dataTransfer,
                ioSetup: contexts.ioSetup,
                patchContext: contexts.patchContext
            )
        }
    }
}

struct MIDILayerContexts {
    let dataTransfer: Any? // RolandDataTransferContext
    let ioSetup: Any? // RolandIoSetupContext
    let patchContext: Any? // RolandRemotePatchContext
}
```

### Step 7: Error Handling Integration

Integrate error handling with existing patterns:

```swift
extension DefaultErrorHandlingManager {

    func integrateWithExistingErrorHandling() {
        // Integrate with existing error handling patterns
        // This would connect to existing error reporting and recovery
    }

    private func handleConnectionLostError() async {
        // Use existing connection recovery logic
        // This would integrate with existing reconnection strategies

        // Attempt to use existing connection recovery
        await attemptExistingLayerRecovery()
    }

    private func attemptExistingLayerRecovery() async {
        // Use existing layer recovery mechanisms
        // This would leverage existing error recovery patterns
    }
}
```

## Integration Testing Strategy

### Unit Tests

```swift
class SwiftMIDIBridgeTests: XCTestCase {

    func testCommandProcessingIntegration() async throws {
        let bridge = SwiftMIDIBridge()
        let command = MIDICommand.pedalSelection(1)

        // Test that command processing integrates correctly
        try await bridge.sendMIDICommand(command)

        // Verify integration with existing layer
        // This would test actual MIDI message generation
    }

    func testDataParsingIntegration() async throws {
        let bridge = SwiftMIDIBridge()
        let testData = createTestMIDIData()

        // Test that data parsing works with existing format
        let updates = try await bridge.dataParser.parseMIDIData(testData)

        XCTAssertFalse(updates.isEmpty)
    }

    func testConnectionStateIntegration() async throws {
        let bridge = SwiftMIDIBridge()

        // Test connection state monitoring
        let connectionState = await bridge.isConnected

        // Verify integration with existing connection monitoring
        XCTAssertNotNil(connectionState)
    }
}
```

### Integration Tests

```swift
class MIDILayerIntegrationTests: XCTestCase {

    func testFullMIDIFlow() async throws {
        // Test complete flow from SwiftUI to hardware
        let stateManager = GR55StateManager()

        // Simulate user interaction
        stateManager.setActivePedal(2)

        // Verify MIDI command was sent through existing layer
        // This would require test hardware or mocking
    }

    func testExistingLayerCompatibility() async throws {
        // Test that existing functionality still works
        // This ensures no breaking changes to current system
    }
}
```

## Migration Strategy

### Phase 1: Parallel Implementation

- Implement SwiftUI MIDI bridge alongside existing system
- No changes to existing React Native functionality
- Test SwiftUI integration independently

### Phase 2: Gradual Migration

- Start using SwiftUI interface for new features
- Maintain existing interface for current functionality
- Validate compatibility and performance

### Phase 3: Full Integration

- Complete migration to SwiftUI interface
- Remove React Native dependencies
- Optimize for SwiftUI patterns

## Performance Considerations

### Memory Management

- Use weak references to existing contexts to prevent retain cycles
- Implement proper cleanup in deinit methods
- Monitor memory usage during MIDI operations

### Concurrency

- Use Swift 6.2 async/await patterns throughout
- Ensure proper actor isolation for UI updates
- Maintain thread safety with existing MIDI layer

### Latency Optimization

- Minimize conversion overhead between systems
- Use efficient data structures for MIDI processing
- Implement command batching for multiple operations

## Debugging and Monitoring

### Logging Integration

```swift
extension SwiftMIDIBridge {

    private func logMIDIOperation(_ operation: String, command: MIDICommand) {
        // Integrate with existing logging system
        print("MIDI Operation: \(operation) - Command: \(command)")

        // In production, this would use proper logging framework
        // and integrate with existing debugging tools
    }
}
```

### Diagnostic Tools

- Implement MIDI message inspection
- Provide connection quality metrics
- Create debugging interfaces for development

## Conclusion

This integration approach maintains full compatibility with the existing Swift MIDI layer while providing modern SwiftUI patterns and improved error handling. The phased migration strategy allows for gradual adoption without breaking existing functionality.

The key to successful integration is maintaining the existing MIDI protocol and address mappings while providing a clean, async/await-based interface for SwiftUI components. This ensures that all current MIDI functionality continues to work while enabling new SwiftUI-based features and improved user experience.
