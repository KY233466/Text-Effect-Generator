import React, { useEffect, useState } from "react";
import { effectsList, getWarpFunction } from "../shapes/index.js";
import opentype from "opentype.js";

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "calc(100% - 55px)",
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    paddingTop: '22px'
  },
  label: {
    color: "#06001A",
    fontSize: "14px",
    fontFamily: "Avenir Next",
    fontWeight: "600",
    marginBottom: "8px",
    display: "block",
  },
  previewContainer: {
    border: "1px solid #EBF3FE",
    height: "240px",
    width: "100%",
    borderRadius: "10px",
    marginBottom: '5px',
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "sticky",
  },
  svg: {
    width: "100%",
    height: "100%",
  },
  controlSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  sliderContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: "24px",
    backgroundColor: "#EBF3FE",
    padding: "10px",
    borderRadius: "10px",
    flexDirection: "row",
  },
  sliderIcon: {
    fontSize: "12px",
  },
  sliderValue: {
    width: "30px",
    marginLeft: "4px",
    fontSize: "12px",
  },
  slider: {
    marginTop: "5px",
    width: "80%",
    WebkitAppearance: "none",
    appearance: "none",
    height: "6px",
    background: "white",
    borderRadius: "3px",
    outline: "none",
    border: "1px solid #ddd",
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    marginBottom: "12px",
  },
  effectButton: {
    width: "86px",
    height: "86px",
    borderRadius: "8px",
    border: "1px solid #EBF3FE",
    backgroundColor: "white",
    outline: "none",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
  },
  effectButtonSelected: {
    backgroundColor: "#EBF3FE",
    border: "1px solid #1178FF",
    borderStyle: "solid",
  },
  effectIcon: {
    marginBottom: "4px",
  },
  effectLabel: {
    fontSize: "10px",
    color: "#666",
    textAlign: "center",
    fontFamily: "Avenir Next",
  },
  effectLabelSelected: {
    color: "white",
  },
  paginationWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "1px",
    padding: "2px",
    backgroundColor: "#EBF3FE",
    borderRadius: "20px",
  },
  paginationButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#000",
  },
  paginationButtonDisabled: {
    cursor: "not-allowed",
    color: "#ccc",
  },
  pageIndexText: {
    fontSize: 10,
  },
  typeButtonsContainer: {
    display: "flex",
    gap: "8px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  typeButton: {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #CBE2FF",
    backgroundColor: "white",
    cursor: "pointer",
    fontSize: "12px",
    fontFamily: "Avenir Next",
    color: "#666",
    transition: "all 0.2s ease",
  },
  typeButtonSelected: {
    backgroundColor: "#1178FF",
    borderColor: "#1178FF",
    color: "white",
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
    color: "#dc3545",
    backgroundColor: "#f8d7da",
    border: "1px solid #f5c6cb",
    padding: "8px 12px",
    borderRadius: "4px",
    textAlign: "center",
    marginTop: "12px",
    fontSize: "12px",
  },
};

const TextWarpPage = ({
  sandboxProxy,
  text,
  fontUrl,
  lineHeight,
  letterSpacing,
  alignment,
}) => {
  const [warpType, setWarpType] = useState("wave");
  const [intensity, setIntensity] = useState(50);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [svgPath, setSvgPath] = useState("");
  const [pathBounds, setPathBounds] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);

  const shapeGroups = [
    { label: "Arc", types: ["bulgeUp", "bulgeDown", "bulgeBoth"] },
    { label: "Wave", types: ["wave"] },
    { label: "Flag", types: ["flag"] },
    { label: "Bridge", types: ["arcLower", "arcUpper"] },
    { label: "Hill", types: ["triangleUpper", "triangleLower"] },
    { label: "Pit", types: ["concaveTop", "concaveBottom"] },
    { label: "Curtain", types: ["slantDownRight", "slantDownLeft"] },
    { label: "Other", types: ["envelopeWave", "bouquet"] },
  ];

  const getSliderBackground = (intensity) =>
    `linear-gradient(to right, #1178FF 0%, #1178FF ${intensity}%, #ffffff ${intensity}%, #ffffff 100%)`;

  const pageSize = 3;
  const totalPages = Math.ceil(shapeGroups.length / pageSize);
  const currentGroups = shapeGroups.slice(
    pageIndex * pageSize,
    (pageIndex + 1) * pageSize
  );
  const selectedGroup =
    shapeGroups.find((group) => group.types.includes(warpType)) ||
    shapeGroups[0];
  const relatedTypes = selectedGroup.types;

  const calculatePathBounds = (commands) => {
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    commands.forEach((cmd) => {
      const pts = [];
      if ("x" in cmd && "y" in cmd) pts.push({ x: cmd.x, y: cmd.y });
      if ("x1" in cmd && "y1" in cmd) pts.push({ x: cmd.x1, y: cmd.y1 });
      if ("x2" in cmd && "y2" in cmd) pts.push({ x: cmd.x2, y: cmd.y2 });
      pts.forEach((p) => {
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
      width: maxX - minX,
      height: maxY - minY,
    };
  };

  useEffect(() => {
    if (!text || !opentype) return;
    opentype.load(fontUrl, (err, font) => {
      if (err || !font) {
        setError("Font loading failed");
        return;
      }
      const fontSize = 120;
      const scale = fontSize / font.unitsPerEm;
      const baselineY = fontSize * 0.8;
      const actualLineHeight = fontSize * lineHeight;

      const lines = text.split("\n").filter((line) => line.trim());
      let allCommands = [],
        maxLineWidth = 0;

      const lineInfos = lines.map((line, i) => {
        const glyphs = font.stringToGlyphs(line);
        const widths = glyphs.map((g) => g.advanceWidth * scale);
        const lineWidth =
          widths.reduce((a, b) => a + b, 0) +
          (glyphs.length - 1) * letterSpacing;
        maxLineWidth = Math.max(maxLineWidth, lineWidth);
        return {
          glyphs,
          widths,
          lineWidth,
          y: baselineY + i * actualLineHeight,
        };
      });

      const warpFn = getWarpFunction(warpType);
      const totalHeight = (lines.length - 1) * actualLineHeight + fontSize;
      const centerY = baselineY + ((lines.length - 1) * actualLineHeight) / 2;
      const centerX = maxLineWidth / 2;
      const overallTopY = baselineY - fontSize * 0.7;
      const overallBottomY =
        baselineY + (lines.length - 1) * actualLineHeight + fontSize * 0.2;
      const textMetrics = {
        baseline: centerY,
        ascender: centerY - totalHeight / 2,
        descender: centerY + totalHeight / 2,
        yMax: overallTopY,
        yMin: overallBottomY,
      };

      lineInfos.forEach(({ glyphs, lineWidth, y }) => {
        let x = (maxLineWidth - lineWidth) / 2;
        glyphs.forEach((g) => {
          const path = g.getPath(x, y, fontSize);
          path.commands.forEach((cmd) => {
            const copy = { ...cmd };
            ["", "1", "2"].forEach((suffix) => {
              const xKey = "x" + suffix;
              const yKey = "y" + suffix;
              if (xKey in copy && yKey in copy) {
                const warped = warpFn(
                  copy[xKey],
                  copy[yKey],
                  maxLineWidth,
                  centerX,
                  intensity,
                  textMetrics
                );
                copy[xKey] = warped.x;
                copy[yKey] = warped.y;
              }
            });
            allCommands.push(copy);
          });
          x += g.advanceWidth * scale + letterSpacing;
        });
      });

      const d = allCommands
        .map((c) => {
          if (c.type === "M") return `M ${c.x} ${c.y}`;
          if (c.type === "L") return `L ${c.x} ${c.y}`;
          if (c.type === "C")
            return `C ${c.x1} ${c.y1}, ${c.x2} ${c.y2}, ${c.x} ${c.y}`;
          if (c.type === "Q") return `Q ${c.x1} ${c.y1}, ${c.x} ${c.y}`;
          if (c.type === "Z") return "Z";
          return "";
        })
        .join(" ");

      setSvgPath(d);
      setPathBounds(calculatePathBounds(allCommands));
    });
  }, [
    text,
    fontUrl,
    warpType,
    intensity,
    lineHeight,
    letterSpacing,
    alignment,
  ]);

  const handleInsert = async () => {
    if (!svgPath || !sandboxProxy) return;
    setIsLoading(true);
    try {
      const result = await sandboxProxy.insertWarpedSVG({
        d: svgPath,
        bounds: pathBounds,
        originalText: text,
        warpType,
        intensity,
      });
      if (!result.success) throw new Error(result.error);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <label style={styles.label}>Preview</label>
      <div style={styles.previewContainer}>
        <svg
          viewBox={
            pathBounds
              ? `${pathBounds.minX - 20} ${pathBounds.minY - 20} ${pathBounds.width + 40
              } ${pathBounds.height + 40}`
              : "0 0 1000 300"
          }
          style={styles.svg}
        >
          <path d={svgPath} fill="#06001A" stroke="none" />
        </svg>
      </div>

      <div style={styles.content}>
        <div style={styles.controlSection}>
          <label style={styles.label}>Shape</label>
          <div style={styles.paginationWrapper}>
            <button
              onClick={() => setPageIndex((p) => Math.max(p - 1, 0))}
              disabled={pageIndex === 0}
              style={{
                ...styles.paginationButton,
                ...(pageIndex === 0 ? styles.paginationButtonDisabled : {}),
              }}
            >
              &lt;
            </button>
            <span style={styles.pageIndexText}>{pageIndex + 1}</span>
            <button
              onClick={() => setPageIndex((p) => Math.min(p + 1, totalPages - 1))}
              disabled={pageIndex === totalPages - 1}
              style={{
                ...styles.paginationButton,
                ...(pageIndex === totalPages - 1
                  ? styles.paginationButtonDisabled
                  : {}),
              }}
            >
              &gt;
            </button>
          </div>
        </div>

        <div style={styles.gridContainer}>
          {currentGroups.map((group) => (
            <button
              key={group.label}
              onClick={() => {
                setWarpType(group.types[0]);
              }}
              style={{
                ...styles.effectButton,
                ...(warpType === group.types[0]
                  ? styles.effectButtonSelected
                  : {}),
              }}
            >
              <div style={styles.effectIcon}>
                <img src={`./icon/${group.types[0]}.png`} alt={group.label} />
              </div>
              <div style={styles.effectLabel}>{group.label}</div>
            </button>
          ))}
        </div>

        <label style={styles.label}>Type</label>
        <div style={styles.typeButtonsContainer}>
          {relatedTypes.map((typeKey) => {
            const type = effectsList.find((e) => e.key === typeKey);
            return (
              <button
                key={typeKey}
                onClick={() => setWarpType(typeKey)}
                style={{
                  ...styles.effectButton,
                  ...(warpType === typeKey ? styles.effectButtonSelected : {}),
                }}
              >
                <div style={styles.effectIcon}>
                  <img
                    src={`./icon/${typeKey}.png`}
                    alt={type?.label || typeKey}
                  />
                </div>
              </button>
            );
          })}
        </div>

        <div style={styles.sliderContainer}>
          <span style={styles.sliderIcon}>Bend</span>
          <span style={styles.sliderValue}>{intensity}</span>
          <input
            type="range"
            min="0"
            max="100"
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            style={{
              ...styles.slider,
              background: getSliderBackground(intensity),
            }}
          />
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

      {error && <div style={styles.errorMessage}>{error}</div>}
    </div>
  );
};

export default TextWarpPage;
