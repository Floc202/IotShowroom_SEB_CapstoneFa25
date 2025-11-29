import { useState, useEffect } from "react";
import { Card, Select, Table, Tag, Empty, Spin, Typography, Row, Col, Statistic } from "antd";
import { Trophy, Medal, Award, Star } from "lucide-react";
import { getHallOfFame, getHallOfFameBySemester, getLeaderboardTop10 } from "../../api/admin";
import { listSemesters } from "../../api/semesters";
import type { HallOfFameItem, LeaderboardTop10 } from "../../types/admin";
import type { Semester } from "../../types/semesters";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../utils/helpers";

const { Title } = Typography;

export default function HallOfFame() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number | undefined>(undefined);
  const [hallOfFame, setHallOfFame] = useState<HallOfFameItem[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardTop10 | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSemesters();
  }, []);

  useEffect(() => {
    fetchHallOfFameData();
  }, [selectedSemester]);

  const fetchSemesters = async () => {
    try {
      const res = await listSemesters();
      if (res.isSuccess && res.data) {
        setSemesters(res.data);
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const fetchHallOfFameData = async () => {
    try {
      setLoading(true);
      if (selectedSemester) {
        const [hofRes, leaderRes] = await Promise.all([
          getHallOfFameBySemester(selectedSemester),
          getLeaderboardTop10(selectedSemester),
        ]);
        if (hofRes.isSuccess && hofRes.data) setHallOfFame(hofRes.data);
        if (leaderRes.isSuccess && leaderRes.data) setLeaderboard(leaderRes.data);
      } else {
        const hofRes = await getHallOfFame();
        if (hofRes.isSuccess && hofRes.data) setHallOfFame(hofRes.data);
        setLeaderboard(null);
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-orange-600" />;
    return <Star className="w-5 h-5 text-blue-500" />;
  };

  const columns = [
    {
      title: "Rank",
      dataIndex: "rank",
      key: "rank",
      width: 80,
      render: (rank: number) => (
        <div className="flex items-center justify-center gap-2">
          {getRankBadge(rank)}
          <span className="font-bold text-lg">#{rank}</span>
        </div>
      ),
    },
    {
      title: "Project Name",
      dataIndex: "projectName",
      key: "projectName",
      render: (text: string | null) => <span className="font-semibold">{text || "N/A"}</span>,
    },
    {
      title: "Group Name",
      dataIndex: "groupName",
      key: "groupName",
      render: (text: string | null) => text || "N/A",
    },
    {
      title: "Class",
      dataIndex: "className",
      key: "className",
      render: (text: string | null) => text || "N/A",
    },
    {
      title: "Semester",
      dataIndex: "semesterName",
      key: "semesterName",
      render: (text: string | null) => <Tag color="blue">{text || "N/A"}</Tag>,
    },
    {
      title: "Final Score",
      dataIndex: "finalScore",
      key: "finalScore",
      width: 120,
      render: (score: number | null) => (
        <Tag color={score && score >= 90 ? "green" : score && score >= 80 ? "blue" : "orange"} className="font-bold">
          {score?.toFixed(2) || "N/A"}
        </Tag>
      ),
      sorter: (a: HallOfFameItem, b: HallOfFameItem) => (b.finalScore || 0) - (a.finalScore || 0),
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
      render: (notes: string | null) => notes || <span className="text-gray-400">-</span>,
    },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <Title level={2}>
          <Trophy className="w-8 h-8 inline-block mr-2 text-yellow-500" />
          Hall of Fame
        </Title>
        <Select
          placeholder="Select Semester"
          style={{ width: 300 }}
          value={selectedSemester}
          onChange={setSelectedSemester}
          allowClear
          options={semesters.map((s) => ({
            label: `${s.name} (${s.year} - ${s.term})`,
            value: s.semesterId,
          }))}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {leaderboard && (
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Semester"
                    value={leaderboard.semesterName}
                    prefix={<Star className="w-5 h-5" />}
                    valueStyle={{ fontSize: "18px", color: "#1890ff" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Top Rank"
                    value={leaderboard.topProjects[0]?.rank || "N/A"}
                    prefix={<Trophy className="w-5 h-5" />}
                    valueStyle={{ color: "#52c41a" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card>
                  <Statistic
                    title="Total Projects"
                    value={leaderboard.totalProjects}
                    prefix={<Award className="w-5 h-5" />}
                    valueStyle={{ color: "#fa8c16" }}
                  />
                </Card>
              </Col>
            </Row>
          )}

          <Card>
            {hallOfFame.length > 0 ? (
              <Table
                dataSource={hallOfFame}
                columns={columns}
                rowKey={(record) => `${record.projectId}-${record.rank}`}
                pagination={{ pageSize: 20 }}
              />
            ) : (
              <Empty description="No projects in Hall of Fame yet" />
            )}
          </Card>
        </>
      )}
    </div>
  );
}
