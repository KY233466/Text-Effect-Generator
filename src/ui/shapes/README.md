# Shape Warp Module

This directory contains independent implementations of various text warp effects.

## File Structure

```
shapes/
├── index.js          # Module index, exports all effects
├── arcLower.js       # Arc lower warp effect
├── arcUpper.js       # Arc upper warp effect
├── wave.js           # Wave warp effect
├── bulgeUpWarp.js    # Bulge up warp effect
├── bulgeDownWarp.js  # Bulge down warp effect
├── bulgeBothWarp.js  # Bulge both sides warp effect
├── triangleUpper.js  # Triangle upper warp effect
├── triangleLower.js  # Triangle lower warp effect
├── flag.js           # Flag waving warp effect
└── README.md         # This documentation file
```

## Available Effects

- **Arc Lower**: Arc lower warp effect
- **Arc Upper**: Arc upper warp effect
- **Wave**: Wave warp effect
- **Bulge Up**: Bulge up warp effect
- **Bulge Down**: Bulge down warp effect
- **Bulge Both**: Bulge both sides warp effect
- **Triangle Upper**: Triangle upper warp effect
- **Triangle Lower**: Triangle lower warp effect
- **Flag**: Flag waving warp effect

## Usage

```javascript
import { getWarpFunction, effectsList } from './shapes/index.js';

// Get a specific warp function
const warpFn = getWarpFunction('wave');

// Apply warp
const result = warpFn(x, y, totalWidth, centerX, intensity, textMetrics);
```

## Add New Effects

1. Create a new `.js` file in the `shapes/` directory
2. Export the warp function and config object
3. Add imports and exports in `index.js`
4. Warp function signature: `(x, y, totalWidth, centerX, intensity, textMetrics) => {x, y}`

## Parameter Description

- `x, y`: Current point coordinates
- `totalWidth`: Total text width
- `centerX`: Center X coordinate of the text
- `intensity`: Warp intensity (0-100)
- `textMetrics`: Text metrics (baseline, bounds, etc.) 