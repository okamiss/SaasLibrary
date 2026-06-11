import { SendOutlined } from '@ant-design/icons';
import type { AskChatResponse } from '@ai-company-assistant/shared';
import { App, Button, Card, Form, Input, Skeleton, Space, Typography } from 'antd';
import { useState } from 'react';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { SourceList } from '../components/SourceList';
import { useAskChatMutation } from '../queries/chat';
import { getFriendlyErrorMessage } from '../utils/errors';

const { Paragraph, Text } = Typography;

export function AskAiPage() {
  const { message } = App.useApp();
  const askMutation = useAskChatMutation();
  const [result, setResult] = useState<AskChatResponse | null>(null);
  const [form] = Form.useForm<{ question: string }>();

  return (
    <div className="page-stack ask-page">
      <PageHeader
        title="Ask AI"
        description="Test whether the assistant can answer from the current company knowledge base with clear sources."
      />

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={async ({ question }) => {
            try {
              const response = await askMutation.mutateAsync(question);
              setResult(response);
            } catch (error) {
              message.error(getFriendlyErrorMessage(error));
            }
          }}
        >
          <Form.Item
            label="Question"
            name="question"
            rules={[{ required: true, message: '请输入要测试的问题。' }]}
          >
            <Input.TextArea
              autoSize={{ minRows: 4, maxRows: 8 }}
              placeholder="例如：员工请假流程是什么？"
            />
          </Form.Item>
          <Button
            htmlType="submit"
            icon={<SendOutlined />}
            loading={askMutation.isPending}
            type="primary"
          >
            Submit
          </Button>
        </Form>
      </Card>

      <Skeleton active loading={askMutation.isPending} paragraph={{ rows: 6 }}>
        {result ? (
          <>
            <Card title="Answer">
              <Paragraph className="answer-text">{result.answer}</Paragraph>
              <Space size={8}>
                <Text type="secondary">Model: {result.usage.model}</Text>
                <Text type="secondary">
                  Tokens: {result.usage.promptTokens + result.usage.completionTokens}
                </Text>
              </Space>
            </Card>
            <Card title="Sources">
              <SourceList sources={result.sources} />
            </Card>
          </>
        ) : (
          <Card>
            <EmptyState
              title="No Answer Yet"
              description="Ask a question to verify the answer and source citations from your documents."
            />
          </Card>
        )}
      </Skeleton>
    </div>
  );
}
