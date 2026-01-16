import { useEffect, useState } from "react";
import { Modal, Card, Tag, Button, Empty, Spin } from "antd";
import { FileText, Download } from "lucide-react";
import { getSyllabusByClass, getSyllabusFiles } from "../../api/syllabus";
import type { SyllabusByClass, SyllabusFile } from "../../types/syllabus";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../utils/helpers";

interface SyllabusListModalProps {
  open: boolean;
  classId: number;
  onClose: () => void;
}

export default function SyllabusListModal({
  open,
  classId,
  onClose,
}: SyllabusListModalProps) {
  const [syllabuses, setSyllabuses] = useState<SyllabusByClass[]>([]);
  const [syllabusFiles, setSyllabusFiles] = useState<Map<number, SyllabusFile[]>>(new Map());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchSyllabuses();
    }
  }, [open, classId]);

  const fetchSyllabuses = async () => {
    try {
      setLoading(true);
      const res = await getSyllabusByClass(classId);

      if (!res.isSuccess || !res.data) {
        setSyllabuses([]);
        setSyllabusFiles(new Map());
        return;
      }

      const syllabusData = res.data;
      setSyllabuses(syllabusData);

      const filesMap = new Map<number, SyllabusFile[]>();
      for (const syllabus of syllabusData) {
        const filesRes = await getSyllabusFiles(syllabus.syllabusId);
        if (filesRes.isSuccess && filesRes.data) {
          filesMap.set(syllabus.syllabusId, filesRes.data);
        }
      }
      setSyllabusFiles(filesMap);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal
      title="Class Syllabuses"
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
      bodyStyle={{ maxHeight: "70vh", overflowY: "auto" }}
    >
      <Spin spinning={loading}>
        {syllabuses.length === 0 ? (
          <Empty description="No syllabuses available" />
        ) : (
          <div className="space-y-4">
            {syllabuses.map((syllabus) => (
              <Card key={syllabus.syllabusId} size="small" className="bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-gray-800">
                    {syllabus.title}
                  </div>
                  <Tag color={syllabus.isActive ? "green" : "red"}>
                    {syllabus.isActive ? "Active" : "Inactive"}
                  </Tag>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs mb-3 text-gray-600">
                  <div>
                    <span className="font-medium">Version:</span> {syllabus.version}
                  </div>
                  <div>
                    <span className="font-medium">Year:</span> {syllabus.academicYear}
                  </div>
                  <div>
                    <span className="font-medium">Files:</span> {syllabus.fileCount}
                  </div>
                </div>

                {syllabusFiles?.get(syllabus.syllabusId) && syllabusFiles.get(syllabus.syllabusId)!.length > 0 ? (
                  <div className="space-y-2 border-t pt-3">
                    {syllabusFiles.get(syllabus.syllabusId)?.map((file) => (
                      <div
                        key={file.fileId}
                        className="flex items-center justify-between bg-white p-2 rounded border border-gray-200"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FileText className="w-4 h-4 text-orange-500 shrink-0" />
                          <span className="text-sm truncate font-medium">
                            {file.fileName}
                          </span>
                          <Tag color="blue" className="text-xs">
                            {file.fileType.toUpperCase()}
                          </Tag>
                        </div>
                        <Button
                          type="text"
                          size="small"
                          icon={<Download className="w-4 h-4" />}
                          onClick={() => handleDownload(file.fileUrl, file.fileName)}
                          className="shrink-0"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 italic">No files</div>
                )}
              </Card>
            ))}
          </div>
        )}
      </Spin>
    </Modal>
  );
}
