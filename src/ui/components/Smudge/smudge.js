import React, { useRef, useState, useEffect } from 'react';
import opentype from 'opentype.js';
const SMUDGE_RADIUS = 100;
const SMUDGE_STRENGTH = 0.33;
const Warp = window.Warp;
export default function Smudge({
  pathBounds,
  setPathBounds,
  text,
  setSvgPath,
  fontUrl,
  lineHeight,
  letterSpacing,
  alignment
}) {
  const svgRef = useRef();
  const pathRef = useRef();
  const warpRef = useRef();
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const lastMouseX = useRef(null);
  const lastMouseY = useRef(null);
  const touchPoints = useRef({});
  const [isMouseDown, setIsMouseDown] = useState(false);
  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, []);
  useEffect(() => {
    if (svgRef.current && text) {
      generateTextPath();
    }
  }, [text, fontUrl, lineHeight, letterSpacing, alignment]);
  const generateTextPath = () => {
    opentype.load(fontUrl, (err, font) => {
      if (err) {
        console.error('Font could not be loaded:', err);
        return;
      }
      const fontSize = 100;
      const scale = fontSize / font.unitsPerEm;
      const baselineY = fontSize * 0.8;
      const actualLineHeight = fontSize * lineHeight;
      const lines = text.split('\n');
      const allCommands = [];
      let maxLineWidth = 0;
      const lineInfos = lines.map((line, i) => {
        const glyphs = font.stringToGlyphs(line);
        const glyphWidths = glyphs.map(g => g.advanceWidth * scale);
        const lineWidth = glyphWidths.reduce((a, b) => a + b, 0) + (glyphs.length - 1) * letterSpacing;
        maxLineWidth = Math.max(maxLineWidth, lineWidth);
        return {
          glyphs,
          glyphWidths,
          lineWidth,
          y: baselineY + i * actualLineHeight
        };
      });
      lineInfos.forEach(lineInfo => {
        let x;
        if (alignment === 'left') {
          x = 0;
        } else if (alignment === 'center') {
          x = (maxLineWidth - lineInfo.lineWidth) / 2;
        } else if (alignment === 'right') {
          x = maxLineWidth - lineInfo.lineWidth;
        } else {
          x = 0;
        }
        lineInfo.glyphs.forEach((glyph, j) => {
          const path = glyph.getPath(x, lineInfo.y, fontSize);
          allCommands.push(...path.commands);
          x += lineInfo.glyphWidths[j] + letterSpacing;
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
      setSvgPath(d);
      const bounds = calculatePathBounds(allCommands);
      setPathBounds(bounds);
      svgRef.current.innerHTML = '';
      const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pathEl.setAttribute('d', d);
      pathEl.setAttribute('fill', 'hotpink');
      pathEl.setAttribute('stroke', 'none');
      svgRef.current.appendChild(pathEl);
      pathRef.current = pathEl;
      const warp = new Warp(svgRef.current);
      warpRef.current = warp;
      warpRef.current.interpolate(10);
      lastMouseX.current = null;
      lastMouseY.current = null;
    });
  };
  const calculatePathBounds = commands => {
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
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
    return {
      minX,
      maxX,
      minY,
      maxY,
      width: maxX - minX,
      height: maxY - minY
    };
  };
  const smudgeFactory = (startX, startY, endX, endY, radius, strength) => {
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    return ([x, y]) => {
      const distX = endX - x;
      const distY = endY - y;
      const dist = Math.sqrt(distX ** 2 + distY ** 2);
      if (dist <= radius) {
        x += strength * deltaX * (radius - dist) / radius;
        y += strength * deltaY * (radius - dist) / radius;
      }
      return [x, y];
    };
  };
  const handleMouseDown = e => {
    if (!svgRef.current) return;
    setIsMouseDown(true);
    mouseX.current = e.clientX;
    mouseY.current = e.clientY;
    lastMouseX.current = e.clientX;
    lastMouseY.current = e.clientY;
  };
  const handleMouseMove = e => {
    if (!isMouseDown || !warpRef.current) return;
    lastMouseX.current = mouseX.current;
    lastMouseY.current = mouseY.current;
    mouseX.current = e.clientX;
    mouseY.current = e.clientY;
    requestAnimationFrame(applySmudge);
  };
  const handleMouseUp = () => {
    setIsMouseDown(false);
    if (pathRef.current) {
      const updatedD = pathRef.current.getAttribute('d');
      if (updatedD) setSvgPath(updatedD);
    }
  };
  const handleTouchStart = e => {
    setIsMouseDown(true);
    Array.from(e.changedTouches).forEach(touch => {
      touchPoints.current[touch.identifier] = {
        lastX: touch.clientX,
        lastY: touch.clientY,
        x: touch.clientX,
        y: touch.clientY
      };
    });
  };
  const handleTouchMove = e => {
    if (!isMouseDown || !warpRef.current) return;
    Array.from(e.changedTouches).forEach(touch => {
      const point = touchPoints.current[touch.identifier];
      if (point) {
        point.lastX = point.x;
        point.lastY = point.y;
        point.x = touch.clientX;
        point.y = touch.clientY;
      }
    });
    requestAnimationFrame(applyTouchSmudge);
  };
  const handleTouchEnd = e => {
    setIsMouseDown(false);
    Array.from(e.changedTouches).forEach(touch => {
      delete touchPoints.current[touch.identifier];
    });
    if (pathRef.current) {
      const updatedD = pathRef.current.getAttribute('d');
      if (updatedD) setSvgPath(updatedD);
    }
  };
  const getSVGCoordinates = (clientX, clientY) => {
    const pt = svgRef.current.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    return pt.matrixTransform(svgRef.current.getScreenCTM().inverse());
  };
  const applySmudge = () => {
    if (!svgRef.current || !warpRef.current) return;
    const start = getSVGCoordinates(lastMouseX.current, lastMouseY.current);
    const end = getSVGCoordinates(mouseX.current, mouseY.current);
    warpRef.current.transform(smudgeFactory(start.x, start.y, end.x, end.y, SMUDGE_RADIUS, SMUDGE_STRENGTH));
  };
  const applyTouchSmudge = () => {
    if (!svgRef.current || !warpRef.current) return;
    Object.values(touchPoints.current).forEach(point => {
      const start = getSVGCoordinates(point.lastX, point.lastY);
      const end = getSVGCoordinates(point.x, point.y);
      warpRef.current.transform(smudgeFactory(start.x, start.y, end.x, end.y, SMUDGE_RADIUS, SMUDGE_STRENGTH));
    });
  };
  return /*#__PURE__*/React.createElement("div", {
    styles: {
      marginBottom: '20px'
    }
  }, /*#__PURE__*/React.createElement("div", null, "Preview"), /*#__PURE__*/React.createElement("svg", {
    ref: svgRef,
    width: "100%",
    height: "200",
    viewBox: pathBounds ? `${pathBounds.minX - 20} ${pathBounds.minY - 20} ${pathBounds.width + 40} ${pathBounds.height + 40}` : '0 0 600 200',
    preserveAspectRatio: "xMidYMid meet",
    style: {
      border: '1px solid #C7C7C7',
      borderRadius: '10px',
      backgroundColor: 'white',
      cursor: isMouseDown ? 'grabbing' : 'grab'
    },
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove
  }));
}