import React, { useEffect, useState } from 'react';
import { effectsList, getWarpFunction } from '../shapes/index.js';
import opentype from 'opentype.js';

const fonts = [
  { name: "Old Standard", url: "./fonts/OldStandardTT-Regular.ttf" },
  { name: "Arial", url: "./fonts/Arial.ttf" },
  { name: "Helvetica", url: "./fonts/Helvetica.ttf" }
];

const TextWarpPage = ({ sandboxProxy }) => {
  const [text, setText] = useState("TYPE WARP");
  const [warpType, setWarpType] = useState("wave");
  const [fontUrl, setFontUrl] = useState(fonts[0].url);
  const [intensity, setIntensity] = useState(50);
  const [svgPath, setSvgPath] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [pathBounds, setPathBounds] = useState(null);

  // 计算路径边界的辅助函数
  const calculatePathBounds = (commands) => {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    
    commands.forEach(cmd => {
      if ('x' in cmd && 'y' in cmd) {
        minX = Math.min(minX, cmd.x);
        maxX = Math.max(maxX, cmd.x);
        minY = Math.min(minY, cmd.y);
        maxY = Math.max(maxY, cmd.y);
      }
      if ('x1' in cmd && 'y1' in cmd) {
        minX = Math.min(minX, cmd.x1);
        maxX = Math.max(maxX, cmd.x1);
        minY = Math.min(minY, cmd.y1);
        maxY = Math.max(maxY, cmd.y1);
      }
      if ('x2' in cmd && 'y2' in cmd) {
        minX = Math.min(minX, cmd.x2);
        maxX = Math.max(maxX, cmd.x2);
        minY = Math.min(minY, cmd.y2);
        maxY = Math.max(maxY, cmd.y2);
      }
    });
    
    return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
  };

  // 当参数变化时重新生成路径
  useEffect(() => {
    if (!text) {
      setSvgPath("");
      setError("");
      return;
    }

    // 直接使用导入的opentype对象
    if (!opentype) {
      setError("OpenType.js 未加载完成，请刷新页面重试");
      return;
    }

    opentype.load(fontUrl, (err, font) => {
      if (err || !font) {
        const errorMessage = `字体加载失败: ${fontUrl}. 请确保字体文件存在于 'src/ui/fonts' 目录下。`;
        console.error(errorMessage, err);
        setError(errorMessage);
        setSvgPath("");
        return;
      }

      setError("");
      const fontSize = 120;
      const scale = fontSize / font.unitsPerEm;
      const arcHeight = intensity;
      const glyphs = font.stringToGlyphs(text);
      let x = 0;
      const commands = [];
      const glyphWidths = glyphs.map(g => g.advanceWidth * scale);
      const totalWidth = glyphWidths.reduce((a, b) => a + b, 0);
      const centerX = totalWidth / 2;
      
      // 使用分离的变形函数
      const warpFn = getWarpFunction(warpType);
      if (!warpFn) {
        setError(`未知的变形类型: ${warpType}`);
        return;
      }
      
      const baselineY = fontSize * 0.8;
      
      // 计算文本度量信息，传递给变形函数
      const textMetrics = {
        baseline: baselineY,
        ascender: baselineY - fontSize * 0.7,
        descender: baselineY + fontSize * 0.2,
        yMax: baselineY - fontSize * 0.7,
        yMin: baselineY + fontSize * 0.2
      };

      glyphs.forEach((g) => {
        const path = g.getPath(x, baselineY, fontSize);
        path.commands.forEach((cmd) => {
          const warped = { ...cmd };
          if ('x' in warped && 'y' in warped) {
            const { x: newX, y: newY } = warpFn(warped.x, warped.y, totalWidth, centerX, arcHeight, textMetrics);
            warped.x = newX;
            warped.y = newY;
          }
          if ('x1' in warped && 'y1' in warped) {
            const { x: newX1, y: newY1 } = warpFn(warped.x1, warped.y1, totalWidth, centerX, arcHeight, textMetrics);
            warped.x1 = newX1;
            warped.y1 = newY1;
          }
          if ('x2' in warped && 'y2' in warped) {
            const { x: newX2, y: newY2 } = warpFn(warped.x2, warped.y2, totalWidth, centerX, arcHeight, textMetrics);
            warped.x2 = newX2;
            warped.y2 = newY2;
          }
          commands.push(warped);
        });
        x += g.advanceWidth * scale;
      });

      const d = commands.map(c => {
        if (c.type === 'M') return `M ${c.x} ${c.y}`;
        if (c.type === 'L') return `L ${c.x} ${c.y}`;
        if (c.type === 'C') return `C ${c.x1} ${c.y1}, ${c.x2} ${c.y2}, ${c.x} ${c.y}`;
        if (c.type === 'Q') return `Q ${c.x1} ${c.y1}, ${c.x} ${c.y}`;
        if (c.type === 'Z') return 'Z';
        return '';
      }).join(' ');

      // 计算并保存路径边界信息
      const bounds = calculatePathBounds(commands);
      setPathBounds(bounds);

      setSvgPath(d);
    });
  }, [text, warpType, fontUrl, intensity]);

  const handleInsert = async () => {
    console.log("准备插入SVG路径:", svgPath.substring(0, 100));
    console.log("路径边界信息:", pathBounds);
    
    if (!svgPath || !sandboxProxy) {
      console.error('SVG路径或沙盒代理不可用');
      return;
    }

    setIsLoading(true);
    try {
      // 传递更多信息到sandbox，包括边界信息
      const result = await sandboxProxy.insertWarpedSVG({ 
        d: svgPath, 
        bounds: pathBounds,
        originalText: text,
        warpType: warpType,
        intensity: intensity
      });
      if (result.success) {
        console.log('SVG 路径插入成功');
      } else {
        console.error('沙盒端插入失败:', result.error);
        setError(`插入失败: ${result.error}`);
      }
    } catch (e) {
      console.error('调用沙盒API失败:', e);
      setError(`插入异常: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 添加测试函数
  const handleTestRectangle = async () => {
    if (!sandboxProxy) {
      console.error('沙盒代理不可用');
      return;
    }

    try {
      const result = await sandboxProxy.createRectangle();
      if (result.success) {
        console.log('测试矩形创建成功');
      } else {
        console.error('测试矩形创建失败:', result.error);
        setError(`测试失败: ${result.error}`);
      }
    } catch (e) {
      console.error('测试API调用失败:', e);
      setError(`测试异常: ${e.message}`);
    }
  };

  return (
    <div className="text-warp-page">
      <div className="control-group">
        <label>选择字体：</label>
        <select
          value={fontUrl}
          onChange={e => setFontUrl(e.target.value)}
          className="font-select"
        >
          {fonts.map(f => (
            <option key={f.url} value={f.url}>{f.name}</option>
          ))}
        </select>
      </div>

      <div className="control-group">
        <label>变形类型：</label>
        <select
          value={warpType}
          onChange={e => setWarpType(e.target.value)}
          className="warp-select"
        >
          {effectsList.map(effect => (
            <option key={effect.key} value={effect.key}>{effect.label}</option>
          ))}
        </select>
      </div>

      <div className="control-group">
        <label>变形强度：{intensity}</label>
        <input
          type="range"
          min="0"
          max="100"
          value={intensity}
          onChange={e => setIntensity(Number(e.target.value))}
          className="intensity-slider"
        />
        <div className="intensity-hint">0 (无变形) — 100 (最大变形)</div>
      </div>

      <div className="control-group">
        <label>输入文字：</label>
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="输入要变形的文字"
          className="text-input"
        />
      </div>

      <div className="preview-container">
        <h3>预览效果</h3>
        <div className="svg-preview">
          {error ? (
            <div className="error-message">{error}</div>
          ) : (
            <svg
              viewBox={pathBounds ? 
                `${pathBounds.minX - 20} ${pathBounds.minY - 20} ${pathBounds.width + 40} ${pathBounds.height + 40}` : 
                '0 0 1000 300'
              }
              width="100%"
              height="200"
              style={{ border: '1px solid #eee' }}
            >
              <path d={svgPath} fill="hotpink" stroke="none" />
            </svg>
          )}
        </div>
      </div>

      <div className="button-group">
        <button
          onClick={handleInsert}
          disabled={isLoading || !svgPath}
          className="insert-button primary"
        >
          {isLoading ? '插入中...' : '插入变形文本'}
        </button>
        
        <button
          onClick={handleTestRectangle}
          className="insert-button secondary"
        >
          测试API
        </button>
      </div>
    </div>
  );
};

export default TextWarpPage; 