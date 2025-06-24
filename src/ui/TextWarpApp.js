import React, { useState } from 'react';
import TextWarpPage from './components/TextWarpPage.js';
import CustomTextPage from './components/CustomTextPage.js';
import SelectText from './components/SelectText.js';
const TextWarpApp = ({
  sandboxProxy
}) => {
  const [activeTab, setActiveTab] = useState('text');
  const [text, setText] = useState("TEXT WARP\nMULTI LINE");
  const [fontUrl, setFontUrl] = useState("./fonts/Arial.ttf");
  const [lineHeight, setLineHeight] = useState(1.2);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [alignment, setAlignment] = useState("center");
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
    text: text,
    setText: setText,
    fontUrl: fontUrl,
    setFontUrl: setFontUrl,
    lineHeight: lineHeight,
    setLineHeight: setLineHeight,
    letterSpacing: letterSpacing,
    setLetterSpacing: setLetterSpacing,
    alignment: alignment,
    setAlignment: setAlignment,
    sandboxProxy: sandboxProxy
  }), activeTab === 'warp' && /*#__PURE__*/React.createElement(TextWarpPage, {
    text: text,
    fontUrl: fontUrl,
    lineHeight: lineHeight,
    letterSpacing: letterSpacing,
    alignment: alignment,
    sandboxProxy: sandboxProxy
  }), activeTab === 'custom' && /*#__PURE__*/React.createElement(CustomTextPage, {
    text: text,
    fontUrl: fontUrl,
    lineHeight: lineHeight,
    letterSpacing: letterSpacing,
    alignment: alignment,
    sandboxProxy: sandboxProxy
  }));
};
export default TextWarpApp;