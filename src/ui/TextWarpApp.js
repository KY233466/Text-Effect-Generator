import React, { useState } from 'react';
import TextWarpPage from './components/TextWarpPage.js';
import CustomTextPage from './components/CustomTextPage.js';

const { createElement: h } = React;

const TextWarpApp = ({ sandboxProxy }) => {
  const [activeTab, setActiveTab] = useState('warp');

  return h('div', { className: 'app' },
    h('div', { className: 'tab-container' },
      h('button', {
        className: `tab ${activeTab === 'warp' ? 'active' : ''}`,
        onClick: () => setActiveTab('warp')
      }, '🎨 文本变形'),
      
      h('button', {
        className: `tab ${activeTab === 'custom' ? 'active' : ''}`,
        onClick: () => setActiveTab('custom')
      }, '✨ 自定义文本')
    ),

    h('div', { className: 'page-content' },
      activeTab === 'warp' && h(TextWarpPage, { sandboxProxy }),
      activeTab === 'custom' && h(CustomTextPage, { sandboxProxy })
    )
  );
};

export default TextWarpApp; 