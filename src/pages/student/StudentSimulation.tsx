import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Card, Button, Form, Input, Space, Breadcrumb } from "antd";
import { ArrowLeft, Pencil, Cpu } from "lucide-react";
import { WokwiSimulator } from "../../components/liveDemo/WokwiSimulator";
import { getSimulationsByProject, createSimulation, updateSimulation } from "../../api/simulation";
import type { SimulationItem, CreateSimulationDto, UpdateSimulationDto } from "../../api/simulation";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../utils/helpers";

interface FormValues {
  title: string;
  description: string;
  wokwiProjectUrl: string;
  wokwiProjectId: string;
}

export default function StudentSimulation() {
  const { id: classId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const mode = searchParams.get("mode") as "create" | "view" | "edit";
  const simulationId = searchParams.get("simulationId");
  const projectId = searchParams.get("projectId");

  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const [simulation, setSimulation] = useState<SimulationItem | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (mode === "view" || mode === "edit") {
      fetchSimulation();
    }
  }, [simulationId]);

  const fetchSimulation = async () => {
    if (!projectId || !simulationId) return;
    
    try {
      setLoading(true);
      const res = await getSimulationsByProject(Number(projectId));
      if (res.data.isSuccess) {
        const found = res.data.data?.find((s) => s.simulationId === Number(simulationId));
        if (found) {
          setSimulation(found);
          form.setFieldsValue({
            title: found.title,
            description: found.description,
            wokwiProjectUrl: found.wokwiProjectUrl,
            wokwiProjectId: found.wokwiProjectId,
          });
        }
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleWokwiSave = async (url: string, id: string) => {
    form.setFieldsValue({
      wokwiProjectUrl: url,
      wokwiProjectId: id,
    });

    if (!isViewMode) {
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (mode === "edit" && simulationId) {
        const dto: UpdateSimulationDto = {
          title: values.title,
          description: values.description,
          wokwiProjectUrl: values.wokwiProjectUrl,
          wokwiProjectId: values.wokwiProjectId,
        };
        await updateSimulation(Number(simulationId), dto);
        toast.success("Simulation updated successfully");
      } else if (mode === "create" && projectId) {
        const dto: CreateSimulationDto = {
          projectId: Number(projectId),
          title: values.title,
          description: values.description,
          wokwiProjectUrl: values.wokwiProjectUrl,
          wokwiProjectId: values.wokwiProjectId,
        };
        await createSimulation(dto);
        toast.success("Simulation created successfully");
      }

      navigate(-1);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";

  return (
    <div className="p-8">
      <Breadcrumb className="mb-6">
        <Breadcrumb.Item>Student</Breadcrumb.Item>
        <Breadcrumb.Item>Classes</Breadcrumb.Item>
        <Breadcrumb.Item>Simulation</Breadcrumb.Item>
      </Breadcrumb>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={handleBack}
          >
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Cpu className="w-6 h-6 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900 mb-0-important">
              {isCreateMode && "Create Simulation"}
              {isViewMode && "View Simulation"}
              {isEditMode && "Edit Simulation"}
            </h1>
          </div>
        </div>
        {isViewMode && simulation?.status === "draft" && (
          <Button
            type="primary"
            size="large"
            icon={<Pencil className="w-4 h-4" />}
            onClick={() =>
              navigate(
                `/student/classes/${classId}/simulation?mode=edit&projectId=${projectId}&simulationId=${simulationId}`
              )
            }
          >
            Edit
          </Button>
        )}
      </div>

      <Card loading={loading}>
        <Form form={form} layout="vertical" disabled={isViewMode}>
          <Form.Item
            name="title"
            label="Simulation Title"
            rules={[{ required: true, message: "Please enter title" }]}
          >
            <Input placeholder="Enter simulation title" size="large" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Describe your IoT simulation"
              size="large"
            />
          </Form.Item>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-3 text-gray-700">
              Wokwi Simulator
            </label>
            <div className="border rounded-lg p-4 bg-gray-50">
              <WokwiSimulator
                projectId={simulation?.wokwiProjectId}
                onSave={handleWokwiSave}
                editable={!isViewMode}
                height={600}
              />
            </div>
          </div>

          <Space direction="vertical" className="w-full">
            <Form.Item
              name="wokwiProjectUrl"
              label="Wokwi Project URL"
              rules={[
                { required: true, message: "Please enter Wokwi URL" },
                { type: "url", message: "Please enter a valid URL" },
              ]}
            >
              <Input
                placeholder="Auto-filled when you save in Wokwi Simulator"
                disabled={!isViewMode}
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="wokwiProjectId"
              label="Wokwi Project ID"
              rules={[{ required: true, message: "Please enter project ID" }]}
            >
              <Input
                placeholder="Auto-filled when you save in Wokwi Simulator"
                disabled={!isViewMode}
                size="large"
              />
            </Form.Item>
          </Space>
        </Form>
      </Card>
    </div>
  );
}
