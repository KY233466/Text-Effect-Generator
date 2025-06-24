import React, { useState } from 'react';
import Mesh from "./Mesh/mesh.js";
import Smudge from "./Smudge/smudge.js";

const CustomTextPage = ({ sandboxProxy }) => {

  const Shape = ["mesh", "smudge"];
  const [selected, setSelected] = useState("mesh");


  return (
    <div>
      {selected == "mesh" ? <Mesh sandboxProxy={sandboxProxy} /> : <Smudge sandboxProxy={sandboxProxy} />}
      <div>Shape</div>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
        {Shape.map((s) => <button style={{
          width: '85px', height: '85px',
          borderRadius: '10px', border: '1px solid black', cursor: ''
        }}
          onClick={() => setSelected(s)}
        >{s}</button>)}
      </div>

    </div>
  );
};

export default CustomTextPage; 