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
        <h3 style={{ margin: '0 0 16px 0', color: '#999' }}>Custom?</h3>
        {/* <Mesh /> */}
        <Smudge/>
      {/* </div> */}
    </div>
  );
};

export default CustomTextPage; 