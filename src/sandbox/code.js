import addOnSandboxSdk from "add-on-sdk-document-sandbox";
import { editor } from "express-document-sdk";

// Get the document sandbox runtime.
const { runtime } = addOnSandboxSdk.instance;

// 安全的属性设置函数
function safeSetProperty(obj, property, value) {
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
        return false;
    }
}

function start() {
    // APIs to be exposed to the UI runtime
    // i.e., to the `index.html` file of this add-on.
    const sandboxApi = {
        // 获取可用字体列表
        getAvailableFonts: async () => {
            return [
                { postscriptName: "ArialMT", familyName: "Arial", styleName: "Regular" },
                { postscriptName: "Helvetica", familyName: "Helvetica", styleName: "Regular" },
                { postscriptName: "TimesNewRomanPSMT", familyName: "Times New Roman", styleName: "Regular" }
            ];
        },
        // 插入 SVG 路径
        insertWarpedSVG: async (options) => {
            const { d, bounds, originalText, warpType, intensity } = options;
            
            try {
                if (!d || d.trim() === '') {
                    throw new Error('SVG 路径数据为空');
                }

                if (!editor) {
                    throw new Error('Editor 对象不可用');
                }
                
                // 尝试创建路径对象
                let pathObj;
                let creationMethod = '';
                
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
                        creationMethod = 'createShape + path属性';
                    }
                } else {
                    throw new Error('没有找到合适的路径创建方法');
                }
                
                if (!pathObj) {
                    throw new Error('路径对象创建失败');
                }
                
                // 移除默认描边
                safeSetProperty(pathObj, 'stroke', null) ||
                safeSetProperty(pathObj, 'strokeWidth', 0) ||
                safeSetProperty(pathObj, 'borderWidth', 0);
                
                // 设置填充颜色（热粉色）
                const fillColor = { red: 1.0, green: 0.412, blue: 0.706, alpha: 1 };
                
                if (typeof editor.makeColorFill === 'function') {
                    try {
                        const colorFill = editor.makeColorFill(fillColor);
                        safeSetProperty(pathObj, 'fill', colorFill) ||
                        safeSetProperty(pathObj, 'fillColor', colorFill) ||
                        safeSetProperty(pathObj, 'color', colorFill);
                    } catch (colorError) {
                        // 如果颜色填充创建失败，尝试直接设置
                        safeSetProperty(pathObj, 'fill', fillColor) ||
                        safeSetProperty(pathObj, 'fillColor', fillColor) ||
                        safeSetProperty(pathObj, 'color', fillColor);
                    }
                } else {
                    safeSetProperty(pathObj, 'fill', fillColor) ||
                    safeSetProperty(pathObj, 'fillColor', fillColor) ||
                    safeSetProperty(pathObj, 'color', fillColor);
                }
                
                // 设置位置
                let offsetX = 100;
                let offsetY = 100;
                
                if (bounds) {
                    offsetX = Math.max(50, -bounds.minX + 50);
                    offsetY = Math.max(50, -bounds.minY + 50);
                }
                
                const translation = { x: offsetX, y: offsetY };
                safeSetProperty(pathObj, 'translation', translation) ||
                safeSetProperty(pathObj, 'position', translation) ||
                (safeSetProperty(pathObj, 'x', offsetX) && safeSetProperty(pathObj, 'y', offsetY));
                
                // 插入到文档
                const insertionParent = editor.context.insertionParent;
                if (!insertionParent) {
                    throw new Error('插入父节点不可用');
                }
                
                insertionParent.children.append(pathObj);
                console.log(`SVG 文本插入成功: "${originalText}" (${warpType}, 强度: ${intensity})`);
                
                return { success: true, position: { x: offsetX, y: offsetY }, method: creationMethod };
                
            } catch (error) {
                console.error('插入 SVG 路径失败:', error.message);
                return { success: false, error: error.message };
            }
        },

        // 创建矩形（用于测试）
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
                console.log('测试矩形创建成功');
                return { success: true };
            } catch (error) {
                console.error('创建矩形失败:', error.message);
                return { success: false, error: error.message };
            }
        }
    };

    // Expose `sandboxApi` to the UI runtime.
    runtime.exposeApi(sandboxApi);
}

start();
