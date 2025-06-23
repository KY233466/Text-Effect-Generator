export function waveWarp(
  x,
  y,
  totalWidth,
  centerX,
  intensity,
  textMetrics = {}
) {
  const freq = 2; // 控制周期数（波浪数）
  const amplitude = (intensity / 100) * (textMetrics.baseline || 50);

  return {
    x,
    y: y + Math.sin((x / totalWidth) * Math.PI * freq) * amplitude,
  };
}

export const waveConfig = {
  label: "Wave",
  description: "Wavy text effect",
  defaultIntensity: 50,
  intensityRange: { min: 0, max: 100 },
};
