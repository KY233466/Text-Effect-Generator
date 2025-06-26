import React, { useEffect, useState } from "react";
import { effectsList, getWarpFunction } from "../shapes/index.js";
import opentype from "opentype.js";

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

  const currentPageEffects = currentGroups;

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
        setError("字体加载失败");
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

      const textMetrics = {
        baseline: centerY,
        ascender: centerY - totalHeight / 2,
        descender: centerY + totalHeight / 2,
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
    <div style={{ backgroundColor: "#FFFFFF" }}>
      <label
        style={{ fontWeight: "bold", marginBottom: "10px", display: "block" }}
      >
        Preview
      </label>
      <div
        style={{
          width: "100%",
          height: "240px",
          border: "1px solid #1178FF",
          borderRadius: "10px",
          marginBottom: "32px",
        }}
      >
        <svg
          viewBox={
            pathBounds
              ? `${pathBounds.minX - 20} ${pathBounds.minY - 20} ${
                  pathBounds.width + 40
                } ${pathBounds.height + 40}`
              : "0 0 1000 300"
          }
          width="100%"
          height="100%"
        >
          <path d={svgPath} fill="#06001A" stroke="none" />
        </svg>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <label
          style={{ fontWeight: "bold", display: "block", marginBottom: "8px" }}
        >
          Shape
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1px",
                padding: "2px",
                backgroundColor: "#F0F0F0",
                borderRadius: "20px",
              }}
            >
              <button
                onClick={() => setPageIndex((p) => Math.max(p - 1, 0))}
                disabled={pageIndex === 0}
                style={{
                  background: "none",
                  border: "none",
                  cursor: pageIndex === 0 ? "not-allowed" : "pointer",
                  color: pageIndex === 0 ? "#ccc" : "#000",
                }}
              >
                &lt;
              </button>
              <span style={{ fontSize: 10 }}>{pageIndex + 1}</span>
              <button
                onClick={() =>
                  setPageIndex((p) => Math.min(p + 1, totalPages - 1))
                }
                disabled={pageIndex === totalPages - 1}
                style={{
                  background: "none",
                  border: "none",
                  cursor:
                    pageIndex === totalPages - 1 ? "not-allowed" : "pointer",
                  color: pageIndex === totalPages - 1 ? "#ccc" : "#000",
                }}
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
        }}
      >
        <div style={{ display: "flex", gap: "12px" }}>
          {currentGroups.map((group) => (
            <button
              key={group.label}
              onClick={() => {
                setWarpType(group.types[0]);
              }}
              style={{
                width: "85px",
                height: "86px",
                border:
                  selectedGroup.label === group.label
                    ? "2px solid #1178FF"
                    : "1px solid #ccc",
                borderRadius: "8px",
                backgroundColor:
                  selectedGroup.label === group.label ? "#EBF3FE" : "#fff",
                fontSize: "12px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "8px",
              }}
            >
              <div
                style={{
                  flexGrow: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img src={`./icon/${group.types[0]}.png`} alt={group.label} />
              </div>
              <div style={{ textAlign: "center", marginTop: "2px" }}>
                {group.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      <label
        style={{ fontWeight: "bold", display: "block", marginBottom: "8px" }}
      >
        Type
      </label>
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        {relatedTypes.map((typeKey) => {
          const type = effectsList.find((e) => e.key === typeKey);
          return (
            <button
              key={typeKey}
              onClick={() => setWarpType(typeKey)}
              style={{
                width: "85px",
                height: "86px",
                border:
                  warpType === typeKey ? "2px solid #1178FF" : "1px solid #ccc",
                borderRadius: "8px",
                backgroundColor: warpType === typeKey ? "#EBF3FE" : "#fff",
                fontSize: "12px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: "8px",
              }}
            >
              <div
                style={{
                  flexGrow: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={`./icon/${typeKey}.png`}
                  alt={type?.label || typeKey}
                />
              </div>
            </button>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "8px 12px",
          backgroundColor: "#EBF3FE",
          borderRadius: "12px",
          marginBottom: "32px",
        }}
      >
        <span style={{ fontSize: "14px", color: "#06001A" }}>
          Bend {intensity}
        </span>
        <input
          type="range"
          min="0"
          max="100"
          value={intensity}
          onChange={(e) => setIntensity(Number(e.target.value))}
          style={{ flexGrow: 1 }}
        />
      </div>

      <button
        onClick={handleInsert}
        disabled={isLoading || !svgPath}
        style={{
          width: "100%",
          padding: "10px 0",
          fontSize: "14px",
          backgroundColor: "#1178FF",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        {isLoading ? "插入中..." : "Add to design"}
      </button>
    </div>
  );
};

export default TextWarpPage;
