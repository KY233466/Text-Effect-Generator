import React, { useEffect, useState } from 'react';
import opentype from 'opentype.js';

// 变形函数定义
function arcLowerWarp(x, y, totalWidth, centerX, arcHeight) {
  const normX = (x - centerX) / (totalWidth / 2);
  const arcY = arcHeight * (1 - normX * normX);
  return { x, y: y + arcY };
}

function waveWarp(x, y, totalWidth, centerX, arcHeight) {
  return { x, y: y + Math.sin(x / 40) * arcHeight };
}

// 优化后的凸起变形算法 - 重命名为melt1
function melt1Warp(x, y, totalWidth, centerX, arcHeight) {
  const normX = (x - centerX) / (totalWidth / 2);
  // 水平方向的变形因子
  const horizontalFactor = Math.cos(normX * Math.PI / 2);
  const horizontalBulge = horizontalFactor * horizontalFactor;
  
  // 关键改进：根据字母的垂直位置决定是否变形
  const baselineY = 80; // 字体基线位置
  const letterTop = baselineY - 60; // 字母顶部大约位置
  const letterBottom = baselineY + 15; // 字母底部大约位置
  const letterMiddle = (letterTop + letterBottom) / 2; // 字母中间位置
  
  // 只有接近字母中间部分的点才进行变形
  const distanceFromMiddle = Math.abs(y - letterMiddle);
  const maxMiddleDistance = 25; // 中间区域的范围
  
  // 如果点在字母的顶部或底部边缘，几乎不变形
  let verticalFactor = 0;
  if (distanceFromMiddle < maxMiddleDistance) {
    verticalFactor = 1 - (distanceFromMiddle / maxMiddleDistance);
  }
  
  const bulgeY = arcHeight * horizontalBulge * verticalFactor;
  return { x, y: y - bulgeY };
}

// 优化后的下凸变形算法 - 重命名为melt2
function melt2Warp(x, y, totalWidth, centerX, arcHeight) {
  const normX = (x - centerX) / (totalWidth / 2);
  // 水平方向的变形因子
  const horizontalFactor = Math.cos(normX * Math.PI / 2);
  const horizontalBulge = horizontalFactor * horizontalFactor;
  
  // 关键改进：根据字母的垂直位置决定是否变形
  const baselineY = 80; // 字体基线位置
  const letterTop = baselineY - 60; // 字母顶部大约位置
  const letterBottom = baselineY + 15; // 字母底部大约位置
  const letterMiddle = (letterTop + letterBottom) / 2; // 字母中间位置
  
  // 只有接近字母中间部分的点才进行变形
  const distanceFromMiddle = Math.abs(y - letterMiddle);
  const maxMiddleDistance = 25; // 中间区域的范围
  
  // 如果点在字母的顶部或底部边缘，几乎不变形
  let verticalFactor = 0;
  if (distanceFromMiddle < maxMiddleDistance) {
    verticalFactor = 1 - (distanceFromMiddle / maxMiddleDistance);
  }
  
  const bulgeY = arcHeight * horizontalBulge * verticalFactor;
  return { x, y: y + bulgeY };
}

const warpTypes = {
  arcLower: { label: "下弧形", fn: arcLowerWarp },
  wave: { label: "波浪形", fn: waveWarp },
  melt1: { label: "Melt1 凸起", fn: melt1Warp },
  melt2: { label: "Melt2 下凸", fn: melt2Warp }
};

const WarpText = ({ text, warpType, intensity, fontPostscriptName }) => {
  const [warpedPath, setWarpedPath] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const generateWarpedPath = async () => {
      try {
        setError("");
        
        // 尝试加载字体
        let font;
        if (fontPostscriptName && fontPostscriptName !== "OldStandardTT-Regular") {
          // 这里应该使用 Adobe Express API 加载字体
          // 暂时使用默认字体
          font = await new Promise((resolve, reject) => {
            opentype.load('./fonts/OldStandardTT-Regular.ttf', (err, font) => {
              if (err) reject(err);
              else resolve(font);
            });
          });
        } else {
          // 使用默认字体
          font = await new Promise((resolve, reject) => {
            opentype.load('./fonts/OldStandardTT-Regular.ttf', (err, font) => {
              if (err) reject(err);
              else resolve(font);
            });
          });
        }

        if (!font) {
          throw new Error('字体加载失败');
        }

        const fontSize = 80;
        const scale = fontSize / font.unitsPerEm;
        const arcHeight = intensity;
        const glyphs = font.stringToGlyphs(text);
        let x = 0;
        const commands = [];
        const glyphWidths = glyphs.map(g => g.advanceWidth * scale);
        const totalWidth = glyphWidths.reduce((a, b) => a + b, 0);
        const centerX = totalWidth / 2;
        const warpFn = warpTypes[warpType].fn;

        glyphs.forEach((g) => {
          const path = g.getPath(x, fontSize, fontSize);
          path.commands.forEach((cmd) => {
            const warped = { ...cmd };
            if ('x' in warped && 'y' in warped) {
              const { x: newX, y: newY } = warpFn(warped.x, warped.y, totalWidth, centerX, arcHeight);
              warped.x = newX;
              warped.y = newY;
            }
            if ('x1' in warped && 'y1' in warped) {
              const { x: newX1, y: newY1 } = warpFn(warped.x1, warped.y1, totalWidth, centerX, arcHeight);
              warped.x1 = newX1;
              warped.y1 = newY1;
            }
            if ('x2' in warped && 'y2' in warped) {
              const { x: newX2, y: newY2 } = warpFn(warped.x2, warped.y2, totalWidth, centerX, arcHeight);
              warped.x2 = newX2;
              warped.y2 = newY2;
            }
            commands.push(warped);
          });
          x += g.advanceWidth * scale;
        });

        const d = commands.map(c => {
          if (c.type === 'M') return `M ${c.x} ${c.y}`;
          if (c.type === 'L') return `L ${c.x} ${c.y}`;
          if (c.type === 'C') return `C ${c.x1} ${c.y1}, ${c.x2} ${c.y2}, ${c.x} ${c.y}`;
          if (c.type === 'Q') return `Q ${c.x1} ${c.y1}, ${c.x} ${c.y}`;
          if (c.type === 'Z') return 'Z';
          return '';
        }).join(' ');

        setWarpedPath(d);
      } catch (err) {
        console.error('Error generating warped path:', err);
        setError('生成变形路径时出错');
        setWarpedPath("");
      }
    };

    if (text && warpType) {
      generateWarpedPath();
    }
  }, [text, warpType, intensity, fontPostscriptName]);

  if (error) {
    return (
      <div className="warp-text-error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="warp-text-container">
      <svg viewBox="0 0 800 300" width="100%" height="200">
        <path d={warpedPath} fill="hotpink" stroke="none" />
      </svg>
    </div>
  );
};

export default WarpText; 