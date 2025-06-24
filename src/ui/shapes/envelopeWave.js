export function envelopeWaveWarp(
    x,
    y,
    totalWidth,
    centerX,
    intensity,
    textMetrics = {}
  ) {
    const freq = 2; // 波数
    const amp = (intensity / 500) * (textMetrics.baseline);
    const centerY = textMetrics.baseline;
  
    const normX = (x - centerX) / (totalWidth / 2); // -1 ~ 1
  
    const waveOffset = Math.sin(normX * Math.PI * freq) * amp;
  
    if (y < centerY) {
      // 上半部分往上偏移
      return {
        x,
        y: y - waveOffset * (1 - (y / centerY)),
      };
    } else {
      // 下半部分往下偏移
      return {
        x,
        y: y + waveOffset * ((y - centerY) / centerY),
      };
    }
  }
  
  export const envelopeWaveConfig = {
    label: "包络波形",
    description: "基于字形中心的垂直包络波形变形",
    defaultIntensity: 50,
    intensityRange: { min: 0, max: 100 },
  };
  