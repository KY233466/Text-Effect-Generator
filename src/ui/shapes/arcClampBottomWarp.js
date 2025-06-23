export function arcClampBottomWarp(x, y, totalWidth, centerX, intensity, textMetrics) {
  const normX = (x - centerX) / (totalWidth / 2); // -1 ~ 1
  const strength = intensity;

  // 从中间向两边 scaleY 从 min 到 1（反向 bulge）
  const scaleY = 1 - strength * (1 - normX * normX);

  const baseline = textMetrics.baseline || 0;

  if (y <= baseline) {
    return { x, y }; // baseline 以上不变
  } else {
    return {
      x,
      y: baseline + (y - baseline) * scaleY, // baseline 以下按 scaleY 缩放
    };
  }
}


export const arcClampBottomConfig = {
  label: "下夹紧形",
  description: "文字顶部向底部收缩，底部保持不变",
  defaultIntensity: 50,
  intensityRange: { min: 0, max: 100 },
};
