export function bouquetWarp(x, y, totalWidth, centerX, intensity, textMetrics) {
  const dx = x - centerX;
  const normX = dx / 300; // scale to -1 ~ 1-ish
  const baselineY = textMetrics.baseline ?? 160;
  const normY = (y - baselineY) / 80; // normalize y relative to baseline

  const xOffset = -normX * (intensity / 1.0) * Math.cos((normY * Math.PI) / 2);

  return { x: x + xOffset, y };
}

export const bouquetConfig = {
  label: "花束型",
  description: "从中间向外左右自然展开，如花束扇形",
  defaultIntensity: 60,
  intensityRange: { min: 0, max: 100 },
};
