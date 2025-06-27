import React, { useEffect, useState } from 'react';
import opentype from 'opentype.js';

const fonts = [
  { name: "Old Standard", url: "./fonts/OldStandardTT-Regular.ttf" },
  { name: "Arial", url: "./fonts/Arial.ttf" },
  { name: "Helvetica", url: "./fonts/Helvetica.ttf" }
];

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: 'calc(100% - 55px)',
  },
  content: {
    flex: 1,
    overflowY: 'auto'
  },
  preview: {
    width: '100%',
    height: '240px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: "sticky",
    top: 56,
    zIndex: 1,
    paddingBottom: "5px",
  },
  label: {
    color: "#06001A",
    fontSize: "14px",
    fontFamily: "Avenir Next",
    fontWeight: "600",
    marginBottom: "8px",
    display: "block"
  },
  alignment: {
    width: '86px',
    height: '37px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '8px'
  },
  insertButton: {
    marginTop: '10px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'Avenir Next',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    width: '100%',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    padding: '12px 24px',
    background: '#1178FF',
    color: 'white'
  },
  insertButtonDisabled: {
    marginTop: '10px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    width: '100%',
    fontFamily: 'Avenir Next',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    minWidth: '120px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    padding: '12px 24px',
    backgroundColor: '#ccc',
    color: '#666',
    cursor: 'not-allowed',
    transform: 'none',
    boxShadow: 'none'
  },
  errorMessage: {
    color: '#dc3545',
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
    padding: '8px 12px',
    borderRadius: '4px',
    textAlign: 'center',
    marginTop: '12px'
  },
  textInput: {
    border: '1px solid #CBE2FF',
    borderRadius: '10px',
    width: '280px',
    height: '72px',
    padding: '12px',
    fontSize: '14px',
    fontFamily: 'Avenir Next',
    resize: 'none',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box'
  },
  selectFont: {
    border: '1px solid #CBE2FF',
    borderRadius: '10px',
    width: '100%',
    height: '40px',
    fontSize: '14px',
    fontFamily: 'Avenir Next',
    marginBottom: '12px',
    outline: 'none',
    cursor: 'pointer',
    boxSizing: 'border-box'
  }
};

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
    <div style={styles.container}>
      <label style={styles.label}>Preview</label>
      <div style={styles.preview}>
        {error ? (
          <div style={{
            color: '#ff4444',
            fontSize: '12px',
            textAlign: 'center',
            padding: '20px'
          }}>{error}</div>
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
              borderRadius: '10px',
              backgroundColor: '#FFFFFF'
            }}
          >
            <path d={svgPath} fill="black" stroke="none" />
          </svg>
        )}
      </div>

      <div style={styles.content}>
        <div style={{ marginTop: '22px', marginBottom: "0" }}>
          <label style={styles.label}>Text</label>
          <textarea
            style={styles.textInput}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Enter text to render\nMulti-line supported\nEach line renders separately"
            rows={3}
            onFocus={e => e.target.style.borderColor = '#1178FF'}
            onBlur={e => e.target.style.borderColor = '#CBE2FF'}
          />
        </div>

        <div style={{ width: '280px', height: '227px', marginTop: '24px', marginBottom: "0" }}>
          <label style={styles.label}>Typography</label>
          <select
            value={fontUrl}
            onChange={e => setFontUrl(e.target.value)}
            style={styles.selectFont}
          >
            {fonts.map(f => (
              <option key={f.url} value={f.url}>{f.name}</option>
            ))}
          </select>

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', backgroundColor: '#EBF3FE', padding: '10px', borderRadius: '5px' }}>
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

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', backgroundColor: '#EBF3FE', padding: '10px', borderRadius: '5px' }}>
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

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setAlignment('left')}
              style={{
                ...styles.alignment,
                backgroundColor: alignment === 'left' ? 'white' : '#EBF3FE',
                border: alignment === 'left' ? '2px solid #CBE2FF' : 'none'
              }}
            >
              <div style={{ width: '100%', height: '2px', backgroundColor: '#666', marginBottom: '3px' }}></div>
              <div style={{ width: '75%', height: '2px', backgroundColor: '#666', marginBottom: '3px' }}></div>
              <div style={{ width: '90%', height: '2px', backgroundColor: '#666' }}></div>
            </button>

            <button
              onClick={() => setAlignment('center')}
              style={{
                ...styles.alignment,
                backgroundColor: alignment === 'center' ? 'white' : '#EBF3FE',
                border: alignment === 'center' ? '2px solid #CBE2FF' : 'none'
              }}
            >
              <div style={{ width: '100%', height: '2px', backgroundColor: '#666', marginBottom: '3px' }}></div>
              <div style={{ width: '75%', height: '2px', backgroundColor: '#666', marginBottom: '3px' }}></div>
              <div style={{ width: '90%', height: '2px', backgroundColor: '#666' }}></div>
            </button>

            <button
              onClick={() => setAlignment('right')}
              style={{
                ...styles.alignment,
                backgroundColor: alignment === 'right' ? 'white' : '#EBF3FE',
                border: alignment === 'right' ? '2px solid #CBE2FF' : 'none'
              }}
            >
              <div style={{ width: '100%', height: '2px', backgroundColor: '#666', marginBottom: '3px' }}></div>
              <div style={{ width: '75%', height: '2px', backgroundColor: '#666', marginBottom: '3px' }}></div>
              <div style={{ width: '90%', height: '2px', backgroundColor: '#666' }}></div>
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={handleInsert}
        disabled={isLoading || !svgPath}
        style={isLoading || !svgPath ? styles.insertButtonDisabled : styles.insertButton}
        onMouseEnter={(e) => {
          if (!isLoading && svgPath) {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(17, 120, 255, 0.4)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isLoading && svgPath) {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(17, 120, 255, 0.3)';
          }
        }}
      >
        {isLoading ? 'Inserting...' : 'Add to Design'}
      </button>
    </div>
  );
};
