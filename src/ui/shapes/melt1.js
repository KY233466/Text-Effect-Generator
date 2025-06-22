// 融化1变形效果
export function melt1Warp(x, y, totalWidth, centerX, meltIntensity, textMetrics) {
  const baselineY = textMetrics.baseline || 0;
  const ascenderHeight = textMetrics.ascender || textMetrics.yMax || 100;
  const descenderHeight = textMetrics.descender || textMetrics.yMin || -20;
  
  // 计算相对于基线的位置
  const relativeY = y - baselineY;
  const totalHeight = ascenderHeight - descenderHeight;
  
  // 计算垂直因子：距离基线越近，变形越明显
  let verticalFactor;
  if (Math.abs(relativeY) < totalHeight * 0.3) {
    verticalFactor = 1; // 基线附近区域
  } else if (Math.abs(relativeY) < totalHeight * 0.6) {
    verticalFactor = 0.7; // 中间区域
  } else {
    verticalFactor = 0.3; // 边缘区域
  }
  
  // 水平位置因子
  const normX = (x - centerX) / (totalWidth / 2);
  const horizontalFactor = Math.pow(Math.cos(normX * Math.PI / 2), 2);
  
  const meltY = meltIntensity * horizontalFactor * verticalFactor;
  return { x, y: y + meltY };
}

export const melt1Config = {
  label: "融化1",
  description: "文字呈现向下融化的效果",
  defaultIntensity: 40,
  intensityRange: { min: 0, max: 100 }
}; 