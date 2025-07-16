import React, { useEffect, useRef, useState } from 'react';
import opentype from 'opentype.js';

const FontSelector = ({ fonts, onSelect, currentFontUrl }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFont, setSelectedFont] = useState(null);
  const [openGroups, setOpenGroups] = useState({});
  const dropdownRef = useRef(null);

  const findFontByUrl = (url) => {
    const flatFonts = fonts.reduce((acc, item) => {
      if (item.group) {
        return [...acc, ...item.fonts];
      } else {
        return [...acc, item];
      }
    }, []);
    return flatFonts.find(font => font.url === url);
  };


  useEffect(() => {
    if (currentFontUrl) {
      const font = findFontByUrl(currentFontUrl);
      if (font) {
        setSelectedFont(font);
      }
    }
  }, [currentFontUrl, fonts]);

  useEffect(() => {
    if (!selectedFont && currentFontUrl) {
      const font = findFontByUrl(currentFontUrl);
      if (font) {
        setSelectedFont(font);
      }
    }
  }, [selectedFont, currentFontUrl]);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const handleSelect = (font) => {
    setSelectedFont(font);
    setIsOpen(false);
    onSelect(font);
  };

  const toggleGroup = (groupName) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const displayFont = selectedFont || fonts[0];

  const renderFontOption = (font) => (
    <div
      key={font.name}
      onClick={() => handleSelect(font)}
      style={{
        padding: '10px',
        borderBottom: '1px solid #f0f0f0',
        cursor: 'pointer',
        backgroundColor: selectedFont?.name === font.name ? '#EBF3FE' : '#fff',
        display: 'flex',
        alignItems: 'center',
        fontSize: '14px'
      }}
    >
      <div style={{
        fontSize: '14px',
        color: '#000'
      }}>{font.name}</div>
    </div>
  );

  return (
    <div style={{ position: 'relative', width: '100%' }} ref={dropdownRef}>
      <div
        onClick={toggleDropdown}
        style={{
          width: '100%',
          height: '40px',
          border: '2px solid #CBE2FF',
          backgroundColor: selectedFont ? '#EBF3FE' : '#fff',
          borderRadius: '8px',
          padding: '10px',
          fontFamily: displayFont.name,
          fontSize: '14px',
          cursor: 'pointer',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <span>{displayFont.name}</span>
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L6 6L11 1" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '45px',
            left: 0,
            right: 0,
            border: '2px solid #CBE2FF',
            borderRadius: '8px',
            backgroundColor: '#fff',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 10
          }}
        >
          {fonts.map((item) => (
            item.group ? (
              <div key={item.group}>
                <div
                  onClick={() => toggleGroup(item.group)}
                  style={{
                    padding: '10px',
                    borderBottom: '1px solid #f0f0f0',
                    cursor: 'pointer',
                    backgroundColor: openGroups[item.group] ? '#EBF3FE' : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '14px',
                    fontWeight: 'normal',
                    color: '#000'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', color: '#000' }}>
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ marginRight: '6px' }}
                    >
                      <path
                        d={openGroups[item.group] ? "M1 3L5 7L9 3" : "M3 1L7 5L3 9"}
                        stroke="#000"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {item.group}
                  </span>
                </div>
                {openGroups[item.group] && item.fonts.map(renderFontOption)}
              </div>
            ) : renderFontOption(item)
          ))}
        </div>
      )}
    </div>
  );
};

const fonts = [
  { name: '8 Heavy', url: './fonts/8 Heavy.ttf' },
  { name: 'Arial', url: './fonts/Arial.ttf' },
  {
    group: 'Degular',
    fonts: [
      { name: 'Degular Display Black', url: './fonts/Degular/DegularDisplay-Black.otf' },
      { name: 'Degular Display Black Italic', url: './fonts/Degular/DegularDisplay-BlackItalic.otf' },
      { name: 'Degular Display Bold', url: './fonts/Degular/DegularDisplay-Bold.otf' },
      { name: 'Degular Display Bold Italic', url: './fonts/Degular/DegularDisplay-BoldItalic.otf' },
      { name: 'Degular Display Light', url: './fonts/Degular/DegularDisplay-Light.otf' },
      { name: 'Degular Display Light Italic', url: './fonts/Degular/DegularDisplay-LightItalic.otf' },
      { name: 'Degular Display Medium', url: './fonts/Degular/DegularDisplay-Medium.otf' },
      { name: 'Degular Display Medium Italic', url: './fonts/Degular/DegularDisplay-MediumItalic.otf' },
      { name: 'Degular Display Regular', url: './fonts/Degular/DegularDisplay-Regular.otf' },
      { name: 'Degular Display Regular Italic', url: './fonts/Degular/DegularDisplay-RegularItalic.otf' },
      { name: 'Degular Display Semibold', url: './fonts/Degular/DegularDisplay-Semibold.otf' },
      { name: 'Degular Display Semibold Italic', url: './fonts/Degular/DegularDisplay-SemiboldItalic.otf' },
      { name: 'Degular Display Thin', url: './fonts/Degular/DegularDisplay-Thin.otf' },
      { name: 'Degular Display Thin Italic', url: './fonts/Degular/DegularDisplay-ThinItalic.otf' }
    ]
  },
  {
    group: 'Eckmannpsych-font',
    fonts: [
      { name: 'Eckmannpsych Large', url: './fonts/eckmannpsych-font/Eckmannpsych-Large.ttf' },
      { name: 'Eckmannpsych Medium', url: './fonts/eckmannpsych-font/Eckmannpsych-Medium.ttf' },
      { name: 'Eckmannpsych Small', url: './fonts/eckmannpsych-font/Eckmannpsych-Small.ttf' },
      { name: 'Eckmannpsych Variable', url: './fonts/eckmannpsych-font/Eckmannpsych-Variable.ttf' }
    ]
  },
  {
    group: 'Gyst',
    fonts: [
      { name: 'Gyst', url: './fonts/Gyst/Gyst.otf' },
      { name: 'Gyst Bold', url: './fonts/Gyst/Gyst-Bold.ttf' },
      { name: 'Gyst Bold Italic', url: './fonts/Gyst/Gyst-BoldItalic.ttf' },
      { name: 'Gyst Italic', url: './fonts/Gyst/Gyst-Italic.ttf' },
      { name: 'Gyst Light', url: './fonts/Gyst/Gyst-Light.ttf' },
      { name: 'Gyst Light Italic', url: './fonts/Gyst/Gyst-LightItalic.ttf' },
      { name: 'Gyst Medium', url: './fonts/Gyst/Gyst-Medium.ttf' },
      { name: 'Gyst Medium Italic', url: './fonts/Gyst/Gyst-MediumItalic.ttf' }
    ]
  },
  { name: 'Helvetica', url: './fonts/Helvetica.ttf' },
  { name: 'Old Standard', url: './fonts/OldStandardTT-Regular.ttf' },
  { name: 'Pika Ultra Script', url: './fonts/PikaUltraScript-Regular-iF667ecb67317fc.otf' },
  { name: 'Swung Note', url: './fonts/SwungNote.ttf' }
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
    overflowY: 'auto',
    // overflowX: 'hidden',
  },
  preview: {
    width: '100%',
    height: '240px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: "relative",
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
    padding: '0 15px',
    boxSizing: 'border-box',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
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
      setError("OpenType.js not loaded yet, please refresh the page and try again");
      return;
    }

    opentype.load(fontUrl, (err, font) => {
      if (err || !font) {
        const errorMessage = `Font loading failed: ${fontUrl}. Please ensure the font file exists in the 'src/ui/fonts' directory.`;
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

        const fontSize = 100;
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

          // Calculate starting x position based on alignment
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
        console.error('Error generating text path:', error);
        setError('Error generating text path, please check your input');
      }
    });
  }, [text, fontUrl, lineHeight, letterSpacing, alignment]);

  const handleInsert = async () => {
    if (!svgPath || !sandboxProxy) {
      console.error('SVG path or sandbox proxy not available');
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
        console.error('Sandbox insertion failed:', result.error);
        setError(`Insertion failed: ${result.error}`);
      } else if (result.message) {
        // Show informational message about SDK limitations
        console.warn('SDK Limitation:', result.message);
        setError(`⚠️ ${result.message}`);
      }
    } catch (e) {
      console.error('Sandbox API call failed:', e);
      setError(`Insertion error: ${e.message}`);
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

        <div style={{ width: '280px', height: '227px', marginTop: '24px' }}>
          <label style={styles.label}>Typography</label>
          <div style={{ marginBottom: '12px' }}>
            <FontSelector 
              fonts={fonts} 
              onSelect={(font) => setFontUrl(font.url)} 
              currentFontUrl={fontUrl}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', backgroundColor: '#EBF3FE', padding: '10px', borderRadius: '5px' }}>
            <img src="./icon/line_height.svg" alt="icon" style={{ width: '12px', height: '12px', marginTop: '2px' }} />
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
            <img src="./icon/letter_spacing.svg" alt="icon" style={{ width: '12px', height: '12px', marginTop: '2px' }} />
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
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop:'12px', marginBottom:'12px', marginLeft:'28px', marginRight:'33px'  }}>
                <div style={{ width: '20px', height: '2px', backgroundColor: '#666', marginBottom: '4px' }}></div>
                <div style={{ width: '13.85px', height: '2px', backgroundColor: '#666', marginBottom: '4px' }}></div>
                <div style={{ width: '13.85px', height: '2px', backgroundColor: '#666' }}></div>
              </div>
            </button>

            <button
              onClick={() => setAlignment('center')}
              style={{
                ...styles.alignment,
                backgroundColor: alignment === 'center' ? 'white' : '#EBF3FE',
                border: alignment === 'center' ? '2px solid #CBE2FF' : 'none'
              }}
            >
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',   // <— center horizontally
                width: '100%'
              }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop:'12px', marginBottom:'12px', marginLeft:'28px', marginRight:'33px'  }}>
                <div style={{ width: '20px', height: '2px', backgroundColor: '#666', marginBottom: '4px' }}></div>
                <div style={{ width: '13.85px', height: '2px', backgroundColor: '#666', marginBottom: '4px' }}></div>
                <div style={{ width: '13.85px', height: '2px', backgroundColor: '#666' }}></div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setAlignment('right')}
              style={{
                ...styles.alignment,
                backgroundColor: alignment === 'right' ? 'white' : '#EBF3FE',
                border: alignment === 'right' ? '2px solid #CBE2FF' : 'none'
              }}
            >
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                width: '100%'
              }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginTop:'12px', marginBottom:'12px', marginLeft:'33px', marginRight:'28px'  }}>
                <div style={{ width: '20px', height: '2px', backgroundColor: '#666', marginBottom: '4px' }}></div>
                <div style={{ width: '13.85px', height: '2px', backgroundColor: '#666', marginBottom: '4px' }}></div>
                <div style={{ width: '13.85px', height: '2px', backgroundColor: '#666' }}></div>
              </div>
              </div>
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
