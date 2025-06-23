import addOnSandboxSdk from "add-on-sdk-document-sandbox";
import { editor } from "express-document-sdk";

// Get the document sandbox runtime.
const { runtime } = addOnSandboxSdk.instance;

// 安全的属性设置函数
function safeSetProperty(obj, property, value, description = '') {
    try {
        if (obj === null || obj === undefined) {
            console.warn(`⚠️ 尝试在null/undefined对象上设置属性 ${property} ${description}`);
            return false;
        }
        
        if (!(property in obj) && typeof obj[property] === 'undefined') {
            console.warn(`⚠️ 对象不支持属性 ${property} ${description}，对象类型:`, typeof obj);
            console.log('可用属性:', Object.getOwnPropertyNames(obj));
            return false;
        }
        
        obj[property] = value;
        console.log(`✅ 成功设置属性 ${property} = ${value} ${description}`);
        return true;
    } catch (error) {
        console.error(`❌ 设置属性 ${property} 失败 ${description}:`, error);
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

                console.log('接收到 SVG 路径数据:', d.substring(0, 100) + '...');
                console.log('路径边界信息:', bounds);
                console.log('原始文本:', originalText, '变形类型:', warpType, '强度:', intensity);
                
                // 检查 editor 对象是否可用
                if (!editor) {
                    throw new Error('Editor 对象不可用');
                }
                
                // 详细检查 editor 对象的所有属性和方法
                const allProps = Object.getOwnPropertyNames(editor);
                const methods = allProps.filter(name => typeof editor[name] === 'function');
                const properties = allProps.filter(name => typeof editor[name] !== 'function');
                
                console.log('Editor 可用方法:', methods);
                console.log('Editor 可用属性:', properties);
                
                // 尝试不同的路径创建方法
                let pathObj;
                let creationMethod = '';
                
                try {
                    // 方法1: 检查各种可能的路径创建方法
                    if (typeof editor.createPath === 'function') {
                        console.log('尝试使用 editor.createPath 方法');
                        pathObj = editor.createPath(d);
                        creationMethod = 'createPath';
                    } else if (typeof editor.createPathNode === 'function') {
                        console.log('尝试使用 editor.createPathNode 方法');
                        pathObj = editor.createPathNode(d);
                        creationMethod = 'createPathNode';
                    } else if (typeof editor.addPath === 'function') {
                        console.log('尝试使用 editor.addPath 方法');
                        pathObj = editor.addPath(d);
                        creationMethod = 'addPath';
                    } else if (typeof editor.createShape === 'function') {
                        console.log('尝试使用 editor.createShape 方法');
                        pathObj = editor.createShape();
                        if (pathObj && typeof pathObj.setPath === 'function') {
                            pathObj.setPath(d);
                            creationMethod = 'createShape + setPath';
                        } else if (pathObj && 'path' in pathObj) {
                            pathObj.path = d;
                            creationMethod = 'createShape + path属性';
                        }
                    } else if (typeof editor.createPolygon === 'function') {
                        console.log('尝试使用 editor.createPolygon 作为替代');
                        // 作为最后的尝试，使用多边形
                        pathObj = editor.createPolygon();
                        creationMethod = 'createPolygon (fallback)';
                    } else {
                        throw new Error(`没有找到合适的路径创建方法。可用方法: ${methods.join(', ')}`);
                    }
                } catch (pathError) {
                    console.error('路径创建失败:', pathError);
                    throw new Error(`路径创建失败: ${pathError.message}。可用方法: ${methods.join(', ')}`);
                }
                
                if (!pathObj) {
                    throw new Error('路径对象创建失败 - 返回值为空');
                }
                
                console.log(`路径对象创建成功，使用方法: ${creationMethod}`, pathObj);
                console.log('路径对象类型:', typeof pathObj);
                console.log('路径对象属性:', Object.getOwnPropertyNames(pathObj));
                
                // 🔥 首要任务：立即移除默认描边
                console.log('🔥 PathNode默认带有描边，立即移除...');
                console.log('创建时的默认stroke:', pathObj.stroke);
                
                // 尝试所有可能的描边移除方法
                const strokeRemovalResults = [];
                
                // 方法1: 设置为 null (最直接的方法)
                if (safeSetProperty(pathObj, 'stroke', null, '(设置stroke为null)')) {
                    strokeRemovalResults.push('stroke=null 成功');
                }
                
                // 方法2: 设置为 undefined
                if (safeSetProperty(pathObj, 'stroke', undefined, '(设置stroke为undefined)')) {
                    strokeRemovalResults.push('stroke=undefined 成功');
                }
                
                // 方法3: 尝试其他可能的描边属性名
                if (safeSetProperty(pathObj, 'strokeColor', null, '(移除strokeColor)')) {
                    strokeRemovalResults.push('strokeColor=null 成功');
                }
                
                if (safeSetProperty(pathObj, 'strokeWidth', 0, '(设置strokeWidth为0)')) {
                    strokeRemovalResults.push('strokeWidth=0 成功');
                }
                
                if (safeSetProperty(pathObj, 'border', null, '(移除border)')) {
                    strokeRemovalResults.push('border=null 成功');
                }
                
                if (safeSetProperty(pathObj, 'borderWidth', 0, '(设置borderWidth为0)')) {
                    strokeRemovalResults.push('borderWidth=0 成功');
                }
                
                // 方法4: 尝试使用editor.makeStroke创建透明描边
                if (typeof editor.makeStroke === 'function') {
                    try {
                        // 创建完全透明且0宽度的描边
                        const transparentStroke = editor.makeStroke({
                            color: { red: 0, green: 0, blue: 0, alpha: 0 },
                            width: 0
                        });
                        if (safeSetProperty(pathObj, 'stroke', transparentStroke, '(设置透明描边)')) {
                            strokeRemovalResults.push('透明描边设置成功');
                        }
                    } catch (strokeError) {
                        console.warn('创建透明描边失败:', strokeError);
                    }
                }
                
                console.log('✅ 描边移除结果:', strokeRemovalResults);
                console.log('✅ 移除描边后的stroke值:', pathObj.stroke);
                
                // 现在设置填充颜色（热粉色）
                console.log('🎨 开始设置填充色...');
                const fillColor = { red: 1.0, green: 0.412, blue: 0.706, alpha: 1 };
                
                // 检查 editor.makeColorFill 是否存在
                if (typeof editor.makeColorFill === 'function') {
                    try {
                        const colorFill = editor.makeColorFill(fillColor);
                        console.log('颜色填充对象创建成功:', colorFill);
                        if (safeSetProperty(pathObj, 'fill', colorFill, '(设置填充色)')) {
                            console.log('✅ 填充色设置成功');
                        } else {
                            console.warn('无法设置填充色，尝试其他方法');
                            // 如果 fill 属性设置失败，尝试其他可能的属性名
                            safeSetProperty(pathObj, 'fillColor', colorFill, '(尝试 fillColor 属性)') ||
                            safeSetProperty(pathObj, 'color', colorFill, '(尝试 color 属性)');
                        }
                    } catch (colorError) {
                        console.error('创建颜色填充失败:', colorError);
                    }
                } else {
                    console.warn('editor.makeColorFill 方法不存在，尝试直接设置颜色');
                    safeSetProperty(pathObj, 'fill', fillColor, '(直接设置填充色)') ||
                    safeSetProperty(pathObj, 'fillColor', fillColor, '(直接设置 fillColor)') ||
                    safeSetProperty(pathObj, 'color', fillColor, '(直接设置 color)');
                }
                
                // 最终验证：确保没有描边，有填充
                console.log('🔍 最终样式验证:', {
                    stroke: pathObj.stroke,
                    fill: pathObj.fill,
                    strokeColor: pathObj.strokeColor,
                    fillColor: pathObj.fillColor,
                    strokeWidth: pathObj.strokeWidth,
                    borderWidth: pathObj.borderWidth
                });
                
                // 根据边界信息计算更合适的位置
                let offsetX = 100;
                let offsetY = 100;
                
                if (bounds) {
                    // 确保插入的内容位于画布的可见区域
                    offsetX = Math.max(50, -bounds.minX + 50);
                    offsetY = Math.max(50, -bounds.minY + 50);
                }
                
                // 设置位置 - 使用安全的属性设置
                const translation = { x: offsetX, y: offsetY };
                if (!safeSetProperty(pathObj, 'translation', translation, '(设置位置)')) {
                    // 如果 translation 失败，尝试其他可能的属性名
                    safeSetProperty(pathObj, 'position', translation, '(尝试 position 属性)') ||
                    safeSetProperty(pathObj, 'transform', translation, '(尝试 transform 属性)') ||
                    (safeSetProperty(pathObj, 'x', offsetX, '(尝试 x 属性)') && 
                     safeSetProperty(pathObj, 'y', offsetY, '(尝试 y 属性)'));
                }
                
                // 检查插入父节点
                const insertionParent = editor.context.insertionParent;
                if (!insertionParent) {
                    throw new Error('插入父节点不可用');
                }
                
                console.log('插入父节点:', insertionParent);
                console.log('插入父节点类型:', typeof insertionParent);
                console.log('插入父节点属性:', Object.getOwnPropertyNames(insertionParent));
                
                try {
                    insertionParent.children.append(pathObj);
                    console.log(`SVG 路径插入成功，使用方法: ${creationMethod}，位置: (${offsetX}, ${offsetY})`);
                } catch (appendError) {
                    console.error('追加到父节点失败:', appendError);
                    throw new Error(`追加到父节点失败: ${appendError.message}`);
                }
                
                return { success: true, position: { x: offsetX, y: offsetY }, method: creationMethod };
                
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
