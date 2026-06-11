import {
  AppstoreOutlined,
  AuditOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  KeyOutlined,
  MoonOutlined,
  QuestionCircleOutlined,
  WechatOutlined,
  SunOutlined
} from '@ant-design/icons';
import { Button, Form, Input, Layout, Menu, Modal, Space, Typography } from 'antd';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PROJECT_NAME } from '@ai-company-assistant/shared';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';

const { Content, Header, Sider } = Layout;
const { Text } = Typography;

export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { token, setToken, clearToken } = useAuthStore();
  const { mode, toggleMode } = useThemeStore();
  const [tokenOpen, setTokenOpen] = useState(false);
  const [tokenDraft, setTokenDraft] = useState(token);

  const selectedKeys = useMemo(() => {
    if (location.pathname.startsWith('/documents')) return ['/documents'];
    if (location.pathname.startsWith('/ask-ai')) return ['/ask-ai'];
    if (location.pathname.startsWith('/chat-logs')) return ['/chat-logs'];
    if (location.pathname.startsWith('/wecom-bots')) return ['/wecom-bots'];
    return ['/'];
  }, [location.pathname]);

  return (
    <Layout className="app-layout">
      <Sider className="app-sidebar" width={240}>
        <div className="brand">
          <div className="brand-mark">AI</div>
          <div>
            <Text strong>{PROJECT_NAME}</Text>
            <Text type="secondary">Knowledge Base</Text>
          </div>
        </div>

        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          items={[
            {
              key: '/',
              icon: <AppstoreOutlined />,
              label: <Link to="/">Dashboard</Link>
            },
            {
              key: 'knowledge',
              type: 'group',
              label: 'Knowledge Base',
              children: [
                {
                  key: '/documents',
                  icon: <FileTextOutlined />,
                  label: <Link to="/documents">Documents</Link>
                }
              ]
            },
            {
              key: 'ai',
              type: 'group',
              label: 'AI Assistant',
              children: [
                {
                  key: '/ask-ai',
                  icon: <QuestionCircleOutlined />,
                  label: <Link to="/ask-ai">Ask AI</Link>
                },
                {
                  key: '/chat-logs',
                  icon: <AuditOutlined />,
                  label: <Link to="/chat-logs">Chat Logs</Link>
                }
              ]
            },
            {
              key: 'integrations',
              type: 'group',
              label: 'Integrations',
              children: [
                {
                  key: '/wecom-bots',
                  icon: <WechatOutlined />,
                  label: <Link to="/wecom-bots">WeCom Bot</Link>
                }
              ]
            },
            {
              key: 'system',
              type: 'group',
              label: 'System',
              children: [
                {
                  key: 'api-token',
                  icon: <KeyOutlined />,
                  label: 'Access Token',
                  onClick: () => {
                    setTokenDraft(token);
                    setTokenOpen(true);
                  }
                }
              ]
            }
          ]}
        />
      </Sider>

      <Layout>
        <Header className="app-header">
          <Space>
            <DatabaseOutlined />
            <Text type="secondary">
              {token ? 'API token connected' : 'Set Access Token before calling protected APIs'}
            </Text>
          </Space>
          <Space>
            <Button
              icon={mode === 'dark' ? <SunOutlined /> : <MoonOutlined />}
              onClick={toggleMode}
            >
              {mode === 'dark' ? 'Light' : 'Dark'}
            </Button>
            <Button
              icon={<KeyOutlined />}
              onClick={() => {
                setTokenDraft(token);
                setTokenOpen(true);
              }}
            >
              Token
            </Button>
          </Space>
        </Header>
        <Content className="app-content">{children}</Content>
      </Layout>

      <Modal
        title="Access Token"
        open={tokenOpen}
        okText="Save"
        cancelText="Cancel"
        onCancel={() => setTokenOpen(false)}
        onOk={() => {
          setToken(tokenDraft);
          setTokenOpen(false);
        }}
        footer={(_, { OkBtn, CancelBtn }) => (
          <Space>
            <Button
              danger
              onClick={() => {
                clearToken();
                setTokenDraft('');
                setTokenOpen(false);
              }}
            >
              Clear
            </Button>
            <CancelBtn />
            <OkBtn />
          </Space>
        )}
      >
        <Form layout="vertical">
          <Form.Item
            label="Bearer Token"
            extra="Login/register endpoints can provide this token. It is stored locally and sent with API requests."
          >
            <Input.Password
              placeholder="Paste access token"
              value={tokenDraft}
              onChange={(event) => setTokenDraft(event.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}
