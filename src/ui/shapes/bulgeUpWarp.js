export function bulgeUpWarp(x, y, totalWidth, centerX, intensity, textMetrics) {
  const normX = (x - centerX) / (totalWidth / 2); // [-1, 1]
  const strength = intensity / 100; // scale 0-100 to ~0-2
  const scaleY = 1 + strength * (1 - normX * normX);
  const baseline = textMetrics.baseline;

  if (y >= baseline * 0.85) return { x, y };

  return { x, y: baseline + (y - baseline) * scaleY };
}

export const bulgeUpConfig = {
  label: "arc",
  description: "文字中部向上膨胀",
  defaultIntensity: 50,
  intensityRange: { min: 0, max: 100 },
};
