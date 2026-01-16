import { useState } from "react";
import {
  Card,
  Button,
  Space,
  Tag,
  Collapse,
  Spin,
  Modal,
  Form,
  Input,
  Popconfirm,
  Empty,
  Upload,
  InputNumber,
} from "antd";
import { Pencil, Trash2, Upload as UploadIcon } from "lucide-react";
import type { UploadFile } from "antd";
import type { SyllabusByClass, SyllabusFile } from "../../types/syllabus";
import { getSyllabusFiles, uploadSyllabusFile, deleteSyllabusFile } from "../../api/syllabus";
import { getErrorMessage } from "../../utils/helpers";
import toast from "react-hot-toast";
import SyllabusFileList from "./SyllabusFileList";

interface SyllabusCardProps {
  syllabus: SyllabusByClass;
  onEdit: (syllabus: SyllabusByClass) => void;
  onDelete: (syllabusId: number) => void;
}

export default function SyllabusCard({ syllabus, onEdit, onDelete }: SyllabusCardProps) {
  const [files, setFiles] = useState<SyllabusFile[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadForm] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const fetchFiles = async () => {
    try {
      setFilesLoading(true);
      const res = await getSyllabusFiles(syllabus.syllabusId);
      if (res.isSuccess) {
        setFiles(res.data || []);
      } else {
        toast.error(res.message || "Failed to load files");
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setFilesLoading(false);
    }
  };

  const handleExpandFiles = async (isExpanded: boolean) => {
    if (isExpanded && files.length === 0) {
      await fetchFiles();
    }
  };

  const handleUploadFile = async () => {
    if (fileList.length === 0) {
      toast.error("Please select a file to upload");
      return;
    }

    try {
      const values = await uploadForm.validateFields();
      setUploading(true);

      const file = fileList[0].originFileObj as File;
      const res = await uploadSyllabusFile({
        syllabusId: syllabus.syllabusId,
        file: file,
        description: values.description,
        displayOrder: values.displayOrder,
      });

      if (!res.isSuccess) {
        toast.error(res.message || "Upload failed");
        return;
      }

      toast.success("File uploaded successfully");
      setUploadModalOpen(false);
      uploadForm.resetFields();
      setFileList([]);
      await fetchFiles();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    try {
      const res = await deleteSyllabusFile(fileId);
      if (!res.isSuccess) {
        toast.error(res.message || "Delete failed");
        return;
      }

      toast.success("File deleted successfully");
      setFiles(files.filter((f) => f.fileId !== fileId));
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const items = [
    {
      key: "files",
      label: `Files (${syllabus.fileCount})`,
      children: (
        <Spin spinning={filesLoading}>
          <div className="space-y-4">
            <Button
              type="primary"
              icon={<UploadIcon className="w-4 h-4" />}
              onClick={() => setUploadModalOpen(true)}
              size="small"
            >
              Upload File
            </Button>

            {files.length > 0 ? (
              <SyllabusFileList
                files={files}
                onDelete={handleDeleteFile}
              />
            ) : (
              <Empty description="No files" />
            )}
          </div>
        </Spin>
      ),
    },
  ];

  return (
    <>
      <Card
        className="h-full transition-shadow hover:shadow-lg"
        title={
          <div className="flex items-center gap-2 truncate">
            <span className="font-semibold truncate">{syllabus.title}</span>
          </div>
        }
        extra={
          <Space size="small">
            <Button
              size="small"
              type="primary"
              ghost
              icon={<Pencil className="w-3 h-3" />}
              onClick={() => onEdit(syllabus)}
            >
              Edit
            </Button>
            <Popconfirm
              title="Delete Syllabus"
              description="Are you sure you want to delete this syllabus?"
              onConfirm={() => onDelete(syllabus.syllabusId)}
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
        }
      >
        <div className="space-y-3">
          <div>
            <span className="text-xs text-gray-500">Version</span>
            <div className="font-medium">{syllabus.version}</div>
          </div>
          <div>
            <span className="text-xs text-gray-500">Academic Year</span>
            <div className="font-medium">{syllabus.academicYear}</div>
          </div>
          <div>
            <span className="text-xs text-gray-500">Created By</span>
            <div className="font-medium">{syllabus.createdByName}</div>
          </div>
          <div className="pt-2 border-t">
            <Tag color={syllabus.isActive ? "green" : "red"}>
              {syllabus.isActive ? "Active" : "Inactive"}
            </Tag>
          </div>
          <Collapse
            items={items}
            onChange={(keys) => {
              handleExpandFiles(keys.includes("files"));
            }}
          />
        </div>
      </Card>

      <Modal
        open={uploadModalOpen}
        title="Upload Syllabus File"
        onCancel={() => {
          setUploadModalOpen(false);
          uploadForm.resetFields();
          setFileList([]);
        }}
        onOk={handleUploadFile}
        confirmLoading={uploading}
        width={600}
      >
        <Form form={uploadForm} layout="vertical">
          <Form.Item
            label="File"
            required
          >
            <Upload
              fileList={fileList}
              beforeUpload={(file) => {
                setFileList([file]);
                return false; 
              }}
              onRemove={() => {
                setFileList([]);
              }}
              maxCount={1}
            >
              <Button icon={<UploadIcon className="w-4 h-4" />}>
                Choose File
              </Button>
            </Upload>
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={3} placeholder="Optional description" />
          </Form.Item>
          <Form.Item
            name="displayOrder"
            label="Display Order"
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Order to display files (optional)"
              min={0}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
