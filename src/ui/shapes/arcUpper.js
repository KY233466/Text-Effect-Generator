export function arcUpperWarp(
    x,
    y,
    totalWidth,
    centerX,
    intensity,
    textMetrics = {}
  ) {
    const normX = (x - centerX) / (totalWidth / 2); // -1 ~ 1
    const arcHeight = (intensity / 100) * (textMetrics.baseline || 100); // 控制弧形高度
  
    return {
      x,
      y: y - arcHeight * (1 - normX * normX), // 越靠中间越高
    };
  }
  
  export const arcUpperConfig = {
    label: "Arc Upper",
    description: "Bend text upward into an arc",
    defaultIntensity: 50,
    intensityRange: { min: 0, max: 100 },
  };
  