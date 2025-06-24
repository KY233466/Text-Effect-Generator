import React, { useState } from 'react';
import Mesh from "./Mesh/mesh.js";
import Smudge from "./Smudge/smudge.js";

const CustomTextPage = ({
  sandboxProxy,
  text,
  fontUrl,
  lineHeight,
  letterSpacing,
  alignment }) => {

  const Shape = ["mesh", "smudge"];
  const [selected, setSelected] = useState("mesh");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [svgPath, setSvgPath] = useState("");
  const [pathBounds, setPathBounds] = useState(null);

  const handleInsert = async () => {
    if (!sandboxProxy || !svgPath || !pathBounds) {
      console.error('缺少必要数据');
      return;
    }
    setIsLoading(true);
    try {
      const result = await sandboxProxy.insertWarpedSVG({
        d: svgPath,
        bounds: pathBounds,
        originalText: text,
        warpType: 'custom',
        intensity: 1
      });
      if (!result.success) {
        setError(result.error);
      }
    } catch (e) {
      setError(`插入异常: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {selected == "mesh" ? <Mesh
        setPathBounds={setPathBounds}
        text={text}
        setSvgPath={setSvgPath}
        fontUrl={fontUrl}
        lineHeight={lineHeight}
        letterSpacing={letterSpacing}
        alignment={alignment}
      /> : <Smudge
        pathBounds={pathBounds}
        setPathBounds={setPathBounds}
        text={text}
        setSvgPath={setSvgPath}
        fontUrl={fontUrl}
        lineHeight={lineHeight}
        letterSpacing={letterSpacing}
        alignment={alignment}
      />}
      <div>Shape</div>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
        {Shape.map((s) => <button style={{
          width: '85px', height: '85px',
          borderRadius: '10px', border: '1px solid black', cursor: ''
        }}
          onClick={() => setSelected(s)}
        >{s}</button>)}
      </div>

      <div className="button-group">
        <button
          onClick={handleInsert}
          disabled={isLoading || !svgPath}
          className="insert-button primary"
        >
          {isLoading ? '插入中...' : '插入变形文本'}
        </button>
      </div>

    </div>
  );
};

export default CustomTextPage; 