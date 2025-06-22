import React, { useRef, useState, useEffect } from 'react';
import opentype from 'opentype.js';

// import * as Warp from '../../../lib/warp.js';

const SMUDGE_RADIUS = 100;
const SMUDGE_STRENGTH = 0.33;
const Warp = window.Warp;
export default function Smudge({
  sandboxProxy
}) {
  const textInputRef = useRef();
  const svgRef = useRef();
  const warpRef = useRef();
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const lastMouseX = useRef(null);
  const lastMouseY = useRef(null);
  const touchPoints = useRef({});
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [text, setText] = useState(null);
  const WarpRef = useRef(null);
  useEffect(() => {
    if (typeof Warp !== 'undefined') {
      // Initialize anything that depends on Warp
    } else {
      console.warn('Warp.js not loaded yet');
    }
  }, []);
  useEffect(() => {
    // Trigger text generation after SVG is rendered
    if (svgRef.current && text) {
      generateTextPath(text);
    }
  }, [svgRef.current]);

  // Generate SVG path from text
  const generateTextPath = text => {
    setIsGenerating(true);
    opentype.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/135636/FiraSansExtraCondensed-Black.ttf', (err, font) => {
      if (err) {
        console.error('Font could not be loaded:', err);
        setIsGenerating(false);
        return;
      }

      // Get SVG dimensions
      const svgWidth = svgRef.current.clientWidth;
      const svgHeight = svgRef.current.clientHeight;

      // Calculate text width
      const fontSize = 100;
      const textWidth = font.getAdvanceWidth(text, fontSize);

      // Calculate centered position
      const x = (svgWidth - textWidth) / 2;
      const y = svgHeight / 2 + fontSize / 3; // Adjust vertical position

      // Generate path at calculated position
      const pathData = font.getPath(text, x, y, fontSize).toSVG(3);
      svgRef.current.innerHTML = pathData;

      // Initialize Warp with the new path
      const warp = new Warp(svgRef.current);
      warpRef.current = warp;
      warpRef.current.interpolate(10);

      // Reset mouse tracking
      lastMouseX.current = null;
      lastMouseY.current = null;
      setIsGenerating(false);
    });
  };
  const handleSubmit = e => {
    e.preventDefault();
    generateTextPath(e.target.value);
  };

  // Smudge effect factory
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

  // Mouse handlers
  const handleMouseDown = e => {
    if (!svgRef.current) return;
    setIsMouseDown(true);

    // Initialize positions
    const rect = svgRef.current.getBoundingClientRect();
    mouseX.current = e.clientX;
    mouseY.current = e.clientY;
    lastMouseX.current = e.clientX;
    lastMouseY.current = e.clientY;
  };
  const handleMouseMove = e => {
    if (!isMouseDown || !warpRef.current) return;

    // Update positions
    lastMouseX.current = mouseX.current;
    lastMouseY.current = mouseY.current;
    mouseX.current = e.clientX;
    mouseY.current = e.clientY;
    requestAnimationFrame(applySmudge);
  };
  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  // Touch handlers
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

  // Cleanup touch points
  const handleTouchEnd = e => {
    setIsMouseDown(false);
    Array.from(e.changedTouches).forEach(touch => {
      delete touchPoints.current[touch.identifier];
    });
  };

  // Set up event listeners
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
  }), /*#__PURE__*/React.createElement("div", null, "Text"), /*#__PURE__*/React.createElement("input", {
    style: {
      color: 'black',
      border: '1px solid black'
    },
    type: "text",
    value: text,
    onChange: e => {
      setText(e.target.value);
      handleSubmit(e);
    },
    id: "text-input",
    required: true
  }));
}