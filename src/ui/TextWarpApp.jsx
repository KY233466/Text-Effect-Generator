import React, { useState } from 'react';
import TextWarpPage from './components/TextWarpPage.js';
import CustomTextPage from './components/CustomTextPage.js';

const TextWarpApp = ({ sandboxProxy }) => {
  const [activeTab, setActiveTab] = useState('warp');

  return (
    <div className="app">
      <div className="tab-container">
        <button 
          className={`tab ${activeTab === 'warp' ? 'active' : ''}`}
          onClick={() => setActiveTab('warp')}
        >
          🎨 文本变形
        </button>
        <button 
          className={`tab ${activeTab === 'custom' ? 'active' : ''}`}
          onClick={() => setActiveTab('custom')}
        >
          ✨ Custom
        </button>
      </div>

      <div className="page-content">
        {activeTab === 'warp' && <TextWarpPage sandboxProxy={sandboxProxy} />}
        {activeTab === 'custom' && <CustomTextPage sandboxProxy={sandboxProxy} />}
      </div>
    </div>
  );
};

export default TextWarpApp; 