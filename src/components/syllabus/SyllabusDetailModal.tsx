import { useState, useEffect } from "react";
import {
  Modal,
  Descriptions,
  Tag,
  Button,
  Spin,
  Divider,
  Form,
  Input,
  Empty,
  Upload,
  InputNumber,
} from "antd";
import { Upload as UploadIcon } from "lucide-react";
import type { SyllabusByClass, SyllabusFile } from "../../types/syllabus";
import {
  getSyllabusFiles,
  uploadSyllabusFile,
  deleteSyllabusFile,
} from "../../api/syllabus";
import { getErrorMessage } from "../../utils/helpers";
import toast from "react-hot-toast";
import SyllabusFileList from "./SyllabusFileList";

interface SyllabusDetailModalProps {
  open: boolean;
  syllabus: SyllabusByClass | null;
  onClose: () => void;
}

export default function SyllabusDetailModal({
  open,
  syllabus,
  onClose,
}: SyllabusDetailModalProps) {
  const [files, setFiles] = useState<SyllabusFile[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadForm] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<any>([]);

  useEffect(() => {
    if (open && syllabus) {
      fetchFiles();
    }
  }, [open, syllabus]);

  const fetchFiles = async () => {
    if (!syllabus) return;
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

  const handleUploadFile = async () => {
    if (!syllabus) return;

    if (fileList.length === 0) {
      toast.error("Please select a file to upload");
      return;
    }

    try {
      const values = await uploadForm.validateFields();
      setUploading(true);

      const file = fileList[0] as File;
      console.log("file: ", file);

      const res = await uploadSyllabusFile({
        syllabusId: syllabus.syllabusId,
        file: file,
        description: values.description,
        displayOrder: values.displayOrder,
      });

      console.log("res: ", res);

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

  return (
    <>
      <Modal
        open={open}
        title={syllabus?.title}
        onCancel={onClose}
        footer={[
          <Button key="close" onClick={onClose}>
            Close
          </Button>,
        ]}
        width={900}
      >
        {syllabus && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Information</h3>
              <Descriptions bordered size="small" column={1}>
                <Descriptions.Item label="Version">
                  {syllabus.version}
                </Descriptions.Item>
                <Descriptions.Item label="Academic Year">
                  {syllabus.academicYear}
                </Descriptions.Item>
                <Descriptions.Item label="Created By">
                  {syllabus.createdByName}
                </Descriptions.Item>
                <Descriptions.Item label="Created At">
                  {new Date(syllabus.createdAt).toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={syllabus.isActive ? "green" : "red"}>
                    {syllabus.isActive ? "Active" : "Inactive"}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </div>

            <Divider />

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Files ({files.length})</h3>
                <Button
                  type="primary"
                  size="small"
                  icon={<UploadIcon className="w-4 h-4" />}
                  onClick={() => setUploadModalOpen(true)}
                >
                  Upload File
                </Button>
              </div>

              <Spin spinning={filesLoading}>
                {files.length > 0 ? (
                  <SyllabusFileList files={files} onDelete={handleDeleteFile} />
                ) : (
                  <Empty description="No files" />
                )}
              </Spin>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={uploadModalOpen}
        title="Upload File"
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
          <Form.Item label="File" required>
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
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Optional description" />
          </Form.Item>
          <Form.Item name="displayOrder" label="Display Order">
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Order to display files (optional)"
              min={0}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
