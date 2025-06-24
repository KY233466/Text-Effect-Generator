import React from 'react';
import Mesh from "./Mesh/mesh.js";
import Smudge from "./Smudge/smudge.js";
const CustomTextPage = ({
  sandboxProxy
}) => {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Mesh, {
    sandboxProxy: sandboxProxy
  }));
};
export default CustomTextPage;