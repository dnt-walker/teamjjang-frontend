import { useState, useEffect } from 'react';
import { 
  Typography, 
  Table, 
  Card, 
  Button, 
  Space, 
  Tag, 
  Input, 
  Dropdown, 
  message,
  Modal,
  Form
} from 'antd';
import { 
  PlusOutlined,
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  ExclamationCircleOutlined,
  SearchOutlined,
  MoreOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  ProjectOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import { taskApi } from '../services/api';
import AppLayout from '../components/layout/AppLayout';

const { Title } = Typography;
const { Search } = Input;

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
  description: string;
  project?: Project;
}

const TaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [modalType, setModalType] = useState<'view' | 'edit' | 'delete'>('view');
  const navigate = useNavigate();

  const fetchTasks = async () => {
    try {
      setLoading(true);
      let response;
      
      // 선택한 프로젝트가 있는 경우 해당 프로젝트의 태스크만 가져옴
      if (selectedProjectId !== null) {
        response = await taskApi.getTasksByProject(selectedProjectId, selectedStatus || undefined);
      } else {
        // 전체 태스크 가져오기
        response = await taskApi.getAllTasks({
          jobStatus: selectedStatus || undefined
        });
      }
      
      setTasks(response.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      message.error('업무 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchProjects = async () => {
    try {
      const { data } = await projectApi.getAllProjects();
      setProjects(data);
    } catch (err) {
      console.error('Error fetching projects:', err);
      message.error('프로젝트 목록을 불러오는데 실패했습니다.');
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchTasks();
  }, []);
  
  // 필터 변경 시 태스크 재조회
  useEffect(() => {
    fetchTasks();
  }, [selectedProjectId, selectedStatus]);

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const openModal = (type: 'view' | 'edit' | 'delete', task: Task) => {
    setSelectedTask(task);
    setModalType(type);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedTask(null);
  };

  const handleTaskAction = async () => {
    if (!selectedTask) return;

    try {
      if (modalType === 'delete') {
        await taskApi.deleteTask(selectedTask.id);
        message.success('업무가 삭제되었습니다.');
        fetchTasks();
      } else if (modalType === 'edit') {
        // Edit 로직 구현 (form 데이터 활용)
        message.success('업무가 수정되었습니다.');
        fetchTasks();
      }
      closeModal();
    } catch (error) {
      message.error('작업 처리 중 오류가 발생했습니다.');
    }
  };

  const getActionMenu = (record: Task): MenuProps => ({
    items: [
      {
        key: '1',
        icon: <EyeOutlined />,
        label: '상세 보기',
        onClick: () => openModal('view', record),
      },
      {
        key: '2',
        icon: <EditOutlined />,
        label: '수정',
        onClick: () => openModal('edit', record),
      },
      {
        key: '3',
        icon: <DeleteOutlined />,
        label: '삭제',
        danger: true,
        onClick: () => openModal('delete', record),
      },
    ],
  });

  const columns: ColumnsType<Task> = [
    {
      title: '업무명',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <a onClick={() => openModal('view', record)}>{text}</a>
      ),
      filteredValue: [search],
      onFilter: (value, record) => {
        return (
          record.name.toLowerCase().includes(value.toString().toLowerCase()) ||
          record.description.toLowerCase().includes(value.toString().toLowerCase()) ||
          record.creator.toLowerCase().includes(value.toString().toLowerCase()) ||
          record.assignees.some(assignee => 
            assignee.toLowerCase().includes(value.toString().toLowerCase())
          )
        );
      },
    },
    {
      title: '프로젝트',
      key: 'project',
      render: (_, record) => (
        record.project ? (
          <Tag color="blue" icon={<ProjectOutlined />}>{record.project.name}</Tag>
        ) : (
          <Tag color="default">프로젝트 없음</Tag>
        )
      ),
      filters: [
        { text: '프로젝트 있음', value: 'hasProject' },
        { text: '프로젝트 없음', value: 'noProject' },
      ],
      onFilter: (value, record) => {
        if (value === 'hasProject') {
          return record.project !== undefined;
        }
        return record.project === undefined;
      },
    },
    {
      title: '시작일',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    },
    {
      title: '예정 종료일',
      dataIndex: 'plannedEndDate',
      key: 'plannedEndDate',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.plannedEndDate).getTime() - new Date(b.plannedEndDate).getTime(),
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
      filters: [
        { text: '완료', value: 'completed' },
        { text: '진행중', value: 'in-progress' },
        { text: '지연', value: 'overdue' },
      ],
      onFilter: (value, record) => {
        if (value === 'completed') {
          return record.completionDate !== null;
        } else if (value === 'in-progress') {
          return !record.completionDate && new Date(record.plannedEndDate) >= new Date();
        } else {
          return !record.completionDate && new Date(record.plannedEndDate) < new Date();
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
    {
      title: '작업',
      key: 'action',
      render: (_, record) => (
        <Dropdown menu={getActionMenu(record)} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  // 상세 보기, 수정, 삭제 모달에 대한 동적 타이틀 및 콘텐츠 처리
  const renderModalTitle = () => {
    switch (modalType) {
      case 'view': return '업무 상세 정보';
      case 'edit': return '업무 수정';
      case 'delete': return '업무 삭제';
      default: return '';
    }
  };

  const renderModalContent = () => {
    if (!selectedTask) return null;
    
    switch (modalType) {
      case 'view':
        return (
          <div>
            <p><strong>업무명:</strong> {selectedTask.name}</p>
            {selectedTask.project && (
              <p><strong>프로젝트:</strong> {selectedTask.project.name}</p>
            )}
            <p><strong>설명:</strong> {selectedTask.description}</p>
            <p><strong>시작일:</strong> {new Date(selectedTask.startDate).toLocaleDateString()}</p>
            <p><strong>종료 예정일:</strong> {new Date(selectedTask.plannedEndDate).toLocaleDateString()}</p>
            <p><strong>담당자:</strong> {selectedTask.assignees.join(', ')}</p>
            <p><strong>생성자:</strong> {selectedTask.creator}</p>
            <p><strong>상태:</strong> {
              selectedTask.completionDate 
                ? `완료 (${new Date(selectedTask.completionDate).toLocaleDateString()})` 
                : new Date(selectedTask.plannedEndDate) < new Date() 
                  ? '지연' 
                  : '진행중'
            }</p>
          </div>
        );
      case 'edit':
        return (
          <Form layout="vertical" initialValues={selectedTask}>
            <Form.Item label="업무명" name="name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label="설명" name="description">
              <Input.TextArea rows={4} />
            </Form.Item>
            {/* 더 많은 폼 필드 추가 */}
          </Form>
        );
      case 'delete':
        return (
          <p>정말로 "{selectedTask.name}" 업무를 삭제하시겠습니까?</p>
        );
      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2}>업무 목록</Title>
        <Space>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => navigate('/tasks/new')}
          >
            새 업무 생성
          </Button>
        </Space>
      </div>
      
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div style={{ flex: '1 1 300px' }}>
            <Search
              placeholder="업무명, 설명, 담당자 등으로 검색"
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </div>
          
          <div style={{ flex: '1 0 220px' }}>
            <Dropdown 
              menu={{
                items: [
                  { key: 'all', label: '전체 프로젝트' },
                  ...projects.map(p => ({ key: p.id.toString(), label: p.name }))
                ],
                onClick: ({ key }) => {
                  setSelectedProjectId(key === 'all' ? null : Number(key));
                }
              }}
              trigger={['click']}
            >
              <Button style={{ width: '100%', textAlign: 'left' }} size="large">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>
                    <ProjectOutlined /> 
                    {selectedProjectId 
                      ? projects.find(p => p.id === selectedProjectId)?.name || '프로젝트' 
                      : '전체 프로젝트'}
                  </span>
                  <span>▾</span>
                </div>
              </Button>
            </Dropdown>
          </div>
          
          <div style={{ flex: '1 0 220px' }}>
            <Dropdown 
              menu={{
                items: [
                  { key: 'all', label: '전체 상태' },
                  { key: 'created', label: '생성됨' },
                  { key: 'waiting', label: '대기 중' },
                  { key: 'in-process', label: '진행 중' },
                  { key: 'succeeded', label: '완료됨' },
                  { key: 'failed', label: '실패' }
                ],
                onClick: ({ key }) => {
                  setSelectedStatus(key === 'all' ? null : key);
                }
              }}
              trigger={['click']}
            >
              <Button style={{ width: '100%', textAlign: 'left' }} size="large">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>
                    <ClockCircleOutlined /> 
                    {selectedStatus 
                      ? ({
                          'created': '생성됨',
                          'waiting': '대기 중',
                          'in-process': '진행 중',
                          'succeeded': '완료됨',
                          'failed': '실패'
                        }[selectedStatus] || '전체 상태')
                      : '전체 상태'}
                  </span>
                  <span>▾</span>
                </div>
              </Button>
            </Dropdown>
          </div>
        </div>
        
        <Table 
          columns={columns} 
          dataSource={tasks.map(task => ({ ...task, key: task.id }))} 
          loading={loading}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
          }}
        />
      </Card>
      
      <Modal
        title={renderModalTitle()}
        open={isModalVisible}
        onCancel={closeModal}
        footer={
          modalType === 'view' 
            ? [<Button key="close" onClick={closeModal}>닫기</Button>]
            : [
                <Button key="cancel" onClick={closeModal}>취소</Button>,
                <Button 
                  key="submit" 
                  type={modalType === 'delete' ? 'danger' : 'primary'} 
                  onClick={handleTaskAction}
                >
                  {modalType === 'delete' ? '삭제' : '저장'}
                </Button>
              ]
        }
      >
        {renderModalContent()}
      </Modal>
    </AppLayout>
  );
};

export default TaskList;
