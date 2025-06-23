export function flagWarp(
    x,
    y,
    totalWidth,
    centerX,
    intensity,
    textMetrics = {}
  ) {
    const freq = 1.5; // 控制周期数（可调）
    const amplitude = (intensity / 100) * (textMetrics.baseline || 50);
  
    return {
      x,
      y: y + Math.sin(((x - centerX) / totalWidth) * Math.PI * freq) * amplitude,
    };
  }
  
  export const flagConfig = {
    label: "Flag",
    description: "Flowing flag-like wave",
    defaultIntensity: 50,
    intensityRange: { min: 0, max: 100 },
  };
  