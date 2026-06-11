import type { ReactNode } from 'react';
import { Space, Typography } from 'antd';

const { Paragraph, Title } = Typography;

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div>
        <Title level={2}>{title}</Title>
        {description ? <Paragraph type="secondary">{description}</Paragraph> : null}
      </div>
      {actions ? <Space>{actions}</Space> : null}
    </div>
  );
}
