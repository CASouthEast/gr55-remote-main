# Performance Monitoring Implementation Guide

## Overview

This guide provides implementation details for integrating performance monitoring into the GR55 SwiftUI hardware view. It includes real-time performance tracking, automated alerting, and production telemetry collection to ensure optimal user experience.

## Real-Time Performance Monitoring

### 1. Core Performance Monitor Implementation

#### PerformanceMonitor Class

```swift
import SwiftUI
import Combine
import QuartzCore

@MainActor
class PerformanceMonitor: ObservableObject {
    // Published properties for UI binding
    @Published var currentFPS: Double = 60.0
    @Published var averageFPS: Double = 60.0
    @Published var memoryUsageMB: Double = 0.0
    @Published var isMonitoring: Bool = false

    // Performance tracking
    private var displayLink: CADisplayLink?
    private var lastTimestamp: CFTimeInterval = 0
    private var frameCount: Int = 0
    private var fpsHistory: CircularBuffer<Double>
    private var frameDropCount: Int = 0

    // Memory monitoring
    private var memoryTimer: Timer?
    private var peakMemoryUsage: UInt64 = 0

    // Performance thresholds
    private let targetFPS: Double = 60.0
    private let warningFPSThreshold: Double = 50.0
    private let criticalFPSThreshold: Double = 30.0
    private let memoryWarningThreshold: UInt64 = 100 * 1024 * 1024 // 100MB

    init() {
        self.fpsHistory = CircularBuffer<Double>(capacity: 120) // 2 seconds at 60fps
    }

    deinit {
        stopMonitoring()
    }

    // MARK: - Public Interface

    func startMonitoring() {
        guard !isMonitoring else { return }

        isMonitoring = true
        startFrameRateMonitoring()
        startMemoryMonitoring()

        print("Performance monitoring started")
    }

    func stopMonitoring() {
        guard isMonitoring else { return }

        isMonitoring = false
        stopFrameRateMonitoring()
        stopMemoryMonitoring()

        print("Performance monitoring stopped")
    }

    func getPerformanceReport() -> PerformanceReport {
        return PerformanceReport(
            averageFPS: averageFPS,
            currentFPS: currentFPS,
            frameDropCount: frameDropCount,
            memoryUsageMB: memoryUsageMB,
            peakMemoryUsageMB: Double(peakMemoryUsage) / (1024 * 1024),
            timestamp: Date()
        )
    }

    // MARK: - Frame Rate Monitoring

    private func startFrameRateMonitoring() {
        displayLink = CADisplayLink(target: self, selector: #selector(displayLinkTick))
        displayLink?.add(to: .main, forMode: .common)
    }

    private func stopFrameRateMonitoring() {
        displayLink?.invalidate()
        displayLink = nil
        lastTimestamp = 0
        frameCount = 0
    }

    @objc private func displayLinkTick(displayLink: CADisplayLink) {
        let timestamp = displayLink.timestamp

        if lastTimestamp > 0 {
            let deltaTime = timestamp - lastTimestamp
            let instantFPS = 1.0 / deltaTime

            // Update current FPS
            currentFPS = instantFPS

            // Add to history for average calculation
            fpsHistory.append(instantFPS)

            // Calculate rolling average
            averageFPS = fpsHistory.average()

            // Track frame drops
            if instantFPS < warningFPSThreshold {
                frameDropCount += 1

                if instantFPS < criticalFPSThreshold {
                    handleCriticalFrameRate(instantFPS)
                }
            }

            // Check for performance issues
            checkPerformanceThresholds()
        }

        lastTimestamp = timestamp
        frameCount += 1
    }

    // MARK: - Memory Monitoring

    private func startMemoryMonitoring() {
        memoryTimer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
            Task { @MainActor in
                self?.updateMemoryMetrics()
            }
        }
    }

    private func stopMemoryMonitoring() {
        memoryTimer?.invalidate()
        memoryTimer = nil
    }

    private func updateMemoryMetrics() {
        let currentMemory = getCurrentMemoryUsage()
        memoryUsageMB = Double(currentMemory) / (1024 * 1024)

        if currentMemory > peakMemoryUsage {
            peakMemoryUsage = currentMemory
        }

        if currentMemory > memoryWarningThreshold {
            handleHighMemoryUsage(currentMemory)
        }
    }

    private func getCurrentMemoryUsage() -> UInt64 {
        var info = mach_task_basic_info()
        var count = mach_msg_type_number_t(MemoryLayout<mach_task_basic_info>.size) / 4

        let kerr: kern_return_t = withUnsafeMutablePointer(to: &info) {
            $0.withMemoryRebound(to: integer_t.self, capacity: 1) {
                task_info(mach_task_self_,
                         task_flavor_t(MACH_TASK_BASIC_INFO),
                         $0,
                         &count)
            }
        }

        return kerr == KERN_SUCCESS ? info.resident_size : 0
    }

    // MARK: - Performance Issue Handling

    private func checkPerformanceThresholds() {
        if averageFPS < warningFPSThreshold {
            NotificationCenter.default.post(
                name: .performanceWarning,
                object: PerformanceWarning.lowFrameRate(averageFPS)
            )
        }
    }

    private func handleCriticalFrameRate(_ fps: Double) {
        print("Critical frame rate detected: \(fps) fps")

        // Trigger performance optimization
        NotificationCenter.default.post(
            name: .performanceCritical,
            object: PerformanceAlert.criticalFrameRate(fps)
        )
    }

    private func handleHighMemoryUsage(_ memoryBytes: UInt64) {
        let memoryMB = Double(memoryBytes) / (1024 * 1024)
        print("High memory usage detected: \(memoryMB) MB")

        NotificationCenter.default.post(
            name: .performanceWarning,
            object: PerformanceWarning.highMemoryUsage(memoryMB)
        )
    }
}

// MARK: - Supporting Types

struct PerformanceReport {
    let averageFPS: Double
    let currentFPS: Double
    let frameDropCount: Int
    let memoryUsageMB: Double
    let peakMemoryUsageMB: Double
    let timestamp: Date
}

enum PerformanceWarning {
    case lowFrameRate(Double)
    case highMemoryUsage(Double)
    case gestureLatency(TimeInterval)
}

enum PerformanceAlert {
    case criticalFrameRate(Double)
    case memoryPressure(Double)
    case systemOverload
}

// MARK: - Notification Extensions

extension Notification.Name {
    static let performanceWarning = Notification.Name("performanceWarning")
    static let performanceCritical = Notification.Name("performanceCritical")
}
```

### 2. Circular Buffer for Efficient Data Storage

#### CircularBuffer Implementation

```swift
struct CircularBuffer<T> {
    private var buffer: [T]
    private var head: Int = 0
    private var count: Int = 0
    private let capacity: Int

    init(capacity: Int) {
        self.capacity = capacity
        self.buffer = Array<T?>(repeating: nil, count: capacity) as! [T]
    }

    mutating func append(_ element: T) {
        buffer[head] = element
        head = (head + 1) % capacity

        if count < capacity {
            count += 1
        }
    }

    func toArray() -> [T] {
        guard count > 0 else { return [] }

        if count < capacity {
            return Array(buffer[0..<count])
        } else {
            return Array(buffer[head..<capacity]) + Array(buffer[0..<head])
        }
    }

    var isEmpty: Bool {
        return count == 0
    }

    var isFull: Bool {
        return count == capacity
    }
}

extension CircularBuffer where T: Numeric {
    func sum() -> T {
        return toArray().reduce(0, +)
    }

    func average() -> Double where T: BinaryFloatingPoint {
        guard count > 0 else { return 0 }
        let total = toArray().reduce(0, +)
        return Double(total) / Double(count)
    }
}
```

### 3. Gesture Performance Tracking

#### GesturePerformanceTracker Implementation

```swift
@MainActor
class GesturePerformanceTracker: ObservableObject {
    @Published var averageResponseTime: TimeInterval = 0
    @Published var gestureCount: Int = 0

    private var gestureStartTimes: [String: Date] = [:]
    private var responseTimeHistory: CircularBuffer<TimeInterval>
    private let maxHistorySize = 100

    init() {
        self.responseTimeHistory = CircularBuffer<TimeInterval>(capacity: maxHistorySize)
    }

    func trackGestureStart(_ gestureType: String, identifier: String = UUID().uuidString) {
        let key = "\(gestureType)_\(identifier)"
        gestureStartTimes[key] = Date()
    }

    func trackGestureEnd(_ gestureType: String, identifier: String = UUID().uuidString) {
        let key = "\(gestureType)_\(identifier)"

        guard let startTime = gestureStartTimes.removeValue(forKey: key) else {
            print("Warning: No start time found for gesture \(key)")
            return
        }

        let responseTime = Date().timeIntervalSince(startTime)
        responseTimeHistory.append(responseTime)

        // Update published properties
        averageResponseTime = responseTimeHistory.average()
        gestureCount += 1

        // Check for slow gestures
        if responseTime > 0.050 { // 50ms threshold
            print("Slow gesture detected: \(gestureType) took \(responseTime * 1000)ms")

            NotificationCenter.default.post(
                name: .performanceWarning,
                object: PerformanceWarning.gestureLatency(responseTime)
            )
        }
    }

    func getGestureMetrics() -> GestureMetrics {
        let times = responseTimeHistory.toArray()

        return GestureMetrics(
            averageResponseTime: averageResponseTime,
            minimumResponseTime: times.min() ?? 0,
            maximumResponseTime: times.max() ?? 0,
            gestureCount: gestureCount,
            slowGestureCount: times.filter { $0 > 0.050 }.count
        )
    }

    func reset() {
        responseTimeHistory = CircularBuffer<TimeInterval>(capacity: maxHistorySize)
        averageResponseTime = 0
        gestureCount = 0
        gestureStartTimes.removeAll()
    }
}

struct GestureMetrics {
    let averageResponseTime: TimeInterval
    let minimumResponseTime: TimeInterval
    let maximumResponseTime: TimeInterval
    let gestureCount: Int
    let slowGestureCount: Int
}
```

## Adaptive Performance Management

### 1. Quality Level Management

#### AdaptiveQualityManager Implementation

```swift
@MainActor
class AdaptiveQualityManager: ObservableObject {
    @Published var currentQualityLevel: QualityLevel = .high
    @Published var isAdaptiveMode: Bool = true

    private var performanceMonitor: PerformanceMonitor?
    private var qualityTimer: Timer?

    enum QualityLevel: Int, CaseIterable {
        case low = 1
        case medium = 2
        case high = 3

        var animationDuration: Double {
            switch self {
            case .low: return 0.1
            case .medium: return 0.15
            case .high: return 0.2
            }
        }

        var shadowRadius: CGFloat {
            switch self {
            case .low: return 2
            case .medium: return 4
            case .high: return 8
            }
        }

        var updateFrequency: TimeInterval {
            switch self {
            case .low: return 0.033 // 30fps
            case .medium: return 0.020 // 50fps
            case .high: return 0.016 // 60fps
            }
        }

        var enableComplexAnimations: Bool {
            return self == .high
        }

        var enableParticleEffects: Bool {
            return self != .low
        }
    }

    init(performanceMonitor: PerformanceMonitor) {
        self.performanceMonitor = performanceMonitor
        startAdaptiveMonitoring()
    }

    deinit {
        stopAdaptiveMonitoring()
    }

    private func startAdaptiveMonitoring() {
        guard isAdaptiveMode else { return }

        qualityTimer = Timer.scheduledTimer(withTimeInterval: 2.0, repeats: true) { [weak self] _ in
            Task { @MainActor in
                self?.evaluatePerformanceAndAdapt()
            }
        }
    }

    private func stopAdaptiveMonitoring() {
        qualityTimer?.invalidate()
        qualityTimer = nil
    }

    private func evaluatePerformanceAndAdapt() {
        guard let monitor = performanceMonitor else { return }

        let currentFPS = monitor.averageFPS
        let memoryUsageMB = monitor.memoryUsageMB

        let recommendedQuality = determineOptimalQuality(fps: currentFPS, memoryMB: memoryUsageMB)

        if recommendedQuality != currentQualityLevel {
            print("Adapting quality from \(currentQualityLevel) to \(recommendedQuality)")
            currentQualityLevel = recommendedQuality

            // Notify components of quality change
            NotificationCenter.default.post(
                name: .qualityLevelChanged,
                object: currentQualityLevel
            )
        }
    }

    private func determineOptimalQuality(fps: Double, memoryMB: Double) -> QualityLevel {
        // Critical performance issues - drop to low quality
        if fps < 30 || memoryMB > 150 {
            return .low
        }

        // Performance warnings - use medium quality
        if fps < 50 || memoryMB > 100 {
            return .medium
        }

        // Good performance - use high quality
        return .high
    }

    func setQualityLevel(_ level: QualityLevel, adaptive: Bool = true) {
        currentQualityLevel = level
        isAdaptiveMode = adaptive

        if adaptive {
            startAdaptiveMonitoring()
        } else {
            stopAdaptiveMonitoring()
        }
    }

    func forceQualityEvaluation() {
        evaluatePerformanceAndAdapt()
    }
}

extension Notification.Name {
    static let qualityLevelChanged = Notification.Name("qualityLevelChanged")
}
```

### 2. Performance-Aware Animation System

#### AdaptiveAnimationManager Implementation

```swift
@MainActor
class AdaptiveAnimationManager: ObservableObject {
    @Published var isAnimationEnabled: Bool = true
    @Published var animationQuality: AnimationQuality = .high

    private var qualityManager: AdaptiveQualityManager?
    private var activeAnimations: Set<String> = []
    private let maxConcurrentAnimations = 10

    enum AnimationQuality {
        case minimal, standard, high

        var springResponse: Double {
            switch self {
            case .minimal: return 0.3
            case .standard: return 0.4
            case .high: return 0.5
            }
        }

        var springDamping: Double {
            switch self {
            case .minimal: return 0.8
            case .standard: return 0.7
            case .high: return 0.6
            }
        }
    }

    init(qualityManager: AdaptiveQualityManager) {
        self.qualityManager = qualityManager
        setupQualityObserver()
    }

    private func setupQualityObserver() {
        NotificationCenter.default.addObserver(
            forName: .qualityLevelChanged,
            object: nil,
            queue: .main
        ) { [weak self] notification in
            if let qualityLevel = notification.object as? AdaptiveQualityManager.QualityLevel {
                self?.adaptToQualityLevel(qualityLevel)
            }
        }
    }

    private func adaptToQualityLevel(_ level: AdaptiveQualityManager.QualityLevel) {
        switch level {
        case .low:
            animationQuality = .minimal
            isAnimationEnabled = true // Keep basic animations
        case .medium:
            animationQuality = .standard
            isAnimationEnabled = true
        case .high:
            animationQuality = .high
            isAnimationEnabled = true
        }
    }

    func requestAnimation(_ identifier: String, priority: AnimationPriority = .normal) -> Bool {
        // Check if we can add more animations
        if activeAnimations.count >= maxConcurrentAnimations && priority != .high {
            return false
        }

        activeAnimations.insert(identifier)
        return true
    }

    func completeAnimation(_ identifier: String) {
        activeAnimations.remove(identifier)
    }

    func getOptimalAnimation(for type: AnimationType) -> Animation {
        guard isAnimationEnabled else {
            return .none
        }

        switch type {
        case .pedalPress:
            return .easeInOut(duration: qualityManager?.currentQualityLevel.animationDuration ?? 0.2)
        case .ledGlow:
            return .spring(response: animationQuality.springResponse, dampingFraction: animationQuality.springDamping)
        case .levelBar:
            return .linear(duration: 0.1)
        case .preview:
            return .easeInOut(duration: 0.25)
        }
    }

    enum AnimationPriority {
        case low, normal, high
    }

    enum AnimationType {
        case pedalPress, ledGlow, levelBar, preview
    }
}
```

## Production Telemetry and Analytics

### 1. Performance Telemetry Collection

#### TelemetryCollector Implementation

```swift
class PerformanceTelemetryCollector {
    static let shared = PerformanceTelemetryCollector()

    private var telemetryBuffer: [TelemetryEvent] = []
    private let maxBufferSize = 1000
    private let flushInterval: TimeInterval = 300 // 5 minutes
    private var flushTimer: Timer?

    private init() {
        startPeriodicFlush()
    }

    deinit {
        flushTimer?.invalidate()
    }

    // MARK: - Public Interface

    func recordPerformanceMetric(_ metric: PerformanceMetric) {
        let event = TelemetryEvent(
            type: .performance,
            data: metric.toDictionary(),
            timestamp: Date(),
            sessionId: SessionManager.shared.currentSessionId
        )

        addEvent(event)
    }

    func recordUserInteraction(_ interaction: UserInteraction) {
        let event = TelemetryEvent(
            type: .interaction,
            data: interaction.toDictionary(),
            timestamp: Date(),
            sessionId: SessionManager.shared.currentSessionId
        )

        addEvent(event)
    }

    func recordError(_ error: PerformanceError) {
        let event = TelemetryEvent(
            type: .error,
            data: error.toDictionary(),
            timestamp: Date(),
            sessionId: SessionManager.shared.currentSessionId
        )

        addEvent(event)

        // Immediately flush critical errors
        if error.severity == .critical {
            flushTelemetry()
        }
    }

    // MARK: - Private Implementation

    private func addEvent(_ event: TelemetryEvent) {
        telemetryBuffer.append(event)

        if telemetryBuffer.count >= maxBufferSize {
            flushTelemetry()
        }
    }

    private func startPeriodicFlush() {
        flushTimer = Timer.scheduledTimer(withTimeInterval: flushInterval, repeats: true) { [weak self] _ in
            self?.flushTelemetry()
        }
    }

    private func flushTelemetry() {
        guard !telemetryBuffer.isEmpty else { return }

        let eventsToSend = telemetryBuffer
        telemetryBuffer.removeAll()

        // Send to analytics service
        Task {
            await sendTelemetryEvents(eventsToSend)
        }
    }

    private func sendTelemetryEvents(_ events: [TelemetryEvent]) async {
        do {
            let telemetryData = TelemetryBatch(
                events: events,
                deviceInfo: DeviceInfo.current,
                appVersion: Bundle.main.appVersion
            )

            try await AnalyticsService.shared.sendTelemetry(telemetryData)
            print("Sent \(events.count) telemetry events")
        } catch {
            print("Failed to send telemetry: \(error)")

            // Re-add events to buffer for retry (with limit)
            if telemetryBuffer.count < maxBufferSize / 2 {
                telemetryBuffer.append(contentsOf: events)
            }
        }
    }
}

// MARK: - Supporting Types

struct TelemetryEvent {
    let type: EventType
    let data: [String: Any]
    let timestamp: Date
    let sessionId: String

    enum EventType: String {
        case performance = "performance"
        case interaction = "interaction"
        case error = "error"
    }
}

struct TelemetryBatch {
    let events: [TelemetryEvent]
    let deviceInfo: DeviceInfo
    let appVersion: String
}

struct PerformanceMetric {
    let fps: Double
    let memoryUsageMB: Double
    let gestureResponseTimeMS: Double
    let activeAnimations: Int
    let qualityLevel: String

    func toDictionary() -> [String: Any] {
        return [
            "fps": fps,
            "memory_usage_mb": memoryUsageMB,
            "gesture_response_time_ms": gestureResponseTimeMS,
            "active_animations": activeAnimations,
            "quality_level": qualityLevel
        ]
    }
}

struct UserInteraction {
    let type: InteractionType
    let responseTimeMS: Double
    let successful: Bool

    enum InteractionType: String {
        case pedalTap = "pedal_tap"
        case expressionDrag = "expression_drag"
        case styleChange = "style_change"
        case previewHover = "preview_hover"
    }

    func toDictionary() -> [String: Any] {
        return [
            "type": type.rawValue,
            "response_time_ms": responseTimeMS,
            "successful": successful
        ]
    }
}

struct PerformanceError {
    let type: ErrorType
    let severity: Severity
    let message: String
    let context: [String: Any]

    enum ErrorType: String {
        case frameRateDrop = "frame_rate_drop"
        case memoryPressure = "memory_pressure"
        case gestureTimeout = "gesture_timeout"
        case animationFailure = "animation_failure"
    }

    enum Severity: String {
        case low, medium, high, critical
    }

    func toDictionary() -> [String: Any] {
        return [
            "type": type.rawValue,
            "severity": severity.rawValue,
            "message": message,
            "context": context
        ]
    }
}

struct DeviceInfo {
    let model: String
    let osVersion: String
    let screenSize: CGSize
    let memoryGB: Double

    static var current: DeviceInfo {
        return DeviceInfo(
            model: UIDevice.current.model,
            osVersion: UIDevice.current.systemVersion,
            screenSize: UIScreen.main.bounds.size,
            memoryGB: Double(ProcessInfo.processInfo.physicalMemory) / (1024 * 1024 * 1024)
        )
    }
}
```

### 2. Performance Dashboard Integration

#### Real-Time Performance Dashboard

```swift
struct PerformanceDashboard: View {
    @StateObject private var performanceMonitor = PerformanceMonitor()
    @StateObject private var gestureTracker = GesturePerformanceTracker()
    @StateObject private var qualityManager: AdaptiveQualityManager

    @State private var showingDetails = false

    init() {
        let monitor = PerformanceMonitor()
        let quality = AdaptiveQualityManager(performanceMonitor: monitor)
        self._qualityManager = StateObject(wrappedValue: quality)
    }

    var body: some View {
        VStack(spacing: 16) {
            // Performance Overview
            HStack(spacing: 20) {
                PerformanceGauge(
                    title: "FPS",
                    value: performanceMonitor.currentFPS,
                    target: 60.0,
                    color: fpsColor
                )

                PerformanceGauge(
                    title: "Memory",
                    value: performanceMonitor.memoryUsageMB,
                    target: 100.0,
                    color: memoryColor,
                    unit: "MB"
                )

                PerformanceGauge(
                    title: "Response",
                    value: gestureTracker.averageResponseTime * 1000,
                    target: 16.0,
                    color: responseColor,
                    unit: "ms"
                )
            }

            // Quality Level Indicator
            HStack {
                Text("Quality Level:")
                    .font(.headline)

                QualityLevelBadge(level: qualityManager.currentQualityLevel)

                Spacer()

                Button("Details") {
                    showingDetails = true
                }
            }

            // Performance History Chart
            if showingDetails {
                PerformanceChart(monitor: performanceMonitor)
                    .frame(height: 200)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(radius: 4)
        .onAppear {
            performanceMonitor.startMonitoring()
        }
        .onDisappear {
            performanceMonitor.stopMonitoring()
        }
    }

    private var fpsColor: Color {
        if performanceMonitor.currentFPS >= 55 { return .green }
        if performanceMonitor.currentFPS >= 30 { return .orange }
        return .red
    }

    private var memoryColor: Color {
        if performanceMonitor.memoryUsageMB <= 75 { return .green }
        if performanceMonitor.memoryUsageMB <= 100 { return .orange }
        return .red
    }

    private var responseColor: Color {
        let responseMS = gestureTracker.averageResponseTime * 1000
        if responseMS <= 16 { return .green }
        if responseMS <= 33 { return .orange }
        return .red
    }
}

struct PerformanceGauge: View {
    let title: String
    let value: Double
    let target: Double
    let color: Color
    let unit: String

    init(title: String, value: Double, target: Double, color: Color, unit: String = "") {
        self.title = title
        self.value = value
        self.target = target
        self.color = color
        self.unit = unit
    }

    var body: some View {
        VStack {
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)

            Text(String(format: "%.1f%@", value, unit))
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(color)

            // Progress bar
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    Rectangle()
                        .fill(Color.gray.opacity(0.3))
                        .frame(height: 4)

                    Rectangle()
                        .fill(color)
                        .frame(width: geometry.size.width * min(value / target, 1.0), height: 4)
                }
            }
            .frame(height: 4)
        }
    }
}
```

This comprehensive performance monitoring implementation provides real-time tracking, adaptive quality management, and production telemetry collection to ensure optimal performance of the SwiftUI GR55 hardware view across all supported devices and usage scenarios.
