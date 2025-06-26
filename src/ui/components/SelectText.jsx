import React, { useEffect, useState } from 'react';
import opentype from 'opentype.js';

const fonts = [
  { name: "Old Standard", url: "./fonts/OldStandardTT-Regular.ttf" },
  { name: "Arial", url: "./fonts/Arial.ttf" },
  { name: "Helvetica", url: "./fonts/Helvetica.ttf" }
];

export default function SelectText({ sandboxProxy,
  text,
  setText,
  fontUrl,
  setFontUrl,
  lineHeight,
  setLineHeight,
  letterSpacing,
  setLetterSpacing,
  alignment,
  setAlignment }) {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [svgPath, setSvgPath] = useState("");
  const [pathBounds, setPathBounds] = useState(null);

  const calculatePathBounds = (commands) => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    commands.forEach(cmd => {
      const points = [];
      if ('x' in cmd && 'y' in cmd) points.push({ x: cmd.x, y: cmd.y });
      if ('x1' in cmd && 'y1' in cmd) points.push({ x: cmd.x1, y: cmd.y1 });
      if ('x2' in cmd && 'y2' in cmd) points.push({ x: cmd.x2, y: cmd.y2 });

      points.forEach(p => {
        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y);
        maxY = Math.max(maxY, p.y);
      });
    });

    return {
      minX: minX === Infinity ? 0 : minX,
      minY: minY === Infinity ? 0 : minY,
      maxX: maxX === -Infinity ? 0 : maxX,
      maxY: maxY === -Infinity ? 0 : maxY,
      width: (maxX === -Infinity || minX === Infinity) ? 0 : maxX - minX,
      height: (maxY === -Infinity || minY === Infinity) ? 0 : maxY - minY
    };
  };

  useEffect(() => {
    if (!text) {
      setSvgPath("");
      setError("");
      return;
    }

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

      try {
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length === 0) {
          setSvgPath("");
          return;
        }

        const fontSize = 20;
        const scale = fontSize / font.unitsPerEm;
        const baselineY = fontSize * 0.8;
        const actualLineHeight = fontSize * lineHeight;

        let allCommands = [];
        let maxLineWidth = 0;

        const lineInfos = lines.map((line, lineIndex) => {
          const glyphs = font.stringToGlyphs(line);
          const glyphWidths = glyphs.map(g => g.advanceWidth * scale);
          const lineWidth = glyphWidths.reduce((a, b) => a + b, 0) + (glyphs.length - 1) * letterSpacing;
          maxLineWidth = Math.max(maxLineWidth, lineWidth);

          return {
            line,
            glyphs,
            glyphWidths,
            lineWidth,
            y: baselineY + lineIndex * actualLineHeight
          };
        });

        lineInfos.forEach((lineInfo, lineIndex) => {
          const { glyphs, lineWidth, y } = lineInfo;
          let x;
          
          // 根据对齐方式计算起始x位置
          if (alignment === 'left') {
            x = 0;
          } else if (alignment === 'right') {
            x = maxLineWidth - lineWidth;
          } else {
            x = (maxLineWidth - lineWidth) / 2;
          }

          glyphs.forEach((g) => {
            const path = g.getPath(x, y, fontSize);
            allCommands.push(...path.commands);
            x += g.advanceWidth * scale + letterSpacing;
          });
        });

        const d = allCommands.map(c => {
          if (c.type === 'M') return `M ${c.x} ${c.y}`;
          if (c.type === 'L') return `L ${c.x} ${c.y}`;
          if (c.type === 'C') return `C ${c.x1} ${c.y1}, ${c.x2} ${c.y2}, ${c.x} ${c.y}`;
          if (c.type === 'Q') return `Q ${c.x1} ${c.y1}, ${c.x} ${c.y}`;
          if (c.type === 'Z') return 'Z';
          return '';
        }).join(' ');

        const bounds = calculatePathBounds(allCommands);
        setPathBounds(bounds);
        setSvgPath(d);

      } catch (error) {
        console.error('生成文本路径时出错:', error);
        setError('生成文本路径时出现错误，请检查输入内容');
      }
    });
  }, [text, fontUrl, lineHeight, letterSpacing, alignment]);

  const handleInsert = async () => {
    if (!svgPath || !sandboxProxy) {
      console.error('SVG路径或沙盒代理不可用');
      return;
    }

    setIsLoading(true);
    try {
      const result = await sandboxProxy.insertWarpedSVG({
        d: svgPath,
        bounds: pathBounds,
        originalText: text,
        warpType: "none",
        intensity: 0
      });
      if (!result.success) {
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

  return (
    <div className="text-warp-page" style={{ 
      backgroundColor: '#FFFFFF',
      width: '280px'
    }}>
      <div className="control-group" style={{ marginBottom: "0" }}>
        <label style={{ 
          color: "#06001A",
          fontSize: "14px",
          fontFamily: "Avenir Next",
          fontWeight: "600",
          marginBottom: "8px"
        }}>Preview</label>
        <div className="svg-preview" style={{ width: '280px', height: '240px' }}>
          {error ? (
            <div className="error-message">{error}</div>
          ) : (
            <svg
              viewBox={pathBounds ?
                `${pathBounds.minX - 20} ${pathBounds.minY - 20} ${pathBounds.width + 40} ${pathBounds.height + 40}` :
                '0 0 1000 300'
              }
              width="100%"
              height="100%"
              style={{
                border: '1px solid #CBE2FF',
                borderRadius: '10px'
              }}
            >
              <path d={svgPath} fill="black" stroke="none" />
            </svg>
          )}
        </div>
      </div>

      <div className="control-group" style={{ marginTop: '32px', marginBottom: "0" }}>
        <label style={{ 
          color: "#06001A",
          fontSize: "14px",
          fontFamily: "Avenir Next",
          fontWeight: "600",
          marginBottom: "8px"
        }}>Text</label>
        <textarea
          style={{
            border: '1px solid #CBE2FF',
            borderRadius: '10px',
            width: '280px',
            height: '72px',
          }}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Enter text to render\nMulti-line supported\nEach line renders separately"
          className="text-input content-textarea"
          rows={3}
        />
      </div>

      <div className="control-group" style={{ width: '280px', height: '227px', marginTop: '24px', marginBottom: "0" }}>
        <label style={{ 
          color: "#06001A",
          fontSize: "14px",
          fontFamily: "Avenir Next",
          fontWeight: "600",
          marginBottom: "8px"
        }}>Typography</label>
        <select
          value={fontUrl}
          onChange={e => setFontUrl(e.target.value)}
          className="font-select"
          style={{
            border: '1px solid #CBE2FF',
            borderRadius: '10px',
            width: '100%',
            marginBottom: '12px',
          }}
        >
          {fonts.map(f => (
            <option key={f.url} value={f.url}>{f.name}</option>
          ))}
        </select>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', backgroundColor: '#EBF3FE', padding: '10px', borderRadius: '5px' }}>
          <img src="./icon/line_height.png" alt="icon" style={{ width: '12px', height: '12px', marginTop: '2px' }} />
          <span style={{ width: '30px', marginLeft: '12px', fontSize: '12px' }}>{lineHeight}</span>
          <input
            type="range"
            min="0.8"
            max="2.5"
            step="0.1"
            value={lineHeight}
            onChange={e => {
              const value = Number(e.target.value);
              setLineHeight(value);
              const progress = ((value - 0.8) / (2.5 - 0.8)) * 100;
              e.target.style.setProperty('--progress', `${progress}%`);
            }}
            onInput={e => {
              const value = Number(e.target.value);
              const progress = ((value - 0.8) / (2.5 - 0.8)) * 100;
              e.target.style.setProperty('--progress', `${progress}%`);
            }}
            className="intensity-slider"
            style={{ marginTop: '5px', width: '80%', '--progress': `${((lineHeight - 0.8) / (2.5 - 0.8)) * 100}%` }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', backgroundColor: '#EBF3FE', padding: '10px', borderRadius: '5px' }}>
          <img src="./icon/letter_spacing.png" alt="icon" style={{ width: '12px', height: '12px', marginTop: '2px' }} />
          <span style={{ width: '30px', marginLeft: '12px', fontSize: '12px' }}>{letterSpacing}</span>
          <input
            type="range"
            min="0"
            max="20"
            value={letterSpacing}
            onChange={e => {
              const value = Number(e.target.value);
              setLetterSpacing(value);
              const progress = (value / 20) * 100;
              e.target.style.setProperty('--progress', `${progress}%`);
            }}
            onInput={e => {
              const value = Number(e.target.value);
              const progress = (value / 20) * 100;
              e.target.style.setProperty('--progress', `${progress}%`);
            }}
            className="intensity-slider"
            style={{ marginTop: '5px', width: '80%', '--progress': `${(letterSpacing / 20) * 100}%` }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
          <button
            onClick={() => setAlignment('left')}
            style={{
              width: '86px',
              height: '37px',
              backgroundColor: alignment === 'left' ? 'white' : '#EBF3FE',
                              border: alignment === 'left' ? '2px solid #CBE2FF' : 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'center',
              padding: '8px'
            }}
          >
            <div style={{ width: '100%', height: '2px', backgroundColor: '#666', marginBottom: '3px' }}></div>
            <div style={{ width: '75%', height: '2px', backgroundColor: '#666', marginBottom: '3px' }}></div>
            <div style={{ width: '90%', height: '2px', backgroundColor: '#666' }}></div>
          </button>

          <button
            onClick={() => setAlignment('center')}
            style={{
              width: '86px',
              height: '37px',
              backgroundColor: alignment === 'center' ? 'white' : '#EBF3FE',
                              border: alignment === 'center' ? '2px solid #CBE2FF' : 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px'
            }}
          >
            <div style={{ width: '100%', height: '2px', backgroundColor: '#666', marginBottom: '3px' }}></div>
            <div style={{ width: '75%', height: '2px', backgroundColor: '#666', marginBottom: '3px' }}></div>
            <div style={{ width: '90%', height: '2px', backgroundColor: '#666' }}></div>
          </button>

          <button
            onClick={() => setAlignment('right')}
            style={{
              width: '86px',
              height: '37px',
              backgroundColor: alignment === 'right' ? 'white' : '#EBF3FE',
                              border: alignment === 'right' ? '2px solid #CBE2FF' : 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              justifyContent: 'center',
              padding: '8px'
            }}
          >
            <div style={{ width: '100%', height: '2px', backgroundColor: '#666', marginBottom: '3px' }}></div>
            <div style={{ width: '75%', height: '2px', backgroundColor: '#666', marginBottom: '3px' }}></div>
            <div style={{ width: '90%', height: '2px', backgroundColor: '#666' }}></div>
          </button>
        </div>
      </div>

      <div className="control-group" style={{ marginTop: '40px' }}>
        <div className="button-group">
          <button
            onClick={handleInsert}
            disabled={isLoading || !svgPath}
            className="insert-button primary"
            style={{ 
              width: '280px', 
              height: '37px', 
              fontSize: '14px', 
              fontFamily: 'Avenir Next',
              fontWeight: '600',
              padding: '0', 
              backgroundColor: '#1178FF',
              color: 'white'
            }}
          >
            {isLoading ? '插入中...' : 'Add to design'}
          </button>
        </div>
      </div>
    </div>
  );
};
