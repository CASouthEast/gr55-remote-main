/**
 * Enhanced Layout Alignment Configuration for GR55 Hardware View
 *
 * This module defines precise alignment constants for all horizontal groups
 * and positioning elements according to Requirements 11.1, 11.2, 11.4
 */

export interface AlignmentPoint {
  x: number;
  y: number;
}

export interface LayoutAlignment {
  // Horizontal alignment groups for top row headings
  topRowHeadings: {
    vlink: AlignmentPoint;
    lead: AlignmentPoint;
    rhythm: AlignmentPoint;
    other: AlignmentPoint;
    user: AlignmentPoint;
    ezEdit: AlignmentPoint;
    exit: AlignmentPoint;
    enter: AlignmentPoint;
    write: AlignmentPoint;
  };

  // Button row alignment (horizontally aligned with headings above)
  buttonRow: {
    vlink: AlignmentPoint;
    lead: AlignmentPoint;
    rhythm: AlignmentPoint;
    other: AlignmentPoint;
    user: AlignmentPoint;
    ez: AlignmentPoint;
    exit: AlignmentPoint;
    enter: AlignmentPoint;
    write: AlignmentPoint;
  };

  // Page controls alignment with text above buttons
  pageControls: {
    pageLeft: AlignmentPoint;
    pageRight: AlignmentPoint;
    edit: AlignmentPoint;
    // Text labels above buttons
    pageLeftLabel: AlignmentPoint;
    pageRightLabel: AlignmentPoint;
    editLabel: AlignmentPoint;
  };

  // Display area positioning
  display: {
    container: AlignmentPoint;
    width: number;
    height: number;
  };

  // Data wheel positioning
  dataWheel: {
    container: AlignmentPoint;
  };

  // Output level control positioning
  outputLevel: {
    container: AlignmentPoint;
    label: AlignmentPoint;
  };
}

/**
 * Enhanced layout configuration with precise alignment
 * All coordinates are relative to the main chassis container
 */
export const ENHANCED_LAYOUT_CONFIG: LayoutAlignment = {
  // Top row headings - horizontally aligned at y=20
  topRowHeadings: {
    vlink: { x: 50, y: 20 },
    lead: { x: 150, y: 20 },
    rhythm: { x: 220, y: 20 },
    other: { x: 290, y: 20 },
    user: { x: 360, y: 20 },
    ezEdit: { x: 450, y: 20 },
    exit: { x: 520, y: 20 },
    enter: { x: 590, y: 20 },
    write: { x: 660, y: 20 },
  },

  // Button row - horizontally aligned with headings above at y=60
  buttonRow: {
    vlink: { x: 50, y: 60 },
    lead: { x: 150, y: 60 },
    rhythm: { x: 220, y: 60 },
    other: { x: 290, y: 60 },
    user: { x: 360, y: 60 },
    ez: { x: 450, y: 60 },
    exit: { x: 520, y: 60 },
    enter: { x: 590, y: 60 },
    write: { x: 660, y: 60 },
  },

  // Page controls with text labels above buttons
  pageControls: {
    // Button positions
    pageLeft: { x: 520, y: 200 },
    pageRight: { x: 590, y: 200 },
    edit: { x: 660, y: 200 },
    // Label positions (above buttons)
    pageLeftLabel: { x: 520, y: 180 },
    pageRightLabel: { x: 590, y: 180 },
    editLabel: { x: 660, y: 180 },
  },

  // Display positioning
  display: {
    container: { x: 50, y: 100 },
    width: 350,
    height: 80,
  },

  // Data wheel positioning
  dataWheel: {
    container: { x: 580, y: 120 },
  },

  // Output level control positioning
  outputLevel: {
    container: { x: 520, y: 120 },
    label: { x: 520, y: 100 },
  },
};

/**
 * Spacing constants for consistent layout
 */
export const SPACING_CONFIG = {
  // Horizontal spacing between elements
  BUTTON_HORIZONTAL_GAP: 70,
  HEADING_HORIZONTAL_GAP: 70,

  // Vertical spacing between rows
  HEADING_TO_BUTTON_GAP: 40,
  BUTTON_TO_CONTROL_GAP: 60,

  // Alignment tolerances
  HORIZONTAL_ALIGNMENT_TOLERANCE: 2, // pixels
  VERTICAL_ALIGNMENT_TOLERANCE: 2, // pixels

  // Component dimensions
  BUTTON_WIDTH: 48,
  BUTTON_HEIGHT: 32,
  HEADING_HEIGHT: 16,

  // Page control specific spacing
  PAGE_CONTROL_LABEL_GAP: 20, // Gap between label and button
} as const;

/**
 * Utility function to validate alignment consistency
 * Ensures all elements in a horizontal group are within tolerance
 */
export function validateHorizontalAlignment(
  points: AlignmentPoint[],
  tolerance: number = SPACING_CONFIG.HORIZONTAL_ALIGNMENT_TOLERANCE
): boolean {
  if (points.length < 2) return true;

  const baseY = points[0].y;
  return points.every((point) => Math.abs(point.y - baseY) <= tolerance);
}

/**
 * Utility function to calculate relative positions for responsive layouts
 */
export function getRelativePosition(
  point: AlignmentPoint,
  containerWidth: number,
  containerHeight: number
): { x: string; y: string } {
  return {
    x: `${(point.x / containerWidth) * 100}%`,
    y: `${(point.y / containerHeight) * 100}%`,
  };
}

/**
 * Helper function to get alignment points for a specific group
 */
export function getAlignmentGroup(
  layout: LayoutAlignment,
  groupName: keyof LayoutAlignment
): AlignmentPoint[] {
  const group = layout[groupName];

  // Handle single alignment point (like display, dataWheel, outputLevel)
  if (typeof group === "object" && "x" in group && "y" in group) {
    return [group as AlignmentPoint];
  }

  // Handle groups of alignment points (like topRowHeadings, buttonRow, etc.)
  if (typeof group === "object") {
    return Object.values(group).filter(
      (item): item is AlignmentPoint =>
        typeof item === "object" &&
        item !== null &&
        "x" in item &&
        "y" in item &&
        typeof (item as any).x === "number" &&
        typeof (item as any).y === "number"
    );
  }

  return [];
}
