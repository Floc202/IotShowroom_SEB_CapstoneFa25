import { useState, useEffect } from "react";
import { Card, Button, Empty, Tag, Tooltip, Space, Popconfirm } from "antd";
import { Cpu, Plus, Eye, Pencil, Trash2, Send } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import type { SimulationItem } from "../../api/simulation";
import { getSimulationsByProject, deleteSimulation, updateSimulationStatus } from "../../api/simulation";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../utils/helpers";

interface SimulationCardProps {
  projectId: number;
  isLeader: boolean;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "draft": return "default";
    case "submitted": return "blue";
    case "graded": return "green";
    default: return "default";
  }
};

export default function SimulationCard({ projectId, isLeader }: SimulationCardProps) {
  const navigate = useNavigate();
  const { id: classId } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [simulations, setSimulations] = useState<SimulationItem[]>([]);

  useEffect(() => {
    fetchSimulations();
  }, [projectId]);

  const fetchSimulations = async () => {
    try {
      setLoading(true);
      const res = await getSimulationsByProject(projectId);
      if (res.data.isSuccess) {
        setSimulations(res.data.data || []);
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    navigate(`/student/classes/${classId}/simulation?mode=create&projectId=${projectId}`);
  };

  const openEdit = (sim: SimulationItem) => {
    navigate(
      `/student/classes/${classId}/simulation?mode=edit&projectId=${projectId}&simulationId=${sim.simulationId}`
    );
  };

  const openView = (sim: SimulationItem) => {
    navigate(
      `/student/classes/${classId}/simulation?mode=view&projectId=${projectId}&simulationId=${sim.simulationId}`
    );
  };

  const handleDelete = async (simulationId: number) => {
    try {
      await deleteSimulation(simulationId);
      toast.success("Simulation deleted");
      fetchSimulations();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleSubmitSimulation = async (sim: SimulationItem) => {
    try {
      await updateSimulationStatus(sim.simulationId, { status: "submitted" });
      toast.success("Simulation submitted for review");
      fetchSimulations();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  return (
    <>
      <Card
        loading={loading}
        className="shadow-sm"
        title={
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-600" />
            <span>IoT Simulations ({simulations.length})</span>
          </div>
        }
        extra={
          isLeader && (
            <Button
              type="primary"
              size="small"
              icon={<Plus className="w-4 h-4" />}
              onClick={openCreate}
            >
              Create Simulation
            </Button>
          )
        }
      >
        {simulations.length > 0 ? (
          <div className="space-y-3">
            {simulations.map((sim) => {
              const canEdit = isLeader && sim.status === "draft";
              const canSubmit = isLeader && sim.status === "draft";
              
              return (
                <Card
                  key={sim.simulationId}
                  type="inner"
                  size="small"
                  className="hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-base">{sim.title}</span>
                        <Tag color={getStatusColor(sim.status)}>
                          {sim.status.toUpperCase()}
                        </Tag>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{sim.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Created: {new Date(sim.createdAt).toLocaleDateString()}</span>
                        {sim.updatedAt && (
                          <span>Updated: {new Date(sim.updatedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <Space>
                      <Tooltip title="View Simulation">
                        <Button
                          type="text"
                          size="small"
                          icon={<Eye className="w-4 h-4" />}
                          onClick={() => openView(sim)}
                        />
                      </Tooltip>
                      {canEdit && (
                        <Tooltip title="Edit">
                          <Button
                            type="text"
                            size="small"
                            icon={<Pencil className="w-4 h-4" />}
                            onClick={() => openEdit(sim)}
                          />
                        </Tooltip>
                      )}
                      {canSubmit && (
                        <Tooltip title="Submit for Review">
                          <Popconfirm
                            title="Submit Simulation"
                            description="Are you sure you want to submit this simulation? You won't be able to edit it after submission."
                            onConfirm={() => handleSubmitSimulation(sim)}
                            okText="Submit"
                            cancelText="Cancel"
                          >
                            <Button
                              type="primary"
                              size="small"
                              icon={<Send className="w-4 h-4" />}
                            />
                          </Popconfirm>
                        </Tooltip>
                      )}
                      {canEdit && (
                        <Popconfirm
                          title="Delete Simulation"
                          description="Are you sure you want to delete this simulation?"
                          onConfirm={() => handleDelete(sim.simulationId)}
                          okText="Delete"
                          okType="danger"
                          cancelText="Cancel"
                        >
                          <Tooltip title="Delete">
                            <Button
                              type="text"
                              danger
                              size="small"
                              icon={<Trash2 className="w-4 h-4" />}
                            />
                          </Tooltip>
                        </Popconfirm>
                      )}
                    </Space>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Empty
            description="No simulations yet"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            {isLeader && (
              <Button
                type="primary"
                icon={<Plus className="w-4 h-4" />}
                onClick={openCreate}
              >
                Create First Simulation
              </Button>
            )}
          </Empty>
        )}
      </Card>
    </>
  );
}
