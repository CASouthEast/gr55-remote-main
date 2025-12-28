// MARK: - Component Index
/// Central export file for all SwiftUI components
/// Provides easy importing for the GR55 hardware interface components

// Import all component files
@_exported import CustomShapes
@_exported import VisualComponents
@_exported import FootPedal
@_exported import NavigationCluster
@_exported import ExpressionPedal
@_exported import PortsBar
@_exported import PreviewPane

// Re-export commonly used shapes and components for convenience
public typealias GR55PedalShape = PedalShape
public typealias GR55DataWheelShape = DataWheelShape
public typealias GR55LevelBarShape = LevelBarShape
public typealias GR55LEDShape = LEDShape
public typealias GR55KnobShape = KnobShape
public typealias GR55ButtonShape = ButtonShape
public typealias GR55DisplayBezelShape = DisplayBezelShape
public typealias GR55ExpressionPedalShape = ExpressionPedalShape

// Re-export visual components
public typealias GR55LevelBar = LevelBar
public typealias GR55LEDIndicator = LEDIndicator
public typealias GR55KnobComponent = KnobComponent
public typealias GR55HardwareButton = HardwareButton
public typealias GR55DisplayBezel = DisplayBezel
public typealias GR55ExpressionPedalSurface = ExpressionPedalSurface
public typealias GR55FootPedal = FootPedal
public typealias GR55NavigationCluster = NavigationCluster
public typealias GR55DataWheel = DataWheel
public typealias GR55ExpressionPedal = ExpressionPedal
public typealias GR55ExpSwButton = ExpSwButton
public typealias GR55PortsBar = PortsBar
public typealias GR55PreviewPane = PreviewPane