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
    className: "app",
    style: {
      margin: '15px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "tab-container"
  }, /*#__PURE__*/React.createElement("button", {
    className: `tab ${activeTab === 'text' ? 'active' : ''}`,
    style: {
      marginRight: '10px',
      padding: '5px 10px',
      borderRadius: '30px'
    },
    onClick: () => setActiveTab('text')
  }, "Text"), /*#__PURE__*/React.createElement("button", {
    className: `tab ${activeTab === 'warp' ? 'active' : ''}`,
    style: {
      marginRight: '10px',
      padding: '5px 10px',
      borderRadius: '30px'
    },
    onClick: () => setActiveTab('warp')
  }, "Shape"), /*#__PURE__*/React.createElement("button", {
    className: `tab ${activeTab === 'custom' ? 'active' : ''}`,
    style: {
      padding: '5px 10px',
      borderRadius: '30px'
    },
    onClick: () => setActiveTab('custom')
  }, "\u2728 Custom")), activeTab === 'text' && /*#__PURE__*/React.createElement(SelectText, {
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
  }));
};
export default TextWarpApp;