import React from 'react';

const { createElement: h } = React;

const CustomTextPage = ({ sandboxProxy }) => {
  return h('div', { className: 'custom-text-page' },
    h('div', { 
      style: { 
        textAlign: 'center', 
        padding: '60px 20px',
        color: '#666'
      } 
    },
      h('h3', { style: { margin: '0 0 16px 0', color: '#999' } }, '自定义文本'),
      h('p', { style: { margin: '0', fontSize: '14px' } }, '此功能正在开发中...')
    )
  );
};

export default CustomTextPage; 