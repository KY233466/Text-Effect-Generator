// 下弧形变形效果
export function arcLowerWarp(x, y, totalWidth, centerX, arcHeight) {
  const normX = (x - centerX) / (totalWidth / 2);
  const arcY = arcHeight * (1 - normX * normX);
  return { x, y: y + arcY };
}

export const arcLowerConfig = {
  label: "下弧形",
  description: "文字向下弯曲成平滑弧形",
  defaultIntensity: 50,
  intensityRange: { min: 0, max: 100 }
}; 