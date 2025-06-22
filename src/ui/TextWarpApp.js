import React, { useState } from 'react';
import TextWarpPage from './components/TextWarpPage.js';
import CustomTextPage from './components/CustomTextPage.js';

const { createElement: h } = React;

const TextWarpApp = ({ sandboxProxy }) => {
  // Tab 状态管理
  const [activeTab, setActiveTab] = useState('warp'); // 'warp' 或 'custom'

  return h('div', { className: 'text-warp-app' },
    // Tab 导航
    h('div', { className: 'tab-navigation' },
      h('button', {
        onClick: () => setActiveTab('warp'),
        className: `tab-button ${activeTab === 'warp' ? 'active' : ''}`
      }, '🎨 文本变形'),
      
      h('button', {
        onClick: () => setActiveTab('custom'),
        className: `tab-button ${activeTab === 'custom' ? 'active' : ''}`
      }, '✨ 自定义文本')
    ),

    // 页面内容容器
    h('div', { className: 'page-content' },
      // 条件渲染页面内容
      activeTab === 'warp' ? 
        h(TextWarpPage, { sandboxProxy }) :
        h(CustomTextPage, { sandboxProxy })
    )
  );
};

export default TextWarpApp; 