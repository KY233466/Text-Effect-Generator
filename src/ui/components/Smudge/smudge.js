import React, { useRef, useState, useEffect } from 'react';
import opentype from 'opentype.js';
const SMUDGE_RADIUS = 100;
const SMUDGE_STRENGTH = 0.33;
const Warp = window.Warp;
export default function Smudge({
  sandboxProxy,
  pathBounds,
  setPathBounds,
  text,
  svgPath,
  setSvgPath,
  isLoading,
  setIsLoading,
  error,
  setError
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
  }, [text]);
  const generateTextPath = () => {
    opentype.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/135636/FiraSansExtraCondensed-Black.ttf', (err, font) => {
      if (err) {
        console.error('Font could not be loaded:', err);
        return;
      }
      const svgWidth = svgRef.current.clientWidth;
      const svgHeight = svgRef.current.clientHeight;
      const fontSize = 100;
      const textWidth = font.getAdvanceWidth(text, fontSize);
      const x = (svgWidth - textWidth) / 2;
      const y = svgHeight / 2 + fontSize / 3;
      const path = font.getPath(text, x, y, fontSize);
      const commands = path.commands;
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

      // Create <path> manually
      svgRef.current.innerHTML = '';
      const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pathEl.setAttribute('d', d);
      pathEl.setAttribute('fill', 'hotpink');
      pathEl.setAttribute('stroke', 'none');
      svgRef.current.appendChild(pathEl);
      pathRef.current = pathEl;

      // Initialize Warp
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
    const rect = svgRef.current.getBoundingClientRect();
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
  const applySmudge = () => {
    if (!svgRef.current || !warpRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    warpRef.current.transform(smudgeFactory(lastMouseX.current - rect.left, lastMouseY.current - rect.top, mouseX.current - rect.left, mouseY.current - rect.top, SMUDGE_RADIUS, SMUDGE_STRENGTH));
  };
  const applyTouchSmudge = () => {
    if (!svgRef.current || !warpRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    Object.values(touchPoints.current).forEach(point => {
      warpRef.current.transform(smudgeFactory(point.lastX - rect.left, point.lastY - rect.top, point.x - rect.left, point.y - rect.top, SMUDGE_RADIUS, SMUDGE_STRENGTH));
    });
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", null, "Preview"), /*#__PURE__*/React.createElement("svg", {
    ref: svgRef,
    width: "100%",
    height: "200",
    viewBox: "0 0 600 200",
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