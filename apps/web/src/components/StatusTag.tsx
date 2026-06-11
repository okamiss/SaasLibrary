import type { DocumentStatus } from '@ai-company-assistant/shared';
import { Tag } from 'antd';

const statusMap: Record<
  DocumentStatus,
  { color: string; label: string }
> = {
  uploaded: { color: 'default', label: 'Uploaded' },
  parsing: { color: 'processing', label: 'Parsing' },
  completed: { color: 'success', label: 'Completed' },
  failed: { color: 'error', label: 'Failed' }
};

export function StatusTag({ status }: { status: DocumentStatus }) {
  const item = statusMap[status];
  return <Tag color={item.color}>{item.label}</Tag>;
}
