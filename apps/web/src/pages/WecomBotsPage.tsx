import {
  DeleteOutlined,
  PlusOutlined,
  SendOutlined,
  WechatOutlined
} from '@ant-design/icons';
import type {
  WecomBot,
  WecomMessageType
} from '@ai-company-assistant/shared';
import type { TableColumnsType } from 'antd';
import {
  App,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Skeleton,
  Space,
  Table,
  Tag,
  Typography
} from 'antd';
import { useState } from 'react';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import {
  useCreateWecomBotMutation,
  useDeleteWecomBotMutation,
  useTestSendWecomBotMutation,
  useWecomBotsQuery
} from '../queries/wecom';
import { getFriendlyErrorMessage } from '../utils/errors';
import { formatDateTime } from '../utils/format';

const { Paragraph, Text } = Typography;

interface CreateBotForm {
  name: string;
  webhookUrl: string;
  secret?: string;
}

interface TestSendForm {
  msgtype: WecomMessageType;
  content: string;
}

const defaultTestContent =
  '**AI Company Assistant** test message from your dashboard.';

function maskWebhookUrl(webhookUrl: string) {
  try {
    const parsed = new URL(webhookUrl);
    const key = parsed.searchParams.get('key');
    if (!key) {
      return `${parsed.origin}${parsed.pathname}`;
    }

    const maskedKey =
      key.length <= 8 ? '********' : `${key.slice(0, 4)}...${key.slice(-4)}`;
    parsed.searchParams.set('key', maskedKey);
    return parsed.toString();
  } catch {
    return webhookUrl;
  }
}

export function WecomBotsPage() {
  const { message } = App.useApp();
  const botsQuery = useWecomBotsQuery();
  const createMutation = useCreateWecomBotMutation();
  const deleteMutation = useDeleteWecomBotMutation();
  const testSendMutation = useTestSendWecomBotMutation();
  const [createOpen, setCreateOpen] = useState(false);
  const [testBot, setTestBot] = useState<WecomBot | null>(null);
  const [createForm] = Form.useForm<CreateBotForm>();
  const [testForm] = Form.useForm<TestSendForm>();

  const columns: TableColumnsType<WecomBot> = [
    {
      title: 'Bot Name',
      dataIndex: 'name',
      render: (value: string) => (
        <Space>
          <WechatOutlined />
          <Text>{value}</Text>
        </Space>
      )
    },
    {
      title: 'Webhook',
      dataIndex: 'webhookUrl',
      render: (value: string) => (
        <Text copyable={{ text: value }} type="secondary">
          {maskWebhookUrl(value)}
        </Text>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 120,
      render: (value: WecomBot['status']) => (
        <Tag color={value === 'active' ? 'success' : 'default'}>
          {value === 'active' ? 'Active' : 'Disabled'}
        </Tag>
      )
    },
    {
      title: 'Created Time',
      dataIndex: 'createdAt',
      width: 180,
      render: (value: string) => formatDateTime(value)
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_, bot) => (
        <Space>
          <Button
            icon={<SendOutlined />}
            onClick={() => {
              setTestBot(bot);
              testForm.setFieldsValue({
                msgtype: 'markdown',
                content: defaultTestContent
              });
            }}
          >
            Test
          </Button>
          <Popconfirm
            title="Delete bot?"
            description="This only removes the dashboard configuration. It does not change WeCom itself."
            okText="Delete"
            okButtonProps={{ danger: true }}
            cancelText="Cancel"
            onConfirm={async () => {
              try {
                await deleteMutation.mutateAsync(bot.id);
                message.success('WeCom bot deleted.');
              } catch (error) {
                message.error(getFriendlyErrorMessage(error));
              }
            }}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="page-stack settings-page">
      <PageHeader
        title="WeCom Bot"
        description="Configure enterprise WeCom group robot webhooks and send controlled test messages."
        actions={
          <Button
            icon={<PlusOutlined />}
            onClick={() => setCreateOpen(true)}
            type="primary"
          >
            New Bot
          </Button>
        }
      />

      <Card>
        <div className="settings-copy">
          <Text strong>Webhook only</Text>
          <Paragraph type="secondary">
            Enterprise WeCom group robots can usually send messages through a webhook.
            They cannot receive group questions in this MVP.
          </Paragraph>
        </div>

        <Skeleton active loading={botsQuery.isLoading} paragraph={{ rows: 8 }}>
          <Table<WecomBot>
            columns={columns}
            dataSource={botsQuery.data ?? []}
            locale={{
              emptyText: (
                <EmptyState
                  title="No WeCom Bots"
                  description="Add a group robot webhook to test sending AI assistant messages into WeCom."
                  action={
                    <Button
                      icon={<PlusOutlined />}
                      onClick={() => setCreateOpen(true)}
                      type="primary"
                    >
                      New Bot
                    </Button>
                  }
                />
              )
            }}
            pagination={{ pageSize: 10, showSizeChanger: false }}
            rowKey="id"
          />
        </Skeleton>
      </Card>

      <Modal
        title="New WeCom Bot"
        open={createOpen}
        okText="Create"
        confirmLoading={createMutation.isPending}
        onCancel={() => setCreateOpen(false)}
        onOk={() => createForm.submit()}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={async (values) => {
            try {
              await createMutation.mutateAsync(values);
              message.success('WeCom bot created.');
              createForm.resetFields();
              setCreateOpen(false);
            } catch (error) {
              message.error(getFriendlyErrorMessage(error));
            }
          }}
        >
          <Form.Item
            label="Bot Name"
            name="name"
            rules={[{ required: true, message: '请输入机器人名称。' }]}
          >
            <Input placeholder="Operations Bot" />
          </Form.Item>
          <Form.Item
            label="Webhook URL"
            name="webhookUrl"
            extra="Use the group robot webhook URL from enterprise WeCom."
            rules={[
              { required: true, message: '请输入企业微信群机器人 webhook。' },
              { type: 'url', message: '请输入有效的 URL。' }
            ]}
          >
            <Input placeholder="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=..." />
          </Form.Item>
          <Form.Item label="Secret" name="secret">
            <Input.Password placeholder="Optional" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Test Send${testBot ? `: ${testBot.name}` : ''}`}
        open={Boolean(testBot)}
        okText="Send"
        confirmLoading={testSendMutation.isPending}
        onCancel={() => setTestBot(null)}
        onOk={() => testForm.submit()}
      >
        <Form
          form={testForm}
          initialValues={{
            msgtype: 'markdown',
            content: defaultTestContent
          }}
          layout="vertical"
          onFinish={async (values) => {
            if (!testBot) {
              return;
            }

            try {
              await testSendMutation.mutateAsync({
                id: testBot.id,
                ...values
              });
              message.success('Test message sent to WeCom.');
              setTestBot(null);
            } catch (error) {
              message.error(getFriendlyErrorMessage(error));
            }
          }}
        >
          <Form.Item label="Message Type" name="msgtype">
            <Select
              options={[
                { label: 'Markdown', value: 'markdown' },
                { label: 'Text', value: 'text' }
              ]}
            />
          </Form.Item>
          <Form.Item
            label="Content"
            name="content"
            rules={[{ required: true, message: '请输入测试消息内容。' }]}
          >
            <Input.TextArea autoSize={{ minRows: 4, maxRows: 8 }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
