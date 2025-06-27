import React, { useEffect, useState } from "react";
import { effectsList, getWarpFunction } from "../shapes/index.js";
import opentype from "opentype.js";

// 样式对象
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "calc(100% - 65px)"
  },
  label: {
    color: "#06001A",
    fontSize: "14px",
    fontFamily: "Avenir Next",
    fontWeight: "600",
    marginBottom: "8px",
    display: "block"
  },
  previewContainer: {
    border: "1px solid #EBF3FE",
    height: "240px",
    borderRadius: "10px",
    marginBottom: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF"
  },
  svg: {
    width: "100%",
    height: "100%"
  },
  controlSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  sliderContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: "24px",
    backgroundColor: "#EBF3FE",
    padding: "10px",
    borderRadius: "10px",
    flexDirection: "row"
  },
  sliderIcon: {
    fontSize: "12px"
  },
  sliderValue: {
    width: "30px",
    marginLeft: "4px",
    fontSize: "12px"
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
    border: "1px solid #ddd"
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    marginBottom: "12px"
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
    boxSizing: "border-box"
  },
  effectButtonSelected: {
    backgroundColor: "#EBF3FE",
    border: "1px solid #1178FF",
    borderStyle: "solid"
  },
  effectIcon: {
    marginBottom: "4px"
  },
  effectLabel: {
    fontSize: "10px",
    color: "#666",
    textAlign: "center",
    fontFamily: "Avenir Next"
  },
  effectLabelSelected: {
    color: "white"
  },
  paginationWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "1px",
    padding: "2px",
    backgroundColor: "#EBF3FE",
    borderRadius: "20px"
  },
  paginationButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#000"
  },
  paginationButtonDisabled: {
    cursor: "not-allowed",
    color: "#ccc"
  },
  pageIndexText: {
    fontSize: 10
  },
  typeButtonsContainer: {
    display: "flex",
    gap: "8px",
    marginBottom: "24px",
    flexWrap: "wrap"
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
    transition: "all 0.2s ease"
  },
  typeButtonSelected: {
    backgroundColor: "#1178FF",
    borderColor: "#1178FF",
    color: "white"
  },
  insertButton: {
    width: "100%",
    height: "37px",
    fontSize: "14px",
    fontFamily: "Avenir Next",
    fontWeight: "600",
    padding: "0",
    backgroundColor: "#1178FF",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    boxSizing: "border-box"
  },
  insertButtonDisabled: {
    backgroundColor: "#CCCCCC",
    cursor: "not-allowed"
  },
  errorMessage: {
    color: "#dc3545",
    backgroundColor: "#f8d7da",
    border: "1px solid #f5c6cb",
    padding: "8px 12px",
    borderRadius: "4px",
    textAlign: "center",
    marginTop: "12px",
    fontSize: "12px"
  }
};
const TextWarpPage = ({
  sandboxProxy,
  text,
  fontUrl,
  lineHeight,
  letterSpacing,
  alignment
}) => {
  const [warpType, setWarpType] = useState("wave");
  const [intensity, setIntensity] = useState(50);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [svgPath, setSvgPath] = useState("");
  const [pathBounds, setPathBounds] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const shapeGroups = [{
    label: "Arc",
    types: ["bulgeUp", "bulgeDown", "bulgeBoth"]
  }, {
    label: "Wave",
    types: ["wave"]
  }, {
    label: "Flag",
    types: ["flag"]
  }, {
    label: "Bridge",
    types: ["arcLower", "arcUpper"]
  }, {
    label: "Hill",
    types: ["triangleUpper", "triangleLower"]
  }, {
    label: "Pit",
    types: ["concaveTop", "concaveBottom"]
  }, {
    label: "Curtain",
    types: ["slantDownRight", "slantDownLeft"]
  }, {
    label: "Other",
    types: ["envelopeWave", "bouquet"]
  }];
  const getSliderBackground = intensity => `linear-gradient(to right, #1178FF 0%, #1178FF ${intensity}%, #ffffff ${intensity}%, #ffffff 100%)`;
  const pageSize = 3;
  const totalPages = Math.ceil(shapeGroups.length / pageSize);
  const currentGroups = shapeGroups.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
  const selectedGroup = shapeGroups.find(group => group.types.includes(warpType)) || shapeGroups[0];
  const relatedTypes = selectedGroup.types;
  const calculatePathBounds = commands => {
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    commands.forEach(cmd => {
      const pts = [];
      if ("x" in cmd && "y" in cmd) pts.push({
        x: cmd.x,
        y: cmd.y
      });
      if ("x1" in cmd && "y1" in cmd) pts.push({
        x: cmd.x1,
        y: cmd.y1
      });
      if ("x2" in cmd && "y2" in cmd) pts.push({
        x: cmd.x2,
        y: cmd.y2
      });
      pts.forEach(p => {
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
      height: maxY - minY
    };
  };
  useEffect(() => {
    if (!text || !opentype) return;
    opentype.load(fontUrl, (err, font) => {
      if (err || !font) {
        setError("字体加载失败");
        return;
      }
      const fontSize = 120;
      const scale = fontSize / font.unitsPerEm;
      const baselineY = fontSize * 0.8;
      const actualLineHeight = fontSize * lineHeight;
      const lines = text.split("\n").filter(line => line.trim());
      let allCommands = [],
        maxLineWidth = 0;
      const lineInfos = lines.map((line, i) => {
        const glyphs = font.stringToGlyphs(line);
        const widths = glyphs.map(g => g.advanceWidth * scale);
        const lineWidth = widths.reduce((a, b) => a + b, 0) + (glyphs.length - 1) * letterSpacing;
        maxLineWidth = Math.max(maxLineWidth, lineWidth);
        return {
          glyphs,
          widths,
          lineWidth,
          y: baselineY + i * actualLineHeight
        };
      });
      const warpFn = getWarpFunction(warpType);
      const totalHeight = (lines.length - 1) * actualLineHeight + fontSize;
      const centerY = baselineY + (lines.length - 1) * actualLineHeight / 2;
      const centerX = maxLineWidth / 2;
      const overallTopY = baselineY - fontSize * 0.7;
      const overallBottomY = baselineY + (lines.length - 1) * actualLineHeight + fontSize * 0.2;
      const textMetrics = {
        baseline: centerY,
        ascender: centerY - totalHeight / 2,
        descender: centerY + totalHeight / 2,
        yMax: overallTopY,
        yMin: overallBottomY
      };
      lineInfos.forEach(({
        glyphs,
        lineWidth,
        y
      }) => {
        let x = (maxLineWidth - lineWidth) / 2;
        glyphs.forEach(g => {
          const path = g.getPath(x, y, fontSize);
          path.commands.forEach(cmd => {
            const copy = {
              ...cmd
            };
            ["", "1", "2"].forEach(suffix => {
              const xKey = "x" + suffix;
              const yKey = "y" + suffix;
              if (xKey in copy && yKey in copy) {
                const warped = warpFn(copy[xKey], copy[yKey], maxLineWidth, centerX, intensity, textMetrics);
                copy[xKey] = warped.x;
                copy[yKey] = warped.y;
              }
            });
            allCommands.push(copy);
          });
          x += g.advanceWidth * scale + letterSpacing;
        });
      });
      const d = allCommands.map(c => {
        if (c.type === "M") return `M ${c.x} ${c.y}`;
        if (c.type === "L") return `L ${c.x} ${c.y}`;
        if (c.type === "C") return `C ${c.x1} ${c.y1}, ${c.x2} ${c.y2}, ${c.x} ${c.y}`;
        if (c.type === "Q") return `Q ${c.x1} ${c.y1}, ${c.x} ${c.y}`;
        if (c.type === "Z") return "Z";
        return "";
      }).join(" ");
      setSvgPath(d);
      setPathBounds(calculatePathBounds(allCommands));
    });
  }, [text, fontUrl, warpType, intensity, lineHeight, letterSpacing, alignment]);
  const handleInsert = async () => {
    if (!svgPath || !sandboxProxy) return;
    setIsLoading(true);
    try {
      const result = await sandboxProxy.insertWarpedSVG({
        d: svgPath,
        bounds: pathBounds,
        originalText: text,
        warpType,
        intensity
      });
      if (!result.success) throw new Error(result.error);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    style: styles.container
  }, /*#__PURE__*/React.createElement("label", {
    style: styles.label
  }, "Preview"), /*#__PURE__*/React.createElement("div", {
    style: styles.previewContainer
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: pathBounds ? `${pathBounds.minX - 20} ${pathBounds.minY - 20} ${pathBounds.width + 40} ${pathBounds.height + 40}` : "0 0 1000 300",
    style: styles.svg
  }, /*#__PURE__*/React.createElement("path", {
    d: svgPath,
    fill: "#06001A",
    stroke: "none"
  }))), /*#__PURE__*/React.createElement("div", {
    style: styles.controlSection
  }, /*#__PURE__*/React.createElement("label", {
    style: styles.label
  }, "Shape"), /*#__PURE__*/React.createElement("div", {
    style: styles.paginationWrapper
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setPageIndex(p => Math.max(p - 1, 0)),
    disabled: pageIndex === 0,
    style: {
      ...styles.paginationButton,
      ...(pageIndex === 0 ? styles.paginationButtonDisabled : {})
    }
  }, "<"), /*#__PURE__*/React.createElement("span", {
    style: styles.pageIndexText
  }, pageIndex + 1), /*#__PURE__*/React.createElement("button", {
    onClick: () => setPageIndex(p => Math.min(p + 1, totalPages - 1)),
    disabled: pageIndex === totalPages - 1,
    style: {
      ...styles.paginationButton,
      ...(pageIndex === totalPages - 1 ? styles.paginationButtonDisabled : {})
    }
  }, ">"))), /*#__PURE__*/React.createElement("div", {
    style: styles.gridContainer
  }, currentGroups.map(group => /*#__PURE__*/React.createElement("button", {
    key: group.label,
    onClick: () => {
      setWarpType(group.types[0]);
    },
    style: {
      ...styles.effectButton,
      ...(warpType === group.types[0] ? styles.effectButtonSelected : {})
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: styles.effectIcon
  }, /*#__PURE__*/React.createElement("img", {
    src: `./icon/${group.types[0]}.png`,
    alt: group.label
  })), /*#__PURE__*/React.createElement("div", {
    style: styles.effectLabel
  }, group.label)))), /*#__PURE__*/React.createElement("label", {
    style: styles.label
  }, "Type"), /*#__PURE__*/React.createElement("div", {
    style: styles.typeButtonsContainer
  }, relatedTypes.map(typeKey => {
    const type = effectsList.find(e => e.key === typeKey);
    return /*#__PURE__*/React.createElement("button", {
      key: typeKey,
      onClick: () => setWarpType(typeKey),
      style: {
        ...styles.effectButton,
        ...(warpType === typeKey ? styles.effectButtonSelected : {})
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: styles.effectIcon
    }, /*#__PURE__*/React.createElement("img", {
      src: `./icon/${typeKey}.png`,
      alt: type?.label || typeKey
    })));
  })), /*#__PURE__*/React.createElement("div", {
    style: styles.sliderContainer
  }, /*#__PURE__*/React.createElement("span", {
    style: styles.sliderIcon
  }, "Bend"), /*#__PURE__*/React.createElement("span", {
    style: styles.sliderValue
  }, intensity), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "0",
    max: "100",
    value: intensity,
    onChange: e => setIntensity(Number(e.target.value)),
    style: {
      ...styles.slider,
      background: getSliderBackground(intensity)
    }
  })), /*#__PURE__*/React.createElement("button", {
    onClick: handleInsert,
    disabled: isLoading || !svgPath,
    style: styles.insertButton
  }, isLoading ? "插入中..." : "Add to design"), error && /*#__PURE__*/React.createElement("div", {
    style: styles.errorMessage
  }, error));
};
export default TextWarpPage;