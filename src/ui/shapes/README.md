# 形状变形模块

这个目录包含了各种文本变形效果的独立实现。

## 文件结构

```
shapes/
├── index.js          # 模块索引，统一导出所有效果
├── arcLower.js       # 下弧形变形效果
├── arcUpper.js       # 上弧形变形效果
├── wave.js           # 波浪变形效果
├── bulgeUpWarp.js    # 上凸变形效果
├── bulgeDownWarp.js  # 下凸变形效果
├── bulgeBothWarp.js  # 双向凸起变形效果
├── triangleUpper.js  # 上三角变形效果
├── triangleLower.js  # 下三角变形效果
├── flag.js           # 旗帜飘动变形效果
└── README.md         # 本说明文件
```

## 可用效果

- **Arc Lower**: 下弧形变形效果
- **Arc Upper**: 上弧形变形效果  
- **Wave**: 波浪变形效果
- **Bulge Up**: 上凸变形效果
- **Bulge Down**: 下凸变形效果
- **Bulge Both**: 双向凸起变形效果
- **Triangle Upper**: 上三角变形效果
- **Triangle Lower**: 下三角变形效果
- **Flag**: 旗帜飘动变形效果

## 使用方法

```javascript
import { getWarpFunction, effectsList } from './shapes/index.js';

// 获取特定的变形函数
const warpFn = getWarpFunction('wave');

// 应用变形
const result = warpFn(x, y, totalWidth, centerX, intensity, textMetrics);
```

## 添加新效果

1. 在 `shapes/` 目录下创建新的 `.js` 文件
2. 导出变形函数和配置对象
3. 在 `index.js` 中添加导入和导出
4. 变形函数签名：`(x, y, totalWidth, centerX, intensity, textMetrics) => {x, y}`

## 参数说明

- `x, y`: 当前点的坐标
- `totalWidth`: 文本总宽度
- `centerX`: 文本中心X坐标
- `intensity`: 变形强度 (0-100)
- `textMetrics`: 文本度量信息（基线、上下界等） 