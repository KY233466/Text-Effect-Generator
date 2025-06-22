export function bulgeDownWarp(
  x,
  y,
  totalWidth,
  centerX,
  intensity,
  textMetrics
) {
  const normX = (x - centerX) / (totalWidth / 2);
  const strength = intensity / 50;
  const scaleY = 1 + strength * (1 - normX * normX);
  const baseline = textMetrics.baseline;

  // 上半部分保持原样，下半部分向下膨胀
  if (y < baseline) {
    return { x, y };
  } else {
    return { x, y: baseline + (y - baseline) * scaleY };
  }
}

export const bulgeDownConfig = {
  label: "下膨胀形",
  description: "文字底部向外膨胀",
  defaultIntensity: 50,
  intensityRange: { min: 0, max: 100 },
};
