# Preview Pane Implementation Plan

**Date**: 27 December 2025  
**Branch**: Previews  
**Scope**: Web version only

## Overview

Display a web-only preview pane overlay within the Display component, positioned to the right of the Display (with 32px gap matching the gap between Left and Right columns) and covering the Expression Pedal area. Implement as fixed-height static dummy previews showing key parameter names from Patch editor with realistic placeholder values for all Effects (MFX, Delay, Chorus, Reverb, AMP, NS, MOD, EQ), then Tones, then Assigns—all using the MOD card design pattern with internal scrolling if content exceeds viewport.

## Implementation Steps

### 1. Add Hover State Tracking to Display Component

**File**: [src/components/hardware-view/components/Display.tsx](../src/components/hardware-view/components/Display.tsx)

- Add state: `hoveredItem: { type: 'effect' | 'tone' | 'assign', id: string } | null`
- Implement `onMouseEnter`/`onMouseLeave` handlers on:
  - Tone chips (GUITAR, PCM1, PCM2, MODEL)
  - Effect buttons (MFX, Delay, Chorus, Reverb, AMP, NS, MOD, EQ)
  - Assign buttons (1-8)
- Track which item is currently hovered

### 2. Create PreviewPane Component

**File**: [src/components/hardware-view/components/PreviewPane.tsx](../src/components/hardware-view/components/PreviewPane.tsx)

- Accept `hoveredItem` prop
- Render card-based layout with:
  - Header section with title and effect type badge
  - ON/OFF switch section
  - Parameter sections with labels and values
- Use switch statement to render different content based on `hoveredItem.type` and `hoveredItem.id`
- Style matching MOD card design (orange accents, white background, rounded corners, shadow)

### 3. Extract and Display Key Parameters

**Source Files**:

- [src/components/fields/remote-fields/MODField.tsx](../src/components/fields/remote-fields/MODField.tsx)
- [src/components/fields/remote-fields/MFXField.tsx](../src/components/fields/remote-fields/MFXField.tsx)
- [src/components/fields/remote-fields/DelayField.tsx](../src/components/fields/remote-fields/DelayField.tsx)
- [src/components/fields/remote-fields/ChorusField.tsx](../src/components/fields/remote-fields/ChorusField.tsx)
- [src/components/fields/remote-fields/ReverbField.tsx](../src/components/fields/remote-fields/ReverbField.tsx)
- [src/components/fields/remote-fields/AmpField.tsx](../src/components/fields/remote-fields/AmpField.tsx)
- [src/components/fields/remote-fields/EQField.tsx](../src/components/fields/remote-fields/EQField.tsx)
- And tone/assign related files

For each effect/tone/assign, show 5-7 key parameters with:

- Realistic placeholder values (e.g., Level: 85, Rate: 2.5 Hz, Cutoff: 800 Hz)
- Proper parameter names from Patch editor
- Static values (no real data integration yet)

### 4. Position PreviewPane Overlay

**File**: [src/components/hardware-view/components/Display.tsx](../src/components/hardware-view/components/Display.tsx)

Position PreviewPane:

- Absolutely positioned within Display container
- Left offset: ~32px from Display right edge (matching gap to Wheel)
- Spans right to cover Expression Pedal width
- Fixed height matching Display viewport
- `overflow-y: auto` for internal scrolling
- High z-index to overlay other components

### 5. Implement Dummy Previews in Order

#### Phase 1: Effects

- MFX (default to "EQ" type as dummy)
- Delay
- Chorus
- Reverb
- AMP
- NS
- MOD
- EQ

#### Phase 2: Tones

- Guitar (Normal PU)
- PCM1
- PCM2
- Model

#### Phase 3: Assigns

- Assigns 1-8 (same structure for all)
- Show: Target, Source, Min/Max, Active Range

## Design Specifications

### Card Layout (Based on MOD)

┌─────────────────────────────────┐
│ [Title] [Effect Badge] │
│ [ON] Switch │
├─────────────────────────────────┤
│ Parameter 1 [Value] │
│ ───────────────────────── │
│ Parameter 2 [Value] │
│ ───────────────────────── │
│ Parameter 3 [Value] │
│ ───────────────────────── │
│ ... │
└─────────────────────────────────┘

### Styling

- **Background**: White
- **Accent Color**: Orange (#FF8A00)
- **Badge Background**: #FFF5EB
- **Border Radius**: 8px
- **Shadow**: Standard card shadow
- **Padding**: 24px
- **Font Sizes**:
  - Title: 16px, weight 600
  - Labels: 14px, weight 500
  - Values: 14px, weight 600, color #FF8A00

## Layout Positioning

┌────────────────────────────────────────────────────────┐
│ GR55HWView │
├────────────────────────┬────────────┬──────────────────┤
│ Left Column │ 32px gap │ Right Column │
│ │ │ │
│ ┌──────────────────┐ │ │ Output Level │
│ │ │ │ │ │
│ │ Display │ │ ┌────────┐ │ Data Wheel │
│ │ │ │ │Preview │ │ │
│ │ [hover items] │ │ │ Pane │ │ Nav Buttons │
│ │ │ │ │ │ │ │
│ │ │ │ │ (over- │ │ │
│ └──────────────────┘ │ │ lays) │ │ Exp Pedal │
│ │ └────────┘ │ │
│ Pedals 1-4 │ │ │
└────────────────────────┴────────────┴──────────────────┘

## Future Enhancements (Not in This Plan)

- Integration of real data from `useRemoteField` hooks
- Dynamic effect type switching (e.g., MOD showing different parameters based on selected effect type)
- Touch device support
- Animations for preview appearance/disappearance
- Preview pane width optimization
- Click-to-edit navigation from preview

## Notes

- This is **dummy/static implementation only**
- All values are hardcoded placeholders
- No real MIDI data integration in this phase
- Web platform only (`Platform.OS === 'web'`)
- Plan for real data integration will be created separately after dummy implementation is complete
