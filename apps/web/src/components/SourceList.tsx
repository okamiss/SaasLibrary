import type { ChatSource } from '@ai-company-assistant/shared';
import { Card, Collapse, Empty, Space, Tag, Typography } from 'antd';
import { formatPercent } from '../utils/format';

const { Paragraph, Text } = Typography;

interface SourceListProps {
  sources: ChatSource[];
}

export function SourceList({ sources }: SourceListProps) {
  if (sources.length === 0) {
    return (
      <Empty
        description="No sources were returned for this answer."
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <Space className="source-list" orientation="vertical" size={12}>
      {sources.map((source) => (
        <Card key={source.chunkId} className="source-card">
          <Collapse
            bordered={false}
            ghost
            items={[
              {
                key: source.chunkId,
                label: (
                  <div className="source-label">
                    <Text strong>{source.documentName}</Text>
                    <Tag color="purple">{formatPercent(source.similarityScore)} Match</Tag>
                  </div>
                ),
                children: <Paragraph>{source.contentSnippet}</Paragraph>
              }
            ]}
          />
        </Card>
      ))}
    </Space>
  );
}
