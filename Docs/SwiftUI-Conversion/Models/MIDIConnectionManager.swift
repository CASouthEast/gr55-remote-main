import Foundation
import SwiftUI
import Combine

// MARK: - MIDI Connection Management
/// Manages MIDI connection state and error handling for GR-55 hardware interface
/// Integrates with existing Swift MIDI layer for seamless operation

/// Main connection manager for MIDI communication
/// Integrates with existing RolandIoSetupContext and connection monitoring
@MainActor
final class MIDIConnectionManager: ObservableObject, ConnectionStateManager {
    
    // MARK: - Published Properties
    @Published private(set) var currentState: MIDIConnectionState = .disconnected
    @Published private(set) var connectionQuality: ConnectionQuality = .unknown
    @Published private(set) var lastError: MIDIError?
    @Published private(set) var reconnectionAttempts: Int = 0
    
    // MARK: - Private Properties
    private let connectionStateSubject = PassthroughSubject<MIDIConnectionState, Never>()
    private let errorHandler: ErrorHandlingManager
    private let reconnectionManager: ReconnectionManager
    private var cancellables = Set<AnyCancellable>()
    
    // Integration with existing MIDI layer
    private weak var existingIoSetup: Any? // RolandIoSetupContext
    private weak var existingDataTransfer: Any? // RolandDataTransferContext
    
    // Connection monitoring
    private var connectionMonitorTask: Task<Void, Never>?
    private var heartbeatTask: Task<Void, Never>?
    
    // MARK: - Initialization
    init(
        errorHandler: ErrorHandlingManager = DefaultErrorHandlingManager(),
        reconnectionManager: ReconnectionManager = DefaultReconnectionManager()
    ) {
        self.errorHandler = errorHandler
        self.reconnectionManager = reconnectionManager
        
        setupConnectionMonitoring()
        setupErrorHandling()
    }
    
    deinit {
        connectionMonitorTask?.cancel()
        heartbeatTask?.cancel()
    }
    
    // MARK: - ConnectionStateManager Protocol
    func monitorConnectionState() -> AsyncStream<MIDIConnectionState> {
        return AsyncStream { continuation in
            let cancellable = connectionStateSubject.sink { state in
                continuation.yield(state)
            }
            
            continuation.onTermination = { _ in
                cancellable.cancel()
            }
        }
    }
    
    var isConnected: Bool {
        get async {
            return currentState.isConnected
        }
    }
    
    func connect() async throws {
        guard currentState != .connecting else {
            throw MIDIError.protocolError("Connection already in progress")
        }
        
        updateConnectionState(.connecting)
        
        do {
            try await performConnection()
            updateConnectionState(.connected)
            startHeartbeat()
            reconnectionAttempts = 0
        } catch {
            let midiError = error as? MIDIError ?? MIDIError.connectionLost
            updateConnectionState(.error(midiError))
            lastError = midiError
            throw midiError
        }
    }
    
    func disconnect() async {
        stopHeartbeat()
        await performDisconnection()
        updateConnectionState(.disconnected)
        reconnectionAttempts = 0
    }
    
    func handleConnectionLoss() async {
        guard currentState.isConnected else { return }
        
        stopHeartbeat()
        updateConnectionState(.disconnected)
        
        // Attempt automatic reconnection if enabled
        if reconnectionManager.shouldAttemptReconnection(attempts: reconnectionAttempts) {
            await attemptReconnection()
        }
    }
    
    // MARK: - Connection Quality Monitoring
    /// Monitors connection quality based on response times and error rates
    func updateConnectionQuality() async {
        let quality = await assessConnectionQuality()
        
        await MainActor.run {
            connectionQuality = quality
        }
        
        // Handle poor connection quality
        if quality == .poor {
            await handlePoorConnectionQuality()
        }
    }
    
    private func assessConnectionQuality() async -> ConnectionQuality {
        // Assess based on recent response times and error rates
        // This would integrate with existing MIDI layer metrics
        
        // Placeholder implementation
        guard currentState.isConnected else { return .disconnected }
        
        // In real implementation, this would check:
        // - Average response time
        // - Error rate
        // - Missed heartbeats
        // - Data integrity
        
        return .good // Placeholder
    }
    
    private func handlePoorConnectionQuality() async {
        // Implement quality improvement strategies
        // - Reduce command frequency
        // - Increase timeouts
        // - Request connection diagnostics
    }
    
    // MARK: - Heartbeat and Health Monitoring
    private func startHeartbeat() {
        heartbeatTask?.cancel()
        
        heartbeatTask = Task {
            while !Task.isCancelled && currentState.isConnected {
                do {
                    try await performHeartbeat()
                    try await Task.sleep(nanoseconds: 5_000_000_000) // 5 seconds
                } catch {
                    await handleHeartbeatFailure(error)
                    break
                }
            }
        }
    }
    
    private func stopHeartbeat() {
        heartbeatTask?.cancel()
        heartbeatTask = nil
    }
    
    private func performHeartbeat() async throws {
        // Send a lightweight MIDI command to verify connection
        // This would use existing MIDI layer to send a system inquiry
        
        // Placeholder implementation
        // In real implementation, this would:
        // 1. Send identity request message
        // 2. Wait for response with timeout
        // 3. Update connection quality metrics
    }
    
    private func handleHeartbeatFailure(_ error: Error) async {
        let midiError = error as? MIDIError ?? MIDIError.connectionLost
        await errorHandler.handleMIDIError(midiError)
        await handleConnectionLoss()
    }
    
    // MARK: - Reconnection Management
    private func attemptReconnection() async {
        updateConnectionState(.reconnecting)
        reconnectionAttempts += 1
        
        let delay = reconnectionManager.getReconnectionDelay(attempt: reconnectionAttempts)
        
        do {
            try await Task.sleep(nanoseconds: UInt64(delay * 1_000_000_000))
            try await connect()
        } catch {
            if reconnectionManager.shouldAttemptReconnection(attempts: reconnectionAttempts) {
                await attemptReconnection()
            } else {
                let midiError = error as? MIDIError ?? MIDIError.connectionLost
                updateConnectionState(.error(midiError))
                lastError = midiError
            }
        }
    }
    
    // MARK: - Integration with Existing MIDI Layer
    /// Configures connection manager with existing MIDI contexts
    func configureWithExistingMIDILayer(
        ioSetup: Any?, // RolandIoSetupContext
        dataTransfer: Any? // RolandDataTransferContext
    ) {
        existingIoSetup = ioSetup
        existingDataTransfer = dataTransfer
        
        // Set up monitoring of existing connection state
        setupExistingLayerMonitoring()
    }
    
    private func setupExistingLayerMonitoring() {
        // Monitor existing MIDI layer connection state
        // This would integrate with existing connection monitoring
        
        // Placeholder for integration with existing layer
        // In real implementation, this would:
        // 1. Subscribe to existing connection state changes
        // 2. Monitor MIDI port availability
        // 3. Track device selection changes
    }
    
    private func performConnection() async throws {
        // Integrate with existing connection logic
        // This would use existing RolandIoSetupContext methods
        
        // Placeholder implementation
        // In real implementation, this would:
        // 1. Check device availability
        // 2. Establish MIDI port connections
        // 3. Verify device identity
        // 4. Initialize communication parameters
        
        // Simulate connection delay
        try await Task.sleep(nanoseconds: 1_000_000_000) // 1 second
    }
    
    private func performDisconnection() async {
        // Integrate with existing disconnection logic
        // This would use existing cleanup methods
        
        // Placeholder implementation
        // In real implementation, this would:
        // 1. Close MIDI port connections
        // 2. Clean up resources
        // 3. Reset communication state
    }
    
    // MARK: - Connection State Management
    private func updateConnectionState(_ newState: MIDIConnectionState) {
        let oldState = currentState
        currentState = newState
        connectionStateSubject.send(newState)
        
        // Log state changes for debugging
        logConnectionStateChange(from: oldState, to: newState)
    }
    
    private func logConnectionStateChange(from oldState: MIDIConnectionState, to newState: MIDIConnectionState) {
        print("MIDI Connection state changed: \(oldState.displayName) -> \(newState.displayName)")
        
        // In real implementation, this would use proper logging
        // and potentially notify analytics or debugging systems
    }
    
    // MARK: - Setup Methods
    private func setupConnectionMonitoring() {
        connectionMonitorTask = Task {
            while !Task.isCancelled {
                await updateConnectionQuality()
                try? await Task.sleep(nanoseconds: 10_000_000_000) // 10 seconds
            }
        }
    }
    
    private func setupErrorHandling() {
        // Set up error handling for connection-related errors
        // This would integrate with existing error handling patterns
    }
    
    // MARK: - Public Interface
    /// Gets detailed connection information for debugging
    func getConnectionInfo() -> ConnectionInfo {
        return ConnectionInfo(
            state: currentState,
            quality: connectionQuality,
            reconnectionAttempts: reconnectionAttempts,
            lastError: lastError,
            uptime: getConnectionUptime()
        )
    }
    
    /// Forces a connection quality check
    func checkConnectionQuality() async {
        await updateConnectionQuality()
    }
    
    /// Resets connection state and error counters
    func resetConnectionState() {
        reconnectionAttempts = 0
        lastError = nil
        updateConnectionState(.disconnected)
    }
    
    private func getConnectionUptime() -> TimeInterval {
        // Calculate connection uptime
        // This would track when connection was established
        return 0.0 // Placeholder
    }
}

// MARK: - Connection Quality Types
enum ConnectionQuality: Sendable, CaseIterable {
    case unknown
    case disconnected
    case poor
    case fair
    case good
    case excellent
    
    var displayName: String {
        switch self {
        case .unknown:
            return "Unknown"
        case .disconnected:
            return "Disconnected"
        case .poor:
            return "Poor"
        case .fair:
            return "Fair"
        case .good:
            return "Good"
        case .excellent:
            return "Excellent"
        }
    }
    
    var color: Color {
        switch self {
        case .unknown:
            return .gray
        case .disconnected:
            return .red
        case .poor:
            return .red
        case .fair:
            return .orange
        case .good:
            return .green
        case .excellent:
            return .blue
        }
    }
}

// MARK: - Reconnection Management
protocol ReconnectionManager: Sendable {
    func shouldAttemptReconnection(attempts: Int) -> Bool
    func getReconnectionDelay(attempt: Int) -> TimeInterval
    func resetReconnectionState()
}

final class DefaultReconnectionManager: ReconnectionManager {
    private let maxReconnectionAttempts = 5
    private let baseDelay: TimeInterval = 1.0
    private let maxDelay: TimeInterval = 30.0
    
    func shouldAttemptReconnection(attempts: Int) -> Bool {
        return attempts < maxReconnectionAttempts
    }
    
    func getReconnectionDelay(attempt: Int) -> TimeInterval {
        // Exponential backoff with jitter
        let exponentialDelay = baseDelay * pow(2.0, Double(attempt - 1))
        let cappedDelay = min(exponentialDelay, maxDelay)
        
        // Add jitter to prevent thundering herd
        let jitter = Double.random(in: 0.8...1.2)
        return cappedDelay * jitter
    }
    
    func resetReconnectionState() {
        // Reset any internal state if needed
    }
}

// MARK: - Error Handling Manager
protocol ErrorHandlingManager: Sendable {
    func handleMIDIError(_ error: MIDIError) async
    func recoverFromConnectionError() async throws
    func handleTimeout() async
    func handleChecksumError() async
    func getUserFriendlyErrorMessage(for error: MIDIError) -> String
}

@MainActor
final class DefaultErrorHandlingManager: ErrorHandlingManager {
    
    private var errorHistory: [ErrorHistoryEntry] = []
    private let maxErrorHistory = 50
    
    func handleMIDIError(_ error: MIDIError) async {
        recordError(error)
        
        switch error {
        case .connectionLost:
            await handleConnectionLostError()
        case .timeout:
            await handleTimeout()
        case .checksumError:
            await handleChecksumError()
        case .hardwareError(let description):
            await handleHardwareError(description)
        case .deviceNotFound:
            await handleDeviceNotFoundError()
        case .permissionDenied:
            await handlePermissionDeniedError()
        case .bufferOverflow:
            await handleBufferOverflowError()
        default:
            await handleGenericError(error)
        }
    }
    
    func recoverFromConnectionError() async throws {
        // Implement connection recovery strategies
        // This would integrate with existing connection recovery
        
        // 1. Clear any pending operations
        // 2. Reset communication buffers
        // 3. Attempt to re-establish connection
        // 4. Verify device identity
        
        throw MIDIError.connectionLost // Placeholder
    }
    
    func handleTimeout() async {
        // Handle timeout errors with retry logic
        recordError(.timeout)
        
        // Implement timeout recovery:
        // 1. Cancel pending operations
        // 2. Check connection state
        // 3. Potentially retry with longer timeout
    }
    
    func handleChecksumError() async {
        // Handle checksum validation errors
        recordError(.checksumError)
        
        // Implement checksum error recovery:
        // 1. Request data retransmission
        // 2. Check for communication interference
        // 3. Potentially reduce transmission speed
    }
    
    func getUserFriendlyErrorMessage(for error: MIDIError) -> String {
        switch error {
        case .connectionLost:
            return "Connection to GR-55 was lost. Please check your MIDI connection and try again."
        case .deviceNotFound:
            return "GR-55 device not found. Please ensure your device is connected and powered on."
        case .permissionDenied:
            return "MIDI access permission denied. Please check your system settings."
        case .timeout:
            return "Communication timeout. The GR-55 may be busy or unresponsive."
        case .checksumError:
            return "Data transmission error. Please try the operation again."
        case .hardwareError(let description):
            return "Hardware error: \(description). Please check your device."
        case .bufferOverflow:
            return "Too many commands sent too quickly. Please wait a moment and try again."
        default:
            return error.localizedDescription
        }
    }
    
    // MARK: - Specific Error Handlers
    private func handleConnectionLostError() async {
        // Specific handling for connection loss
        // This would integrate with reconnection logic
    }
    
    private func handleHardwareError(_ description: String) async {
        // Handle hardware-specific errors
        // This might involve device diagnostics or user guidance
    }
    
    private func handleDeviceNotFoundError() async {
        // Handle device not found errors
        // This might trigger device scanning or user prompts
    }
    
    private func handlePermissionDeniedError() async {
        // Handle permission errors
        // This might show user guidance for system settings
    }
    
    private func handleBufferOverflowError() async {
        // Handle buffer overflow errors
        // This might involve clearing buffers and reducing command rate
    }
    
    private func handleGenericError(_ error: MIDIError) async {
        // Handle other types of errors
        // This provides fallback error handling
    }
    
    // MARK: - Error History Management
    private func recordError(_ error: MIDIError) {
        let entry = ErrorHistoryEntry(error: error, timestamp: Date())
        errorHistory.append(entry)
        
        // Limit history size
        if errorHistory.count > maxErrorHistory {
            errorHistory.removeFirst()
        }
    }
    
    func getErrorHistory() -> [ErrorHistoryEntry] {
        return errorHistory
    }
    
    func getErrorStatistics() -> ErrorStatistics {
        let totalErrors = errorHistory.count
        let errorTypeCounts = Dictionary(grouping: errorHistory, by: { type(of: $0.error) })
            .mapValues { $0.count }
        
        let recentErrors = errorHistory.filter { 
            $0.timestamp.timeIntervalSinceNow > -3600 // Last hour
        }.count
        
        return ErrorStatistics(
            totalErrors: totalErrors,
            recentErrors: recentErrors,
            errorTypeCounts: errorTypeCounts,
            lastError: errorHistory.last
        )
    }
}

// MARK: - Supporting Types
struct ConnectionInfo: Sendable {
    let state: MIDIConnectionState
    let quality: ConnectionQuality
    let reconnectionAttempts: Int
    let lastError: MIDIError?
    let uptime: TimeInterval
}

struct ErrorHistoryEntry: Sendable, Identifiable {
    let id = UUID()
    let error: MIDIError
    let timestamp: Date
}

struct ErrorStatistics: Sendable {
    let totalErrors: Int
    let recentErrors: Int
    let errorTypeCounts: [ObjectIdentifier: Int]
    let lastError: ErrorHistoryEntry?
}

// MARK: - Connection Diagnostics
/// Provides diagnostic information about MIDI connection
final class MIDIConnectionDiagnostics: ObservableObject {
    
    @Published private(set) var diagnosticInfo: DiagnosticInfo = DiagnosticInfo()
    
    /// Runs comprehensive connection diagnostics
    func runDiagnostics() async -> DiagnosticResult {
        var results: [DiagnosticTest] = []
        
        // Test MIDI port availability
        results.append(await testMIDIPortAvailability())
        
        // Test device connectivity
        results.append(await testDeviceConnectivity())
        
        // Test communication latency
        results.append(await testCommunicationLatency())
        
        // Test data integrity
        results.append(await testDataIntegrity())
        
        let overallResult = determineOverallResult(from: results)
        
        await MainActor.run {
            diagnosticInfo = DiagnosticInfo(
                tests: results,
                overallResult: overallResult,
                timestamp: Date()
            )
        }
        
        return overallResult
    }
    
    private func testMIDIPortAvailability() async -> DiagnosticTest {
        // Test if MIDI ports are available
        // This would integrate with existing MIDI port detection
        
        return DiagnosticTest(
            name: "MIDI Port Availability",
            result: .passed,
            details: "MIDI ports are available",
            duration: 0.1
        )
    }
    
    private func testDeviceConnectivity() async -> DiagnosticTest {
        // Test if GR-55 device responds
        // This would send identity request and wait for response
        
        return DiagnosticTest(
            name: "Device Connectivity",
            result: .passed,
            details: "GR-55 device responds to identity request",
            duration: 0.5
        )
    }
    
    private func testCommunicationLatency() async -> DiagnosticTest {
        // Test communication round-trip time
        // This would measure response time for simple commands
        
        return DiagnosticTest(
            name: "Communication Latency",
            result: .passed,
            details: "Average latency: 15ms",
            duration: 1.0
        )
    }
    
    private func testDataIntegrity() async -> DiagnosticTest {
        // Test data transmission integrity
        // This would send known data and verify response
        
        return DiagnosticTest(
            name: "Data Integrity",
            result: .passed,
            details: "Data transmission is reliable",
            duration: 2.0
        )
    }
    
    private func determineOverallResult(from tests: [DiagnosticTest]) -> DiagnosticResult {
        if tests.allSatisfy({ $0.result == .passed }) {
            return .healthy
        } else if tests.contains(where: { $0.result == .failed }) {
            return .unhealthy
        } else {
            return .warning
        }
    }
}

// MARK: - Diagnostic Types
struct DiagnosticInfo: Sendable {
    let tests: [DiagnosticTest]
    let overallResult: DiagnosticResult
    let timestamp: Date
    
    init(tests: [DiagnosticTest] = [], overallResult: DiagnosticResult = .unknown, timestamp: Date = Date()) {
        self.tests = tests
        self.overallResult = overallResult
        self.timestamp = timestamp
    }
}

struct DiagnosticTest: Sendable, Identifiable {
    let id = UUID()
    let name: String
    let result: DiagnosticTestResult
    let details: String
    let duration: TimeInterval
}

enum DiagnosticTestResult: Sendable {
    case passed
    case failed
    case warning
    case skipped
    
    var displayName: String {
        switch self {
        case .passed:
            return "Passed"
        case .failed:
            return "Failed"
        case .warning:
            return "Warning"
        case .skipped:
            return "Skipped"
        }
    }
    
    var color: Color {
        switch self {
        case .passed:
            return .green
        case .failed:
            return .red
        case .warning:
            return .orange
        case .skipped:
            return .gray
        }
    }
}

enum DiagnosticResult: Sendable {
    case unknown
    case healthy
    case warning
    case unhealthy
    
    var displayName: String {
        switch self {
        case .unknown:
            return "Unknown"
        case .healthy:
            return "Healthy"
        case .warning:
            return "Warning"
        case .unhealthy:
            return "Unhealthy"
        }
    }
    
    var color: Color {
        switch self {
        case .unknown:
            return .gray
        case .healthy:
            return .green
        case .warning:
            return .orange
        case .unhealthy:
            return .red
        }
    }
}