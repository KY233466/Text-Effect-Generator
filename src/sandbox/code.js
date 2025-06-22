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
                
                // 检查 editor 对象是否可用
                if (!editor) {
                    throw new Error('Editor 对象不可用');
                }
                
                console.log('Editor 对象可用方法:', Object.getOwnPropertyNames(editor));
                
                // 尝试不同的路径创建方法
                let pathObj;
                try {
                    // 方法1: 直接使用 createPath
                    if (typeof editor.createPath === 'function') {
                        console.log('使用 editor.createPath 方法');
                        pathObj = editor.createPath(d);
                    } else {
                        throw new Error('createPath 方法不存在');
                    }
                } catch (pathError) {
                    console.error('createPath 失败:', pathError);
                    
                    // 方法2: 尝试其他可能的方法名
                    if (typeof editor.createPathNode === 'function') {
                        console.log('尝试使用 editor.createPathNode 方法');
                        pathObj = editor.createPathNode(d);
                    } else if (typeof editor.addPath === 'function') {
                        console.log('尝试使用 editor.addPath 方法');
                        pathObj = editor.addPath(d);
                    } else {
                        // 列出所有可用的方法
                        const methods = Object.getOwnPropertyNames(editor).filter(name => typeof editor[name] === 'function');
                        console.log('Editor 可用方法:', methods);
                        throw new Error(`createPath 方法不存在。可用方法: ${methods.join(', ')}`);
                    }
                }
                
                if (!pathObj) {
                    throw new Error('路径对象创建失败');
                }
                
                console.log('路径对象创建成功:', pathObj);
                
                // 设置填充颜色（热粉色）
                // hotpink的RGB值是: rgb(255, 105, 180) 即 #FF69B4
                const fillColor = { red: 1.0, green: 0.412, blue: 0.706, alpha: 1 };
                pathObj.fill = editor.makeColorFill(fillColor);
                
                // 明确移除描边，确保没有黑色边框
                pathObj.stroke = undefined;
                
                // 根据边界信息计算更合适的位置
                let offsetX = 100;
                let offsetY = 100;
                
                if (bounds) {
                    // 确保插入的内容位于画布的可见区域
                    offsetX = Math.max(50, -bounds.minX + 50);
                    offsetY = Math.max(50, -bounds.minY + 50);
                }
                
                pathObj.translation = { x: offsetX, y: offsetY };
                
                // 检查插入父节点
                const insertionParent = editor.context.insertionParent;
                if (!insertionParent) {
                    throw new Error('插入父节点不可用');
                }
                
                console.log('插入父节点:', insertionParent);
                
                insertionParent.children.append(pathObj);
                
                console.log(`SVG 路径插入成功，位置: (${offsetX}, ${offsetY})，无描边`);
                return { success: true, position: { x: offsetX, y: offsetY } };
                
            } catch (error) {
                console.error('插入 SVG 路径失败:', error);
                console.error('错误堆栈:', error.stack);
                return { success: false, error: error.message };
            }
        },

        // 创建矩形（保留原有功能，用于测试）
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
                console.log('矩形创建成功');
                return { success: true };
            } catch (error) {
                console.error('创建矩形失败:', error);
                return { success: false, error: error.message };
            }
        }
    };

    // Expose `sandboxApi` to the UI runtime.
    runtime.exposeApi(sandboxApi);
}

start();
