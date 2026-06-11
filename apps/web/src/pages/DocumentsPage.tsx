import {
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
  UploadOutlined
} from '@ant-design/icons';
import type { DocumentRecord, DocumentStatus } from '@ai-company-assistant/shared';
import type { TableColumnsType, UploadProps } from 'antd';
import {
  App,
  Button,
  Card,
  Drawer,
  Input,
  Modal,
  Select,
  Skeleton,
  Space,
  Table,
  Typography,
  Upload
} from 'antd';
import { useMemo, useState } from 'react';
import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { ParseSteps } from '../components/ParseSteps';
import { StatusTag } from '../components/StatusTag';
import {
  useDeleteDocumentMutation,
  useDocumentQuery,
  useDocumentsQuery,
  useReparseDocumentMutation,
  useUploadDocumentMutation
} from '../queries/documents';
import { getFriendlyErrorMessage } from '../utils/errors';
import { formatDateTime, formatFileSize } from '../utils/format';

const { Paragraph, Text } = Typography;

const statusOptions: Array<{ label: string; value: DocumentStatus | 'all' }> = [
  { label: 'All Status', value: 'all' },
  { label: 'Uploaded', value: 'uploaded' },
  { label: 'Parsing', value: 'parsing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' }
];

export function DocumentsPage() {
  const { message } = App.useApp();
  const documentsQuery = useDocumentsQuery();
  const uploadMutation = useUploadDocumentMutation();
  const deleteMutation = useDeleteDocumentMutation();
  const reparseMutation = useReparseDocumentMutation();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<DocumentStatus | 'all'>('all');
  const [detailId, setDetailId] = useState('');
  const detailQuery = useDocumentQuery(detailId, Boolean(detailId));

  const filteredDocuments = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return (documentsQuery.data ?? []).filter((document) => {
      const matchesSearch =
        !keyword ||
        document.originalName.toLowerCase().includes(keyword) ||
        document.mimeType.toLowerCase().includes(keyword);
      const matchesStatus = status === 'all' || document.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [documentsQuery.data, search, status]);

  const uploadProps: UploadProps = {
    multiple: false,
    showUploadList: false,
    customRequest: async ({ file, onError, onSuccess }) => {
      try {
        await uploadMutation.mutateAsync(file as File);
        message.success('文档已上传，AI 正在处理解析任务。');
        onSuccess?.('ok');
      } catch (error) {
        const friendlyMessage = getFriendlyErrorMessage(error);
        message.error(friendlyMessage);
        onError?.(new Error(friendlyMessage));
      }
    }
  };

  const columns: TableColumnsType<DocumentRecord> = [
    {
      title: 'Document',
      dataIndex: 'originalName',
      render: (_, document) => (
        <button className="link-button" onClick={() => setDetailId(document.id)}>
          {document.originalName}
        </button>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 120,
      render: (value: DocumentStatus) => <StatusTag status={value} />
    },
    {
      title: 'Parsing',
      dataIndex: 'status',
      width: 360,
      render: (value: DocumentStatus) => <ParseSteps status={value} />
    },
    {
      title: 'Size',
      dataIndex: 'fileSize',
      width: 120,
      render: (value: number) => formatFileSize(value)
    },
    {
      title: 'Updated',
      dataIndex: 'updatedAt',
      width: 180,
      render: (value: string) => formatDateTime(value)
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_, document) => (
        <Space>
          <Button
            icon={<ReloadOutlined />}
            loading={reparseMutation.isPending}
            onClick={async () => {
              try {
                await reparseMutation.mutateAsync(document.id);
                message.success('已重新加入解析队列。');
              } catch (error) {
                message.error(getFriendlyErrorMessage(error));
              }
            }}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            loading={deleteMutation.isPending}
            onClick={() => {
              Modal.confirm({
                title: '删除文档',
                content: `确定删除 ${document.originalName}？此操作会同时删除文档切片。`,
                okText: 'Delete',
                okButtonProps: { danger: true },
                cancelText: 'Cancel',
                onOk: async () => {
                  try {
                    await deleteMutation.mutateAsync(document.id);
                    message.success('文档已删除。');
                  } catch (error) {
                    message.error(getFriendlyErrorMessage(error));
                  }
                }
              });
            }}
          />
        </Space>
      )
    }
  ];

  return (
    <div className="page-stack">
      <PageHeader
        title="Documents"
        description="Upload, search, and manage source documents for the company knowledge base."
        actions={
          <Upload {...uploadProps}>
            <Button
              icon={<UploadOutlined />}
              loading={uploadMutation.isPending}
              type="primary"
            >
              Upload
            </Button>
          </Upload>
        }
      />

      <Card>
        <div className="table-toolbar">
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Search documents"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Select
            options={statusOptions}
            value={status}
            onChange={setStatus}
          />
        </div>

        <Skeleton active loading={documentsQuery.isLoading} paragraph={{ rows: 8 }}>
          <Table<DocumentRecord>
            columns={columns}
            dataSource={filteredDocuments}
            locale={{
              emptyText: (
                <EmptyState
                  title="No Documents"
                  description="Upload your first document to start building your company knowledge base."
                  action={
                    <Upload {...uploadProps}>
                      <Button icon={<UploadOutlined />} type="primary">
                        Upload Document
                      </Button>
                    </Upload>
                  }
                />
              )
            }}
            pagination={{ pageSize: 10, showSizeChanger: false }}
            rowKey="id"
          />
        </Skeleton>
      </Card>

      <Drawer
        title="Document Detail"
        open={Boolean(detailId)}
        size={560}
        onClose={() => setDetailId('')}
      >
        <Skeleton active loading={detailQuery.isLoading} paragraph={{ rows: 8 }}>
          {detailQuery.data ? (
            <Space orientation="vertical" size={16} className="drawer-stack">
              <div>
                <Text type="secondary">File Name</Text>
                <Paragraph strong>{detailQuery.data.originalName}</Paragraph>
              </div>
              <div>
                <Text type="secondary">Status</Text>
                <div>
                  <StatusTag status={detailQuery.data.status} />
                </div>
              </div>
              <ParseSteps status={detailQuery.data.status} />
              <div>
                <Text type="secondary">File Key</Text>
                <Paragraph copyable>{detailQuery.data.fileKey}</Paragraph>
              </div>
              {detailQuery.data.errorMessage ? (
                <div>
                  <Text type="secondary">Error</Text>
                  <Paragraph type="danger">{detailQuery.data.errorMessage}</Paragraph>
                </div>
              ) : null}
            </Space>
          ) : null}
        </Skeleton>
      </Drawer>
    </div>
  );
}
