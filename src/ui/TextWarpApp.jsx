import React, { useState } from 'react';
import TextWarpPage from './components/TextWarpPage.js';
import CustomTextPage from './components/CustomTextPage.js';
import SelectText from './components/SelectText.js';

const TextWarpApp = ({ sandboxProxy }) => {
  const [activeTab, setActiveTab] = useState('text');
  const [text, setText] = useState("TEXT WARP\nMULTI LINE");
  const [fontUrl, setFontUrl] = useState("./fonts/Arial.ttf");
  const [lineHeight, setLineHeight] = useState(1.2);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [alignment, setAlignment] = useState("center");

  return (
    <div className="app" style={{ margin: '15px' }}>
      <div className="tab-container">
        <button
          className={`tab ${activeTab === 'text' ? 'active' : ''}`}
          style={{ marginRight: '10px', padding: '5px 10px', borderRadius: '30px' }}
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

      {activeTab === 'text' &&
        <SelectText
          text={text}
          setText={setText}
          fontUrl={fontUrl}
          setFontUrl={setFontUrl}
          lineHeight={lineHeight}
          setLineHeight={setLineHeight}
          letterSpacing={letterSpacing}
          setLetterSpacing={setLetterSpacing}
          alignment={alignment}
          setAlignment={setAlignment}
          sandboxProxy={sandboxProxy} />}
      {activeTab === 'warp' &&
        <TextWarpPage
          text={text}
          fontUrl={fontUrl}
          lineHeight={lineHeight}
          letterSpacing={letterSpacing}
          alignment={alignment}
          sandboxProxy={sandboxProxy} />}
      {activeTab === 'custom' &&
        <CustomTextPage
          text={text}
          fontUrl={fontUrl}
          lineHeight={lineHeight}
          letterSpacing={letterSpacing}
          alignment={alignment}
          sandboxProxy={sandboxProxy} />}
    </div>
  );
};

export default TextWarpApp; 