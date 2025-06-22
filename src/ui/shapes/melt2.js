// 融化2变形效果 - 更激进的中间区域变形
export function melt2Warp(x, y, totalWidth, centerX, meltIntensity, textMetrics) {
  const baselineY = textMetrics.baseline || 0;
  const ascenderHeight = textMetrics.ascender || textMetrics.yMax || 100;
  const descenderHeight = textMetrics.descender || textMetrics.yMin || -20;
  
  // 计算相对于基线的位置
  const relativeY = y - baselineY;
  const totalHeight = ascenderHeight - descenderHeight;
  
  // 定义中间区域范围（更精确的控制）
  const middleZoneStart = totalHeight * 0.2;
  const middleZoneEnd = totalHeight * 0.8;
  const relativeYAbs = Math.abs(relativeY);
  
  let verticalFactor = 0;
  if (relativeYAbs < middleZoneStart) {
    // 顶部/底部区域：不变形
    verticalFactor = 0;
  } else if (relativeYAbs < middleZoneEnd) {
    // 中间区域：完全变形
    verticalFactor = 1;
  } else {
    // 过渡区域：渐变到不变形
    const transitionFactor = Math.max(0, 1 - (relativeYAbs - middleZoneEnd) / (totalHeight * 0.1));
    verticalFactor = transitionFactor;
  }
  
  // 水平位置因子
  const normX = (x - centerX) / (totalWidth / 2);
  const horizontalFactor = Math.pow(Math.cos(normX * Math.PI / 2), 2);
  
  const meltY = meltIntensity * horizontalFactor * verticalFactor;
  return { x, y: y + meltY };
}

export const melt2Config = {
  label: "融化2",
  description: "更激进的融化效果，只变形中间区域",
  defaultIntensity: 60,
  intensityRange: { min: 0, max: 120 }
}; 