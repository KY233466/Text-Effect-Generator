import React, { useEffect, useState } from 'react';

const { createElement: h, Fragment } = React;

// 变形函数定义
function arcLowerWarp(x, y, totalWidth, centerX, arcHeight) {
  const normX = (x - centerX) / (totalWidth / 2);
  const arcY = arcHeight * (1 - normX * normX);
  return { x, y: y + arcY };
}

function waveWarp(x, y, totalWidth, centerX, arcHeight) {
  return { x, y: y + Math.sin(x / 40) * arcHeight };
}

// 优化后的凸起变形算法 - 重命名为melt1
function melt1Warp(x, y, totalWidth, centerX, arcHeight) {
  const normX = (x - centerX) / (totalWidth / 2);
  // 水平方向的变形因子
  const horizontalFactor = Math.cos(normX * Math.PI / 2);
  const horizontalBulge = horizontalFactor * horizontalFactor;
  
  // 关键改进：根据字母的垂直位置决定是否变形
  const baselineY = 80; // 字体基线位置
  const letterTop = baselineY - 60; // 字母顶部大约位置
  const letterBottom = baselineY + 15; // 字母底部大约位置
  const letterMiddle = (letterTop + letterBottom) / 2; // 字母中间位置
  
  // 只有接近字母中间部分的点才进行变形
  const distanceFromMiddle = Math.abs(y - letterMiddle);
  const maxMiddleDistance = 25; // 中间区域的范围
  
  // 如果点在字母的顶部或底部边缘，几乎不变形
  let verticalFactor = 0;
  if (distanceFromMiddle < maxMiddleDistance) {
    verticalFactor = 1 - (distanceFromMiddle / maxMiddleDistance);
  }
  
  const bulgeY = arcHeight * horizontalBulge * verticalFactor;
  return { x, y: y - bulgeY };
}

// 优化后的下凸变形算法 - 重命名为melt2
function melt2Warp(x, y, totalWidth, centerX, arcHeight) {
  const normX = (x - centerX) / (totalWidth / 2);
  // 水平方向的变形因子
  const horizontalFactor = Math.cos(normX * Math.PI / 2);
  const horizontalBulge = horizontalFactor * horizontalFactor;
  
  // 关键改进：根据字母的垂直位置决定是否变形
  const baselineY = 80; // 字体基线位置
  const letterTop = baselineY - 60; // 字母顶部大约位置
  const letterBottom = baselineY + 15; // 字母底部大约位置
  const letterMiddle = (letterTop + letterBottom) / 2; // 字母中间位置
  
  // 只有接近字母中间部分的点才进行变形
  const distanceFromMiddle = Math.abs(y - letterMiddle);
  const maxMiddleDistance = 25; // 中间区域的范围
  
  // 如果点在字母的顶部或底部边缘，几乎不变形
  let verticalFactor = 0;
  if (distanceFromMiddle < maxMiddleDistance) {
    verticalFactor = 1 - (distanceFromMiddle / maxMiddleDistance);
  }
  
  const bulgeY = arcHeight * horizontalBulge * verticalFactor;
  return { x, y: y + bulgeY };
}

const warpTypes = {
  arcLower: { label: "下弧形", fn: arcLowerWarp },
  wave: { label: "波浪形", fn: waveWarp },
  melt1: { label: "Melt1 凸起", fn: melt1Warp },
  melt2: { label: "Melt2 下凸", fn: melt2Warp }
};

const fonts = [
  { name: "Old Standard", url: "./fonts/OldStandardTT-Regular.ttf" },
  { name: "Arial", url: "./fonts/Arial.ttf" },
  { name: "Helvetica", url: "./fonts/Helvetica.ttf" }
];

const TextWarpApp = ({ sandboxProxy }) => {
  const [text, setText] = useState("TYPE WARP");
  const [warpType, setWarpType] = useState("melt1");
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

    const opentype = window.opentype;
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
      const warpFn = warpTypes[warpType].fn;
      const baselineY = fontSize * 0.8;

      glyphs.forEach((g) => {
        const path = g.getPath(x, baselineY, fontSize);
        path.commands.forEach((cmd) => {
          const warped = { ...cmd };
          if ('x' in warped && 'y' in warped) {
            const { x: newX, y: newY } = warpFn(warped.x, warped.y, totalWidth, centerX, arcHeight);
            warped.x = newX;
            warped.y = newY;
          }
          if ('x1' in warped && 'y1' in warped) {
            const { x: newX1, y: newY1 } = warpFn(warped.x1, warped.y1, totalWidth, centerX, arcHeight);
            warped.x1 = newX1;
            warped.y1 = newY1;
          }
          if ('x2' in warped && 'y2' in warped) {
            const { x: newX2, y: newY2 } = warpFn(warped.x2, warped.y2, totalWidth, centerX, arcHeight);
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

  return h('div', { className: 'text-warp-app' },
    h('h2', null, '文本变形插件'),
    
    h('div', { className: 'control-group' },
      h('label', null, '选择字体：'),
      h('select', {
        value: fontUrl,
        onChange: e => setFontUrl(e.target.value),
        className: 'font-select'
      }, fonts.map(f => h('option', { key: f.url, value: f.url }, f.name)))
    ),

    h('div', { className: 'control-group' },
      h('label', null, '变形类型：'),
      h('select', {
        value: warpType,
        onChange: e => setWarpType(e.target.value),
        className: 'warp-select'
      }, Object.entries(warpTypes).map(([key, val]) => 
        h('option', { key: key, value: key }, val.label)
      ))
    ),

    h('div', { className: 'control-group' },
      h('label', null, `变形强度：${intensity}`),
      h('input', {
        type: 'range',
        min: '0',
        max: '100',
        value: intensity,
        onChange: e => setIntensity(Number(e.target.value)),
        className: 'intensity-slider'
      }),
      h('div', { className: 'intensity-hint' }, '0 (无变形) — 100 (最大变形)')
    ),

    h('div', { className: 'control-group' },
      h('label', null, '输入文字：'),
      h('input', {
        type: 'text',
        value: text,
        onChange: e => setText(e.target.value),
        placeholder: '输入要变形的文字',
        className: 'text-input'
      })
    ),

    h('div', { className: 'preview-container' },
      h('h3', null, '预览效果'),
      h('div', { className: 'svg-preview' },
        error ? 
          h('div', { className: 'error-message' }, error) :
          h('svg', { 
            viewBox: pathBounds ? 
              `${pathBounds.minX - 20} ${pathBounds.minY - 20} ${pathBounds.width + 40} ${pathBounds.height + 40}` : 
              '0 0 1000 300',
            width: '100%', 
            height: '200', 
            style: { border: '1px solid #eee' } 
          },
            h('path', { d: svgPath, fill: 'hotpink', stroke: 'none' })
          )
      )
    ),

    h('div', { className: 'button-group' },
      h('button', {
        onClick: handleInsert,
        disabled: isLoading || !svgPath,
        className: 'insert-button primary'
      }, isLoading ? '插入中...' : '插入变形文本')
    )
  );
};

export default TextWarpApp; 