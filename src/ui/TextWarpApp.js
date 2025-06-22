import React, { useState } from 'react';
import TextWarpPage from './components/TextWarpPage.js';
import CustomTextPage from './components/CustomTextPage.js';
const TextWarpApp = ({
  sandboxProxy
}) => {
  const [activeTab, setActiveTab] = useState('warp');
  return /*#__PURE__*/React.createElement("div", {
    className: "app"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tab-container"
  }, /*#__PURE__*/React.createElement("button", {
    className: `tab ${activeTab === 'warp' ? 'active' : ''}`,
    onClick: () => setActiveTab('warp')
  }, "\uD83C\uDFA8 \u6587\u672C\u53D8\u5F62"), /*#__PURE__*/React.createElement("button", {
    className: `tab ${activeTab === 'custom' ? 'active' : ''}`,
    onClick: () => setActiveTab('custom')
  }, "\u2728 Custom")), /*#__PURE__*/React.createElement("div", {
    className: "page-content"
  }, activeTab === 'warp' && /*#__PURE__*/React.createElement(TextWarpPage, {
    sandboxProxy: sandboxProxy
  }), activeTab === 'custom' && /*#__PURE__*/React.createElement(CustomTextPage, {
    sandboxProxy: sandboxProxy
  })));
};
export default TextWarpApp;