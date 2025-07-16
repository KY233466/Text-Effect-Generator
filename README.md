# Text Generator Add-on for Adobe Express

This project is an Adobe Express add-on that provides advanced text warping and creative typography effects. It is built with React and opentype.js, supporting real-time preview, custom fonts, and a variety of shape-based text warps.

## Features

- **Multiple Warp Types**: Arc, wave, bulge, triangle, flag, curtain, bouquet, envelope, and more.
- **Real-time Preview**: Instantly see the effect of text warping in the UI.
- **Custom & System Fonts**: Supports both bundled and system fonts.
- **Intensity & Typography Controls**: Adjust warp intensity, line height, letter spacing, and alignment.
- **Insert to Canvas**: One-click to insert warped text into Adobe Express canvas.
- **Modular Design**: Easy to add new warp effects.

## Project Structure

```
text-generator/
└── my-addon/
    ├── package.json
    ├── README.md
    ├── src/
    │   ├── index.html                # Add-on entry (sandbox)
    │   ├── manifest.json             # Add-on manifest
    │   ├── lib/
    │   │   └── warp.js               # Warp.js library
    │   ├── sandbox/
    │   │   └── code.js               # Adobe Express sandbox logic
    │   └── ui/
    │       ├── index.html            # UI entry
    │       ├── index.js(x)           # UI bootstrap (React)
    │       ├── TextWarpApp.js(x)     # Main React App
    │       ├── components/           # UI components (TextWarpPage, CustomTextPage, SelectText, etc.)
    │       ├── shapes/               # All shape warp algorithms (see below)
    │       └── fonts/                # Custom font files
    └── dist/                        # Build output
```

### Shape Warp Algorithms

All text warp effects are implemented in `src/ui/shapes/`. Each file exports a warp function and config. You can easily add new effects by following the pattern in this folder.

Supported effects include:
- Arc Lower, Arc Upper
- Wave
- Bulge Up, Bulge Down, Bulge Both
- Triangle Upper, Triangle Lower
- Flag
- Concave Top, Concave Bottom
- Slant Down Left/Right
- Bouquet, Envelope Wave

## Installation

1. **Install dependencies**
   ```bash
   cd my-addon
   npm install
   ```

2. **(Optional) Add custom fonts**
   - Place `.ttf` or `.otf` files in `src/ui/fonts/`.

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   - Open the add-on in Adobe Express or in your browser for local debugging.

## Usage

1. **Input Text**: Enter your text in the input field.
2. **Select Font**: Choose a font from the dropdown (custom or system).
3. **Choose Warp Type**: Select a shape effect (arc, wave, bulge, etc.).
4. **Adjust Controls**: Use sliders for intensity, line height, letter spacing, and alignment.
5. **Preview**: See the real-time effect in the preview area.
6. **Insert**: Click "Insert to Canvas" to add the warped text to Adobe Express.

## Development

- Main UI is built with React (`src/ui/`).
- Text warping is powered by `opentype.js` and custom SVG path manipulation.
- Communication with Adobe Express is via the Add-on SDK and sandbox API.
- To add new warp effects, create a new file in `src/ui/shapes/` and export your function/config.

## Main Dependencies

- [React](https://react.dev/)
- [opentype.js](https://github.com/opentypejs/opentype.js)
- [@adobe/ccweb-add-on-scripts](https://www.npmjs.com/package/@adobe/ccweb-add-on-scripts)

## Extending

To add a new warp effect:
1. Create a new `.js` file in `src/ui/shapes/`.
2. Export a function: `(x, y, totalWidth, centerX, intensity, textMetrics) => {x, y}`.
3. Add your config and register it in `shapes/index.js`.

## Notes

- If no custom font is found, system fonts are used as fallback.
- Some complex effects may impact performance.
- Make sure your Adobe Express version supports the required APIs.

## License

MIT
