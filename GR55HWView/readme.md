# Roland GR-55 Controller

A pixel-perfect, interactive recreation of the Roland GR-55 Guitar Synthesizer interface.

## Features

- **Authentic Layout**: Matches the physical unit's schematic precisely.
- **Interactive Controls**:
  - Functional Sound Style buttons (Lead, Rhythm, Other, User)
  - Data Wheel with rotational interaction
  - 4 Main Foot Pedals + Expression Pedal
  - Toggle-able LED indicators
- **Responsive Display**: LCD screen updates based on selected style/patch.

## Usage

```tsx
import { GR55Controller } from "@/sd-components/4d895231-6d18-47b7-8a00-1d3b841ebd97";

function MyStudio() {
  return <GR55Controller />;
}
```

## Dependencies

- lucide-react (icons)
- framer-motion (animations)
- tailwindcss (styling)
