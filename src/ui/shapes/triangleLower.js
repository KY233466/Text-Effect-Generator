// 三角形下变形效果
export function triangleLowerWarp(
  x,
  y,
  totalWidth,
  centerX,
  intensity,
  textMetrics
) {
  const baselineY = 10;
  const ascenderHeight = textMetrics.ascender || textMetrics.yMax || 100;
  const descenderHeight = textMetrics.descender || textMetrics.yMin || -20;

  // 计算相对于基线的位置
  const relativeY = y - baselineY;

  // 计算水平位置的归一化值 (-1 到 1)
  const normX = (x - centerX) / (totalWidth / 2);

  // 倒三角形线性变形：中心最低，向两边线性上升
  // 使用绝对值创建对称的倒三角形形状
  const triangleFactor = 1 - Math.abs(normX);

  // 垂直影响因子：主要影响基线以下的部分，并扩展影响范围
  let verticalFactor = 0;
  if (relativeY >= 0) {
    // 基线及以下的部分
    // 扩展影响范围，不仅限于字体的descender部分
    const descenderRange = Math.abs(descenderHeight - baselineY);
    const effectiveRange = Math.max(descenderRange, 40); // 至少40像素的影响范围

    // 计算变形强度，距离基线越远效果越强
    verticalFactor = (relativeY + effectiveRange * 0.2) / effectiveRange;
    verticalFactor = Math.min(verticalFactor, 1.2); // 允许稍微超过1以增强效果
  }
  // 基线以上的部分保持不变形

  // 计算最终的Y偏移量（向下变形为正值）
  const triangleY = intensity * triangleFactor * verticalFactor;

  return { x, y: y + triangleY };
}

export const triangleLowerConfig = {
  label: "三角形下",
  description: "文字底部形成倒三角形，顶部保持对齐",
  defaultIntensity: 50,
  intensityRange: { min: 0, max: 100 },
};
