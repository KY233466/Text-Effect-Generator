import React from 'react';
import Mesh from "./Mesh/mesh.js";
const CustomTextPage = ({
  sandboxProxy
}) => {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: '0 0 16px 0',
      color: '#999'
    }
  }, "Custom?"), /*#__PURE__*/React.createElement(Mesh, null));
};
export default CustomTextPage;