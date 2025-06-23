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
import { envelopeWaveWarp, envelopeWaveConfig } from './envelopeWave.js';
import { arcClampTopWarp, arcClampTopConfig } from './arcClampTopWarp.js';
import { arcClampBottomWarp, arcClampBottomConfig } from './arcClampBottomWarp.js';

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
  envelopeWave: envelopeWaveWarp,
  arcClampTop: arcClampTopWarp,
  arcClampBottom: arcClampBottomWarp,
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
  { key: "envelopeWave", label: envelopeWaveConfig.label, description: envelopeWaveConfig.description },
  { key: "arcClampTop", label: arcClampTopConfig.label, description: arcClampTopConfig.description },
  { key: "arcClampBottom", label: arcClampBottomConfig.label, description: arcClampBottomConfig.description },
];

// 辅助函数：获取变形函数
export function getWarpFunction(type) {
  const functions = {
    arcLower: arcLowerWarp,
    arcUpper: arcUpperWarp,
    wave: waveWarp,
    bulgeUp: bulgeUpWarp,
    bulgeDown: bulgeDownWarp,
    bulgeBoth: bulgeBothWarp,
    triangleUpper: triangleUpperWarp,
    triangleLower: triangleLowerWarp,
    flag: flagWarp,
    envelopeWave: envelopeWaveWarp,
    arcClampTop: arcClampTopWarp,
    arcClampBottom: arcClampBottomWarp,
  };
  
  return functions[type];
}
