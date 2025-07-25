export function slantDownLeftWarp(
  x,
  y,
  totalWidth,
  centerX,
  intensity,
  textMetrics
) {
  const baseline = textMetrics.baseline;
  if (y <= baseline) return { x, y };

  const leftX = centerX - totalWidth / 2;
  const ratio = 1 - (x - leftX) / totalWidth;

  const minScale = 0.1;
  const targetScale = 1 - 0.9 * (intensity / 100); // 强度归一化

  const scaleY = Math.max(minScale, 1 - (1 - targetScale) * ratio);

  return {
    x,
    y: baseline + (y - baseline) * scaleY,
  };
}

export const slantDownLeftConfig = {
  label: "curtain",
  description: "Text bottom narrows and slants to the left",
  defaultIntensity: 50,
  intensityRange: { min: 0, max: 100 },
};
