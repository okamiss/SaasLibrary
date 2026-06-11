import type { ReactNode } from 'react';
import { Empty, Typography } from 'antd';

const { Paragraph } = Typography;

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Empty description={false} image={Empty.PRESENTED_IMAGE_SIMPLE}>
      <div className="empty-state-copy">
        <strong>{title}</strong>
        <Paragraph type="secondary">{description}</Paragraph>
        {action}
      </div>
    </Empty>
  );
}
