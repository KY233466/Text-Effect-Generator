import React from 'react';
import Mesh from "./Mesh/mesh.js";
import Smudge from "./Smudge/smudge.js";

const CustomTextPage = ({ sandboxProxy }) => {
  return (
    <div>
      {/* <div style={{ 
        textAlign: 'center', 
        padding: '60px 20px',
        color: '#666'
      }}> */}
      <Mesh sandboxProxy={sandboxProxy} />
      {/* <Smudge sandboxProxy={sandboxProxy} /> */}
      {/* </div> */}
    </div>
  );
};

export default CustomTextPage; 