// MARK: - Component Index
/// Central export file for all SwiftUI components
/// Provides easy importing for the GR55 hardware interface components

// Import all component files
@_exported import CustomShapes
@_exported import VisualComponents

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