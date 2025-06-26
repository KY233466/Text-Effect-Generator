// concaveTop.js
export function concaveTopWarp(
  x,
  y,
  totalWidth,
  centerX,
  intensity,
  textMetrics
) {
  const baseline = textMetrics.yMin;
  const top = textMetrics.yMax;

  if (y >= baseline * 0.85) return { x, y }; // baseline 以下不变

  const normX = (x - centerX) / (totalWidth / 2); // -1 to 1
  const horizontalFactor = 1 - normX * normX; // 抛物线：中间最大
  const normY = (baseline - y) / (baseline - top); // y 越靠近 top，值越大
  const verticalFactor = normY;

  const offsetY = (intensity / 50) * 50 * horizontalFactor * verticalFactor; // 自适应强度

  return {
    x,
    y: y + offsetY,
  };
}

export const concaveTopConfig = {
  label: "pit",
  description: "文字顶部中间凹陷",
  defaultIntensity: 50,
  intensityRange: { min: 0, max: 100 },
};
