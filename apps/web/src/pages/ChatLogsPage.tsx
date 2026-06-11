import { EyeOutlined, SearchOutlined } from '@ant-design/icons';
import type { ChatLog } from '@ai-company-assistant/shared';
import type { TableColumnsType } from 'antd';
import { Button, Card, Drawer, Input, Skeleton, Space, Table, Tag, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { SourceList } from '../components/SourceList';
import { useChatLogsQuery } from '../queries/chat';
import { formatDateTime, truncateText } from '../utils/format';

const { Paragraph, Text } = Typography;

export function ChatLogsPage() {
  const logsQuery = useChatLogsQuery();
  const [search, setSearch] = useState('');
  const [activeLog, setActiveLog] = useState<ChatLog | null>(null);

  const filteredLogs = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return (logsQuery.data ?? []).filter((log) => {
      if (!keyword) {
        return true;
      }

      return (
        log.question.toLowerCase().includes(keyword) ||
        log.answer.toLowerCase().includes(keyword) ||
        log.sourceChunks.some((source) =>
          source.documentName.toLowerCase().includes(keyword)
        )
      );
    });
  }, [logsQuery.data, search]);

  const columns: TableColumnsType<ChatLog> = [
    {
      title: 'Question',
      dataIndex: 'question',
      render: (value: string) => <Text>{truncateText(value, 80)}</Text>
    },
    {
      title: 'Answer',
      dataIndex: 'answer',
      render: (value: string) => <Text type="secondary">{truncateText(value, 120)}</Text>
    },
    {
      title: 'Source',
      dataIndex: 'sourceChunks',
      width: 180,
      render: (_, log) => (
        <Space wrap>
          <Tag>{String(log.source).toLowerCase()}</Tag>
          <Tag color="purple">{log.sourceChunks.length} sources</Tag>
        </Space>
      )
    },
    {
      title: 'Time',
      dataIndex: 'createdAt',
      width: 180,
      render: (value: string) => formatDateTime(value)
    },
    {
      title: 'Detail',
      key: 'detail',
      width: 100,
      render: (_, log) => (
        <Button icon={<EyeOutlined />} onClick={() => setActiveLog(log)} />
      )
    }
  ];

  return (
    <div className="page-stack">
      <PageHeader
        title="Chat Logs"
        description="Review recent questions, AI answers, source evidence, and usage context."
      />

      <Card>
        <div className="table-toolbar">
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Search questions, answers, or sources"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <Skeleton active loading={logsQuery.isLoading} paragraph={{ rows: 8 }}>
          <Table<ChatLog>
            columns={columns}
            dataSource={filteredLogs}
            locale={{
              emptyText: (
                <EmptyState
                  title="No Chat Logs"
                  description="Ask AI questions will appear here with their answers and source citations."
                />
              )
            }}
            pagination={{ pageSize: 10, showSizeChanger: false }}
            rowKey="id"
          />
        </Skeleton>
      </Card>

      <Drawer
        title="Chat Detail"
        open={Boolean(activeLog)}
        size={720}
        onClose={() => setActiveLog(null)}
      >
        {activeLog ? (
          <Space orientation="vertical" size={18} className="drawer-stack">
            <div>
              <Text type="secondary">Question</Text>
              <Paragraph>{activeLog.question}</Paragraph>
            </div>
            <div>
              <Text type="secondary">Answer</Text>
              <Paragraph>{activeLog.answer}</Paragraph>
            </div>
            <div>
              <Text type="secondary">Time</Text>
              <Paragraph>{formatDateTime(activeLog.createdAt)}</Paragraph>
            </div>
            <Card title="Sources">
              <SourceList sources={activeLog.sourceChunks} />
            </Card>
          </Space>
        ) : null}
      </Drawer>
    </div>
  );
}
