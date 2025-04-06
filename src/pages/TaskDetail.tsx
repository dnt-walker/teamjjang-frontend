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
  Table,
  Form,
  Input,
  DatePicker,
  Tooltip,
  Collapse
} from 'antd';
import { 
  ArrowLeftOutlined,
  CalendarOutlined,
  UserOutlined,
  EditOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  DownOutlined,
  RightOutlined,
  SaveOutlined,
  CloseOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { taskApi, jobApi } from '../services/api';
import { tasks } from '../mocks/data';
import AppLayout from '../components/layout/AppLayout';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

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
  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);
  const [showJobForm, setShowJobForm] = useState<boolean>(false);
  const [jobFormLoading, setJobFormLoading] = useState<boolean>(false);
  
  const [form] = Form.useForm();
  
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

  // 작업 추가 제출 핸들러
  const handleJobSubmit = async (values: any) => {
    try {
      setJobFormLoading(true);
      
      // 시간 데이터 변환
      const jobData = {
        ...values,
        startTime: values.timeRange?.[0]?.format ? values.timeRange[0].format() : new Date(values.timeRange[0]).toISOString(),
        endTime: values.timeRange?.[1]?.format ? values.timeRange[1].format() : new Date(values.timeRange[1]).toISOString(),
        completed: false,
        completionTime: null
      };
      delete jobData.timeRange;
      
      // API 호출 (현재는 목업 데이터 사용 중이므로 임시 구현)
      if (task && task.id) {
        // 실제 API 호출 대신 목업 데이터 수정
        const newJob = {
          id: Date.now(), // 임시 ID 생성
          ...jobData
        };
        
        // 태스크에 새 작업 추가
        const updatedJobs = [...(task.jobs || []), newJob];
        setTask({
          ...task,
          jobs: updatedJobs
        });
        
        message.success('작업이 추가되었습니다.');
        setShowJobForm(false);
        form.resetFields();
      }
    } catch (error) {
      console.error('Error adding job:', error);
      message.error('작업 추가 중 오류가 발생했습니다.');
    } finally {
      setJobFormLoading(false);
    }
  };
  
  // 행 확장 토글 핸들러
  const handleRowExpand = (expanded: boolean, record: Job) => {
    setExpandedRowKeys(expanded ? [record.id] : []);
  };
  
  // 확장된 행 렌더링
  const expandedRowRender = (record: Job) => {
    return (
      <div style={{ padding: '16px 40px', backgroundColor: '#f5f5f5' }}>
        <Descriptions bordered column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
          <Descriptions.Item label="작업명">{record.name}</Descriptions.Item>
          <Descriptions.Item label="담당자">
            <Tag icon={<UserOutlined />}>{record.assignedUser}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="상태">
            {record.completed ? (
              <Tag icon={<CheckCircleOutlined />} color="success">완료</Tag>
            ) : (
              <Tag icon={<ClockCircleOutlined />} color="processing">진행중</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="시작 시간">
            {record.startTime ? new Date(record.startTime).toLocaleString() : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="종료 예정 시간">
            {record.endTime ? new Date(record.endTime).toLocaleString() : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="완료 시간">
            {record.completionTime ? new Date(record.completionTime).toLocaleString() : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="작업 설명" span={3}>
            <Paragraph>{record.description || '설명이 없습니다.'}</Paragraph>
          </Descriptions.Item>
        </Descriptions>
      </div>
    );
  };
  
  // 작업 테이블 컬럼 정의
  const jobColumns: ColumnsType<Job> = [
    {
      title: '작업명',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <span style={{ fontWeight: 500 }}>{text}</span>
      )
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
    {
      title: '',
      key: 'expand',
      width: 50,
      render: (_, record) => (
        <Button 
          type="text" 
          icon={expandedRowKeys.includes(record.id) ? <DownOutlined /> : <RightOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            handleRowExpand(!expandedRowKeys.includes(record.id), record);
          }}
        />
      ),
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
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowJobForm(!showJobForm)}
            >
              작업 추가
            </Button>
            <Button
              icon={<EditOutlined />}
              onClick={() => navigate(`/projects/${projectId}/tasks/${task.id}/jobs`)}
            >
              작업 관리
            </Button>
          </Space>
        }
      >
        {task.jobs && task.jobs.length > 0 ? (
          <Table 
            columns={jobColumns} 
            dataSource={task.jobs.map(job => ({ ...job, key: job.id }))} 
            pagination={false}
            size="middle"
            expandable={{
              expandedRowRender,
              expandedRowKeys,
              onExpand: handleRowExpand
            }}
            onRow={(record) => ({
              onClick: () => handleRowExpand(!expandedRowKeys.includes(record.id), record)
            })}
          />
        ) : (
          <Empty description="등록된 작업이 없습니다" />
        )}
        
        {/* 작업 추가 폼 */}
        {showJobForm && (
          <div style={{ marginTop: 24, border: '1px solid #f0f0f0', padding: 24, borderRadius: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <Title level={5}>새 작업 추가</Title>
              <Button 
                type="text" 
                icon={<CloseOutlined />} 
                onClick={() => {
                  setShowJobForm(false);
                  form.resetFields();
                }}
              />
            </div>
            
            <Form
              form={form}
              layout="vertical"
              onFinish={handleJobSubmit}
              initialValues={{
                // DatePicker의 초기값을 설정하지 않음
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="작업명"
                    rules={[{ required: true, message: '작업명을 입력해주세요' }]}
                  >
                    <Input placeholder="작업명을 입력하세요" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="assignedUser"
                    label="담당자"
                    rules={[{ required: true, message: '담당자를 입력해주세요' }]}
                  >
                    <Input placeholder="담당자를 입력하세요" />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                name="timeRange"
                label="시작/종료 시간"
                rules={[{ required: true, message: '시간을 선택해주세요' }]}
              >
                <RangePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
              </Form.Item>
              
              <Form.Item
                name="description"
                label="작업 설명"
              >
                <TextArea rows={4} placeholder="작업에 대한 설명을 입력하세요" />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={jobFormLoading}>
                  작업 추가
                </Button>
              </Form.Item>
            </Form>
          </div>
        )}
      </Card>
    </AppLayout>
  );
};

export default TaskDetail;