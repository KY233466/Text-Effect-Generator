import React, { useState } from 'react';
import TextWarpPage from './components/TextWarpPage.js';
import CustomTextPage from './components/CustomTextPage.js';
import SelectText from './components/SelectText.js';

const TextWarpApp = ({ sandboxProxy }) => {
  const [activeTab, setActiveTab] = useState('text');
  const [text, setText] = useState("TEXT WARP\nMULTI LINE");
  const [svgPath, setSvgPath] = useState("");
  const [pathBounds, setPathBounds] = useState(null);

  return (
    <div className="app" style={{margin: '15px'}}>
      <div className="tab-container">
        <button
          className={`tab ${activeTab === 'text' ? 'active' : ''}`}
          style={{ marginRight: '10px', padding: '5px 10px', borderRadius: '30px'}}
          onClick={() => setActiveTab('text')}
        >
          Text
        </button>
        <button
          className={`tab ${activeTab === 'warp' ? 'active' : ''}`}
          style={{ marginRight: '10px', padding: '5px 10px', borderRadius: '30px' }}
          onClick={() => setActiveTab('warp')}
        >
          Shape
        </button>
        <button
          className={`tab ${activeTab === 'custom' ? 'active' : ''}`}
          style={{ padding: '5px 10px', borderRadius: '30px' }}
          onClick={() => setActiveTab('custom')}
        >
          ✨ Custom
        </button>
      </div>

      {/* <div className="page-content"> */}
        {activeTab === 'text' && 
          <SelectText 
            pathBounds={pathBounds} 
            setPathBounds={setPathBounds} 
            text={text} 
            setText={setText}
            svgPath={svgPath} 
            setSvgPath={setSvgPath} 
            sandboxProxy={sandboxProxy} />}
        {activeTab === 'warp' && 
          <TextWarpPage
            pathBounds={pathBounds} 
            setPathBounds={setPathBounds} 
            text={text} 
            svgPath={svgPath} 
            setSvgPath={setSvgPath} 
            sandboxProxy={sandboxProxy} />}
        {activeTab === 'custom' && 
          <CustomTextPage
            pathBounds={pathBounds}
            setPathBounds={setPathBounds}
            text={text}
            svgPath={svgPath}
            setSvgPath={setSvgPath}
            sandboxProxy={sandboxProxy} />}
      {/* </div> */}
    </div>
  );
};

export default TextWarpApp; 