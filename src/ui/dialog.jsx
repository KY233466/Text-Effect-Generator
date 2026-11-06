import React from "react";
import { createRoot } from "react-dom/client";
import addOnUISdk from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";
import TextWarpApp from "./TextWarpApp.js";
import { installUIInteractionGuards } from "./utils/uiInteractionGuards.js";
import {
  DEFAULT_EDITOR_STATE,
  EDITOR_DRAFT_STORAGE_KEY,
  normalizeEditorState,
} from "./utils/editorState.js";

installUIInteractionGuards();

addOnUISdk.ready.then(async () => {
  const root = createRoot(document.getElementById("root"));
  const savedDraft = await addOnUISdk.instance.clientStorage.getItem(
    EDITOR_DRAFT_STORAGE_KEY
  );
  const initialState = normalizeEditorState(savedDraft || DEFAULT_EDITOR_STATE);

  const closeDialog = (result) => {
    addOnUISdk.instance.runtime.dialog?.close(result);
  };

  root.render(
    <TextWarpApp
      initialState={initialState}
      isDialog
      onCancel={() => closeDialog({ action: "cancel" })}
      onApply={(state) => closeDialog({ action: "apply", state })}
    />
  );
});
