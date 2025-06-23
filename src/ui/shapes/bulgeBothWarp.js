export function bulgeBothWarp(
  x,
  y,
  totalWidth,
  centerX,
  intensity,
  textMetrics = {}
) {
  const normX = (x - centerX) / (totalWidth / 2); // -1 ~ 1
  const strength = intensity / 50;

  const centerY = textMetrics.baseline / 2;

  const scaleY = 1 + strength * (1 - normX * normX);

  if (y < centerY) {
    // bulge up
    return {
      x,
      y: centerY - (centerY - y) * scaleY,
    };
  } else {
    // bulge down
    return {
      x,
      y: centerY + (y - centerY) * scaleY,
    };
  }
}

export const bulgeBothConfig = {
  label: "BulgeBoth",
  description: "Bulge up and down",
  defaultIntensity: 50,
  intensityRange: { min: 0, max: 100 },
};
