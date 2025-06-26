import React, { useRef, useState, useEffect } from 'react';
import opentype from 'opentype.js';
const Warp = window.Warp;
const styles = {
  svgControl: {
    border: '1px solid #CBE2FF',
    borderRadius: '10px',
    overflow: 'visible',
    position: 'absolute',
    pointerEvents: 'none'
  },
  svg: {
    border: '1px solid #CBE2FF',
    borderRadius: '10px',
    overflow: 'visible'
  }
};
export default function Mesh({
  setPathBounds,
  text,
  setSvgPath,
  fontUrl,
  lineHeight,
  letterSpacing,
  alignment,
  calculatePathBounds
}) {
  const svgRef = useRef();
  const pathRef = useRef();
  const svgControlRef = useRef();
  const controlPathRef = useRef();
  const controlCirclesRef = useRef([]);
  const warpRef = useRef();
  const controlPointsRef = useRef([]);
  const [dragIndex, setDragIndex] = useState(null);
  useEffect(() => {
    if (!svgRef.current) return;
    if (text === "") {
      svgRef.current.innerHTML = "";
      if (controlPathRef.current) controlPathRef.current.setAttribute("d", "");
      setSvgPath("");
      setPathBounds(null);
      return;
    }
    generateTextPath();
  }, [text, fontUrl, lineHeight, letterSpacing, alignment]);
  const generateTextPath = () => {
    opentype.load(fontUrl, (err, font) => {
      if (err) {
        console.error('Font could not be loaded:', err);
        return;
      }
      const lines = text.split('\n').filter(line => line.trim());
      const fontSize = 100;
      const scale = fontSize / font.unitsPerEm;
      const baselineY = fontSize * 0.8;
      const actualLineHeight = fontSize * lineHeight;
      let commands = [];
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
      lineInfos.forEach(({
        glyphs,
        glyphWidths,
        lineWidth,
        y
      }) => {
        let x = alignment === 'left' ? 0 : alignment === 'right' ? maxLineWidth - lineWidth : (maxLineWidth - lineWidth) / 2;
        glyphs.forEach((g, i) => {
          const glyphPath = g.getPath(x, y, fontSize);
          commands.push(...glyphPath.commands);
          x += glyphWidths[i] + letterSpacing;
        });
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
      const bounds = calculatePathBounds(commands);
      setPathBounds(bounds);
      svgRef.current.innerHTML = '';
      const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pathEl.setAttribute('d', d);
      pathEl.setAttribute('fill', 'black');
      pathEl.setAttribute('stroke', 'none');
      svgRef.current.appendChild(pathEl);
      pathRef.current = pathEl;
      const pathBox = svgRef.current.querySelector('path');
      const box = pathBox.getBBox();
      const {
        x,
        y,
        width: w,
        height: h
      } = box;
      const rect = svgControlRef.current.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      let initialControlPoints = [[x, y], [x, y + h], [(x + w) * 0.25, y + h], [(x + w) * 0.75, y + h], [x + w, y + h], [x + w, y], [x + w * 0.4, y]];
      const buffer = 0.1;
      initialControlPoints = initialControlPoints.map(([cx, cy]) => [cx === x ? cx - buffer : cx === x + w ? cx + buffer : cx, cy === y ? cy - buffer : cy === y + h ? cy + buffer : cy]);
      const c = (width - 40) / 520;
      const xShift = 20;
      const yShift = 50;
      const customControlPoints = [[20 * c + xShift, 5 * c + yShift], [5 * c + xShift, 120 * c + yShift], [80 * c + xShift, 210 * c + yShift], [350 * c + xShift, 160 * c + yShift], [520 * c + xShift, 180 * c + yShift], [450 * c + xShift, 20 * c + yShift], [200 * c + xShift, 80 * c + yShift]];
      controlPointsRef.current = customControlPoints;
      const warp = new Warp(svgRef.current);
      warp.interpolate(4);
      warpRef.current = warp;
      warp.transform((v0, V = initialControlPoints) => {
        const A = [],
          W = [],
          L = [];
        for (let i = 0; i < V.length; i++) {
          const j = (i + 1) % V.length;
          const vi = V[i],
            vj = V[j];
          const r0i = Math.hypot(v0[0] - vi[0], v0[1] - vi[1]);
          const r0j = Math.hypot(v0[0] - vj[0], v0[1] - vj[1]);
          const rij = Math.hypot(vi[0] - vj[0], vi[1] - vj[1]);
          const dn = 2 * r0i * r0j;
          const r = (r0i ** 2 + r0j ** 2 - rij ** 2) / dn;
          A[i] = isNaN(r) ? 0 : Math.acos(Math.max(-1, Math.min(r, 1)));
        }
        for (let j = 0; j < V.length; j++) {
          const i = (j > 0 ? j : V.length) - 1;
          const vi = V[i],
            vj = V[j];
          const r = Math.hypot(vj[0] - v0[0], vj[1] - v0[1]);
          W[j] = (Math.tan(A[i] / 2) + Math.tan(A[j] / 2)) / r;
        }
        const sum = W.reduce((a, b) => a + b, 0);
        for (let i = 0; i < V.length; i++) L[i] = W[i] / sum;
        return [...v0, ...L];
      });
      warp.transform(reposition);
      const newD = pathRef.current?.getAttribute('d');
      if (newD) setSvgPath(newD);
      drawControlShape();
    });
  };
  const reposition = ([x, y, ...W], V = controlPointsRef.current) => {
    let nx = 0,
      ny = 0;
    for (let i = 0; i < V.length; i++) {
      nx += W[i] * V[i][0];
      ny += W[i] * V[i][1];
    }
    return [nx, ny, ...W];
  };
  const drawControlShape = (element = controlPathRef.current, V = controlPointsRef.current) => {
    const d = ['M' + V[0].join(' ')];
    for (let i = 1; i < V.length; i++) d.push('L' + V[i].join(' '));
    d.push('Z');
    element.setAttribute('d', d.join(''));
    if (controlCirclesRef.current.length) {
      controlCirclesRef.current.forEach((circle, i) => {
        if (circle) {
          circle.setAttribute('cx', V[i][0]);
          circle.setAttribute('cy', V[i][1]);
        }
      });
    }
  };
  const handleMouseDown = index => e => {
    e.preventDefault();
    setDragIndex(index);
  };
  const handleMouseMove = e => {
    if (dragIndex === null) return;
    const svgRect = svgControlRef.current.getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    const y = e.clientY - svgRect.top;
    controlPointsRef.current[dragIndex] = [x, y];
    drawControlShape();
    warpRef.current.transform(reposition);
  };
  const handleMouseUp = () => {
    if (pathRef.current) {
      const updatedD = svgRef.current.querySelector('path')?.getAttribute('d');
      if (updatedD) {
        setSvgPath(updatedD);
      }
    }
    setDragIndex(null);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      position: 'relative',
      overflow: 'hidden',
      marginBottom: '20px'
    },
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    ref: svgControlRef,
    id: "svg-control",
    width: "100%",
    height: "200",
    style: styles.svgControl
  }, /*#__PURE__*/React.createElement("path", {
    ref: controlPathRef,
    id: "control-path",
    fill: "none",
    stroke: "#1178FF",
    strokeWidth: "1px"
  }), text != "" && Array.from({
    length: 7
  }).map((_, i) => /*#__PURE__*/React.createElement("circle", {
    key: i,
    ref: el => controlCirclesRef.current[i] = el,
    r: "5",
    fill: "blue",
    stroke: "white",
    strokeWidth: "1",
    onMouseDown: handleMouseDown(i),
    style: {
      cursor: 'grab',
      pointerEvents: 'all'
    }
  }))), /*#__PURE__*/React.createElement("svg", {
    ref: svgRef,
    id: "svg-element",
    width: "100%",
    height: "200",
    style: styles.svg
  })));
}