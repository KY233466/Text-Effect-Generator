import React, { useState } from 'react';
import TextWarpPage from './components/TextWarpPage.js';
import CustomTextPage from './components/CustomTextPage.js';
import SelectText from './components/SelectText.js';
const TextWarpApp = ({
  sandboxProxy
}) => {
  const [activeTab, setActiveTab] = useState('text');
  const [text, setText] = useState("TEXT WARP\nMULTI LINE");
  const [svgPath, setSvgPath] = useState("");
  const [pathBounds, setPathBounds] = useState(null);
  return /*#__PURE__*/React.createElement("div", {
    className: "app"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tab-container"
  }, /*#__PURE__*/React.createElement("button", {
    className: `tab ${activeTab === 'text' ? 'active' : ''}`,
    onClick: () => setActiveTab('text')
  }, "Text"), /*#__PURE__*/React.createElement("button", {
    className: `tab ${activeTab === 'warp' ? 'active' : ''}`,
    onClick: () => setActiveTab('warp')
  }, "\uD83C\uDFA8 \u6587\u672C\u53D8\u5F62"), /*#__PURE__*/React.createElement("button", {
    className: `tab ${activeTab === 'custom' ? 'active' : ''}`,
    onClick: () => setActiveTab('custom')
  }, "\u2728 Custom")), /*#__PURE__*/React.createElement("div", {
    className: "page-content"
  }, activeTab === 'text' && /*#__PURE__*/React.createElement(SelectText, {
    pathBounds: pathBounds,
    setPathBounds: setPathBounds,
    text: text,
    setText: setText,
    svgPath: svgPath,
    setSvgPath: setSvgPath,
    sandboxProxy: sandboxProxy
  }), activeTab === 'warp' && /*#__PURE__*/React.createElement(TextWarpPage, {
    pathBounds: pathBounds,
    setPathBounds: setPathBounds,
    text: text,
    svgPath: svgPath,
    setSvgPath: setSvgPath,
    sandboxProxy: sandboxProxy
  }), activeTab === 'custom' && /*#__PURE__*/React.createElement(CustomTextPage, {
    pathBounds: pathBounds,
    setPathBounds: setPathBounds,
    text: text,
    svgPath: svgPath,
    setSvgPath: setSvgPath,
    sandboxProxy: sandboxProxy
  })));
};
export default TextWarpApp;