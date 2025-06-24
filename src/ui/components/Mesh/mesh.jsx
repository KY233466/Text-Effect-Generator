import React, { useRef, useState, useEffect } from 'react';
import opentype from 'opentype.js';

const Warp = window.Warp;

export default function Mesh({ 
  sandboxProxy, 
  pathBounds,
  setPathBounds,
  text,
  svgPath,
  setSvgPath }) {
  const svgRef = useRef();
  const pathRef = useRef();
  const svgControlRef = useRef();
  const controlPathRef = useRef();
  const controlCirclesRef = useRef([]);
  const warpRef = useRef();
  const controlPointsRef = useRef([]);
  const [dragIndex, setDragIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
  }, [text]);

  const generateTextPath = () => {
    opentype.load(
      'https://s3-us-west-2.amazonaws.com/s.cdpn.io/135636/FiraSansExtraCondensed-Black.ttf',
      (err, font) => {
        if (err) {
          console.error('Font could not be loaded:', err);
          return;
        }

        const svgWidth = svgRef.current.clientWidth;
        const svgHeight = svgRef.current.clientHeight;
        const fontSize = 100;
        const textWidth = font.getAdvanceWidth(text, fontSize);
        const xSvg = (svgWidth - textWidth) / 2;
        const ySvg = svgHeight / 2 + fontSize / 3;

        // const path = font.getPath(text, xSvg, ySvg, fontSize);

        console.log("curr Text", text);
        const path = font.getPath(text, 0, 100, fontSize);
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

        const pathBox = svgRef.current.querySelector('path');
        const box = pathBox.getBBox();
        const { x, y, width: w, height: h } = box;

        const rect = svgControlRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        // 1. FIRST CREATE RECTANGULAR CONTROL POINTS (BOUNDING BOX)
        let initialControlPoints = [
          [x, y],
          [x, y + h],
          [(x + w) * 0.25, y + h],
          [(x + w) * 0.75, y + h],
          [x + w, y + h],
          [x + w, y],
          [x + w * 0.4, y],
        ];

        // Apply buffer to avoid zero distances
        const buffer = 0.1;
        initialControlPoints = initialControlPoints.map(([cx, cy]) => [
          cx === x ? cx - buffer : cx === x + w ? cx + buffer : cx,
          cy === y ? cy - buffer : cy === y + h ? cy + buffer : cy,
        ]);

        const c = (width - 40) / 520;
        const xShift = 20;
        const yShift = 50;

        // 2. SET CUSTOM CONTROL POINTS (THE ONES YOU WANT TO SHOW/DRAG)
        const customControlPoints = [
          [20 * c + xShift, 5 * c + yShift],
          [5 * c + xShift, 120 * c + yShift],
          [80 * c + xShift, 210 * c + yShift],
          [350 * c + xShift, 160 * c + yShift],
          [520 * c + xShift, 180 * c + yShift],
          [450 * c + xShift, 20 * c + yShift],
          [200 * c + xShift, 80 * c + yShift],
        ];
        
        controlPointsRef.current = customControlPoints;

        const warp = new Warp(svgRef.current);

        warp.interpolate(4);
        warpRef.current = warp;

        // 3. CALCULATE WEIGHTS USING RECTANGULAR POINTS
        warp.transform((v0, V = initialControlPoints) => {
          const A = [], W = [], L = [];

          for (let i = 0; i < V.length; i++) {
            const j = (i + 1) % V.length;
            const vi = V[i], vj = V[j];
            const r0i = Math.hypot(v0[0] - vi[0], v0[1] - vi[1]);
            const r0j = Math.hypot(v0[0] - vj[0], v0[1] - vj[1]);
            const rij = Math.hypot(vi[0] - vj[0], vi[1] - vj[1]);
            const dn = 2 * r0i * r0j;
            const r = (r0i ** 2 + r0j ** 2 - rij ** 2) / dn;
            A[i] = isNaN(r) ? 0 : Math.acos(Math.max(-1, Math.min(r, 1)));
          }

          for (let j = 0; j < V.length; j++) {
            const i = (j > 0 ? j : V.length) - 1;
            const vi = V[i], vj = V[j];
            const r = Math.hypot(vj[0] - v0[0], vj[1] - v0[1]);
            W[j] = (Math.tan(A[i] / 2) + Math.tan(A[j] / 2)) / r;
          }

          const sum = W.reduce((a, b) => a + b, 0);
          for (let i = 0; i < V.length; i++) L[i] = W[i] / sum;
          return [...v0, ...L];
        });

        // 4. APPLY CUSTOM SHAPE USING THE WEIGHTS
        warp.transform(reposition);

        const newD = pathRef.current?.getAttribute('d');
        if (newD) setSvgPath(newD);

        // 5. DRAW THE CUSTOM CONTROL SHAPE
        drawControlShape();
      }
    );
  };

  const calculatePathBounds = (commands) => {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
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
    return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
  };

  const reposition = ([x, y, ...W], V = controlPointsRef.current) => {
    let nx = 0, ny = 0;
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

  const handleMouseDown = (index) => (e) => {
    e.preventDefault();
    setDragIndex(index);
  };

  const handleMouseMove = (e) => {
    if (dragIndex === null) return;

    const svgRect = svgControlRef.current.getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    const y = e.clientY - svgRect.top;

    controlPointsRef.current[dragIndex] = [x, y];
    drawControlShape();
    warpRef.current.transform(reposition);
  };

  const handleMouseUp = () => {
    // if (dragIndex !== null) {
    //   console.log('Updated control points:', controlPointsRef.current);
    // }
    if (pathRef.current) {
      const updatedD = svgRef.current.querySelector('path')?.getAttribute('d');
      if (updatedD) {
        // console.log('Updated path D:', updatedD);
        setSvgPath(updatedD);
      }
    }
    setDragIndex(null);
  };

  const handleInsert = async () => {
    if (!sandboxProxy || !svgPath || !pathBounds) {
      console.error('缺少必要数据');
      return;
    }
    setIsLoading(true);
    try {
      const result = await sandboxProxy.insertWarpedSVG({
        d: svgPath,
        bounds: pathBounds,
        originalText: text,
        warpType: 'mesh',
        intensity: 1
      });
      if (!result.success) {
        setError(result.error);
      }
    } catch (e) {
      setError(`插入异常: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div>Preview</div>
      <div style={{ display: 'flex', width: '100%' }}>
        <svg
          ref={svgControlRef}
          id="svg-control"
          width="100%"
          height="200"
          // viewBox={`0 0 350 200`}
          // preserveAspectRatio="xMidYMid meet"
          style={{
            border: '1px solid #C7C7C7',
            borderRadius: '10px',
            overflow: 'visible',
            position: 'absolute',
            pointerEvents: 'none',
          }}
        >
          <path
            ref={controlPathRef}
            id="control-path"
            fill="none"
            stroke="red"
            strokeWidth="1px"
          />
          {text != "" && Array.from({ length: 7 }).map((_, i) => (
            <circle
              key={i}
              ref={(el) => (controlCirclesRef.current[i] = el)}
              r="5"
              fill="blue"
              stroke="white"
              strokeWidth="1"
              onMouseDown={handleMouseDown(i)}
              style={{ cursor: 'grab', pointerEvents: 'all' }}
            />
          ))}
        </svg>

        <svg
          ref={svgRef}
          id="svg-element"
          width="100%"
          height="200"
          // viewBox={`0 0 350 200`}
          // preserveAspectRatio="xMidYMid meet"
          style={{
            border: '1px solid #C7C7C7',
            borderRadius: '10px', overflow: 'visible'
          }}
        />

      </div>

      <div>Text</div>
      <input
        style={{ color: 'black', border: '1px solid black' }}
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        id="text-input"
        required
      />

      <button
        onClick={handleInsert}
        disabled={isLoading || !svgPath}
      >
        {isLoading ? '插入中...' : '插入变形文本'}
      </button>
    </div>
  );
}