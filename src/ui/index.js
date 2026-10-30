import React from "react";
import { createRoot } from "react-dom/client";
import addOnUISdk from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";
import TextWarpApp from "./TextWarpApp.js";
import { insertWarpedSvg } from "./utils/svgImport.js";
import { EDITOR_DRAFT_STORAGE_KEY, normalizeEditorState } from "./utils/editorState.js";
addOnUISdk.ready.then(() => {
  const container = document.getElementById("root");
  const root = createRoot(container);
  const insertSvg = options => insertWarpedSvg(addOnUISdk.app.document, options);
  const openExpandedEditor = async editorState => {
    await addOnUISdk.instance.clientStorage.setItem(EDITOR_DRAFT_STORAGE_KEY, normalizeEditorState(editorState));
    try {
      const dialogResult = await addOnUISdk.app.showModalDialog({
        variant: "custom",
        title: "Edit text effect",
        src: "./dialog.html",
        size: {
          width: 900,
          height: 700
        }
      });
      const result = dialogResult?.result;
      return result?.action === "apply" ? normalizeEditorState(result.state) : null;
    } finally {
      await addOnUISdk.instance.clientStorage.removeItem(EDITOR_DRAFT_STORAGE_KEY);
    }
  };
  root.render(/*#__PURE__*/React.createElement(TextWarpApp, {
    insertWarpedSvg: insertSvg,
    openExpandedEditor: openExpandedEditor
  }));
});