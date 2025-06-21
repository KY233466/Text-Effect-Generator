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

function bulgeWarp(x, y, totalWidth, centerX, arcHeight) {
  const normX = (x - centerX) / (totalWidth / 2);
  const bulgeY = arcHeight * (1 - Math.abs(normX));
  return { x, y: y - bulgeY };
}

function bulgeDownWarp(x, y, totalWidth, centerX, arcHeight) {
  const normX = (x - centerX) / (totalWidth / 2);
  const bulgeY = arcHeight * (1 - Math.abs(normX));
  return { x, y: y + bulgeY };
}

const warpTypes = {
  arcLower: { label: "下弧形", fn: arcLowerWarp },
  wave: { label: "波浪形", fn: waveWarp },
  bulge: { label: "凸起", fn: bulgeWarp },
  bulgeDown: { label: "下凸", fn: bulgeDownWarp }
};

const fonts = [
  { name: "Old Standard", url: "./fonts/OldStandardTT-Regular.ttf" },
  { name: "Arial", url: "./fonts/Arial.ttf" },
  { name: "Helvetica", url: "./fonts/Helvetica.ttf" }
];

const TextWarpApp = ({ sandboxProxy }) => {
  const [text, setText] = useState("TYPE WARP");
  const [warpType, setWarpType] = useState("arcLower");
  const [fontUrl, setFontUrl] = useState(fonts[0].url);
  const [intensity, setIntensity] = useState(30);
  const [svgPath, setSvgPath] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
        const errorMessage = `字体加载失败: ${fontUrl}. 请确保字体文件存在于 'public/fonts' 目录下。`;
        console.error(errorMessage, err);
        setError(errorMessage);
        setSvgPath("");
        return;
      }

      setError("");
      const fontSize = 80;
      const scale = fontSize / font.unitsPerEm;
      const arcHeight = intensity;
      const glyphs = font.stringToGlyphs(text);
      let x = 0;
      const commands = [];
      const glyphWidths = glyphs.map(g => g.advanceWidth * scale);
      const totalWidth = glyphWidths.reduce((a, b) => a + b, 0);
      const centerX = totalWidth / 2;
      const warpFn = warpTypes[warpType].fn;

      glyphs.forEach((g) => {
        const path = g.getPath(x, fontSize, fontSize);
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

      setSvgPath(d);
    });
  }, [text, warpType, fontUrl, intensity]);

  const handleInsert = async () => {
    console.log("准备插入SVG路径:", svgPath.substring(0, 100));
    if (!svgPath || !sandboxProxy) {
      console.error('SVG路径或沙盒代理不可用');
      return;
    }

    setIsLoading(true);
    try {
      const result = await sandboxProxy.insertWarpedSVG({ d: svgPath });
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
            viewBox: '0 0 800 300', 
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