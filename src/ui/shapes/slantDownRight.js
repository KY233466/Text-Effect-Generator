export function slantDownRightWarp(
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
  const ratio = (x - leftX) / totalWidth;

  const minScale = 0.1;
  const targetScale = 1 - 0.9 * (intensity / 100);

  const scaleY = Math.max(minScale, 1 - (1 - targetScale) * ratio);

  return {
    x,
    y: baseline + (y - baseline) * scaleY,
  };
}

export const slantDownRightConfig = {
  label: "curtain2",
  description: "文字底部向右渐窄倾斜",
  defaultIntensity: 50,
  intensityRange: { min: 0, max: 100 },
};
