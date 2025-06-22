// 三角形上变形效果
export function triangleUpperWarp(x, y, totalWidth, centerX, intensity, textMetrics) {
  const baselineY = textMetrics.baseline || 0;
  const ascenderHeight = textMetrics.ascender || textMetrics.yMax || 100;
  const descenderHeight = textMetrics.descender || textMetrics.yMin || -20;
  
  // 计算相对于基线的位置
  const relativeY = y - baselineY;
  
  // 计算水平位置的归一化值 (-1 到 1)
  const normX = (x - centerX) / (totalWidth / 2);
  
  // 三角形线性变形：中心最高，向两边线性下降
  // 使用绝对值创建对称的三角形形状
  const triangleFactor = 1 - Math.abs(normX);
  
  // 垂直影响因子：只影响基线以上的部分
  let verticalFactor = 0;
  if (relativeY < 0) { // 只有基线以上的部分才变形
    // 距离基线越远，变形效果越强
    const ascenderRange = Math.abs(ascenderHeight - baselineY);
    if (ascenderRange > 0) {
      verticalFactor = Math.abs(relativeY) / ascenderRange;
      verticalFactor = Math.min(verticalFactor, 1);
    } else {
      // 如果没有上升部，使用固定的影响范围
      verticalFactor = Math.min(Math.abs(relativeY) / 50, 1);
    }
  }
  // 基线及以下的部分 (relativeY >= 0) 保持 verticalFactor = 0，完全不变形
  
  // 计算最终的Y偏移量（向上变形为负值）
  const triangleY = -intensity * triangleFactor * verticalFactor;
  
  return { x, y: y + triangleY };
}

export const triangleUpperConfig = {
  label: "三角形上",
  description: "文字顶部形成对称三角形，底部基线保持对齐",
  defaultIntensity: 50,
  intensityRange: { min: 0, max: 100 }
}; 