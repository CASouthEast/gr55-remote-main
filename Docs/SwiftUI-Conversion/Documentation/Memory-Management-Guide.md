# Memory Management and Resource Cleanup Guide

## Overview

This guide provides comprehensive strategies for efficient memory management and resource cleanup in the GR55 SwiftUI hardware view. It covers memory optimization patterns, resource lifecycle management, and cleanup procedures to ensure optimal performance and prevent memory leaks.

## Memory Management Patterns

### 1. ObservableObject Lifecycle Management

#### Proper StateObject and ObservedObject Usage

```swift
// ✅ Correct: Use @StateObject for ownership
struct GR55HardwareView: View {
    @StateObject private var stateManager = GR55StateManager()
    @StateObject private var performanceMonitor = PerformanceMonitor()

    var body: some View {
        HardwareViewContent()
            .environmentObject(stateManager)
            .environmentObject(performanceMonitor)
    }
}

// ✅ Correct: Use @ObservedObject for observation without ownership
struct DisplayComponent: View {
    @ObservedObject var stateManager: GR55StateManager

    var body: some View {
        // Component implementation
    }
}

// ❌ Incorrect: Don't use @StateObject in child views
struct FootPedal: View {
    @StateObject private var stateManager = GR55StateManager() // Creates new instance!

    var body: some View {
        // This creates memory leaks and state inconsistency
    }
}
```

#### Proper Cleanup in ObservableObject

```swift
@MainActor
class GR55StateManager: ObservableObject {
    @Published var activePedal: Int = 1
    @Published var patchName: String = ""

    private var midiUpdateTimer: Timer?
    private var performanceMonitor: PerformanceMonitor?
    private var cancellables = Set<AnyCancellable>()
    private var displayLink: CADisplayLink?

    init() {
        setupMIDIUpdates()
        setupPerformanceMonitoring()
        setupNotificationObservers()
    }

    deinit {
        print("GR55StateManager deallocating")
        cleanup()
    }

    private func cleanup() {
        // Stop timers
        midiUpdateTimer?.invalidate()
        midiUpdateTimer = nil

        // Stop display link
        displayLink?.invalidate()
        displayLink = nil

        // Cancel Combine subscriptions
        cancellables.removeAll()

        // Clean up performance monitor
        performanceMonitor?.stopMonitoring()
        performanceMonitor = nil

        // Remove notification observers
        NotificationCenter.default.removeObserver(self)

        print("GR55StateManager cleanup completed")
    }

    // Call this when the view disappears or app goes to background
    func pauseUpdates() {
        midiUpdateTimer?.invalidate()
        displayLink?.invalidate()
        performanceMonitor?.stopMonitoring()
    }

    // Call this when the view appears or app becomes active
    func resumeUpdates() {
        setupMIDIUpdates()
        setupPerformanceMonitoring()
    }

    private func setupNotificationObservers() {
        // Use weak self to prevent retain cycles
        NotificationCenter.default.addObserver(
            forName: UIApplication.didEnterBackgroundNotification,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            self?.pauseUpdates()
        }

        NotificationCenter.default.addObserver(
            forName: UIApplication.willEnterForegroundNotification,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            self?.resumeUpdates()
        }
    }
}
```

### 2. Efficient Image and Asset Management

#### Smart Asset Caching System

```swift
@MainActor
class AssetManager: ObservableObject {
    static let shared = AssetManager()

    private var imageCache: NSCache<NSString, UIImage>
    private var svgCache: NSCache<NSString, AnyView>
    private var memoryWarningObserver: NSObjectProtocol?

    private init() {
        // Configure image cache
        imageCache = NSCache<NSString, UIImage>()
        imageCache.countLimit = 50
        imageCache.totalCostLimit = 50 * 1024 * 1024 // 50MB
        imageCache.delegate = self

        // Configure SVG cache
        svgCache = NSCache<NSString, AnyView>()
        svgCache.countLimit = 30
        svgCache.totalCostLimit = 10 * 1024 * 1024 // 10MB

        setupMemoryWarningObserver()
    }

    deinit {
        if let observer = memoryWarningObserver {
            NotificationCenter.default.removeObserver(observer)
        }
    }

    func loadImage(named name: String) -> UIImage? {
        let key = name as NSString

        // Check cache first
        if let cachedImage = imageCache.object(forKey: key) {
            return cachedImage
        }

        // Load from bundle
        guard let image = UIImage(named: name) else {
            print("Warning: Image '\(name)' not found")
            return nil
        }

        // Calculate cost based on image size
        let cost = Int(image.size.width * image.size.height * image.scale * image.scale * 4)
        imageCache.setObject(image, forKey: key, cost: cost)

        return image
    }

    func preloadImages(_ imageNames: [String]) {
        for name in imageNames {
            _ = loadImage(named: name)
        }
    }

    func clearCache() {
        imageCache.removeAllObjects()
        svgCache.removeAllObjects()
        print("Asset cache cleared")
    }

    private func setupMemoryWarningObserver() {
        memoryWarningObserver = NotificationCenter.default.addObserver(
            forName: UIApplication.didReceiveMemoryWarningNotification,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            print("Memory warning received - clearing asset cache")
            self?.clearCache()
        }
    }

    // Get current cache statistics
    func getCacheStats() -> CacheStats {
        return CacheStats(
            imageCount: imageCache.countLimit,
            imageCostMB: Double(imageCache.totalCostLimit) / (1024 * 1024),
            svgCount: svgCache.countLimit
        )
    }
}

extension AssetManager: NSCacheDelegate {
    func cache(_ cache: NSCache<AnyObject, AnyObject>, willEvictObject obj: AnyObject) {
        print("Cache evicting object due to memory pressure")
    }
}

struct CacheStats {
    let imageCount: Int
    let imageCostMB: Double
    let svgCount: Int
}
```

### 3. Memory-Efficient View Management

#### Lazy Loading and View Recycling

```swift
struct PreviewPane: View {
    let hoveredItem: HoveredItem?
    @State private var cachedPreviews: [String: AnyView] = [:]
    @State private var isVisible: Bool = false

    var body: some View {
        Group {
            if let item = hoveredItem, isVisible {
                LazyVStack {
                    // Use cached preview if available
                    if let cachedPreview = cachedPreviews[item.id] {
                        cachedPreview
                    } else {
                        // Create and cache new preview
                        PreviewContent(for: item)
                            .onAppear {
                                cachePreview(for: item)
                            }
                    }
                }
                .transition(.opacity.combined(with: .scale))
            }
        }
        .onChange(of: hoveredItem) { newItem in
            withAnimation(.easeInOut(duration: 0.2)) {
                isVisible = newItem != nil
            }

            // Clean up old previews when not needed
            if newItem == nil {
                cleanupOldPreviews()
            }
        }
    }

    private func cachePreview(for item: HoveredItem) {
        // Limit cache size to prevent memory growth
        if cachedPreviews.count > 10 {
            // Remove oldest entries
            let keysToRemove = Array(cachedPreviews.keys.prefix(5))
            for key in keysToRemove {
                cachedPreviews.removeValue(forKey: key)
            }
        }

        cachedPreviews[item.id] = AnyView(PreviewContent(for: item))
    }

    private func cleanupOldPreviews() {
        // Clear cache after a delay to allow for quick re-hovers
        DispatchQueue.main.asyncAfter(deadline: .now() + 5.0) {
            if hoveredItem == nil {
                cachedPreviews.removeAll()
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
    @State private var searchText: String = ""

    // Pagination for large lists
    @State private var displayedPatches: [Patch] = []
    private let pageSize = 50
    @State private var currentPage = 0

    var body: some View {
        VStack {
            SearchBar(text: $searchText)
                .onChange(of: searchText) { newText in
                    filterPatches(searchText: newText)
                }

            ScrollView {
                LazyVStack(spacing: 8) {
                    ForEach(displayedPatches, id: \.id) { patch in
                        PatchRowView(patch: patch)
                            .onAppear {
                                // Load more when approaching end
                                if patch.id == displayedPatches.last?.id {
                                    loadMorePatches()
                                }
                            }
                    }

                    if displayedPatches.count < filteredPatches.count {
                        ProgressView()
                            .onAppear {
                                loadMorePatches()
                            }
                    }
                }
            }
        }
        .onAppear {
            loadInitialPatches()
        }
    }

    private func filterPatches(searchText: String) {
        if searchText.isEmpty {
            filteredPatches = patches
        } else {
            filteredPatches = patches.filter { patch in
                patch.name.localizedCaseInsensitiveContains(searchText) ||
                patch.category.localizedCaseInsensitiveContains(searchText)
            }
        }

        // Reset pagination
        currentPage = 0
        loadDisplayedPatches()
    }

    private func loadInitialPatches() {
        // Load patches asynchronously to avoid blocking UI
        Task {
            let loadedPatches = await PatchDataManager.shared.loadPatches()
            await MainActor.run {
                self.patches = loadedPatches
                self.filteredPatches = loadedPatches
                loadDisplayedPatches()
            }
        }
    }

    private func loadMorePatches() {
        let startIndex = currentPage * pageSize
        let endIndex = min(startIndex + pageSize, filteredPatches.count)

        if startIndex < filteredPatches.count {
            let newPatches = Array(filteredPatches[startIndex..<endIndex])
            displayedPatches.append(contentsOf: newPatches)
            currentPage += 1
        }
    }

    private func loadDisplayedPatches() {
        displayedPatches = Array(filteredPatches.prefix(pageSize))
        currentPage = 1
    }
}
```

## Resource Cleanup Strategies

### 1. Timer and Subscription Management

#### Centralized Timer Manager

```swift
@MainActor
class TimerManager: ObservableObject {
    private var timers: [String: Timer] = [:]
    private var cancellables: [String: Set<AnyCancellable>] = [:]

    deinit {
        cleanup()
    }

    func startTimer(
        identifier: String,
        interval: TimeInterval,
        repeats: Bool = true,
        action: @escaping () -> Void
    ) {
        // Stop existing timer with same identifier
        stopTimer(identifier: identifier)

        let timer = Timer.scheduledTimer(withTimeInterval: interval, repeats: repeats) { _ in
            action()
        }

        timers[identifier] = timer
        print("Started timer: \(identifier)")
    }

    func stopTimer(identifier: String) {
        timers[identifier]?.invalidate()
        timers.removeValue(forKey: identifier)
        print("Stopped timer: \(identifier)")
    }

    func addCancellable(_ cancellable: AnyCancellable, for identifier: String) {
        if cancellables[identifier] == nil {
            cancellables[identifier] = Set<AnyCancellable>()
        }
        cancellables[identifier]?.insert(cancellable)
    }

    func removeCancellables(for identifier: String) {
        cancellables[identifier]?.removeAll()
        cancellables.removeValue(forKey: identifier)
    }

    func cleanup() {
        // Stop all timers
        for (identifier, timer) in timers {
            timer.invalidate()
            print("Cleaned up timer: \(identifier)")
        }
        timers.removeAll()

        // Cancel all subscriptions
        for (identifier, cancellableSet) in cancellables {
            cancellableSet.forEach { $0.cancel() }
            print("Cleaned up cancellables: \(identifier)")
        }
        cancellables.removeAll()
    }

    func pauseAll() {
        for timer in timers.values {
            timer.invalidate()
        }
    }

    func getActiveTimerCount() -> Int {
        return timers.count
    }
}
```

### 2. Memory Pressure Response

#### Memory Pressure Monitor

```swift
@MainActor
class MemoryPressureMonitor: ObservableObject {
    @Published var currentPressure: MemoryPressureLevel = .normal
    @Published var memoryUsageMB: Double = 0

    private var memoryTimer: Timer?
    private var pressureSource: DispatchSourceMemoryPressure?

    enum MemoryPressureLevel: String, CaseIterable {
        case normal = "normal"
        case warning = "warning"
        case urgent = "urgent"
        case critical = "critical"

        var shouldReduceQuality: Bool {
            return self != .normal
        }

        var shouldClearCaches: Bool {
            return self == .urgent || self == .critical
        }

        var shouldPauseAnimations: Bool {
            return self == .critical
        }
    }

    init() {
        startMonitoring()
        setupMemoryPressureSource()
    }

    deinit {
        stopMonitoring()
    }

    private func startMonitoring() {
        memoryTimer = Timer.scheduledTimer(withTimeInterval: 2.0, repeats: true) { [weak self] _ in
            Task { @MainActor in
                self?.updateMemoryMetrics()
            }
        }
    }

    private func stopMonitoring() {
        memoryTimer?.invalidate()
        memoryTimer = nil
        pressureSource?.cancel()
        pressureSource = nil
    }

    private func setupMemoryPressureSource() {
        pressureSource = DispatchSource.makeMemoryPressureSource(
            eventMask: [.warning, .urgent, .critical],
            queue: .main
        )

        pressureSource?.setEventHandler { [weak self] in
            guard let self = self else { return }

            let event = self.pressureSource?.mask

            if event?.contains(.critical) == true {
                self.handleMemoryPressure(.critical)
            } else if event?.contains(.urgent) == true {
                self.handleMemoryPressure(.urgent)
            } else if event?.contains(.warning) == true {
                self.handleMemoryPressure(.warning)
            }
        }

        pressureSource?.resume()
    }

    private func updateMemoryMetrics() {
        let memoryUsage = getCurrentMemoryUsage()
        memoryUsageMB = Double(memoryUsage) / (1024 * 1024)

        // Determine pressure level based on usage
        let newPressure = determinePressureLevel(memoryMB: memoryUsageMB)

        if newPressure != currentPressure {
            currentPressure = newPressure
            handleMemoryPressure(newPressure)
        }
    }

    private func determinePressureLevel(memoryMB: Double) -> MemoryPressureLevel {
        if memoryMB > 200 {
            return .critical
        } else if memoryMB > 150 {
            return .urgent
        } else if memoryMB > 100 {
            return .warning
        } else {
            return .normal
        }
    }

    private func handleMemoryPressure(_ level: MemoryPressureLevel) {
        print("Memory pressure level: \(level.rawValue)")

        // Notify other components
        NotificationCenter.default.post(
            name: .memoryPressureChanged,
            object: level
        )

        switch level {
        case .normal:
            // Resume normal operations
            break

        case .warning:
            // Reduce cache sizes
            AssetManager.shared.clearCache()

        case .urgent:
            // More aggressive cleanup
            AssetManager.shared.clearCache()
            NotificationCenter.default.post(name: .shouldReduceQuality, object: nil)

        case .critical:
            // Emergency cleanup
            AssetManager.shared.clearCache()
            NotificationCenter.default.post(name: .shouldPauseAnimations, object: nil)
            NotificationCenter.default.post(name: .shouldReduceQuality, object: nil)

            // Force garbage collection
            autoreleasepool { }
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
}

extension Notification.Name {
    static let memoryPressureChanged = Notification.Name("memoryPressureChanged")
    static let shouldReduceQuality = Notification.Name("shouldReduceQuality")
    static let shouldPauseAnimations = Notification.Name("shouldPauseAnimations")
}
```

### 3. View Lifecycle Management

#### Proper View Cleanup

```swift
struct GR55HardwareView: View {
    @StateObject private var stateManager = GR55StateManager()
    @StateObject private var performanceMonitor = PerformanceMonitor()
    @StateObject private var memoryMonitor = MemoryPressureMonitor()
    @StateObject private var timerManager = TimerManager()

    @Environment(\.scenePhase) private var scenePhase
    @State private var isActive = false

    var body: some View {
        ZStack {
            // Main hardware view content
            HardwareViewContent()
                .environmentObject(stateManager)
                .environmentObject(performanceMonitor)
                .environmentObject(memoryMonitor)
                .environmentObject(timerManager)
        }
        .onAppear {
            setupView()
        }
        .onDisappear {
            cleanupView()
        }
        .onChange(of: scenePhase) { phase in
            handleScenePhaseChange(phase)
        }
        .onReceive(NotificationCenter.default.publisher(for: .memoryPressureChanged)) { notification in
            if let pressure = notification.object as? MemoryPressureMonitor.MemoryPressureLevel {
                handleMemoryPressure(pressure)
            }
        }
    }

    private func setupView() {
        print("GR55HardwareView appeared")
        isActive = true

        // Start monitoring and updates
        stateManager.resumeUpdates()
        performanceMonitor.startMonitoring()

        // Setup periodic cleanup
        timerManager.startTimer(identifier: "cleanup", interval: 60.0) {
            performPeriodicCleanup()
        }
    }

    private func cleanupView() {
        print("GR55HardwareView disappeared")
        isActive = false

        // Stop all monitoring and updates
        stateManager.pauseUpdates()
        performanceMonitor.stopMonitoring()
        timerManager.cleanup()

        // Clear caches
        AssetManager.shared.clearCache()
    }

    private func handleScenePhaseChange(_ phase: ScenePhase) {
        switch phase {
        case .active:
            if isActive {
                stateManager.resumeUpdates()
                performanceMonitor.startMonitoring()
            }

        case .inactive:
            stateManager.pauseUpdates()

        case .background:
            stateManager.pauseUpdates()
            performanceMonitor.stopMonitoring()

            // Aggressive cleanup when backgrounded
            AssetManager.shared.clearCache()
            performPeriodicCleanup()

        @unknown default:
            break
        }
    }

    private func handleMemoryPressure(_ pressure: MemoryPressureMonitor.MemoryPressureLevel) {
        switch pressure {
        case .normal:
            // Resume normal operations
            break

        case .warning:
            // Light cleanup
            performPeriodicCleanup()

        case .urgent:
            // Moderate cleanup
            AssetManager.shared.clearCache()
            performPeriodicCleanup()

        case .critical:
            // Aggressive cleanup
            AssetManager.shared.clearCache()
            timerManager.pauseAll()

            // Force memory cleanup
            autoreleasepool {
                performPeriodicCleanup()
            }
        }
    }

    private func performPeriodicCleanup() {
        // Clean up any temporary data
        // Reset performance counters
        // Clear unused caches
        print("Performing periodic cleanup")
    }
}
```

## Memory Leak Prevention

### 1. Common Leak Patterns and Solutions

#### Retain Cycle Prevention

```swift
// ❌ Retain cycle - Timer holds strong reference to self
class BadStateManager: ObservableObject {
    private var timer: Timer?

    func startTimer() {
        timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { _ in
            self.updateState() // Strong reference to self
        }
    }
}

// ✅ Correct - Use weak self to break retain cycle
class GoodStateManager: ObservableObject {
    private var timer: Timer?

    func startTimer() {
        timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
            self?.updateState() // Weak reference to self
        }
    }

    deinit {
        timer?.invalidate()
    }
}
```

#### Notification Observer Cleanup

```swift
class NotificationObserverManager {
    private var observers: [NSObjectProtocol] = []

    func addObserver(for name: Notification.Name, action: @escaping (Notification) -> Void) {
        let observer = NotificationCenter.default.addObserver(
            forName: name,
            object: nil,
            queue: .main,
            using: action
        )
        observers.append(observer)
    }

    deinit {
        // Clean up all observers
        for observer in observers {
            NotificationCenter.default.removeObserver(observer)
        }
        observers.removeAll()
    }
}
```

### 2. Memory Leak Detection Tools

#### Custom Leak Detector

```swift
class MemoryLeakDetector {
    private static var instanceCounts: [String: Int] = [:]
    private static let queue = DispatchQueue(label: "leak-detector", attributes: .concurrent)

    static func trackAllocation(of type: String) {
        queue.async(flags: .barrier) {
            instanceCounts[type, default: 0] += 1
        }
    }

    static func trackDeallocation(of type: String) {
        queue.async(flags: .barrier) {
            instanceCounts[type, default: 0] -= 1
        }
    }

    static func printLeakReport() {
        queue.async {
            print("=== Memory Leak Report ===")
            for (type, count) in instanceCounts where count > 0 {
                print("Potential leak: \(type) has \(count) instances")
            }
            print("========================")
        }
    }
}

// Usage in classes
class TrackedStateManager: ObservableObject {
    init() {
        MemoryLeakDetector.trackAllocation(of: "GR55StateManager")
    }

    deinit {
        MemoryLeakDetector.trackDeallocation(of: "GR55StateManager")
    }
}
```

This comprehensive memory management guide ensures efficient resource usage and prevents memory leaks in the SwiftUI GR55 hardware view, maintaining optimal performance across extended usage periods.
