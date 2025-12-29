# SwiftUI Performance Optimization Guide

## Overview

This guide documents performance optimization strategies for the GR55 SwiftUI hardware view to ensure smooth 60fps operation, efficient memory usage, and responsive user interactions. The strategies focus on minimizing unnecessary view updates, optimizing gesture recognition, and maintaining efficient resource management.

## View Update Optimization Strategies

### 1. Minimize Unnecessary Recomposition

#### @Published Property Granularity

```swift
// ❌ Avoid: Single large state object that triggers full UI updates
@Published var entireState: GR55State

// ✅ Preferred: Granular @Published properties for specific UI sections
@Published var activePedal: Int
@Published var patchName: String
@Published var activeStyle: SoundStyle
@Published var effectStates: EffectStates
```

#### Strategic View Isolation

```swift
// ✅ Isolate frequently changing components
struct DisplayComponent: View {
    @ObservedObject var stateManager: GR55StateManager

    var body: some View {
        VStack {
            // Static elements that don't need frequent updates
            StaticHeaderView()

            // Dynamic elements isolated to minimize recomposition
            DynamicPatchInfoView(
                patchName: stateManager.patchName,
                bank: stateManager.bank
            )

            EffectButtonsView(effectStates: stateManager.effectStates)
        }
    }
}
```

#### Conditional View Updates

```swift
// ✅ Use conditional modifiers to prevent unnecessary updates
struct LEDIndicator: View {
    let isActive: Bool

    var body: some View {
        Circle()
            .fill(isActive ? Color.red : Color.gray)
            .shadow(
                color: isActive ? Color.red : Color.clear,
                radius: isActive ? 8 : 0
            )
            // Only animate when state actually changes
            .animation(.easeInOut(duration: 0.2), value: isActive)
    }
}
```

### 2. Efficient State Management Patterns

#### Computed Properties for Derived State

```swift
class GR55StateManager: ObservableObject {
    @Published private var _activePedal: Int = 1
    @Published private var _bankSlots: [BankSlot] = []

    // Computed property prevents unnecessary @Published overhead
    var currentPatchName: String {
        guard _activePedal > 0 && _activePedal <= _bankSlots.count else {
            return "NO PATCH"
        }
        return _bankSlots[_activePedal - 1].name
    }

    // Only publish when actual change occurs
    func setActivePedal(_ pedal: Int) {
        guard pedal != _activePedal else { return }
        _activePedal = pedal
    }
}
```

#### Batch State Updates

```swift
// ✅ Batch related state changes to minimize UI updates
func updatePatchData(_ patchData: PatchData) {
    // Use withAnimation to batch all changes
    withAnimation(.easeInOut(duration: 0.2)) {
        self.patchName = patchData.name
        self.activeStyle = patchData.style
        self.effectStates = patchData.effects
        self.bank = patchData.bank
    }
}
```

### 3. View Hierarchy Optimization

#### Lazy Loading for Complex Components

```swift
struct PreviewPane: View {
    let hoveredItem: HoveredItem?

    var body: some View {
        Group {
            if let item = hoveredItem {
                // Lazy load preview content only when needed
                LazyVStack {
                    PreviewContent(for: item)
                }
                .transition(.opacity.combined(with: .scale))
            }
        }
    }
}
```

#### Efficient List Rendering

```swift
struct PatchSelectorView: View {
    @State private var patches: [Patch] = []
    @State private var filteredPatches: [Patch] = []

    var body: some View {
        LazyVStack(spacing: 8) {
            ForEach(filteredPatches, id: \.id) { patch in
                PatchRowView(patch: patch)
                    .id(patch.id) // Stable identity for efficient updates
            }
        }
        .onReceive(searchTextPublisher.debounce(for: .milliseconds(300), scheduler: RunLoop.main)) { searchText in
            updateFilteredPatches(searchText)
        }
    }
}
```

## Efficient Gesture Recognition and Animation System

### 1. Optimized Gesture Handling

#### Gesture State Management

```swift
struct FootPedal: View {
    @State private var gestureState: GestureState = .idle
    @State private var tapCount: Int = 0
    @State private var lastTapTime: Date = Date()

    private enum GestureState {
        case idle, pressing, released
    }

    var body: some View {
        PedalShape()
            .scaleEffect(gestureState == .pressing ? 0.98 : 1.0)
            .gesture(
                // Combine gestures for efficiency
                SimultaneousGesture(
                    // Single tap detection
                    TapGesture()
                        .onEnded { handleTap() },

                    // Press state for visual feedback
                    DragGesture(minimumDistance: 0)
                        .onChanged { _ in
                            if gestureState != .pressing {
                                gestureState = .pressing
                                // Haptic feedback only on state change
                                HapticManager.shared.lightImpact()
                            }
                        }
                        .onEnded { _ in
                            gestureState = .released
                        }
                )
            )
    }

    private func handleTap() {
        let now = Date()
        let timeSinceLastTap = now.timeIntervalSince(lastTapTime)

        if timeSinceLastTap < 0.5 {
            tapCount += 1
        } else {
            tapCount = 1
        }

        lastTapTime = now

        // Debounce double-tap detection
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            if tapCount == 1 {
                onSingleTap()
            } else if tapCount >= 2 {
                onDoubleTap?()
            }
            tapCount = 0
        }
    }
}
```

#### Expression Pedal Drag Optimization

```swift
struct ExpressionPedal: View {
    @ObservedObject var stateManager: GR55StateManager
    @State private var isDragging: Bool = false
    @State private var lastUpdateTime: Date = Date()

    var body: some View {
        GeometryReader { geometry in
            PedalSurface()
                .gesture(
                    DragGesture()
                        .onChanged { value in
                            // Throttle updates to prevent excessive state changes
                            let now = Date()
                            guard now.timeIntervalSince(lastUpdateTime) > 0.016 else { return } // ~60fps

                            let normalizedY = max(0, min(1, 1 - (value.location.y / geometry.size.height)))
                            let newLevel = Int(normalizedY * 100)

                            if newLevel != stateManager.patchLevel {
                                stateManager.setPatchLevel(newLevel)
                                lastUpdateTime = now
                            }
                        }
                        .onEnded { _ in
                            isDragging = false
                        }
                )
        }
    }
}
```

### 2. Animation Performance Optimization

#### Efficient Animation Timing

```swift
extension Animation {
    // Predefined animations for consistency and performance
    static let pedalPress = Animation.easeInOut(duration: 0.1)
    static let ledGlow = Animation.easeInOut(duration: 0.2)
    static let levelBarUpdate = Animation.linear(duration: 0.1)
    static let previewTransition = Animation.easeInOut(duration: 0.25)
}

struct AnimatedLED: View {
    let isActive: Bool

    var body: some View {
        Circle()
            .fill(isActive ? Color.red : Color.gray)
            .shadow(
                color: isActive ? Color.red.opacity(0.8) : Color.clear,
                radius: isActive ? 8 : 0
            )
            // Use specific animation for this component
            .animation(.ledGlow, value: isActive)
    }
}
```

#### Layer-Based Animation Optimization

```swift
struct LevelBar: View {
    let level: Int

    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .bottom) {
                // Background layer (static)
                Rectangle()
                    .fill(Color.gray.opacity(0.3))

                // Animated level layer
                Rectangle()
                    .fill(LinearGradient(
                        colors: [.green, .yellow, .red],
                        startPoint: .bottom,
                        endPoint: .top
                    ))
                    .frame(height: geometry.size.height * CGFloat(level) / 100)
                    .animation(.levelBarUpdate, value: level)
            }
        }
        // Use drawingGroup for complex gradients
        .drawingGroup()
    }
}
```

## Performance Monitoring Strategies

### 1. 60fps Target Monitoring

#### Frame Rate Tracking

```swift
class PerformanceMonitor: ObservableObject {
    @Published var currentFPS: Double = 60.0
    @Published var averageFPS: Double = 60.0
    @Published var frameDrops: Int = 0

    private var displayLink: CADisplayLink?
    private var lastTimestamp: CFTimeInterval = 0
    private var frameCount: Int = 0
    private var fpsHistory: [Double] = []

    func startMonitoring() {
        displayLink = CADisplayLink(target: self, selector: #selector(displayLinkTick))
        displayLink?.add(to: .main, forMode: .common)
    }

    @objc private func displayLinkTick(displayLink: CADisplayLink) {
        let timestamp = displayLink.timestamp

        if lastTimestamp > 0 {
            let deltaTime = timestamp - lastTimestamp
            let fps = 1.0 / deltaTime

            currentFPS = fps
            fpsHistory.append(fps)

            // Keep rolling average of last 60 frames
            if fpsHistory.count > 60 {
                fpsHistory.removeFirst()
            }

            averageFPS = fpsHistory.reduce(0, +) / Double(fpsHistory.count)

            // Count frame drops (below 55fps threshold)
            if fps < 55.0 {
                frameDrops += 1
            }
        }

        lastTimestamp = timestamp
        frameCount += 1
    }

    func stopMonitoring() {
        displayLink?.invalidate()
        displayLink = nil
    }
}
```

#### Performance Metrics Collection

```swift
struct PerformanceMetrics {
    let timestamp: Date
    let fps: Double
    let memoryUsage: UInt64
    let cpuUsage: Double
    let activeAnimations: Int
    let viewUpdateCount: Int
}

class MetricsCollector: ObservableObject {
    @Published var metrics: [PerformanceMetrics] = []
    private var timer: Timer?

    func startCollection() {
        timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { _ in
            self.collectMetrics()
        }
    }

    private func collectMetrics() {
        let metric = PerformanceMetrics(
            timestamp: Date(),
            fps: PerformanceMonitor.shared.currentFPS,
            memoryUsage: getMemoryUsage(),
            cpuUsage: getCPUUsage(),
            activeAnimations: getActiveAnimationCount(),
            viewUpdateCount: getViewUpdateCount()
        )

        metrics.append(metric)

        // Keep only last 300 metrics (5 minutes at 1Hz)
        if metrics.count > 300 {
            metrics.removeFirst()
        }
    }
}
```

### 2. Memory Usage Monitoring

#### Memory Pressure Detection

```swift
class MemoryMonitor: ObservableObject {
    @Published var memoryUsage: UInt64 = 0
    @Published var memoryPressure: MemoryPressureLevel = .normal

    enum MemoryPressureLevel {
        case normal, warning, critical
    }

    func startMonitoring() {
        Timer.scheduledTimer(withTimeInterval: 2.0, repeats: true) { _ in
            self.updateMemoryMetrics()
        }
    }

    private func updateMemoryMetrics() {
        var info = mach_task_basic_info()
        var count = mach_msg_type_number_t(MemoryLayout<mach_task_basic_info>.size)/4

        let kerr: kern_return_t = withUnsafeMutablePointer(to: &info) {
            $0.withMemoryRebound(to: integer_t.self, capacity: 1) {
                task_info(mach_task_self_,
                         task_flavor_t(MACH_TASK_BASIC_INFO),
                         $0,
                         &count)
            }
        }

        if kerr == KERN_SUCCESS {
            memoryUsage = info.resident_size

            // Determine pressure level based on usage
            let usageMB = memoryUsage / (1024 * 1024)
            if usageMB > 200 {
                memoryPressure = .critical
            } else if usageMB > 100 {
                memoryPressure = .warning
            } else {
                memoryPressure = .normal
            }
        }
    }
}
```

### 3. Gesture Recognition Performance

#### Gesture Response Time Tracking

```swift
class GesturePerformanceTracker {
    private var gestureStartTimes: [String: Date] = [:]
    private var responseTimeHistory: [String: [TimeInterval]] = [:]

    func trackGestureStart(_ gestureType: String) {
        gestureStartTimes[gestureType] = Date()
    }

    func trackGestureResponse(_ gestureType: String) {
        guard let startTime = gestureStartTimes[gestureType] else { return }

        let responseTime = Date().timeIntervalSince(startTime)

        if responseTimeHistory[gestureType] == nil {
            responseTimeHistory[gestureType] = []
        }

        responseTimeHistory[gestureType]?.append(responseTime)

        // Keep only last 100 measurements
        if let count = responseTimeHistory[gestureType]?.count, count > 100 {
            responseTimeHistory[gestureType]?.removeFirst()
        }

        gestureStartTimes.removeValue(forKey: gestureType)
    }

    func getAverageResponseTime(for gestureType: String) -> TimeInterval? {
        guard let times = responseTimeHistory[gestureType], !times.isEmpty else {
            return nil
        }
        return times.reduce(0, +) / Double(times.count)
    }
}
```

## Memory Management and Resource Cleanup Patterns

### 1. Efficient Resource Management

#### Image and Asset Caching

```swift
class AssetManager: ObservableObject {
    private var imageCache: NSCache<NSString, UIImage> = {
        let cache = NSCache<NSString, UIImage>()
        cache.countLimit = 50 // Limit cached images
        cache.totalCostLimit = 50 * 1024 * 1024 // 50MB limit
        return cache
    }()

    func loadImage(named name: String) -> UIImage? {
        if let cachedImage = imageCache.object(forKey: name as NSString) {
            return cachedImage
        }

        guard let image = UIImage(named: name) else { return nil }

        // Cache with cost based on image size
        let cost = Int(image.size.width * image.size.height * 4) // Assume 4 bytes per pixel
        imageCache.setObject(image, forKey: name as NSString, cost: cost)

        return image
    }

    func clearCache() {
        imageCache.removeAllObjects()
    }
}
```

#### Timer and Observer Cleanup

```swift
class GR55StateManager: ObservableObject {
    private var midiUpdateTimer: Timer?
    private var performanceMonitor: PerformanceMonitor?
    private var cancellables = Set<AnyCancellable>()

    init() {
        setupMIDIUpdates()
        setupPerformanceMonitoring()
    }

    deinit {
        cleanup()
    }

    private func cleanup() {
        midiUpdateTimer?.invalidate()
        midiUpdateTimer = nil

        performanceMonitor?.stopMonitoring()
        performanceMonitor = nil

        cancellables.removeAll()
    }

    func pauseUpdates() {
        midiUpdateTimer?.invalidate()
        performanceMonitor?.stopMonitoring()
    }

    func resumeUpdates() {
        setupMIDIUpdates()
        setupPerformanceMonitoring()
    }
}
```

### 2. View Lifecycle Management

#### Efficient View Appearance Handling

```swift
struct GR55HardwareView: View {
    @StateObject private var stateManager = GR55StateManager()
    @StateObject private var performanceMonitor = PerformanceMonitor()
    @Environment(\.scenePhase) private var scenePhase

    var body: some View {
        // Main view content
        HardwareViewContent()
            .environmentObject(stateManager)
            .environmentObject(performanceMonitor)
            .onChange(of: scenePhase) { phase in
                handleScenePhaseChange(phase)
            }
            .onAppear {
                stateManager.resumeUpdates()
                performanceMonitor.startMonitoring()
            }
            .onDisappear {
                stateManager.pauseUpdates()
                performanceMonitor.stopMonitoring()
            }
    }

    private func handleScenePhaseChange(_ phase: ScenePhase) {
        switch phase {
        case .active:
            stateManager.resumeUpdates()
            performanceMonitor.startMonitoring()
        case .inactive, .background:
            stateManager.pauseUpdates()
            performanceMonitor.stopMonitoring()
        @unknown default:
            break
        }
    }
}
```

### 3. Memory Pressure Response

#### Adaptive Quality Settings

```swift
class AdaptiveQualityManager: ObservableObject {
    @Published var qualityLevel: QualityLevel = .high

    enum QualityLevel {
        case low, medium, high

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
    }

    func adaptToMemoryPressure(_ pressure: MemoryMonitor.MemoryPressureLevel) {
        switch pressure {
        case .normal:
            qualityLevel = .high
        case .warning:
            qualityLevel = .medium
        case .critical:
            qualityLevel = .low
            // Force garbage collection
            AssetManager.shared.clearCache()
        }
    }
}
```

## Performance Testing Documentation

### 1. Automated Performance Tests

#### Frame Rate Testing

```swift
class PerformanceTests: XCTestCase {
    func testFrameRateUnderLoad() {
        let expectation = XCTestExpectation(description: "Maintain 60fps under load")
        let monitor = PerformanceMonitor()

        monitor.startMonitoring()

        // Simulate heavy interaction load
        for _ in 0..<100 {
            // Trigger rapid state changes
            stateManager.setActivePedal(Int.random(in: 1...4))
            stateManager.setPatchLevel(Int.random(in: 0...100))
        }

        DispatchQueue.main.asyncAfter(deadline: .now() + 5.0) {
            monitor.stopMonitoring()

            // Assert average FPS is above threshold
            XCTAssertGreaterThan(monitor.averageFPS, 55.0, "Frame rate dropped below acceptable threshold")
            expectation.fulfill()
        }

        wait(for: [expectation], timeout: 10.0)
    }
}
```

#### Memory Leak Detection

```swift
func testMemoryLeakDuringExtendedUse() {
    let initialMemory = getMemoryUsage()

    // Simulate extended use
    for _ in 0..<1000 {
        let view = GR55HardwareView()
        _ = view.body // Force view creation

        // Simulate user interactions
        stateManager.setActivePedal(Int.random(in: 1...4))
        stateManager.toggleCtlPedal()
    }

    // Force garbage collection
    autoreleasepool { }

    let finalMemory = getMemoryUsage()
    let memoryIncrease = finalMemory - initialMemory

    // Assert memory increase is within acceptable bounds (< 10MB)
    XCTAssertLessThan(memoryIncrease, 10 * 1024 * 1024, "Memory leak detected")
}
```

### 2. Manual Performance Testing Procedures

#### Device-Specific Testing Matrix

```
Testing Matrix:
- iPhone 12 Mini (A14 Bionic, 4GB RAM)
- iPhone 13 (A15 Bionic, 6GB RAM)
- iPhone 14 Pro (A16 Bionic, 6GB RAM)
- iPhone 15 Pro Max (A17 Pro, 8GB RAM)
- iPad Air (M1, 8GB RAM)
- iPad Pro 12.9" (M2, 16GB RAM)

Test Scenarios:
1. Cold start performance
2. Extended use (30+ minutes)
3. Background/foreground transitions
4. Memory pressure conditions
5. Rapid gesture interactions
6. MIDI data flood scenarios
```

#### Performance Benchmarking Checklist

```
□ Frame rate remains above 55fps during normal operation
□ Memory usage stays below 100MB during extended use
□ Gesture response time < 16ms (1 frame at 60fps)
□ Animation smoothness maintained during state changes
□ No memory leaks after 1000+ interactions
□ Graceful degradation under memory pressure
□ Proper resource cleanup on view dismissal
□ Battery impact remains minimal during extended use
```

## Implementation Guidelines

### 1. Performance-First Development Approach

1. **Profile Early**: Use Instruments to identify bottlenecks during development
2. **Measure Everything**: Implement performance monitoring from the start
3. **Optimize Incrementally**: Address performance issues as they arise
4. **Test on Target Hardware**: Always test on minimum supported devices
5. **Monitor in Production**: Include performance telemetry in release builds

### 2. Code Review Performance Checklist

- [ ] Are @Published properties granular enough to minimize unnecessary updates?
- [ ] Are animations using efficient timing and appropriate duration?
- [ ] Are gesture recognizers optimized to prevent excessive callbacks?
- [ ] Are resources properly cleaned up in deinit methods?
- [ ] Are expensive operations moved off the main thread where possible?
- [ ] Are view hierarchies optimized to minimize recomposition?
- [ ] Are memory allocations minimized in hot code paths?

### 3. Continuous Performance Monitoring

Implement automated performance regression testing in CI/CD pipeline:

- Frame rate benchmarks for key user flows
- Memory usage limits for extended operation
- Gesture response time thresholds
- Animation smoothness validation
- Resource cleanup verification

This comprehensive performance optimization approach ensures the SwiftUI GR55 hardware view maintains professional-grade performance standards while providing a smooth, responsive user experience across all supported iOS devices.
