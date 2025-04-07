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
  Modal,
  Form,
  App
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
import { taskApi, projectApi } from '../services/api';
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
  const { message } = App.useApp();
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
      
      // 상태 필터링이 있으면 프론트에서 한번 더 처리
      let filteredTasks = response.data;
      if (selectedStatus && filteredTasks.length > 0) {
        // 완료된 태스크 필터링
        if (selectedStatus === 'succeeded' || selectedStatus === 'finished') {
          filteredTasks = filteredTasks.filter(task => task.completionDate !== null);
        }
        // 진행 중인 태스크 필터링
        else if (selectedStatus === 'in-process') {
          filteredTasks = filteredTasks.filter(task => 
            task.completionDate === null && new Date(task.plannedEndDate) >= new Date()
          );
        }
        // 지연된 태스크 필터링
        else if (selectedStatus === 'failed') {
          filteredTasks = filteredTasks.filter(task =>
            task.completionDate === null && new Date(task.plannedEndDate) < new Date()
          );
        }
        // 대기 중인 태스크 필터링
        else if (selectedStatus === 'waiting' || selectedStatus === 'created') {
          filteredTasks = filteredTasks.filter(task => 
            task.completionDate === null && new Date(task.startDate) > new Date()
          );
        }
      }
      
      setTasks(filteredTasks);
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
    // 검색어가 있을 때만 필터링
    const filtered = tasks.filter(task => {
      if (!value) return true;
      
      const searchLower = value.toLowerCase();
      return (
        task.name.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower) ||
        task.creator.toLowerCase().includes(searchLower) ||
        task.assignees.some(assignee => assignee.toLowerCase().includes(searchLower))
      );
    });
    
    if (value) {
      setTasks(filtered);
    } else {
      // 검색어가 없으면 다시 데이터 조회
      fetchTasks();
    }
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
        onClick: () => {
          // Task는 프로젝트에 종속되어야 하므로 프로젝트가 없는 경우 이동하지 않음
          if (!record.project?.id) {
            message.info('프로젝트에 속한 업무만 상세 정보를 조회할 수 있습니다.');
            return;
          }
          
          navigate(`/projects/${record.project.id}/tasks/${record.id}`);
        },
      },
      {
        key: '2',
        icon: <EditOutlined />,
        label: '수정',
        onClick: () => {
          // Task는 프로젝트에 종속되어야 하므로 프로젝트가 없는 경우 수정하지 않음
          if (!record.project?.id) {
            message.info('프로젝트에 속한 업무만 수정할 수 있습니다.');
            return;
          }
          
          navigate(`/projects/${record.project.id}/tasks/${record.id}/edit`);
        },
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
      render: (text, record) => {
        // Task는 프로젝트에 종속되어야 하므로 프로젝트가 없는 경우 이동하지 않음
        if (!record.project?.id) {
          return <span>{text}</span>;
        }
        
        // 프로젝트가 있는 경우 해당 프로젝트의 Task 페이지로 이동
        const taskPath = `/projects/${record.project.id}/tasks/${record.id}`;
        return <a onClick={() => navigate(taskPath)}>{text}</a>;
      },
      // 검색 필터링 로직은 상태 변경으로 처리
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
      // 필터 속성 제거
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
      // 필터 속성 제거 - 상태 관리는 상태 변경으로 통합 처리
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
                  { key: 'created', label: '시작 전' },
                  { key: 'waiting', label: '대기 중' },
                  { key: 'in-process', label: '진행 중' },
                  { key: 'succeeded', label: '완료됨' },
                  { key: 'failed', label: '지연됨' }
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
                          'created': '시작 전',
                          'waiting': '대기 중',
                          'in-process': '진행 중',
                          'succeeded': '완료됨',
                          'failed': '지연됨'
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
