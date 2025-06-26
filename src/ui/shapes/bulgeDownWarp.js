export function bulgeDownWarp(
  x,
  y,
  totalWidth,
  centerX,
  intensity,
  textMetrics
) {
  const normX = (x - centerX) / (totalWidth / 2);
  const strength = intensity / 100;
  const scaleY = 1 + strength * (1 - normX * normX);
  const baseline = 10;

  // 上半部分保持原样，下半部分向下膨胀
  if (y < baseline * 0.85) {
    return { x, y };
  } else {
    return { x, y: baseline + (y - baseline) * scaleY };
  }
}

export const bulgeDownConfig = {
  label: "arc3",
  description: "文字底部向外膨胀",
  defaultIntensity: 50,
  intensityRange: { min: 0, max: 100 },
};
