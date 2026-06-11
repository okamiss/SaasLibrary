import { Card, Col, Row, Skeleton, Space, Statistic, Tag, Typography } from 'antd';
import { PageHeader } from '../components/PageHeader';
import { StatusTag } from '../components/StatusTag';
import { useChatLogsQuery } from '../queries/chat';
import { useDocumentsQuery } from '../queries/documents';
import { formatDateTime, truncateText } from '../utils/format';

const { Paragraph, Text } = Typography;

export function DashboardPage() {
  const documentsQuery = useDocumentsQuery();
  const logsQuery = useChatLogsQuery();
  const documents = documentsQuery.data ?? [];
  const logs = logsQuery.data ?? [];
  const completed = documents.filter((item) => item.status === 'completed').length;
  const successRate = documents.length
    ? Math.round((completed / documents.length) * 100)
    : 0;

  return (
    <div className="page-stack">
      <PageHeader
        title="Dashboard"
        description="A compact overview of the company knowledge base and recent AI activity."
      />

      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic title="Documents" value={documents.length} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Chunks" value="-" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Questions Today" value={logs.length} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Success Rate" value={successRate} suffix="%" />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={10}>
          <Card title="Recent Documents">
            <Skeleton active loading={documentsQuery.isLoading} paragraph={{ rows: 4 }}>
              <div className="compact-list">
                {documents.slice(0, 5).length ? (
                  documents.slice(0, 5).map((document) => (
                    <div className="compact-list-item" key={document.id}>
                      <div>
                        <Text>{document.originalName}</Text>
                        <Paragraph type="secondary">
                          {formatDateTime(document.createdAt)}
                        </Paragraph>
                      </div>
                      <StatusTag status={document.status} />
                    </div>
                  ))
                ) : (
                  <Text type="secondary">No recent documents.</Text>
                )}
              </div>
            </Skeleton>
          </Card>
        </Col>
        <Col span={10}>
          <Card title="Recent Questions">
            <Skeleton active loading={logsQuery.isLoading} paragraph={{ rows: 4 }}>
              <div className="compact-list">
                {logs.slice(0, 5).length ? (
                  logs.slice(0, 5).map((log) => (
                    <div className="compact-list-item" key={log.id}>
                      <div>
                        <Text>{truncateText(log.question, 64)}</Text>
                        <Paragraph type="secondary">
                          {formatDateTime(log.createdAt)}
                        </Paragraph>
                      </div>
                    </div>
                  ))
                ) : (
                  <Text type="secondary">No recent questions.</Text>
                )}
              </div>
            </Skeleton>
          </Card>
        </Col>
        <Col span={4}>
          <Card title="System Status">
            <Space orientation="vertical" size={12}>
              <Tag color="success">API Ready</Tag>
              <Tag color="processing">RAG Pipeline</Tag>
              <Paragraph type="secondary">
                Documents and Ask AI use authenticated API calls.
              </Paragraph>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
