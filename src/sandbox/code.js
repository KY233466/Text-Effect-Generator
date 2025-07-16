import addOnSandboxSdk from "add-on-sdk-document-sandbox";
import { editor } from "express-document-sdk";

// Get the document sandbox runtime.
const { runtime } = addOnSandboxSdk.instance;

// Safe property setting function
function safeSetProperty(obj, property, value, description = '') {
    try {
        if (obj === null || obj === undefined) {
            return false;
        }
        
        if (!(property in obj) && typeof obj[property] === 'undefined') {
            return false;
        }
        
        obj[property] = value;
        return true;
    } catch (error) {
        console.error(`Failed to set property ${property} ${description}:`, error);
        return false;
    }
}

function start() {
    // APIs to be exposed to the UI runtime
    // i.e., to the `index.html` file of this add-on.
    const sandboxApi = {
        // Get available fonts list - should match the fonts in SelectText.jsx
        getAvailableFonts: async () => {
            return [
                // Custom fonts ordered alphabetically
                { postscriptName: "8Heavy", familyName: "8 Heavy", styleName: "Regular" },
                { postscriptName: "ArialMT", familyName: "Arial", styleName: "Regular" },
                
                // Degular family (ordered alphabetically)
                { postscriptName: "DegularDisplayBlack", familyName: "Degular Display", styleName: "Black" },
                { postscriptName: "DegularDisplayBlackItalic", familyName: "Degular Display", styleName: "Black Italic" },
                { postscriptName: "DegularDisplayBold", familyName: "Degular Display", styleName: "Bold" },
                { postscriptName: "DegularDisplayBoldItalic", familyName: "Degular Display", styleName: "Bold Italic" },
                { postscriptName: "DegularDisplayLight", familyName: "Degular Display", styleName: "Light" },
                { postscriptName: "DegularDisplayLightItalic", familyName: "Degular Display", styleName: "Light Italic" },
                { postscriptName: "DegularDisplayMedium", familyName: "Degular Display", styleName: "Medium" },
                { postscriptName: "DegularDisplayMediumItalic", familyName: "Degular Display", styleName: "Medium Italic" },
                { postscriptName: "DegularDisplayRegular", familyName: "Degular Display", styleName: "Regular" },
                { postscriptName: "DegularDisplayRegularItalic", familyName: "Degular Display", styleName: "Regular Italic" },
                { postscriptName: "DegularDisplaySemibold", familyName: "Degular Display", styleName: "Semibold" },
                { postscriptName: "DegularDisplaySemiboldItalic", familyName: "Degular Display", styleName: "Semibold Italic" },
                { postscriptName: "DegularDisplayThin", familyName: "Degular Display", styleName: "Thin" },
                { postscriptName: "DegularDisplayThinItalic", familyName: "Degular Display", styleName: "Thin Italic" },
                
                // Eckmannpsych family (ordered alphabetically)
                { postscriptName: "EckmannpsychLarge", familyName: "Eckmannpsych Large", styleName: "Regular" },
                { postscriptName: "EckmannpsychMedium", familyName: "Eckmannpsych Medium", styleName: "Regular" },
                { postscriptName: "EckmannpsychSmall", familyName: "Eckmannpsych Small", styleName: "Regular" },
                { postscriptName: "EckmannpsychVariable", familyName: "Eckmannpsych Variable", styleName: "Regular" },
                
                // Gyst font family (ordered alphabetically)
                { postscriptName: "Gyst", familyName: "Gyst", styleName: "Regular" },
                { postscriptName: "Gyst-Bold", familyName: "Gyst", styleName: "Bold" },
                { postscriptName: "Gyst-BoldItalic", familyName: "Gyst", styleName: "Bold Italic" },
                { postscriptName: "Gyst-Italic", familyName: "Gyst", styleName: "Italic" },
                { postscriptName: "Gyst-Light", familyName: "Gyst", styleName: "Light" },
                { postscriptName: "Gyst-LightItalic", familyName: "Gyst", styleName: "Light Italic" },
                { postscriptName: "Gyst-Medium", familyName: "Gyst", styleName: "Medium" },
                { postscriptName: "Gyst-MediumItalic", familyName: "Gyst", styleName: "Medium Italic" },
                
                // Remaining fonts (ordered alphabetically)
                { postscriptName: "Helvetica", familyName: "Helvetica", styleName: "Regular" },
                { postscriptName: "OldStandardTT", familyName: "Old Standard", styleName: "Regular" },
                { postscriptName: "PikaUltraScript", familyName: "Pika Ultra Script", styleName: "Regular" },
                { postscriptName: "SwungNote", familyName: "Swung Note", styleName: "Regular" },
                { postscriptName: "TimesNewRomanPSMT", familyName: "Times New Roman", styleName: "Regular" }
            ];
        },
        // Insert SVG path
        insertWarpedSVG: async (options) => {
            const { d, bounds, originalText, warpType, intensity } = options;
            
            try {
                if (!d || d.trim() === '') {
                    throw new Error('SVG path data is empty');
                }


                
                // Check if editor object is available
                if (!editor) {
                    throw new Error('Editor object not available');
                }
                
                // Detailed check of all editor object properties and methods
                const allProps = Object.getOwnPropertyNames(editor);
                const methods = allProps.filter(name => typeof editor[name] === 'function');
                const properties = allProps.filter(name => typeof editor[name] !== 'function');
                
                // Try different path creation methods
                let pathObj;
                let creationMethod = '';
                
                try {
                    // Method 1: Check various possible path creation methods
                    if (typeof editor.createPath === 'function') {
                        pathObj = editor.createPath(d);
                        creationMethod = 'createPath';
                    } else if (typeof editor.createPathNode === 'function') {
                        pathObj = editor.createPathNode(d);
                        creationMethod = 'createPathNode';
                    } else if (typeof editor.addPath === 'function') {
                        pathObj = editor.addPath(d);
                        creationMethod = 'addPath';
                    } else if (typeof editor.createShape === 'function') {
                        pathObj = editor.createShape();
                        if (pathObj && typeof pathObj.setPath === 'function') {
                            pathObj.setPath(d);
                            creationMethod = 'createShape + setPath';
                        } else if (pathObj && 'path' in pathObj) {
                            pathObj.path = d;
                            creationMethod = 'createShape + path property';
                        }
                    } else if (typeof editor.createPolygon === 'function') {
                        // As a last attempt, use polygon
                        pathObj = editor.createPolygon();
                        creationMethod = 'createPolygon (fallback)';
                    } else {
                        throw new Error(`No suitable path creation method found. Available methods: ${methods.join(', ')}`);
                    }
                } catch (pathError) {
                    console.error('Path creation failed:', pathError);
                    throw new Error(`Path creation failed: ${pathError.message}. Available methods: ${methods.join(', ')}`);
                }
                
                if (!pathObj) {
                    throw new Error('Path object creation failed - return value is null');
                }
                
                // 🔥 Primary task: immediately remove default stroke
                
                // Try all possible stroke removal methods
                const strokeRemovalResults = [];
                
                // Method 1: Set to null (most direct method)
                if (safeSetProperty(pathObj, 'stroke', null, '(set stroke to null)')) {
                    strokeRemovalResults.push('stroke=null success');
                }
                
                // Method 2: Set to undefined
                if (safeSetProperty(pathObj, 'stroke', undefined, '(set stroke to undefined)')) {
                    strokeRemovalResults.push('stroke=undefined success');
                }
                
                // Method 3: Try other possible stroke property names
                if (safeSetProperty(pathObj, 'strokeColor', null, '(remove strokeColor)')) {
                    strokeRemovalResults.push('strokeColor=null success');
                }
                
                if (safeSetProperty(pathObj, 'strokeWidth', 0, '(set strokeWidth to 0)')) {
                    strokeRemovalResults.push('strokeWidth=0 success');
                }
                
                if (safeSetProperty(pathObj, 'border', null, '(remove border)')) {
                    strokeRemovalResults.push('border=null success');
                }
                
                if (safeSetProperty(pathObj, 'borderWidth', 0, '(set borderWidth to 0)')) {
                    strokeRemovalResults.push('borderWidth=0 success');
                }
                
                // Method 4: Try using editor.makeStroke to create transparent stroke
                if (typeof editor.makeStroke === 'function') {
                    try {
                        // Create completely transparent stroke with 0 width
                        const transparentStroke = editor.makeStroke({
                            color: { red: 0, green: 0, blue: 0, alpha: 0 },
                            width: 0
                        });
                        if (safeSetProperty(pathObj, 'stroke', transparentStroke, '(set transparent stroke)')) {
                            strokeRemovalResults.push('transparent stroke set successfully');
                        }
                    } catch (strokeError) {
                        // Failed to create transparent stroke
                    }
                }
                
                // Now set fill color (hot pink)
                const fillColor = { red: 0.0, green: 0.0, blue: 0.0, alpha: 1 }; // 黑色


                
                // Check if editor.makeColorFill exists
                if (typeof editor.makeColorFill === 'function') {
                    try {
                        const colorFill = editor.makeColorFill(fillColor);
                        if (safeSetProperty(pathObj, 'fill', colorFill, '(set fill color)')) {
                            // Fill color set successfully
                        } else {
                            // If fill property setting fails, try other possible property names
                            safeSetProperty(pathObj, 'fillColor', colorFill, '(try fillColor property)') ||
                            safeSetProperty(pathObj, 'color', colorFill, '(try color property)');
                        }
                    } catch (colorError) {
                        // Failed to create color fill
                    }
                } else {
                    safeSetProperty(pathObj, 'fill', fillColor, '(set fill color directly)') ||
                    safeSetProperty(pathObj, 'fillColor', fillColor, '(set fillColor directly)') ||
                    safeSetProperty(pathObj, 'color', fillColor, '(set color directly)');
                }
                
                // Final verification: ensure no stroke and has fill
                
                // Calculate more suitable position based on bounds information
                let offsetX = 100;
                let offsetY = 100;
                
                if (bounds) {
                    // Ensure inserted content is in visible area of canvas
                    offsetX = Math.max(50, -bounds.minX + 50);
                    offsetY = Math.max(50, -bounds.minY + 50);
                }
                
                // Set position - using safe property setting
                const translation = { x: offsetX, y: offsetY };
                if (!safeSetProperty(pathObj, 'translation', translation, '(set position)')) {
                    // If translation fails, try other possible property names
                    safeSetProperty(pathObj, 'position', translation, '(try position property)') ||
                    safeSetProperty(pathObj, 'transform', translation, '(try transform property)') ||
                    (safeSetProperty(pathObj, 'x', offsetX, '(try x property)') && 
                     safeSetProperty(pathObj, 'y', offsetY, '(try y property)'));
                }
                
                // Check insertion parent node
                const insertionParent = editor.context.insertionParent;
                if (!insertionParent) {
                    throw new Error('Insertion parent node not available');
                }
                
                try {
                    insertionParent.children.append(pathObj);
                } catch (appendError) {
                    console.error('Failed to append to parent node:', appendError);
                    throw new Error(`Failed to append to parent node: ${appendError.message}`);
                }
                
                return { success: true, position: { x: offsetX, y: offsetY }, method: creationMethod };
                
            } catch (error) {
                return { success: false, error: error.message };
            }
        },

        // Create rectangle (retain original functionality for testing)
        createRectangle: () => {
            try {
                const rectangle = editor.createRectangle();
                rectangle.width = 240;
                rectangle.height = 180;
                rectangle.translation = { x: 10, y: 10 };
                const color = { red: 0.32, green: 0.34, blue: 0.89, alpha: 1 };
                const rectangleFill = editor.makeColorFill(color);
                rectangle.fill = rectangleFill;
                const insertionParent = editor.context.insertionParent;
                insertionParent.children.append(rectangle);
                return { success: true };
            } catch (error) {
                return { success: false, error: error.message };
            }
        }
    };

    // Expose `sandboxApi` to the UI runtime.
    runtime.exposeApi(sandboxApi);
}

start();