import React, { useEffect, useState } from 'react';
import { effectsList, getWarpFunction } from '../shapes/index.js';
import opentype from 'opentype.js';
const TextWarpPage = ({
  sandboxProxy,
  text,
  fontUrl,
  lineHeight,
  letterSpacing,
  alignment
}) => {
  const [warpType, setWarpType] = useState("wave");
  const [intensity, setIntensity] = useState(50);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [svgPath, setSvgPath] = useState("");
  const [pathBounds, setPathBounds] = useState(null);

  // 计算路径边界
  const calculatePathBounds = commands => {
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    commands.forEach(cmd => {
      const points = [];
      if ('x' in cmd && 'y' in cmd) points.push({
        x: cmd.x,
        y: cmd.y
      });
      if ('x1' in cmd && 'y1' in cmd) points.push({
        x: cmd.x1,
        y: cmd.y1
      });
      if ('x2' in cmd && 'y2' in cmd) points.push({
        x: cmd.x2,
        y: cmd.y2
      });
      points.forEach(p => {
        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y);
        maxY = Math.max(maxY, p.y);
      });
    });
    return {
      minX: minX === Infinity ? 0 : minX,
      minY: minY === Infinity ? 0 : minY,
      maxX: maxX === -Infinity ? 0 : maxX,
      maxY: maxY === -Infinity ? 0 : maxY,
      width: maxX === -Infinity || minX === Infinity ? 0 : maxX - minX,
      height: maxY === -Infinity || minY === Infinity ? 0 : maxY - minY
    };
  };
  console.log("text is", text);

  // 当参数变化时重新生成路径 - 修改为支持多行
  useEffect(() => {
    console.log("text is", text);
    if (!text) {
      setSvgPath("");
      setError("");
      return;
    }

    // 直接使用导入的opentype对象
    if (!opentype) {
      setError("OpenType.js 未加载完成，请刷新页面重试");
      return;
    }
    opentype.load(fontUrl, (err, font) => {
      if (err || !font) {
        const errorMessage = `字体加载失败: ${fontUrl}. 请确保字体文件存在于 'src/ui/fonts' 目录下。`;
        console.error(errorMessage, err);
        setError(errorMessage);
        setSvgPath("");
        return;
      }
      setError("");
      try {
        // 处理多行文本
        const lines = text.split('\n').filter(line => line.trim()); // 过滤空行
        if (lines.length === 0) {
          setSvgPath("");
          return;
        }
        const fontSize = 120;
        const scale = fontSize / font.unitsPerEm;
        const baselineY = fontSize * 0.8;
        const actualLineHeight = fontSize * lineHeight;
        let allCommands = [];
        let maxLineWidth = 0;

        // 预先计算所有行的宽度，用于整体居中
        const lineInfos = lines.map((line, lineIndex) => {
          const glyphs = font.stringToGlyphs(line);
          const glyphWidths = glyphs.map(g => g.advanceWidth * scale);
          // 计算行宽度时包含字符间距
          const lineWidth = glyphWidths.reduce((a, b) => a + b, 0) + (glyphs.length - 1) * letterSpacing;
          maxLineWidth = Math.max(maxLineWidth, lineWidth);
          return {
            line,
            glyphs,
            glyphWidths,
            lineWidth,
            y: baselineY + lineIndex * actualLineHeight
          };
        });

        // 获取变形函数
        const warpFn = getWarpFunction(warpType);
        if (!warpFn) {
          setError(`未知的变形类型: ${warpType}`);
          return;
        }

        // 计算整体文本的度量信息 - 关键改进！
        const totalHeight = (lines.length - 1) * actualLineHeight + fontSize;
        const overallTopY = baselineY - fontSize * 0.7; // 第一行顶部
        const overallBottomY = baselineY + (lines.length - 1) * actualLineHeight + fontSize * 0.2; // 最后一行底部
        const overallCenterY = (overallTopY + overallBottomY) / 2; // 整体垂直中心

        // 统一的文本度量信息 - 所有字符都使用这个
        const unifiedTextMetrics = {
          baseline: overallCenterY,
          // 使用整体的垂直中心作为基线
          ascender: overallTopY,
          descender: overallBottomY,
          yMax: overallTopY,
          yMin: overallBottomY
        };

        // 整体变形参数
        const totalWidth = maxLineWidth;
        const centerX = maxLineWidth / 2;
        const arcHeight = intensity;

        // 处理每一行
        lineInfos.forEach((lineInfo, lineIndex) => {
          const {
            glyphs,
            lineWidth,
            y
          } = lineInfo;

          // 水平居中对齐
          let x = (maxLineWidth - lineWidth) / 2;

          // 处理当前行的每个字符 - 全部使用统一的文本度量！
          glyphs.forEach(g => {
            const path = g.getPath(x, y, fontSize);
            path.commands.forEach(cmd => {
              const warped = {
                ...cmd
              };
              if ('x' in warped && 'y' in warped) {
                const {
                  x: newX,
                  y: newY
                } = warpFn(warped.x, warped.y, totalWidth, centerX, arcHeight, unifiedTextMetrics);
                warped.x = newX;
                warped.y = newY;
              }
              if ('x1' in warped && 'y1' in warped) {
                const {
                  x: newX1,
                  y: newY1
                } = warpFn(warped.x1, warped.y1, totalWidth, centerX, arcHeight, unifiedTextMetrics);
                warped.x1 = newX1;
                warped.y1 = newY1;
              }
              if ('x2' in warped && 'y2' in warped) {
                const {
                  x: newX2,
                  y: newY2
                } = warpFn(warped.x2, warped.y2, totalWidth, centerX, arcHeight, unifiedTextMetrics);
                warped.x2 = newX2;
                warped.y2 = newY2;
              }
              allCommands.push(warped);
            });
            // 应用字符间距到x坐标
            x += g.advanceWidth * scale + letterSpacing;
          });
        });
        const d = allCommands.map(c => {
          if (c.type === 'M') return `M ${c.x} ${c.y}`;
          if (c.type === 'L') return `L ${c.x} ${c.y}`;
          if (c.type === 'C') return `C ${c.x1} ${c.y1}, ${c.x2} ${c.y2}, ${c.x} ${c.y}`;
          if (c.type === 'Q') return `Q ${c.x1} ${c.y1}, ${c.x} ${c.y}`;
          if (c.type === 'Z') return 'Z';
          return '';
        }).join(' ');

        // 计算并保存路径边界信息
        const bounds = calculatePathBounds(allCommands);
        setPathBounds(bounds);
        setSvgPath(d);
      } catch (error) {
        console.error('生成多行文本变形时出错:', error);
        setError('生成文本变形时出现错误，请检查输入内容');
      }
    });
  }, [text, warpType, fontUrl, intensity, lineHeight, letterSpacing]); // 添加lineHeight和letterSpacing依赖

  const handleInsert = async () => {
    console.log("准备插入SVG路径:", svgPath.substring(0, 100));
    console.log("路径边界信息:", pathBounds);
    if (!svgPath || !sandboxProxy) {
      console.error('SVG路径或沙盒代理不可用');
      return;
    }
    setIsLoading(true);
    try {
      // 传递更多信息到sandbox，包括边界信息
      const result = await sandboxProxy.insertWarpedSVG({
        d: svgPath,
        bounds: pathBounds,
        originalText: text,
        warpType: warpType,
        intensity: intensity
      });
      if (result.success) {
        console.log('SVG 路径插入成功');
      } else {
        console.error('沙盒端插入失败:', result.error);
        setError(`插入失败: ${result.error}`);
      }
    } catch (e) {
      console.error('调用沙盒API失败:', e);
      setError(`插入异常: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 添加测试函数
  const handleTestRectangle = async () => {
    if (!sandboxProxy) {
      console.error('沙盒代理不可用');
      return;
    }
    try {
      const result = await sandboxProxy.createRectangle();
      if (result.success) {
        console.log('测试矩形创建成功');
      } else {
        console.error('测试矩形创建失败:', result.error);
        setError(`测试失败: ${result.error}`);
      }
    } catch (e) {
      console.error('测试API调用失败:', e);
      setError(`测试异常: ${e.message}`);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "text-warp-page"
  }, /*#__PURE__*/React.createElement("div", {
    className: "preview-container"
  }, /*#__PURE__*/React.createElement("h3", null, "\u9884\u89C8\u6548\u679C"), /*#__PURE__*/React.createElement("div", {
    className: "svg-preview"
  }, error ? /*#__PURE__*/React.createElement("div", {
    className: "error-message"
  }, error) : /*#__PURE__*/React.createElement("svg", {
    viewBox: pathBounds ? `${pathBounds.minX - 20} ${pathBounds.minY - 20} ${pathBounds.width + 40} ${pathBounds.height + 40}` : '0 0 1000 300',
    width: "100%",
    height: "200",
    style: {
      border: '1px solid #eee',
      minHeight: '200px',
      maxHeight: '500px'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: svgPath,
    fill: "hotpink",
    stroke: "none"
  })))), /*#__PURE__*/React.createElement("div", {
    className: "control-group"
  }, /*#__PURE__*/React.createElement("label", null, "\u53D8\u5F62\u7C7B\u578B\uFF1A"), /*#__PURE__*/React.createElement("select", {
    value: warpType,
    onChange: e => setWarpType(e.target.value),
    className: "warp-select"
  }, effectsList.map(effect => /*#__PURE__*/React.createElement("option", {
    key: effect.key,
    value: effect.key
  }, effect.label)))), /*#__PURE__*/React.createElement("div", {
    className: "control-group"
  }, /*#__PURE__*/React.createElement("label", null, "\u53D8\u5F62\u5F3A\u5EA6\uFF1A", intensity), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "0",
    max: "100",
    value: intensity,
    onChange: e => setIntensity(Number(e.target.value)),
    className: "intensity-slider"
  }), /*#__PURE__*/React.createElement("div", {
    className: "intensity-hint"
  }, "0 (\u65E0\u53D8\u5F62) \u2014 100 (\u6700\u5927\u53D8\u5F62)")), /*#__PURE__*/React.createElement("div", {
    className: "button-group"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: handleInsert,
    disabled: isLoading || !svgPath,
    className: "insert-button primary"
  }, isLoading ? '插入中...' : '插入变形文本'), /*#__PURE__*/React.createElement("button", {
    onClick: handleTestRectangle,
    className: "insert-button secondary"
  }, "\u6D4B\u8BD5API")));
};
export default TextWarpPage;