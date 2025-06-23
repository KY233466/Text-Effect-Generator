export function arcLowerWarp(
  x,
  y,
  totalWidth,
  centerX,
  intensity,
  textMetrics = {}
) {
  const normX = (x - centerX) / (totalWidth / 2); // -1 ~ 1
  const arcHeight = (intensity / 100) * (textMetrics.baseline || 100); // 控制弧形高度

  return {
    x,
    y: y + arcHeight * (1 - normX * normX), // 越靠中间越低
  };
}

export const arcLowerConfig = {
  label: "Arc Lower",
  description: "Bend text downward into an arc",
  defaultIntensity: 50,
  intensityRange: { min: 0, max: 100 },
};
