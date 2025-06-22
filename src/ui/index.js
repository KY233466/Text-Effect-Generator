import React from "react";
import { createRoot } from "react-dom/client";
import addOnUISdk from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";
import TextWarpApp from "./TextWarpApp.js";

const { createElement: h } = React;

addOnUISdk.ready.then(async () => {
  const { runtime } = addOnUISdk.instance;
  const sandboxProxy = await runtime.apiProxy("documentSandbox");
  const container = document.getElementById("root");
  const root = createRoot(container);
  root.render(h(TextWarpApp, { sandboxProxy }));
}); 