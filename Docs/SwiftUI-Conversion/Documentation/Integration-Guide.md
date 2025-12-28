# GR55 SwiftUI Integration Guide

## Overview

This guide provides instructions for integrating the converted GR55 SwiftUI hardware interface into existing iOS applications.

## Prerequisites

- iOS 15.0 or later
- Swift 6.2 or later
- Xcode 15.0 or later
- Existing Swift MIDI communication layer

## Integration Steps

### 1. File Integration

Copy the following directories into your Xcode project:

```
YourProject/
├── GR55/
│   ├── Models/
│   │   ├── GR55State.swift
│   │   └── GR55StateManager.swift
│   ├── Views/
│   │   └── GR55HardwareView.swift
│   ├── Components/
│   │   ├── CustomShapes.swift
│   │   ├── FootPedal.swift
│   │   └── DisplayComponent.swift
│   └── Utils/
│       ├── DesignTokens.swift
│       └── SwiftUIExtensions.swift
```

### 2. Basic Integration

#### Simple Integration

```swift
import SwiftUI

struct ContentView: View {
    var body: some View {
        GR55HardwareView()
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Color.black)
    }
}
```

#### Navigation Integration

```swift
struct MainView: View {
    var body: some View {
        NavigationView {
            VStack {
                // Your existing content

                NavigationLink("GR55 Hardware") {
                    GR55HardwareView()
                        .navigationTitle("GR55 Controller")
                        .navigationBarTitleDisplayMode(.inline)
                }
            }
        }
    }
}
```

#### Modal Presentation

```swift
struct ParentView: View {
    @State private var showGR55 = false

    var body: some View {
        Button("Open GR55 Controller") {
            showGR55 = true
        }
        .sheet(isPresented: $showGR55) {
            GR55HardwareView()
                .preferredColorScheme(.dark)
        }
    }
}
```

### 3. MIDI Integration

#### Interface Definition

```swift
// Define protocol for your existing MIDI layer
protocol MIDIInterface {
    func sendCommand(_ command: MIDICommand) async throws
    func receiveData() -> AsyncStream<MIDIData>
    var isConnected: Bool { get }
}

// Implement with your existing MIDI code
class YourMIDIInterface: MIDIInterface {
    func sendCommand(_ command: MIDICommand) async throws {
        // Use your existing MIDI sending code
    }

    func receiveData() -> AsyncStream<MIDIData> {
        // Use your existing MIDI receiving code
    }

    var isConnected: Bool {
        // Return your MIDI connection status
    }
}
```

#### State Manager Integration

```swift
// Extend GR55StateManager for your MIDI integration
extension GR55StateManager {
    convenience init(midiInterface: MIDIInterface) {
        self.init()
        self.midiInterface = midiInterface
        setupMIDIListening()
    }

    private func setupMIDIListening() {
        Task {
            for await data in midiInterface.receiveData() {
                await processMIDIData(data)
            }
        }
    }
}
```

#### Usage with MIDI

```swift
struct GR55ContainerView: View {
    let midiInterface: MIDIInterface

    var body: some View {
        GR55HardwareView()
            .environmentObject(GR55StateManager(midiInterface: midiInterface))
    }
}
```

### 4. Customization Options

#### Theme Customization

```swift
// Customize colors in DesignTokens.swift
extension DesignTokens.Colors {
    static let customAccent = Color.blue // Your brand color
    static let customChassis = Color.gray // Your preferred chassis color
}
```

#### Size Customization

```swift
struct CustomSizedGR55: View {
    var body: some View {
        GR55HardwareView()
            .frame(width: 800, height: 600) // Fixed size
            .scaleEffect(0.8) // Scale factor
    }
}
```

#### Responsive Integration

```swift
struct ResponsiveGR55: View {
    var body: some View {
        GeometryReader { geometry in
            GR55HardwareView()
                .responsiveScale(geometry)
        }
    }
}
```

### 5. State Management Integration

#### Shared State

```swift
// Share state manager across your app
class AppState: ObservableObject {
    @Published var gr55StateManager = GR55StateManager()

    // Your other app state
}

struct YourApp: App {
    @StateObject private var appState = AppState()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appState.gr55StateManager)
        }
    }
}
```

#### State Observation

```swift
struct StatusView: View {
    @EnvironmentObject var gr55State: GR55StateManager

    var body: some View {
        VStack {
            Text("Current Patch: \(gr55State.currentState.patchName)")
            Text("Active Pedal: \(gr55State.currentState.activePedal)")
            Text("Patch Level: \(gr55State.currentState.patchLevel)")
        }
    }
}
```

### 6. Error Handling

#### Connection Status

```swift
struct GR55WithStatus: View {
    @StateObject private var stateManager = GR55StateManager()

    var body: some View {
        VStack {
            if stateManager.isConnected {
                GR55HardwareView()
                    .environmentObject(stateManager)
            } else {
                ConnectionErrorView()
            }
        }
    }
}
```

#### Error Recovery

```swift
extension GR55StateManager {
    func handleConnectionError() {
        // Reset to safe state
        state = GR55State()

        // Attempt reconnection
        Task {
            try await reconnectMIDI()
        }
    }
}
```

### 7. Performance Optimization

#### Lazy Loading

```swift
struct OptimizedGR55Container: View {
    @State private var isLoaded = false

    var body: some View {
        Group {
            if isLoaded {
                GR55HardwareView()
            } else {
                LoadingView()
                    .onAppear {
                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                            isLoaded = true
                        }
                    }
            }
        }
    }
}
```

#### Memory Management

```swift
struct MemoryEfficientGR55: View {
    @State private var stateManager: GR55StateManager?

    var body: some View {
        Group {
            if let stateManager = stateManager {
                GR55HardwareView()
                    .environmentObject(stateManager)
            }
        }
        .onAppear {
            stateManager = GR55StateManager()
        }
        .onDisappear {
            stateManager = nil
        }
    }
}
```

### 8. Testing Integration

#### Unit Testing

```swift
import XCTest
@testable import YourApp

class GR55IntegrationTests: XCTestCase {
    func testStateManagerInitialization() {
        let stateManager = GR55StateManager()
        XCTAssertEqual(stateManager.currentState.activePedal, 1)
        XCTAssertEqual(stateManager.currentState.patchName, "LEAD GUITAR")
    }

    func testPedalSelection() {
        let stateManager = GR55StateManager()
        stateManager.setActivePedal(2)
        XCTAssertEqual(stateManager.currentState.activePedal, 2)
    }
}
```

#### UI Testing

```swift
import XCTest

class GR55UITests: XCTestCase {
    func testPedalInteraction() {
        let app = XCUIApplication()
        app.launch()

        let pedal2Button = app.buttons["Pedal 2"]
        XCTAssertTrue(pedal2Button.exists)

        pedal2Button.tap()
        // Verify state change
    }

    func testFootPedalGestures() {
        let app = XCUIApplication()
        app.launch()

        // Test single tap
        let pedal1 = app.buttons["Pedal 1"]
        pedal1.tap()

        // Test double tap for bank navigation
        pedal1.doubleTap()

        // Test CTL pedal
        let ctlPedal = app.buttons["Control Pedal"]
        ctlPedal.tap()
    }
}
```

### 8.1. NavigationCluster Component Integration

The NavigationCluster component provides data wheel interaction, page navigation, and GK controls:

#### Basic NavigationCluster Usage

```swift
import SwiftUI

struct HardwareControlsView: View {
    @ObservedObject var stateManager: GR55StateManager

    var body: some View {
        HStack(spacing: DesignTokens.Spacing.extraLarge) {
            // Left side controls
            VStack {
                DisplayComponent(stateManager: stateManager)
                PedalCluster(stateManager: stateManager)
            }

            // Right side navigation
            NavigationCluster(stateManager: stateManager)
        }
    }
}
```

#### NavigationCluster Features

```swift
// Data wheel interactions
NavigationCluster(stateManager: stateManager)
    .onDataWheelRotate { direction in
        // Automatic pedal selection changes
        // Handled by stateManager.handleDataWheelRotate
    }
    .onDataWheelPress { direction in
        // Style and bank navigation
        // Handled by stateManager.handleDataWheelPress
    }
```

#### Custom Navigation Button Actions

```swift
// Extend NavigationCluster for custom button handling
extension NavigationCluster {
    func withCustomActions(
        onPageLeft: @escaping () -> Void,
        onPageRight: @escaping () -> Void,
        onEdit: @escaping () -> Void,
        onExit: @escaping () -> Void,
        onEnter: @escaping () -> Void,
        onWrite: @escaping () -> Void
    ) -> some View {
        // Custom button action implementation
        // Currently buttons are placeholders for future implementation
    }
}
```

#### GK Controls Integration

```swift
// GK controls reflect MIDI parameter values
struct GKStatusView: View {
    @ObservedObject var stateManager: GR55StateManager

    var body: some View {
        HStack {
            Text("S1: \(stateManager.currentState.gkS1Value)")
            Text("S2: \(stateManager.currentState.gkS2Value)")
            Text("VOL: \(stateManager.currentState.gkVolValue)")
        }
        .font(DesignTokens.Fonts.gkValue)
    }
}
```

### 8.2. FootPedal Component Integration

The FootPedal component provides individual pedal controls with gesture recognition:

#### Basic FootPedal Usage

```swift
import SwiftUI

struct PedalCluster: View {
    @ObservedObject var stateManager: GR55StateManager

    var body: some View {
        HStack(spacing: DesignTokens.Spacing.large) {
            // Numbered pedals 1-3
            ForEach(1...3, id: \.self) { pedalNumber in
                FootPedal(
                    number: pedalNumber,
                    isActive: stateManager.currentState.activePedal == pedalNumber,
                    topLabel: stateManager.currentState.bankSlots?[pedalNumber - 1]?.name,
                    onSingleTap: {
                        stateManager.selectOrdinalInCurrentBank(pedalNumber)
                    },
                    onDoubleTap: {
                        if pedalNumber == 1 {
                            stateManager.gotoNextBank()
                        } else if pedalNumber == 2 {
                            stateManager.gotoPrevBank()
                        }
                    }
                )
            }

            // CTL pedal
            FootPedal(
                isCtlActive: stateManager.currentState.ctlStatus,
                ctlFunction: stateManager.currentState.ctlFunction,
                onCtlToggle: {
                    stateManager.toggleCtlPedal()
                }
            )
        }
    }
}
```

#### Custom FootPedal Configuration

```swift
// Custom pedal with specific styling
FootPedal(
    number: .numbered(1),
    isActive: true,
    topLabel: "CUSTOM PATCH",
    subLabel: "SPECIAL MODE",
    onSingleTap: {
        // Custom single tap action
    },
    onDoubleTap: {
        // Custom double tap action
    }
)

// CTL pedal with custom function
FootPedal(
    number: .ctl,
    isActive: ctlActive,
    topLabel: customCtlFunction,
    subLabel: "CUSTOM CTL",
    onSingleTap: {
        // Custom CTL toggle
    }
)
```

#### FootPedal Accessibility

```swift
// FootPedal automatically provides accessibility support
// Custom accessibility can be added:
FootPedal(
    number: 1,
    isActive: isActive,
    topLabel: "LEAD GUITAR",
    onSingleTap: { /* action */ }
)
.accessibilityHint("Double tap to navigate banks")
.accessibilityValue(isActive ? "Active" : "Inactive")
```

### 9. Deployment Considerations

#### App Store Guidelines

- Ensure all MIDI functionality is clearly described
- Include privacy policy for any data collection
- Test on various device sizes and orientations

#### Performance Requirements

- Target 60fps during normal operation
- Memory usage should remain stable during extended use
- Gesture recognition should be responsive (<100ms)

#### Accessibility Compliance

- All interactive elements have accessibility labels
- Support for VoiceOver navigation
- Proper contrast ratios for all text

### 10. Troubleshooting

#### Common Issues

**Build Errors:**

```swift
// Ensure proper import statements
import SwiftUI
import Combine

// Check iOS deployment target (15.0+)
// Verify Swift version (6.2+)
```

**Runtime Issues:**

```swift
// State not updating:
// Ensure @StateObject is used for state manager lifecycle
@StateObject private var stateManager = GR55StateManager()

// MIDI not working:
// Verify MIDI interface implementation
// Check connection status
```

**Performance Issues:**

```swift
// Use drawing groups for complex graphics
.drawingGroup()

// Minimize view updates
@Published private(set) var state: GR55State
```

### 11. Support and Maintenance

#### Version Compatibility

- iOS 15.0+ required for full functionality
- Swift 6.2+ for concurrency features
- Regular updates for new iOS versions

#### Documentation Updates

- Keep integration guide current with iOS updates
- Document any custom modifications
- Maintain changelog for version tracking

## Example Complete Integration

```swift
import SwiftUI

@main
struct GR55App: App {
    @StateObject private var midiInterface = YourMIDIInterface()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(GR55StateManager(midiInterface: midiInterface))
        }
    }
}

struct ContentView: View {
    @EnvironmentObject var gr55State: GR55StateManager

    var body: some View {
        NavigationView {
            VStack {
                StatusBar(stateManager: gr55State)

                GR55HardwareView()
                    .environmentObject(gr55State)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
            .navigationTitle("GR55 Controller")
        }
    }
}

struct StatusBar: View {
    @ObservedObject var stateManager: GR55StateManager

    var body: some View {
        HStack {
            Text("Patch: \(stateManager.currentState.patchName)")
            Spacer()
            Text("Level: \(stateManager.currentState.patchLevel)")
        }
        .padding()
        .background(Color.secondary.opacity(0.1))
    }
}
```

This integration approach provides a clean, maintainable way to incorporate the GR55 SwiftUI interface into existing iOS applications while preserving the existing MIDI communication infrastructure.
