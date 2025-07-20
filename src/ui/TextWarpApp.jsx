import React, { useState } from "react";
import TextWarpPage from "./components/TextWarpPage.js";
import CustomTextPage from "./components/CustomTextPage.js";
import SelectText from "./components/SelectText.js";
import { useWarpSettings } from "./hooks/useWarpSettings.js";

const styles = {
  app: {
    width: "100%",
    height: "100%",
    padding: "5px 20px",
  },
  tabs: {
    backgroundColor: 'white',
    display: "flex",
    paddingBottom: "16px",
    position: "sticky",
    top: 0,
    zIndex: 2,
  },
}

const TextWarpApp = ({ sandboxProxy }) => {
  const [activeTab, setActiveTab] = useState("text");
  const [text, setText] = useState("TEXT WARP\nMULTI LINE");
  const [fontUrl, setFontUrl] = useState("./fonts/Arial.ttf");
  const [lineHeight, setLineHeight] = useState(1.2);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [alignment, setAlignment] = useState("center");
  
  const {
    warpType,
    setWarpType,
    intensity,
    setIntensity,
  } = useWarpSettings("wave", 50);

  const tabStyle = (tabName) => ({
    marginRight: tabName !== "custom" ? "10px" : "0",
    padding: "4px 16px",
    borderRadius: "30px",
    border: "none",
    border: activeTab === tabName ? "1px solid #1178FF" : "1px solid #CBE2FF",
    backgroundColor: activeTab === tabName ? "#1178FF" : "white",
    color: activeTab === tabName ? "white" : "#808080",
    fontSize: "14px",
    fontFamily: "Avenir Next",
    fontWeight: activeTab === tabName ? "600" : "500",
    cursor: "pointer",
  });

  return (
    <div className="app" style={styles.app}>
      <div
        className="tab-container"
        style={styles.tabs}
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
          warpType={warpType}
          intensity={intensity}
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
          warpType={warpType}
          setWarpType={setWarpType}
          intensity={intensity}
          setIntensity={setIntensity}
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
