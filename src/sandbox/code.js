import addOnSandboxSdk from "add-on-sdk-document-sandbox";
import { editor } from "express-document-sdk";

// Get the document sandbox runtime.
const { runtime } = addOnSandboxSdk.instance;

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

                console.log('接收到 SVG 路径数据:', d.substring(0, 100) + '...');
                console.log('路径边界信息:', bounds);
                console.log('原始文本:', originalText, '变形类型:', warpType, '强度:', intensity);
                
                // 创建路径对象，直接传递路径字符串
                const pathObj = editor.createPath(d);
                
                // 设置填充颜色（热粉色）
                // hotpink的RGB值是: rgb(255, 105, 180) 即 #FF69B4
                const fillColor = { red: 1.0, green: 0.412, blue: 0.706, alpha: 1 };
                pathObj.fill = editor.makeColorFill(fillColor);
                
                // 修复：明确移除描边，确保没有黑色边框
                pathObj.stroke = undefined; // 使用undefined而不是null
                
                // 修复：根据边界信息计算更合适的位置
                let offsetX = 100;
                let offsetY = 100;
                
                if (bounds) {
                    // 确保插入的内容位于画布的可见区域
                    offsetX = Math.max(50, -bounds.minX + 50);
                    offsetY = Math.max(50, -bounds.minY + 50);
                }
                
                pathObj.translation = { x: offsetX, y: offsetY };
                
                const insertionParent = editor.context.insertionParent;
                insertionParent.children.append(pathObj);
                
                console.log(`SVG 路径插入成功，位置: (${offsetX}, ${offsetY})，无描边`);
                return { success: true, position: { x: offsetX, y: offsetY } };
                
            } catch (error) {
                console.error('插入 SVG 路径失败:', error);
                return { success: false, error: error.message };
            }
        },

        // 创建矩形（保留原有功能）
        createRectangle: () => {
            const rectangle = editor.createRectangle();
            rectangle.width = 240;
            rectangle.height = 180;
            rectangle.translation = { x: 10, y: 10 };
            const color = { red: 0.32, green: 0.34, blue: 0.89, alpha: 1 };
            const rectangleFill = editor.makeColorFill(color);
            rectangle.fill = rectangleFill;
            const insertionParent = editor.context.insertionParent;
            insertionParent.children.append(rectangle);
        }
    };

    // Expose `sandboxApi` to the UI runtime.
    runtime.exposeApi(sandboxApi);
}

start();
