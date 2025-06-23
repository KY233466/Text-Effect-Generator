import React, { useEffect, useState } from "react";
import { effectsList, getWarpFunction } from "../shapes/index.js";
import opentype from "opentype.js";
const fonts = [
  {
    name: "Old Standard",
    url: "./fonts/OldStandardTT-Regular.ttf",
  },
  {
    name: "Arial",
    url: "./fonts/Arial.ttf",
  },
  {
    name: "Helvetica",
    url: "./fonts/Helvetica.ttf",
  },
];
const TextWarpPage = ({ sandboxProxy }) => {
  const [text, setText] = useState("TYPE WARP");
  const [warpType, setWarpType] = useState("melt1");
  const [fontUrl, setFontUrl] = useState(fonts[0].url);
  const [intensity, setIntensity] = useState(50);
  const [svgPath, setSvgPath] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [pathBounds, setPathBounds] = useState(null);

  // 计算路径边界的辅助函数
  const calculatePathBounds = (commands) => {
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    commands.forEach((cmd) => {
      if ("x" in cmd && "y" in cmd) {
        minX = Math.min(minX, cmd.x);
        maxX = Math.max(maxX, cmd.x);
        minY = Math.min(minY, cmd.y);
        maxY = Math.max(maxY, cmd.y);
      }
      if ("x1" in cmd && "y1" in cmd) {
        minX = Math.min(minX, cmd.x1);
        maxX = Math.max(maxX, cmd.x1);
        minY = Math.min(minY, cmd.y1);
        maxY = Math.max(maxY, cmd.y1);
      }
      if ("x2" in cmd && "y2" in cmd) {
        minX = Math.min(minX, cmd.x2);
        maxX = Math.max(maxX, cmd.x2);
        minY = Math.min(minY, cmd.y2);
        maxY = Math.max(maxY, cmd.y2);
      }
    });
    return {
      minX,
      maxX,
      minY,
      maxY,
      width: maxX - minX,
      height: maxY - minY,
    };
  };

  // 当参数变化时重新生成路径
  useEffect(() => {
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
      const fontSize = 120;
      const scale = fontSize / font.unitsPerEm;
      const arcHeight = intensity;
      const glyphs = font.stringToGlyphs(text);
      let x = 0;
      const commands = [];
      const glyphWidths = glyphs.map((g) => g.advanceWidth * scale);
      const totalWidth = glyphWidths.reduce((a, b) => a + b, 0);
      const centerX = totalWidth / 2;

      // 使用分离的变形函数
      const warpFn = getWarpFunction(warpType);
      if (!warpFn) {
        setError(`未知的变形类型: ${warpType}`);
        return;
      }
      const baselineY = fontSize * 0.8;

      // 计算文本度量信息，传递给变形函数
      const textMetrics = {
        baseline: baselineY,
        ascender: baselineY - fontSize * 0.7,
        descender: baselineY + fontSize * 0.2,
        yMax: baselineY - fontSize * 0.7,
        yMin: baselineY + fontSize * 0.2,
      };
      glyphs.forEach((g) => {
        const path = g.getPath(x, baselineY, fontSize);
        path.commands.forEach((cmd) => {
          const warped = {
            ...cmd,
          };
          if ("x" in warped && "y" in warped) {
            const { x: newX, y: newY } = warpFn(
              warped.x,
              warped.y,
              totalWidth,
              centerX,
              arcHeight,
              textMetrics
            );
            warped.x = newX;
            warped.y = newY;
          }
          if ("x1" in warped && "y1" in warped) {
            const { x: newX1, y: newY1 } = warpFn(
              warped.x1,
              warped.y1,
              totalWidth,
              centerX,
              arcHeight,
              textMetrics
            );
            warped.x1 = newX1;
            warped.y1 = newY1;
          }
          if ("x2" in warped && "y2" in warped) {
            const { x: newX2, y: newY2 } = warpFn(
              warped.x2,
              warped.y2,
              totalWidth,
              centerX,
              arcHeight,
              textMetrics
            );
            warped.x2 = newX2;
            warped.y2 = newY2;
          }
          commands.push(warped);
        });
        x += g.advanceWidth * scale;
      });
      const d = commands
        .map((c) => {
          if (c.type === "M") return `M ${c.x} ${c.y}`;
          if (c.type === "L") return `L ${c.x} ${c.y}`;
          if (c.type === "C")
            return `C ${c.x1} ${c.y1}, ${c.x2} ${c.y2}, ${c.x} ${c.y}`;
          if (c.type === "Q") return `Q ${c.x1} ${c.y1}, ${c.x} ${c.y}`;
          if (c.type === "Z") return "Z";
          return "";
        })
        .join(" ");

      // 计算并保存路径边界信息
      const bounds = calculatePathBounds(commands);
      setPathBounds(bounds);
      setSvgPath(d);
    });
  }, [text, warpType, fontUrl, intensity]);
  const handleInsert = async () => {
    console.log("准备插入SVG路径:", svgPath.substring(0, 100));
    console.log("路径边界信息:", pathBounds);
    if (!svgPath || !sandboxProxy) {
      console.error("SVG路径或沙盒代理不可用");
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
        intensity: intensity,
      });
      if (result.success) {
        console.log("SVG 路径插入成功");
      } else {
        console.error("沙盒端插入失败:", result.error);
        setError(`插入失败: ${result.error}`);
      }
    } catch (e) {
      console.error("调用沙盒API失败:", e);
      setError(`插入异常: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 添加测试函数
  const handleTestRectangle = async () => {
    if (!sandboxProxy) {
      console.error("沙盒代理不可用");
      return;
    }
    try {
      const result = await sandboxProxy.createRectangle();
      if (result.success) {
        console.log("测试矩形创建成功");
      } else {
        console.error("测试矩形创建失败:", result.error);
        setError(`测试失败: ${result.error}`);
      }
    } catch (e) {
      console.error("测试API调用失败:", e);
      setError(`测试异常: ${e.message}`);
    }
  };
  return /*#__PURE__*/ React.createElement(
    "div",
    {
      className: "text-warp-page",
    },
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "control-group",
      },
      /*#__PURE__*/ React.createElement(
        "label",
        null,
        "\u9009\u62E9\u5B57\u4F53\uFF1A"
      ),
      /*#__PURE__*/ React.createElement(
        "select",
        {
          value: fontUrl,
          onChange: (e) => setFontUrl(e.target.value),
          className: "font-select",
        },
        fonts.map((f) =>
          /*#__PURE__*/ React.createElement(
            "option",
            {
              key: f.url,
              value: f.url,
            },
            f.name
          )
        )
      )
    ),
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "control-group",
      },
      /*#__PURE__*/ React.createElement(
        "label",
        null,
        "\u53D8\u5F62\u7C7B\u578B\uFF1A"
      ),
      /*#__PURE__*/ React.createElement(
        "select",
        {
          value: warpType,
          onChange: (e) => setWarpType(e.target.value),
          className: "warp-select",
        },
        effectsList.map((effect) =>
          /*#__PURE__*/ React.createElement(
            "option",
            {
              key: effect.key,
              value: effect.key,
            },
            effect.label
          )
        )
      )
    ),
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "control-group",
      },
      /*#__PURE__*/ React.createElement(
        "label",
        null,
        "\u53D8\u5F62\u5F3A\u5EA6\uFF1A",
        intensity
      ),
      /*#__PURE__*/ React.createElement("input", {
        type: "range",
        min: "0",
        max: "100",
        value: intensity,
        onChange: (e) => setIntensity(Number(e.target.value)),
        className: "intensity-slider",
      }),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "intensity-hint",
        },
        "0 (\u65E0\u53D8\u5F62) \u2014 100 (\u6700\u5927\u53D8\u5F62)"
      )
    ),
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "control-group",
      },
      /*#__PURE__*/ React.createElement(
        "label",
        null,
        "\u8F93\u5165\u6587\u5B57\uFF1A"
      ),
      /*#__PURE__*/ React.createElement("input", {
        type: "text",
        value: text,
        onChange: (e) => setText(e.target.value),
        placeholder: "\u8F93\u5165\u8981\u53D8\u5F62\u7684\u6587\u5B57",
        className: "text-input",
      })
    ),
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "preview-container",
      },
      /*#__PURE__*/ React.createElement("h3", null, "\u9884\u89C8\u6548\u679C"),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "svg-preview",
        },
        error
          ? /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "error-message",
              },
              error
            )
          : /*#__PURE__*/ React.createElement(
              "svg",
              {
                viewBox: pathBounds
                  ? `${pathBounds.minX - 20} ${pathBounds.minY - 20} ${
                      pathBounds.width + 40
                    } ${pathBounds.height + 40}`
                  : "0 0 1000 300",
                width: "100%",
                height: "200",
                style: {
                  border: "1px solid #eee",
                },
              },
              /*#__PURE__*/ React.createElement("path", {
                d: svgPath,
                fill: "hotpink",
                stroke: "none",
              })
            )
      )
    ),
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "button-group",
      },
      /*#__PURE__*/ React.createElement(
        "button",
        {
          onClick: handleInsert,
          disabled: isLoading || !svgPath,
          className: "insert-button primary",
        },
        isLoading ? "插入中..." : "插入变形文本"
      ),
      /*#__PURE__*/ React.createElement(
        "button",
        {
          onClick: handleTestRectangle,
          className: "insert-button secondary",
        },
        "\u6D4B\u8BD5API"
      )
    )
  );
};
export default TextWarpPage;
