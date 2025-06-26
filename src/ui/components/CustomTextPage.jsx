import React, { useState } from 'react';
import Mesh from "./Mesh/mesh.js";
import Smudge from "./Smudge/smudge.js";

// 样式对象
const styles = {
  container: {
    width: '280px',
    marginLeft: '20px',
    marginRight: '20px'
  },
  label: {
    color: "#06001A",
    fontSize: "14px",
    fontFamily: "Avenir Next",
    fontWeight: "600",
    marginBottom: "8px",
    display: "block"
  },
  shapeContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: '10px',
    marginBottom: '24px'
  },
  shapeButton: {
    width: '85px',
    height: '85px',
    borderRadius: '10px',
    border: '1px solid #CBE2FF',
    cursor: 'pointer',
    backgroundColor: 'white',
    fontSize: '14px',
    fontFamily: 'Avenir Next',
    fontWeight: '500',
    color: '#495057',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    ':hover': {
      backgroundColor: '#007bff',
      color: 'white',
      borderColor: '#007bff',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(0,123,255,0.3)'
    }
  },
  shapeButtonSelected: {
    backgroundColor: '#007bff',
    color: 'white',
    borderColor: '#007bff'
  },
  buttonGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: '20px'
  },
  insertButton: {
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'Avenir Next',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    minWidth: '120px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    padding: '12px 24px',
    background: '#1178FF',
    color: 'white'
  },
  insertButtonDisabled: {
    backgroundColor: '#ccc',
    color: '#666',
    cursor: 'not-allowed',
    transform: 'none',
    boxShadow: 'none'
  },
  errorMessage: {
    color: '#dc3545',
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
    padding: '8px 12px',
    borderRadius: '4px',
    textAlign: 'center',
    marginTop: '12px'
  }
};

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
    <div style={styles.container}>
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
      
      <label style={styles.label}>Shape</label>
      <div style={styles.shapeContainer}>
        {Shape.map((s) => (
          <button
            key={s}
            style={{
              ...styles.shapeButton,
              ...(selected === s ? styles.shapeButtonSelected : {})
            }}
            onClick={() => setSelected(s)}
            onMouseEnter={(e) => {
              if (selected !== s) {
                e.target.style.backgroundColor = '#007bff';
                e.target.style.color = 'white';
                e.target.style.borderColor = '#007bff';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 8px rgba(0,123,255,0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (selected !== s) {
                e.target.style.backgroundColor = 'white';
                e.target.style.color = '#495057';
                e.target.style.borderColor = '#CBE2FF';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {error && <div style={styles.errorMessage}>{error}</div>}

      <div style={styles.buttonGroup}>
        <button
          onClick={handleInsert}
          disabled={isLoading || !svgPath}
          style={{
            ...styles.insertButton,
            ...(isLoading || !svgPath ? styles.insertButtonDisabled : {})
          }}
          onMouseEnter={(e) => {
            if (!isLoading && svgPath) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(17, 120, 255, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading && svgPath) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(17, 120, 255, 0.3)';
            }
          }}
        >
          {isLoading ? '插入中...' : '插入变形文本'}
        </button>
      </div>
    </div>
  );
};

export default CustomTextPage; 