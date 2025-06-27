import React, { useState } from "react";
import TextWarpPage from "./components/TextWarpPage.js";
import CustomTextPage from "./components/CustomTextPage.js";
import SelectText from "./components/SelectText.js";
const TextWarpApp = ({
  sandboxProxy
}) => {
  const [activeTab, setActiveTab] = useState("text");
  const [text, setText] = useState("TEXT WARP\nMULTI LINE");
  const [fontUrl, setFontUrl] = useState("./fonts/Arial.ttf");
  const [lineHeight, setLineHeight] = useState(1.2);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [alignment, setAlignment] = useState("center");
  const tabStyle = tabName => ({
    marginRight: tabName !== "custom" ? "10px" : "0",
    padding: "5px 10px",
    borderRadius: "30px",
    border: "none",
    backgroundColor: activeTab === tabName ? "#1178FF" : "#EBF3FE",
    color: activeTab === tabName ? "white" : "#06001A",
    fontSize: "14px",
    fontFamily: "Avenir Next",
    fontWeight: activeTab === tabName ? "600" : "500",
    cursor: "pointer"
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "app",
    style: {
      width: "100%",
      height: "100%",
      padding: "5px 20px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "tab-container",
    style: {
      backgroundColor: 'white',
      display: "flex",
      paddingBottom: "16px",
      position: "sticky",
      top: 0,
      zIndex: 2
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: `tab ${activeTab === "text" ? "active" : ""}`,
    style: tabStyle("text"),
    onClick: () => setActiveTab("text")
  }, "Text"), /*#__PURE__*/React.createElement("button", {
    className: `tab ${activeTab === "warp" ? "active" : ""}`,
    style: tabStyle("warp"),
    onClick: () => setActiveTab("warp")
  }, "Shape"), /*#__PURE__*/React.createElement("button", {
    className: `tab ${activeTab === "custom" ? "active" : ""}`,
    style: tabStyle("custom"),
    onClick: () => setActiveTab("custom")
  }, "\u2728 Customize")), activeTab === "text" && /*#__PURE__*/React.createElement(SelectText, {
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
  }), activeTab === "warp" && /*#__PURE__*/React.createElement(TextWarpPage, {
    text: text,
    fontUrl: fontUrl,
    lineHeight: lineHeight,
    letterSpacing: letterSpacing,
    alignment: alignment,
    sandboxProxy: sandboxProxy
  }), activeTab === "custom" && /*#__PURE__*/React.createElement(CustomTextPage, {
    text: text,
    fontUrl: fontUrl,
    lineHeight: lineHeight,
    letterSpacing: letterSpacing,
    alignment: alignment,
    sandboxProxy: sandboxProxy
  }));
};
export default TextWarpApp;