import React, { useState } from "react";
import TextWarpPage from "./components/TextWarpPage.js";
import CustomTextPage from "./components/CustomTextPage.js";
import SelectText from "./components/SelectText.js";

const TextWarpApp = ({ sandboxProxy }) => {
  const [activeTab, setActiveTab] = useState("text");
  const [text, setText] = useState("TEXT WARP\nMULTI LINE");
  const [fontUrl, setFontUrl] = useState("./fonts/Arial.ttf");
  const [lineHeight, setLineHeight] = useState(1.2);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [alignment, setAlignment] = useState("center");

  return /*#__PURE__*/ React.createElement(
    "div",
    {
      className: "app",
      style: {
        margin: "15px",
      },
    },
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "tab-container",
      },
      /*#__PURE__*/ React.createElement(
        "button",
        {
          className: `tab ${activeTab === "text" ? "active" : ""}`,
          style: {
            marginRight: "10px",
            padding: "6px 16px",
            borderRadius: "20px",
            border: activeTab === "text" ? "none" : "1px solid #EBF3FE",
            backgroundColor: activeTab === "text" ? "#1178FF" : "#EBF3FE",
            color: activeTab === "text" ? "#FFFFFF" : "#06001A",
            fontWeight: 500,
            cursor: "pointer",
            outline: "none",
            transition: "all 0.2s ease",
          },
          onClick: () => setActiveTab("text"),
        },
        "Text"
      ),

      /*#__PURE__*/ React.createElement(
        "button",
        {
          className: `tab ${activeTab === "warp" ? "active" : ""}`,
          style: {
            marginRight: "10px",
            padding: "6px 16px",
            borderRadius: "20px",
            border: activeTab === "warp" ? "none" : "1px solid #EBF3FE",
            backgroundColor: activeTab === "warp" ? "#1178FF" : "#EBF3FE",
            color: activeTab === "warp" ? "#FFFFFF" : "#06001A",
            fontWeight: 500,
            cursor: "pointer",
            outline: "none",
            transition: "all 0.2s ease",
          },
          onClick: () => setActiveTab("warp"),
        },
        "Shape"
      ),

      /*#__PURE__*/ React.createElement(
        "button",
        {
          className: `tab ${activeTab === "custom" ? "active" : ""}`,
          style: {
            padding: "6px 16px",
            borderRadius: "20px",
            border: activeTab === "custom" ? "none" : "1px solid #EBF3FE",
            backgroundColor: activeTab === "custom" ? "#1178FF" : "#EBF3FE",
            color: activeTab === "custom" ? "#FFFFFF" : "#06001A",
            fontWeight: 500,
            cursor: "pointer",
            outline: "none",
            transition: "all 0.2s ease",
          },
          onClick: () => setActiveTab("custom"),
        },
        "Customize"
      )
    ),

    activeTab === "text" &&
      /*#__PURE__*/ React.createElement(SelectText, {
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
        sandboxProxy: sandboxProxy,
      }),

    activeTab === "warp" &&
      /*#__PURE__*/ React.createElement(TextWarpPage, {
        text: text,
        fontUrl: fontUrl,
        lineHeight: lineHeight,
        letterSpacing: letterSpacing,
        alignment: alignment,
        sandboxProxy: sandboxProxy,
      }),

    activeTab === "custom" &&
      /*#__PURE__*/ React.createElement(CustomTextPage, {
        text: text,
        fontUrl: fontUrl,
        lineHeight: lineHeight,
        letterSpacing: letterSpacing,
        alignment: alignment,
        sandboxProxy: sandboxProxy,
      })
  );
};

export default TextWarpApp;
