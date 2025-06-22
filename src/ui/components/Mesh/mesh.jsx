import React, { useRef, useState } from 'react';
import opentype from 'opentype.js';

// import Warp from 'warpjs';
import * as Warp from '../../../lib/warp.js';
// import { Warp } from '../../../lib/warp.js';
// import Warp from '../../../lib/warp.js';

export default function Mesh() {
  const textInputRef = useRef();
  const svgRef = useRef();
  const svgControlRef = useRef();
  const controlPathRef = useRef();
  const controlCirclesRef = useRef([]);
  const warpRef = useRef();
  const controlPointsRef = useRef([]);
  const [dragIndex, setDragIndex] = useState(null);
  const [text, setText] = useState(null);

  const handleSubmit = (e, targetText) => {
    e.preventDefault();

    console.log("?" + targetText);

    opentype.load(
      'https://s3-us-west-2.amazonaws.com/s.cdpn.io/135636/FiraSansExtraCondensed-Black.ttf',
      (err, font) => {
        if (err) {
          console.error('Font could not be loaded:', err);
          return;
        }

        const pathData = font.getPath(targetText, 0, 100, 100).toSVG(3);
        svgRef.current.innerHTML = pathData;

        const path = svgRef.current.querySelector('path');
        const box = path.getBBox();
        const { x, y, width: w, height: h } = box;

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

        // 2. SET CUSTOM CONTROL POINTS (THE ONES YOU WANT TO SHOW/DRAG)
        const customControlPoints = [
          [20, -5],
          [5, 120],
          [100, 210],
          [350, 160],
          [520, 180],
          [450, 20],
          [250, 80],
        ];
        
        controlPointsRef.current = customControlPoints;

        const warp = new Warp.Warp(svgRef.current);

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
        
        // 5. DRAW THE CUSTOM CONTROL SHAPE
        drawControlShape();
      }
    );
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
    setDragIndex(null);
  };

  return (
    <div
      style={{ padding: '0.5em' }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <input
          style={{ color: 'black', border: '1px solid black' }}
          type="text"
          value={text}
          onChange={e => {setText(e.target.value); handleSubmit(e, e.target.value);}}
          id="text-input"
          required
      />

      {/* <button
          onClick={handleSubmit}
          // onClick={handleTestRectangle}
          className="insert-button secondary"
        >
          WARP
      </button> */}

      {/* <form id="text-form" onSubmit={handleSubmit} style={{ paddingBottom: '0.5em' }}>
        <input
          style={{ color: 'black', border: '1px solid black' }}
          type="text"
          ref={textInputRef}
          id="text-input"
          placeholder="Lorem ipsum"
          required
        />
        <input type="submit" value="WARP" style={{ color: 'black', border: '1px solid black' }} />
      </form> */}

      <svg
        ref={svgControlRef}
        id="svg-control"
        width="500"
        height="200"
        style={{
          border: '1px solid black',
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
        {Array.from({ length: 7 }).map((_, i) => (
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
        width="500"
        height="200"
        style={{ border: '1px solid black', overflow: 'visible' }}
      />
    </div>
  );
}