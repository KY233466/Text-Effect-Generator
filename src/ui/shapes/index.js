// 形状变形效果模块索引

import { arcLowerWarp, arcLowerConfig } from "./arcLower.js";
import { arcUpperWarp, arcUpperConfig } from "./arcUpper.js";
import { waveWarp, waveConfig } from "./wave.js";
import { bulgeUpWarp, bulgeUpConfig } from "./bulgeUpWarp.js";
import { bulgeDownWarp, bulgeDownConfig } from "./bulgeDownWarp.js";
import { bulgeBothWarp, bulgeBothConfig } from "./bulgeBothWarp.js";
import { triangleUpperWarp, triangleUpperConfig } from "./triangleUpper.js";
import { triangleLowerWarp, triangleLowerConfig } from "./triangleLower.js";
import { flagWarp, flagConfig } from "./flag.js";
import { concaveTopWarp, concaveTopConfig } from "./concaveTop.js";
import { concaveBottomWarp, concaveBottomConfig } from "./concaveBottom.js";
import { slantDownRightWarp, slantDownRightConfig } from "./slantDownRight.js";
import { slantDownLeftWarp, slantDownLeftConfig } from "./slantDownLeft.js";
import { bouquetWarp, bouquetConfig } from "./bouquet.js";

// 导出所有变形函数
export const warpFunctions = {
  arcLower: arcLowerWarp,
  arcUpper: arcUpperWarp,
  wave: waveWarp,
  bulgeUp: bulgeUpWarp,
  bulgeDown: bulgeDownWarp,
  bulgeBoth: bulgeBothWarp,
  triangleUpper: triangleUpperWarp,
  triangleLower: triangleLowerWarp,
  flag: flagWarp,
  concaveTop: concaveTopWarp,
  concaveBottom: concaveBottomWarp,
  slantDownRight: slantDownRightWarp,
  slantDownLeft: slantDownLeftWarp,
  bouquet: bouquetWarp,
};

// 导出所有配置
export const warpConfigs = {
  arcLower: arcLowerConfig,
  arcUpper: arcUpperConfig,
  wave: waveConfig,
  bulgeUp: bulgeUpConfig,
  bulgeDown: bulgeDownConfig,
  bulgeBoth: bulgeBothConfig,
  triangleUpper: triangleUpperConfig,
  triangleLower: triangleLowerConfig,
  flag: flagConfig,
  concaveTop: concaveTopConfig,
  concaveBottom: concaveBottomConfig,
  slantDownRight: slantDownRightConfig,
  slantDownLeft: slantDownLeftConfig,
  bouquet: bouquetConfig,
};

// 导出效果列表（用于UI渲染）
export const effectsList = [
  { key: "arcLower", ...arcLowerConfig },
  { key: "arcUpper", ...arcUpperConfig },
  { key: "wave", ...waveConfig },
  { key: "bulgeUp", ...bulgeUpConfig },
  { key: "bulgeDown", ...bulgeDownConfig },
  { key: "bulgeBoth", ...bulgeBothConfig },
  { key: "triangleUpper", ...triangleUpperConfig },
  { key: "triangleLower", ...triangleLowerConfig },
  { key: "flag", ...flagConfig },
  { key: "concaveTop", ...concaveTopConfig },
  { key: "concaveBottom", ...concaveBottomConfig },
  { key: "slantDownRight", ...slantDownRightConfig },
  { key: "slantDownLeft", ...slantDownLeftConfig },
  { key: "bouquet", ...bouquetConfig },
];

// 辅助函数：获取变形函数
export function getWarpFunction(effectType) {
  return warpFunctions[effectType];
}

// 辅助函数：获取配置
export function getWarpConfig(effectType) {
  return warpConfigs[effectType];
}
