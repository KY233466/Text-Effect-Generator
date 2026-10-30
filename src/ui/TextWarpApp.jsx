import React, { useCallback, useState } from "react";
import TextWarpPage from "./components/TextWarpPage.js";
import CustomTextPage from "./components/CustomTextPage.js";
import SelectText from "./components/SelectText.js";
import { useWarpSettings } from "./hooks/useWarpSettings.js";
import { normalizeEditorState } from "./utils/editorState.js";
import { limitText } from "./utils/textLimit.js";

const styles = {
  app: {
    width: "100%",
    height: "100%",
    padding: "5px 20px",
    boxSizing: "border-box",
    overflowY: "auto",
  },
  tabs: {
    backgroundColor: 'white',
    display: "flex",
    alignItems: "center",
    gap: "8px",
    paddingBottom: "16px",
  },
}

const TextWarpApp = ({
  insertWarpedSvg,
  openExpandedEditor,
  initialState,
  isDialog = false,
  onApply,
  onCancel,
}) => {
  const initial = normalizeEditorState(initialState);
  const [activeTab, setActiveTab] = useState(initial.activeTab);
  const [text, setTextState] = useState(initial.text);
  const [fontUrl, setFontUrl] = useState(initial.fontUrl);
  const [lineHeight, setLineHeight] = useState(initial.lineHeight);
  const [letterSpacing, setLetterSpacing] = useState(initial.letterSpacing);
  const [alignment, setAlignment] = useState(initial.alignment);
  const [isOpeningDialog, setIsOpeningDialog] = useState(false);
  const [dialogError, setDialogError] = useState("");
  const [customEffect, setCustomEffect] = useState(initial.customEffect);
  const [customEffectRevision, setCustomEffectRevision] = useState(0);

  const {
    warpType,
    setWarpType,
    intensity,
    setIntensity,
  } = useWarpSettings(initial.warpType, initial.intensity);

  const setText = (value) => {
    setTextState(limitText(value));
    setCustomEffect(null);
  };
  const updateFontUrl = (value) => {
    setFontUrl(value);
    setCustomEffect(null);
  };
  const updateLineHeight = (value) => {
    setLineHeight(value);
    setCustomEffect(null);
  };
  const updateLetterSpacing = (value) => {
    setLetterSpacing(value);
    setCustomEffect(null);
  };
  const updateAlignment = (value) => {
    setAlignment(value);
    setCustomEffect(null);
  };
  const handleCustomPreviewChange = useCallback((preview) => {
    setCustomEffect(preview);
  }, []);

  const getEditorState = () => normalizeEditorState({
    activeTab,
    text,
    fontUrl,
    lineHeight,
    letterSpacing,
    alignment,
    warpType,
    intensity,
    customEffect,
  });

  const applyEditorState = (state) => {
    const next = normalizeEditorState(state);
    setActiveTab(next.activeTab);
    setTextState(next.text);
    setFontUrl(next.fontUrl);
    setLineHeight(next.lineHeight);
    setLetterSpacing(next.letterSpacing);
    setAlignment(next.alignment);
    setWarpType(next.warpType);
    setIntensity(next.intensity);
    setCustomEffect(next.customEffect);
    setCustomEffectRevision((revision) => revision + 1);
  };

  const handleExpand = async () => {
    if (!openExpandedEditor || isOpeningDialog) return;

    setDialogError("");
    setIsOpeningDialog(true);
    try {
      const nextState = await openExpandedEditor(getEditorState());
      if (nextState) applyEditorState(nextState);
    } catch (error) {
      console.error("Could not open expanded editor", error);
      setDialogError("The larger editor could not be opened. Please try again.");
    } finally {
      setIsOpeningDialog(false);
    }
  };

  const tabStyle = (tabName) => ({
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
    <div
      className="app"
      style={{
        ...styles.app,
        ...(isDialog ? {
          height: "100vh",
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "20px 28px",
          overflowY: "auto",
        } : {}),
      }}
    >
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

      {dialogError && (
        <div role="alert" style={{ color: "#b42318", fontSize: "12px", marginBottom: "10px" }}>
          {dialogError}
        </div>
      )}

      <div>
        {activeTab === "text" && (
          <SelectText
            text={text}
            setText={setText}
            fontUrl={fontUrl}
            setFontUrl={updateFontUrl}
            lineHeight={lineHeight}
            setLineHeight={updateLineHeight}
            letterSpacing={letterSpacing}
            setLetterSpacing={updateLetterSpacing}
            alignment={alignment}
            setAlignment={updateAlignment}
            warpType={warpType}
            intensity={intensity}
            insertWarpedSvg={insertWarpedSvg}
            expanded={isDialog}
            showInsert={!isDialog}
            onExpand={!isDialog ? handleExpand : undefined}
            isExpanding={isOpeningDialog}
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
            insertWarpedSvg={insertWarpedSvg}
            expanded={isDialog}
            showInsert={!isDialog}
            onExpand={!isDialog ? handleExpand : undefined}
            isExpanding={isOpeningDialog}
          />
        )}
        {activeTab === "custom" && (
          <CustomTextPage
            key={`custom-${customEffectRevision}`}
            text={text}
            fontUrl={fontUrl}
            lineHeight={lineHeight}
            letterSpacing={letterSpacing}
            alignment={alignment}
            insertWarpedSvg={insertWarpedSvg}
            expanded={isDialog}
            showInsert={!isDialog}
            initialCustomEffect={customEffect}
            onPreviewChange={handleCustomPreviewChange}
            onExpand={!isDialog ? handleExpand : undefined}
            isExpanding={isOpeningDialog}
          />
        )}
      </div>

      {isDialog && (
        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "10px",
          padding: "14px 0 2px",
          borderTop: "1px solid #e6e6e6",
          background: "white",
          flexShrink: 0,
        }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: "9px 18px",
              borderRadius: "8px",
              border: "1px solid #b8b8b8",
              background: "white",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onApply?.(getEditorState())}
            disabled={activeTab === "custom" && !customEffect}
            style={{
              padding: "9px 20px",
              borderRadius: "8px",
              border: "1px solid #1178FF",
              background: activeTab === "custom" && !customEffect ? "#c8c8c8" : "#1178FF",
              color: "white",
              fontWeight: 600,
              cursor: activeTab === "custom" && !customEffect ? "not-allowed" : "pointer",
            }}
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
};

export default TextWarpApp;
