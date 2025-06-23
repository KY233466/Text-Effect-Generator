export const arcClampTopWarp = function (
    x, y, totalWidth, centerX, intensity, textMetrics
  ) {
    const baseline = textMetrics.baseline;
    const top = textMetrics.boundingBox.y;
  
    if (y >= baseline) return { x, y }; // baseline 以下不变
  
    const normX = (x - centerX) / (totalWidth / 2); // -1 to 1
    const horizontalFactor = 1 - normX * normX; // 抛物线：中间最大
  
    const normY = (baseline - y) / (baseline - top); // y 越靠近 top，值越大
    const verticalFactor = normY;
    const arcHeight = intensity ;
    const offsetY = arcHeight * horizontalFactor * verticalFactor;
  
    return {
      x,
      y: y + offsetY, // 向下压（所以是 +offsetY）
    };
  };

export const arcClampTopConfig = {
  label: "弧形上夹紧",
  description: "顶部固定，向下弧形压缩文字",
  defaultIntensity: 50,
  intensityRange: { min: 0, max: 100 },
};
  