// 形状变形效果模块索引

import { arcLowerWarp, arcLowerConfig } from "./arcLower.js";
import { waveWarp, waveConfig } from "./wave.js";
import { melt1Warp, melt1Config } from "./melt1.js";
import { melt2Warp, melt2Config } from "./melt2.js";
import { bulgeUpWarp, bulgeUpConfig } from "./bulgeUpWarp.js";
import { bulgeDownWarp, bulgeDownConfig } from "./bulgeDownWarp.js";
import { triangleUpperWarp, triangleUpperConfig } from "./triangleUpper.js";
import { triangleLowerWarp, triangleLowerConfig } from "./triangleLower.js";

// 导出所有变形函数
export const warpFunctions = {
  arcLower: arcLowerWarp,
  wave: waveWarp,
  melt1: melt1Warp,
  melt2: melt2Warp,
  bulgeUp: bulgeUpWarp,
  bulgeDown: bulgeDownWarp,
  triangleUpper: triangleUpperWarp,
  triangleLower: triangleLowerWarp,
};

// 导出所有配置
export const warpConfigs = {
  arcLower: arcLowerConfig,
  wave: waveConfig,
  melt1: melt1Config,
  melt2: melt2Config,
  bulgeUp: bulgeUpConfig,
  bulgeDown: bulgeDownConfig,
  triangleUpper: triangleUpperConfig,
  triangleLower: triangleLowerConfig,
};

// 导出效果列表（用于UI渲染）
export const effectsList = [
  { key: "arcLower", ...arcLowerConfig },
  { key: "wave", ...waveConfig },
  { key: "melt1", ...melt1Config },
  { key: "melt2", ...melt2Config },
  { key: "bulgeUp", ...bulgeUpConfig },
  { key: "bulgeDown", ...bulgeDownConfig },
  { key: "triangleUpper", ...triangleUpperConfig },
  { key: "triangleLower", ...triangleLowerConfig },
];

// 辅助函数：获取变形函数
export function getWarpFunction(effectType) {
  return warpFunctions[effectType];
}

// 辅助函数：获取配置
export function getWarpConfig(effectType) {
  return warpConfigs[effectType];
}
