import { useState, useEffect } from 'react';
import { 
  Typography, 
  Table, 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Tag, 
  Spin,
  Alert,
  Badge,
  Divider,
  Progress,
  List,
  Avatar
} from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  ExclamationCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
  ProjectOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { taskApi, projectApi } from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

interface Project {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  manager: string;
  active: boolean;
}

interface Task {
  id: number;
  name: string;
  startDate: string;
  plannedEndDate: string;
  completionDate: string | null;
  creator: string;
  assignees: string[];
  project?: Project;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 모든 API 요청을 병렬로 실행
        const [tasksResponse, projectsResponse] = await Promise.all([
          taskApi.getAllTasks(),
          projectApi.getAllProjects()
        ]);
        
        setTasks(tasksResponse.data);
        setProjects(projectsResponse.data);
        
        // 내 프로젝트 데이터 추출 (예시)
        // 실제 구현에서는 API를 통해 필터링된 데이터를 가져올 수 있음
        const username = localStorage.getItem('username');
        const filteredProjects = projectsResponse.data.filter(
          (project: Project) => project.manager === username
        );
        setMyProjects(filteredProjects);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 상태별 업무 개수 계산
  const completedTasks = tasks.filter(task => task.completionDate).length;
  const pendingTasks = tasks.filter(task => 
    !task.completionDate && new Date(task.plannedEndDate) >= new Date()
  ).length;
  const overdueTasks = tasks.filter(task => 
    !task.completionDate && new Date(task.plannedEndDate) < new Date()
  ).length;
  
  // 프로젝트 관련 통계
  const activeProjects = projects.filter(p => p.active).length;
  const completedProjects = projects.filter(p => !p.active).length;

  const columns: ColumnsType<Task> = [
    {
      title: '업무명',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <a>{text}</a>,
    },
    {
      title: '프로젝트',
      key: 'project',
      render: (_, record) => (
        record.project ? (
          <Tag color="blue">{record.project.name}</Tag>
        ) : (
          <Tag color="default">프로젝트 없음</Tag>
        )
      ),
    },
    {
      title: '시작일',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: '예정 종료일',
      dataIndex: 'plannedEndDate',
      key: 'plannedEndDate',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: '상태',
      key: 'status',
      render: (_, record) => {
        if (record.completionDate) {
          return (
            <Tag icon={<CheckCircleOutlined />} color="success">
              완료
            </Tag>
          );
        } else if (new Date(record.plannedEndDate) < new Date()) {
          return (
            <Tag icon={<ExclamationCircleOutlined />} color="error">
              지연
            </Tag>
          );
        } else {
          return (
            <Tag icon={<ClockCircleOutlined />} color="processing">
              진행중
            </Tag>
          );
        }
      },
    },
    {
      title: '담당자',
      key: 'assignees',
      dataIndex: 'assignees',
      render: (assignees: string[]) => (
        <>
          {assignees.map((assignee) => (
            <Tag key={assignee}>
              {assignee}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: '생성자',
      dataIndex: 'creator',
      key: 'creator',
    },
  ];

  return (
    <AppLayout>
      <Title level={2}>대시보드</Title>
      
      {/* 프로젝트 통계 */}
      <Divider orientation="left">프로젝트 현황</Divider>
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="전체 프로젝트"
              value={projects.length}
              prefix={<ProjectOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="진행 중인 프로젝트"
              value={activeProjects}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="내가 참여한 프로젝트"
              value={myProjects.length}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>
      
      {/* 진행 중인 프로젝트 목록 */}
      <Card title="진행 중인 프로젝트" style={{ marginBottom: '24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin />
          </div>
        ) : error ? (
          <Alert message={error} type="error" showIcon />
        ) : (
          <List
            dataSource={projects.filter(p => p.active).slice(0, 5)}
            renderItem={(project) => {
              // 프로젝트 진행도 계산 (끝날짜 기준)
              const today = new Date();
              const startDate = new Date(project.startDate);
              const endDate = new Date(project.endDate);
              const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
              const passedDays = (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
              const progress = Math.min(Math.round((passedDays / totalDays) * 100), 100);
              
              return (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<ProjectOutlined />} />}
                    title={<a onClick={() => navigate(`/projects/${project.id}`)}>{project.name}</a>}
                    description={
                      <>
                        <div>관리자: {project.manager}</div>
                        <div>기간: {new Date(project.startDate).toLocaleDateString()} ~ {new Date(project.endDate).toLocaleDateString()}</div>
                      </>
                    }
                  />
                  <div style={{ width: 180 }}>
                    <Progress percent={progress} size="small" status={progress < 100 ? "active" : "success"} />
                  </div>
                </List.Item>
              );
            }}
          />
        )}
      </Card>
      
      {/* 업무 통계 */}
      <Divider orientation="left">업무 현황</Divider>
      
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="전체 업무"
              value={tasks.length}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="담당자"
              value={
                [...new Set(tasks.flatMap(task => task.assignees))].length
              }
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="진행 중인 기간"
              value={tasks.length > 0 ? "30일" : "0일"}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="완료된 업무"
              value={completedTasks}
              valueStyle={{ color: '#3f8600' }}
              prefix={<Badge status="success" />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="진행 중인 업무"
              value={pendingTasks}
              valueStyle={{ color: '#1677ff' }}
              prefix={<Badge status="processing" />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="지연된 업무"
              value={overdueTasks}
              valueStyle={{ color: '#cf1322' }}
              prefix={<Badge status="error" />}
            />
          </Card>
        </Col>
      </Row>
      
      <Card title="내 업무 목록" style={{ marginBottom: '24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        ) : error ? (
          <Alert message={error} type="error" showIcon />
        ) : (
          <Table 
            columns={columns} 
            dataSource={tasks.map(task => ({ ...task, key: task.id }))} 
            pagination={{ pageSize: 5 }}
          />
        )}
      </Card>
    </AppLayout>
  );
};

export default Dashboard;
