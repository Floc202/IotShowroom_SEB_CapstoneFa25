import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Card, Button, Breadcrumb, Tag } from "antd";
import { ArrowLeft, Cpu } from "lucide-react";
import { WokwiSimulator } from "../../components/liveDemo/WokwiSimulator";
import { getSimulationsByProject } from "../../api/simulation";
import type { SimulationItem } from "../../api/simulation";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../utils/helpers";

export default function InstructorSimulationView() {
  const { classId, groupId } = useParams<{ classId: string; groupId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const simulationId = searchParams.get("simulationId");
  const projectId = searchParams.get("projectId");

  const [loading, setLoading] = useState(false);
  const [simulation, setSimulation] = useState<SimulationItem | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (projectId && simulationId) {
      fetchSimulation();
    }
  }, [projectId, simulationId]);

  const fetchSimulation = async () => {
    if (!projectId || !simulationId) return;
    
    try {
      setLoading(true);
      const res = await getSimulationsByProject(Number(projectId));
      if (res.data.isSuccess && res.data.data) {
        const found = res.data.data.find((s) => s.simulationId === Number(simulationId));
        if (found) {
          setSimulation(found);
        }
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="p-8">
      <Breadcrumb className="mb-6">
        <Breadcrumb.Item>Instructor</Breadcrumb.Item>
        <Breadcrumb.Item>Classes</Breadcrumb.Item>
        <Breadcrumb.Item>{classId}</Breadcrumb.Item>
        <Breadcrumb.Item>Groups</Breadcrumb.Item>
        <Breadcrumb.Item>{groupId}</Breadcrumb.Item>
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
              View Simulation
            </h1>
          </div>
        </div>
        {simulation && (
          <Tag color="blue" className="text-base px-4 py-1">
            {simulation.status.toUpperCase()}
          </Tag>
        )}
      </div>

      <Card loading={loading}>
        {simulation && (
          <div>
            <div className="mb-4">
              <h2 className="text-2xl font-semibold mb-2">{simulation.title}</h2>
              <p className="text-gray-600 mb-4">{simulation.description}</p>
              
              <div className="flex items-center gap-6 text-sm text-gray-500 mb-2">
                <div>
                  <span className="font-medium">Project:</span> {simulation.projectTitle}
                </div>
                <div>
                  <span className="font-medium">Group:</span> {simulation.groupName}
                </div>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div>
                  <span className="font-medium">Created:</span>{" "}
                  {new Date(new Date(simulation.createdAt).getTime() + 7 * 60 * 60 * 1000).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  })}
                </div>
                {simulation.updatedAt && (
                  <div>
                    <span className="font-medium">Updated:</span>{" "}
                    {new Date(new Date(simulation.updatedAt).getTime() + 7 * 60 * 60 * 1000).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    })}
                  </div>
                )}
              </div>

             
            </div>

            <div className="mt-6 border rounded-lg p-4 bg-gray-50">
              <WokwiSimulator
                projectId={simulation.wokwiProjectId}
                editable={false}
                height={600}
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
