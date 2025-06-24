import React, { useState } from 'react';
import Mesh from "./Mesh/mesh.js";
import Smudge from "./Smudge/smudge.js";
const CustomTextPage = ({
  sandboxProxy,
  pathBounds,
  setPathBounds,
  text,
  svgPath,
  setSvgPath
}) => {
  const Shape = ["mesh", "smudge"];
  const [selected, setSelected] = useState("mesh");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
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
  return /*#__PURE__*/React.createElement("div", null, selected == "mesh" ? /*#__PURE__*/React.createElement(Mesh, {
    sandboxProxy: sandboxProxy,
    pathBounds: pathBounds,
    setPathBounds: setPathBounds,
    text: text,
    svgPath: svgPath,
    setSvgPath: setSvgPath,
    isLoading: isLoading,
    setIsLoading: setIsLoading,
    error: error,
    setError: setError
  }) : /*#__PURE__*/React.createElement(Smudge, {
    sandboxProxy: sandboxProxy,
    pathBounds: pathBounds,
    setPathBounds: setPathBounds,
    text: text,
    svgPath: svgPath,
    setSvgPath: setSvgPath,
    isLoading: isLoading,
    setIsLoading: setIsLoading,
    error: error,
    setError: setError
  }), /*#__PURE__*/React.createElement("div", null, "Shape"), /*#__PURE__*/React.createElement("div", {
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
      border: '1px solid black',
      cursor: ''
    },
    onClick: () => setSelected(s)
  }, s))), /*#__PURE__*/React.createElement("div", {
    className: "button-group"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: handleInsert,
    disabled: isLoading || !svgPath,
    className: "insert-button primary"
  }, isLoading ? '插入中...' : '插入变形文本')));
};
export default CustomTextPage;