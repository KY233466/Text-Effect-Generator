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

  const tabStyle = (tabName) => ({
    marginRight: tabName !== "custom" ? "10px" : "0",
    padding: "5px 10px",
    borderRadius: "30px",
    border: "none",
    backgroundColor: activeTab === tabName ? "#1178FF" : "#EBF3FE",
    color: activeTab === tabName ? "#FFFFFF" : "#06001A",
    fontWeight: "500",
    cursor: "pointer",
  });

  return (
    <div className="app" style={{ margin: "15px" }}>
      <div
        className="tab-container"
        style={{ display: "flex", marginBottom: "16px" }}
      >
        <button
          className={`tab ${activeTab === "text" ? "active" : ""}`}
          style={tabStyle("text")}
          onClick={() => setActiveTab("text")}
        >
          Text
        </button>
        <button
          className={`tab ${activeTab === "warp" ? "active" : ""}`}
          style={tabStyle("warp")}
          onClick={() => setActiveTab("warp")}
        >
          Shape
        </button>
        <button
          className={`tab ${activeTab === "custom" ? "active" : ""}`}
          style={tabStyle("custom")}
          onClick={() => setActiveTab("custom")}
        >
          ✨ Customize
        </button>
      </div>

      {activeTab === "text" && (
        <SelectText
          text={text}
          setText={setText}
          fontUrl={fontUrl}
          setFontUrl={setFontUrl}
          lineHeight={lineHeight}
          setLineHeight={setLineHeight}
          letterSpacing={letterSpacing}
          setLetterSpacing={setLetterSpacing}
          alignment={alignment}
          setAlignment={setAlignment}
          sandboxProxy={sandboxProxy}
        />
      )}
      {activeTab === "warp" && (
        <TextWarpPage
          text={text}
          fontUrl={fontUrl}
          lineHeight={lineHeight}
          letterSpacing={letterSpacing}
          alignment={alignment}
          sandboxProxy={sandboxProxy}
        />
      )}
      {activeTab === "custom" && (
        <CustomTextPage
          text={text}
          fontUrl={fontUrl}
          lineHeight={lineHeight}
          letterSpacing={letterSpacing}
          alignment={alignment}
          sandboxProxy={sandboxProxy}
        />
      )}
    </div>
  );
};

export default TextWarpApp;
