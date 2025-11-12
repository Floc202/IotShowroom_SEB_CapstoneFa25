import { useMemo } from "react";
import { Button, Form, Input, Select, Space } from "antd";
import { RefreshCcw, Search, Plus } from "lucide-react";
import type { Semester } from "../../types/semesters";

type Props = {
  semesters: Semester[];
  loading?: boolean;
  onSearch: (params?: { q?: string; semesterId?: number }) => void;
  onRefresh: () => void;
  onCreate?: () => void;
};

export default function ClassSearch({
  semesters,
  loading,
  onSearch,
  onRefresh,
  onCreate,
}: Props) {
  const [form] = Form.useForm();

  const semesterOptions = useMemo(
    () => [
      { label: "All semesters", value: undefined },
      ...semesters.map((s) => ({
        label: s.name || s.code,
        value: s.semesterId,
      })),
    ],
    [semesters]
  );

  const submit = () => {
    const { q, semesterId } = form.getFieldsValue();
    onSearch({ q, semesterId });
  };

  const handleRefresh = () => {
    form.resetFields();
    onRefresh();
  };

  return (
    <Form form={form} layout="inline" className="flex flex-wrap gap-1">
      <Form.Item name="q" className="flex-1 min-w-[220px]">
        <Input
          allowClear
          placeholder="Search by class name, description, or instructor…"
          onPressEnter={submit}
        />
      </Form.Item>
      <Form.Item name="semesterId" initialValue={undefined}>
        <Select
          className="min-w-[220px]"
          options={semesterOptions}
          placeholder="Semester"
          onChange={() => submit()}
        />
      </Form.Item>
      <Space>
        <Button
          icon={<Search className="w-4 h-4" />}
          type="primary"
          loading={loading}
          onClick={submit}
        >
          Search
        </Button>
        <Button
          icon={<RefreshCcw className="w-4 h-4" />}
          onClick={handleRefresh}
          disabled={loading}
        >
          Refresh
        </Button>
        {onCreate && (
          <Button
            type="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={onCreate}
            disabled={loading}
          >
            New Class
          </Button>
        )}
      </Space>
    </Form>
  );
}
