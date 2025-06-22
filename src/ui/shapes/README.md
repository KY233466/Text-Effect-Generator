# 形状变形模块

这个目录包含了各种文本变形效果的独立实现。

## 文件结构

```
shapes/
├── index.js          # 模块索引，统一导出所有效果
├── arcLower.js       # 下弧形变形效果
├── wave.js           # 波浪变形效果
├── melt1.js          # 融化1效果（基于基线的渐进变形）
├── melt2.js          # 融化2效果（中间区域重点变形）
└── README.md         # 本说明文件
```

## 使用方法

```javascript
import { getWarpFunction, effectsList } from './shapes/index.js';

// 获取特定的变形函数
const warpFn = getWarpFunction('melt1');

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