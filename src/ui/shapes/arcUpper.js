export function arcUpperWarp(
  x,
  y,
  totalWidth,
  centerX,
  intensity,
  textMetrics = {}
) {
  const normX = (x - centerX) / (totalWidth / 2); // -1 ~ 1
  const arcHeight = (intensity / 100) * (textMetrics.baseline || 100); // Control arc height

  return {
    x,
    y: y - arcHeight * (1 - normX * normX), // Higher in the middle
  };
}

export const arcUpperConfig = {
  label: "bridge",
  description: "Bend text upward into an arc",
  defaultIntensity: 50,
  intensityRange: { min: 0, max: 100 },
};
