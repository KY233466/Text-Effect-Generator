// Triangle lower deformation effect - unified version
export function triangleLowerWarp(
  x,
  y,
  totalWidth,
  centerX,
  intensity,
  textMetrics
) {
  const fixedLine = textMetrics.ascender; // Top as fixed line (top alignment)
  const variableLine = textMetrics.descender; // Bottom as deformation boundary

  // Only deform parts below the fixed line
  if (y <= fixedLine) {
    return { x, y }; // Top area remains completely unchanged
  }

  // Calculate normalized horizontal position value (-1 to 1)
  const normX = (x - centerX) / (totalWidth / 2);

  // Triangle linear deformation: strongest at center, linear decrease towards edges
  const triangleFactor = 1 - Math.abs(normX);

  // Vertical influence factor: farther from fixed line, stronger deformation
  const textHeight = Math.abs(variableLine - fixedLine);
  const normY = Math.abs(y - fixedLine) / textHeight;
  const verticalFactor = Math.min(normY, 1);

  // Normalized intensity calculation
  const standardIntensity = (intensity / 50) * (textHeight / 4);
  const triangleY = standardIntensity * triangleFactor * verticalFactor;

  return { x, y: y + triangleY };
}

export const triangleLowerConfig = {
  label: "hill2",
  description: "Text forms inverted triangle at bottom, top remains aligned",
  defaultIntensity: 50,
  intensityRange: { min: 0, max: 100 },
};
