# Adobe Express Text Warp Add-on

This is an Adobe Express add-on based on opentype.js that enables advanced text warping effects.

## Features

- **Multiple Warp Types**: Arc lower, wave, bulge up, bulge down
- **Real-time Preview**: Preview warp effects in real-time within the add-on interface
- **Intensity Control**: 0-100 intensity slider to control warp strength
- **Font Support**: Support for custom font files (place font files in `public/fonts/` directory)
- **System Fonts**: Support for system default fonts as fallback

## Project Structure

```
my-addon/
├── src/
│   ├── ui/
│   │   └── index.jsx          # UI interface (React + opentype.js)
│   └── sandbox/
│       └── code.js            # Adobe Express sandbox logic
├── public/
│   └── fonts/                 # Font files directory
├── dist/                      # Build output directory
└── package.json
```

## Installation and Usage

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Add Font Files** (Optional)
   - Place font files (.ttf format) in the `public/fonts/` directory
   - Supported font files:
     - `OldStandardTT-Regular.ttf`
     - `Arial.ttf`
     - `Helvetica.ttf`

3. **Build Project**
   ```bash
   npm run build
   ```

4. **Load Add-on in Adobe Express**
   - Load the built `dist/` directory as an add-on in Adobe Express

## How to Use

1. **Input Text**: Enter the text you want to warp in the text input field
2. **Select Font**: Choose a font from the dropdown menu (including system default fonts)
3. **Select Warp Type**: Choose from arc lower, wave, bulge up, or bulge down
4. **Adjust Intensity**: Use the slider to adjust warp intensity (0-100)
5. **Preview Effect**: View the warp effect in the preview area
6. **Insert to Canvas**: Click "Insert to Canvas" button to insert the warped text into Adobe Express canvas

## Technical Implementation

### UI Side (React)
- Uses `opentype.js` to load font files
- Generates SVG path data
- Real-time preview of warp effects
- Communicates with sandbox via Adobe Express SDK

### Sandbox Side
- Receives SVG path data
- Uses `editor.createPath()` to create path objects
- Sets fill color and position
- Inserts into Adobe Express canvas

## Warp Algorithms

- **Arc Lower**: Uses quadratic functions to create downward curving arc effects
- **Wave**: Uses sine functions to create wave effects
- **Bulge Up**: Creates upward bulging effects
- **Bulge Down**: Creates downward bulging effects

## Notes

1. **Font Files**: If font files don't exist, the add-on will automatically use system default fonts
2. **Performance**: Complex warp effects may impact performance, adjust intensity appropriately
3. **Compatibility**: Ensure Adobe Express version supports Path object creation

## Development and Debugging

- Use `npm run dev` to start development server
- Open add-on in browser for local debugging

## Future Enhancements

- Support for more warp types
- Color selection feature
- Gradient fill support
- Stroke effects
- Image export functionality
