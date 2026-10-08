# PortsBar Component Guide

## Overview

The `PortsBar` component displays connection labels and guitar output source information at the top of the GR55 hardware interface. It provides visual indication of available ports and the current guitar output routing.

## Requirements Addressed

- **12.1**: Display contextual information for hardware connections
- **12.6**: Position interface elements without obscuring controls
- **1.2**: Display all major hardware sections including connection information

## Component Structure

### PortsBar

Main container showing all connection labels and guitar output source.

**Properties:**

- `guitarOutSource: String` - Current guitar output source (e.g., "NORMAL PU", "MODEL")

### PortLabel

Individual port label with consistent styling.

**Properties:**

- `text: String` - Port label text

### GuitarOutputLabel

Special label for guitar output with dynamic source display.

**Properties:**

- `source: String` - Current guitar output source

## Usage Example

```swift
PortsBar(guitarOutSource: "NORMAL PU")
```

## Styling

The component uses:

- `DesignTokens.Fonts.statusText` for consistent label typography
- `DesignTokens.Colors.textMuted` for standard port labels
- `DesignTokens.Colors.accent` for dynamic guitar output source
- Uppercase text with letter spacing for hardware aesthetic

## Layout

- Horizontal layout with "Connections :" on the left
- Port labels spaced with `DesignTokens.Spacing.extraLarge`
- Guitar output label shows source above "GUITAR OUT" text
- Semi-transparent background for subtle visual separation

## Integration

The PortsBar integrates with the main GR55HardwareView at the top of the interface layout. It receives the guitar output source from the state manager and updates automatically when the source changes.

## Swift 6.2 Compliance

- Uses `@MainActor` for UI thread safety
- Follows sendable patterns for data flow
- Implements proper concurrency patterns for state updates
