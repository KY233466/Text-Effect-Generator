import React, { useState } from 'react';
import Mesh from "./Mesh/mesh.js";
import Smudge from "./Smudge/smudge.js";
const CustomTextPage = ({
  sandboxProxy,
  text,
  fontUrl,
  lineHeight,
  letterSpacing,
  alignment
}) => {
  const Shape = ["mesh", "smudge"];
  const [selected, setSelected] = useState("mesh");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [svgPath, setSvgPath] = useState("");
  const [pathBounds, setPathBounds] = useState(null);
  const handleInsert = async () => {
    if (!sandboxProxy || !svgPath || !pathBounds) {
      console.error('缺少必要数据');
      return;
    }
    setIsLoading(true);
    try {
      const result = await sandboxProxy.insertWarpedSVG({
        d: svgPath,
        bounds: pathBounds,
        originalText: text,
        warpType: 'custom',
        intensity: 1
      });
      if (!result.success) {
        setError(result.error);
      }
    } catch (e) {
      setError(`插入异常: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '280px',
      marginLeft: '20px',
      marginRight: '20px'
    }
  }, selected == "mesh" ? /*#__PURE__*/React.createElement(Mesh, {
    setPathBounds: setPathBounds,
    text: text,
    setSvgPath: setSvgPath,
    fontUrl: fontUrl,
    lineHeight: lineHeight,
    letterSpacing: letterSpacing,
    alignment: alignment
  }) : /*#__PURE__*/React.createElement(Smudge, {
    pathBounds: pathBounds,
    setPathBounds: setPathBounds,
    text: text,
    setSvgPath: setSvgPath,
    fontUrl: fontUrl,
    lineHeight: lineHeight,
    letterSpacing: letterSpacing,
    alignment: alignment
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      color: "#06001A",
      fontSize: "14px",
      fontFamily: "Avenir Next",
      fontWeight: "600",
      marginBottom: "8px"
    }
  }, "Shape"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'row',
      gap: '10px'
    }
  }, Shape.map(s => /*#__PURE__*/React.createElement("button", {
    style: {
      width: '85px',
      height: '85px',
      borderRadius: '10px',
      border: '1px solid #CBE2FF',
      cursor: ''
    },
    onClick: () => setSelected(s)
  }, s))), /*#__PURE__*/React.createElement("div", {
    className: "button-group"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: handleInsert,
    disabled: isLoading || !svgPath,
    className: "insert-button primary",
    style: {
      fontSize: "14px",
      fontFamily: "Avenir Next",
      fontWeight: "600",
      color: "white"
    }
  }, isLoading ? '插入中...' : '插入变形文本')));
};
export default CustomTextPage;