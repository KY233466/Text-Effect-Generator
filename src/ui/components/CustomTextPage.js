import React, { useState } from 'react';
import Mesh from "./Mesh/mesh.js";
import Smudge from "./Smudge/smudge.js";
const CustomTextPage = ({
  sandboxProxy
}) => {
  const Shape = ["mesh", "smudge"];
  const [selected, setSelected] = useState("mesh");
  return /*#__PURE__*/React.createElement("div", null, selected == "mesh" ? /*#__PURE__*/React.createElement(Mesh, {
    sandboxProxy: sandboxProxy
  }) : /*#__PURE__*/React.createElement(Smudge, {
    sandboxProxy: sandboxProxy
  }), /*#__PURE__*/React.createElement("div", null, "Shape"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'row',
      gap: '10px'
    }
  }, Shape.map(s => /*#__PURE__*/React.createElement("button", {
    style: {
      width: '85px',
      height: '85px',
      borderRadius: '10px',
      border: '1px solid black',
      cursor: ''
    },
    onClick: () => setSelected(s)
  }, s))));
};
export default CustomTextPage;