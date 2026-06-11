import React from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider } from 'antd';
import 'antd/dist/reset.css';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#7C3AED',
          borderRadius: 12,
          fontFamily:
            'Inter, PingFang SC, HarmonyOS Sans, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
        }
      }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
