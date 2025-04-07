import { useState, useEffect } from 'react';
import { Typography, Card, Table, Button, Tag, App, Space } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { projectApi } from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import type { ColumnsType } from 'antd/es/table';

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

const ProjectList = () => {
  const navigate = useNavigate();
  const { message, modal } = App.useApp();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectApi.getAllProjects();
      setProjects(response.data);
    } catch (err) {
      console.error('Error fetching projects:', err);
      message.error('프로젝트 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = (id: number) => {
    modal.confirm({
      title: '프로젝트 삭제',
      content: '정말 이 프로젝트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      okText: '삭제',
      okType: 'danger',
      cancelText: '취소',
      onOk: async () => {
        try {
          await projectApi.deleteProject(id);
          message.success('프로젝트가 삭제되었습니다.');
          fetchProjects();
        } catch (err) {
          console.error('Error deleting project:', err);
          message.error('프로젝트 삭제에 실패했습니다.');
        }
      },
    });
  };

  const getProjectStatus = (project: Project) => {
    if (!project.active) {
      return <Tag color="default">비활성</Tag>;
    }

    const now = new Date();
    const startDate = new Date(project.startDate);
    const endDate = new Date(project.endDate);

    if (now < startDate) {
      return <Tag icon={<ClockCircleOutlined />} color="blue">예정됨</Tag>;
    } else if (now > endDate) {
      return <Tag icon={<ExclamationCircleOutlined />} color="red">만료됨</Tag>;
    } else {
      return <Tag icon={<CheckCircleOutlined />} color="green">진행중</Tag>;
    }
  };

  const columns: ColumnsType<Project> = [
    {
      title: '프로젝트명',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <a onClick={() => navigate(`/projects/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: '관리자',
      dataIndex: 'manager',
      key: 'manager',
      render: (text) => (
        <Tag icon={<UserOutlined />}>{text}</Tag>
      ),
    },
    {
      title: '시작일',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    },
    {
      title: '종료일',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime(),
    },
    {
      title: '상태',
      key: 'status',
      render: (_, record) => getProjectStatus(record),
    },
    {
      title: '작업',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={() => navigate(`/projects/${record.id}`)}
          />
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => navigate(`/projects/${record.id}/edit`)}
          />
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDeleteProject(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <AppLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2}>프로젝트 관리</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => navigate('/projects/new')}
        >
          프로젝트 추가
        </Button>
      </div>

      <Card>
        <Table 
          columns={columns} 
          dataSource={projects.map(project => ({ ...project, key: project.id }))} 
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
          }}
        />
      </Card>
    </AppLayout>
  );
};

export default ProjectList;
