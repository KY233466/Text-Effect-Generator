import React from "react";
import { createRoot } from "react-dom/client";
import addOnUISdk from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";
import opentype from "opentype.js";
import TextWarpApp from "./TextWarpApp.js";
import App from "./App.jsx";

// 将 opentype 添加到全局对象，供其他组件使用
window.opentype = opentype;

addOnUISdk.ready.then(async () => {
  const { runtime } = addOnUISdk.instance;
  const sandboxProxy = await runtime.apiProxy("documentSandbox");
  const container = document.getElementById("root");
  const root = createRoot(container);
  root.render(React.createElement(App, { sandboxProxy }));
}); 