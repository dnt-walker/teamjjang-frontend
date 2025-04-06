import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Card, 
  Space, 
  Tag, 
  Button, 
  Descriptions, 
  Divider,
  Empty,
  Spin,
  message,
  Row,
  Col,
  Table
} from 'antd';
import { 
  ArrowLeftOutlined,
  CalendarOutlined,
  UserOutlined,
  EditOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { taskApi } from '../services/api';
import AppLayout from '../components/layout/AppLayout';

const { Title, Text, Paragraph } = Typography;

interface Job {
  id: number;
  name: string;
  assignedUser: string;
  description: string;
  startTime: string;
  endTime: string;
  completionTime: string | null;
  completed: boolean;
}

interface Task {
  id: number;
  name: string;
  description: string;
  startDate: string;
  plannedEndDate: string;
  completionDate: string | null;
  creator: string;
  assignees: string[];
  jobs: Job[];
}

const TaskDetail = () => {
  const { projectId, taskId } = useParams<{ projectId: string, taskId: string }>();
  const navigate = useNavigate();
  
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchTaskDetails = async () => {
      if (!taskId) return;
      
      try {
        setLoading(true);
        const response = await taskApi.getTaskById(parseInt(taskId));
        setTask(response.data);
      } catch (error) {
        console.error('Error fetching task details:', error);
        message.error('업무 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTaskDetails();
  }, [taskId]);
  
  // 태스크 상태 정보
  const getTaskStatus = () => {
    if (!task) return { text: '로딩 중', color: 'default' };
    
    if (task.completionDate) {
      return { text: '완료', color: 'success', icon: <CheckCircleOutlined /> };
    } else if (new Date(task.plannedEndDate) < new Date()) {
      return { text: '지연', color: 'error', icon: <ExclamationCircleOutlined /> };
    } else {
      return { text: '진행중', color: 'processing', icon: <ClockCircleOutlined /> };
    }
  };

  // 작업 테이블 컬럼 정의
  const jobColumns: ColumnsType<Job> = [
    {
      title: '작업명',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '담당자',
      dataIndex: 'assignedUser',
      key: 'assignedUser',
      render: (user) => <Tag icon={<UserOutlined />}>{user}</Tag>,
    },
    {
      title: '시작 시간',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (time) => time ? new Date(time).toLocaleString() : '-',
    },
    {
      title: '종료 예정 시간',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (time) => time ? new Date(time).toLocaleString() : '-',
    },
    {
      title: '상태',
      key: 'status',
      render: (_, record) => {
        if (record.completed) {
          return <Tag icon={<CheckCircleOutlined />} color="success">완료</Tag>;
        } else if (record.endTime && new Date(record.endTime) < new Date()) {
          return <Tag icon={<ExclamationCircleOutlined />} color="error">지연</Tag>;
        } else {
          return <Tag icon={<ClockCircleOutlined />} color="processing">진행중</Tag>;
        }
      },
    },
  ];
  
  const taskStatus = getTaskStatus();
  
  if (loading) {
    return (
      <AppLayout>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" />
          <p>업무 정보를 불러오는 중...</p>
        </div>
      </AppLayout>
    );
  }
  
  if (!task) {
    return (
      <AppLayout>
        <Empty
          description="업무를 찾을 수 없습니다."
          style={{ margin: '100px 0' }}
        />
        <div style={{ textAlign: 'center' }}>
          <Button 
            type="primary" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(`/projects/${projectId}`)}
          >
            프로젝트로 돌아가기
          </Button>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <div style={{ marginBottom: 16 }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(`/projects/${projectId}`)}
        >
          프로젝트로 돌아가기
        </Button>
      </div>
      
      {/* 태스크 헤더 */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <Title level={2} style={{ marginBottom: 8 }}>
              {task.name}
            </Title>
            <Tag color={taskStatus.color} icon={taskStatus.icon}>{taskStatus.text}</Tag>
            <Tag icon={<CalendarOutlined />}>
              {new Date(task.startDate).toLocaleDateString()} ~ {new Date(task.plannedEndDate).toLocaleDateString()}
            </Tag>
            <Tag icon={<UserOutlined />}>{task.creator}</Tag>
          </div>
          <Space>
            <Button 
              icon={<EditOutlined />} 
              onClick={() => navigate(`/projects/${projectId}/tasks/${task.id}/edit`)}
            >
              수정하기
            </Button>
            <Button
              type="primary"
              onClick={() => navigate(`/projects/${projectId}/tasks/${task.id}/jobs`)}
            >
              작업 관리
            </Button>
          </Space>
        </div>
      </Card>
      
      {/* 태스크 상세 정보 */}
      <Card title="업무 상세 정보" style={{ marginBottom: 24 }}>
        <Descriptions bordered column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}>
          <Descriptions.Item label="업무명">{task.name}</Descriptions.Item>
          <Descriptions.Item label="생성자">{task.creator}</Descriptions.Item>
          <Descriptions.Item label="시작일">{new Date(task.startDate).toLocaleDateString()}</Descriptions.Item>
          <Descriptions.Item label="예정 종료일">{new Date(task.plannedEndDate).toLocaleDateString()}</Descriptions.Item>
          <Descriptions.Item label="완료일">
            {task.completionDate ? new Date(task.completionDate).toLocaleDateString() : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="상태">
            <Tag color={taskStatus.color} icon={taskStatus.icon}>{taskStatus.text}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="담당자" span={2}>
            <Space wrap>
              {task.assignees && task.assignees.map((assignee) => (
                <Tag key={assignee} icon={<UserOutlined />}>{assignee}</Tag>
              ))}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="업무 설명" span={3}>
            <Paragraph>{task.description || '설명이 없습니다.'}</Paragraph>
          </Descriptions.Item>
        </Descriptions>
      </Card>
      
      {/* 작업 목록 */}
      <Card 
        title="작업 목록" 
        extra={
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/projects/${projectId}/tasks/${task.id}/jobs`)}
          >
            작업 관리
          </Button>
        }
      >
        {task.jobs && task.jobs.length > 0 ? (
          <Table 
            columns={jobColumns} 
            dataSource={task.jobs.map(job => ({ ...job, key: job.id }))} 
            pagination={false}
            size="middle"
          />
        ) : (
          <Empty description="등록된 작업이 없습니다" />
        )}
      </Card>
    </AppLayout>
  );
};

export default TaskDetail;