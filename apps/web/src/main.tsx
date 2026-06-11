import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, theme } from 'antd';
import 'antd/dist/reset.css';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { useThemeStore } from './stores/themeStore';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

function Root() {
  const mode = useThemeStore((state) => state.mode);

  return (
    <ConfigProvider
      theme={{
        algorithm: mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#7C3AED',
          borderRadius: 12,
          borderRadiusLG: 16,
          fontFamily:
            'Inter, PingFang SC, HarmonyOS Sans, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
        },
        components: {
          Button: {
            borderRadius: 10,
            fontWeight: 500
          },
          Card: {
            boxShadowTertiary: '0 1px 3px rgba(0, 0, 0, .08)'
          },
          Layout: {
            bodyBg: mode === 'dark' ? '#0f1115' : '#f9fafb',
            siderBg: mode === 'dark' ? '#111318' : '#ffffff',
            headerBg: mode === 'dark' ? '#111318' : '#ffffff'
          }
        }
      }}
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ConfigProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
