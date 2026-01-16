import { Table, Button, Space, Popconfirm, Tag } from "antd";
import { Download, Trash2 } from "lucide-react";
import type { SyllabusFile } from "../../types/syllabus";

interface SyllabusFileListProps {
  files: SyllabusFile[];
  onDelete: (fileId: number) => void;
}

export default function SyllabusFileList({ files, onDelete }: SyllabusFileListProps) {
  const handleDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      title: "File Name",
      dataIndex: "fileName",
      key: "fileName",
      render: (text: string) => <div className="truncate">{text}</div>,
    },
    {
      title: "Type",
      dataIndex: "fileType",
      key: "fileType",
      width: 80,
      render: (text: string) => <Tag color="blue">{text.toUpperCase()}</Tag>,
    },
    {
      title: "Size",
      dataIndex: "fileSize",
      key: "fileSize",
      width: 100,
      render: (size: number) => {
        const kb = (size / 1024).toFixed(2);
        return <span>{kb} KB</span>;
      },
    },
    {
      title: "Uploaded By",
      dataIndex: "uploadedByName",
      key: "uploadedByName",
      width: 120,
      render: (text: string) => <div className="truncate">{text}</div>,
    },
    {
      title: "Uploaded At",
      dataIndex: "uploadedAt",
      key: "uploadedAt",
      width: 150,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_: any, record: SyllabusFile) => (
        <Space size="small">
          <Button
            type="primary"
            ghost
            size="small"
            icon={<Download className="w-3 h-3" />}
            onClick={() => handleDownload(record.fileUrl, record.fileName)}
          >
            Download
          </Button>
          <Popconfirm
            title="Delete File"
            description="Are you sure you want to delete this file?"
            onConfirm={() => onDelete(record.fileId)}
            okText="Delete"
            okType="danger"
            cancelText="Cancel"
          >
            <Button
              size="small"
              danger
              ghost
              icon={<Trash2 className="w-3 h-3" />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={files.map((f) => ({ ...f, key: f.fileId }))}
      pagination={false}
      size="small"
      scroll={{ x: 700 }}
    />
  );
}
