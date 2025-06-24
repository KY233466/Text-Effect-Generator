// 三角形上变形效果 - 统一版本
export function triangleUpperWarp(x, y, totalWidth, centerX, intensity, textMetrics) {
  const fixedLine = textMetrics.yMin;    // 底部作为固定线（底部对齐）
  const variableLine = textMetrics.yMax; // 顶部作为变形边界
  
  // 只有在固定线以上的部分才变形
  if (y >= fixedLine) {
    return { x, y }; // 底部区域完全不变形
  }
  
  // 计算水平位置的归一化值 (-1 到 1)
  const normX = (x - centerX) / (totalWidth / 2);
  
  // 三角形线性变形：中心最强，向两边线性下降
  const triangleFactor = 1 - Math.abs(normX);
  
  // 垂直影响因子：距离固定线越远，变形越强
  const textHeight = Math.abs(variableLine - fixedLine);
  const normY = Math.abs(fixedLine - y) / textHeight;
  const verticalFactor = Math.min(normY, 1);
  
  // 标准化强度计算
  const standardIntensity = (intensity / 50) * (textHeight / 4);
  const triangleY = -standardIntensity * triangleFactor * verticalFactor;
  
  return { x, y: y + triangleY };
}

export const triangleUpperConfig = {
  label: "三角形上",
  description: "文字顶部形成对称三角形，底部保持对齐",
  defaultIntensity: 50,
  intensityRange: { min: 0, max: 100 }
}; 