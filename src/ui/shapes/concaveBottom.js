// concaveBottom.js

export function concaveBottomWarp(
  x,
  y,
  totalWidth,
  centerX,
  intensity,
  textMetrics
) {
  const normX = (x - centerX) / (totalWidth / 2); // -1 ~ 1

  const baseline = textMetrics.yMax;

  const horizontalFactor = 1 - normX * normX;
  const bottom = textMetrics.yMin;
  const normY = (y - baseline) / (bottom - baseline);
  const verticalFactor = Math.max(0, Math.min(1, normY));

  const offsetY = (intensity / 50) * 50 * horizontalFactor * verticalFactor;

  if (y <= baseline * 0.85) {
    return { x, y }; // baseline 以上不变
  } else {
    return {
      x,
      y: y - offsetY, // baseline 以下缩放
    };
  }
}

export const concaveBottomConfig = {
  label: "pit2",
  description: "Text bottom concaves inward (reverse bulge)",
  defaultIntensity: 50,
  intensityRange: { min: 0, max: 100 },
};
