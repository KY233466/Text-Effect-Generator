// 波浪变形效果
export function waveWarp(x, y, totalWidth, centerX, waveHeight) {
  const frequency = 2;
  const waveY = waveHeight * Math.sin((x / totalWidth) * frequency * Math.PI);
  return { x, y: y + waveY };
}

export const waveConfig = {
  label: "波浪",
  description: "文字呈现平滑的波浪形状",
  defaultIntensity: 30,
  intensityRange: { min: 0, max: 80 }
}; 