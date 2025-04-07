import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
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
  Collapse,
  Switch,
  Select
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
  CloseOutlined,
  PauseCircleOutlined,
  MinusCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { taskApi, jobApi } from '../services/api';
import { tasks } from '../mocks/data';
import AppLayout from '../components/layout/AppLayout';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

// 작업 상태 태그 컴포넌트
interface JobStatusTagProps {
  status: string;
}

const JobStatusTag: React.FC<JobStatusTagProps> = ({ status }) => {
  // 상태에 따른 태그 표시 데이터
  const statusConfig: Record<string, { text: string, color: string, icon: React.ReactNode }> = {
    'created': {
      text: '미진행',
      color: 'default',
      icon: <MinusCircleOutlined />
    },
    'waiting': {
      text: '대기중',
      color: 'default',
      icon: <MinusCircleOutlined />
    },
    'in-process': {
      text: '진행중',
      color: 'processing',
      icon: <ClockCircleOutlined />
    },
    'cancel': {
      text: '취소됨',
      color: 'error',
      icon: <PauseCircleOutlined />
    },
    'finished': {
      text: '완료',
      color: 'success',
      icon: <CheckCircleOutlined />
    },
    'removed': {
      text: '삭제됨',
      color: 'default',
      icon: <MinusCircleOutlined />
    }
  };

  // 상태값이 없거나 정의되지 않은 경우 기본값 표시
  const config = status && statusConfig[status] 
    ? statusConfig[status] 
    : { text: '상태 미정', color: 'default', icon: <MinusCircleOutlined /> };

  return (
    <Tag color={config.color} icon={config.icon}>
      {config.text}
    </Tag>
  );
};

interface Job {
  id: number;
  name: string;
  assignedUser: string;
  description: string;
  startTime: string;
  endTime: string;
  completionTime: string | null;
  completed: boolean;
  status?: string;
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

// 작업 상태 정의
const AVAILABLE_STATUSES = [
  { value: 'created', label: '미진행' },
  { value: 'waiting', label: '대기중' },
  { value: 'in-process', label: '진행중' },
  { value: 'cancel', label: '취소됨' },
  { value: 'finished', label: '완료' }
];

const TaskDetail = () => {
  const { projectId, taskId } = useParams<{ projectId: string, taskId: string }>();
  const navigate = useNavigate();
  
  const [task, setTask] = useState<Task | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [jobsLoading, setJobsLoading] = useState<boolean>(true);
  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);
  const [showJobForm, setShowJobForm] = useState<boolean>(false);
  const [jobFormLoading, setJobFormLoading] = useState<boolean>(false);
  const [editingJobId, setEditingJobId] = useState<number | null>(null);
  
  // 폼 참조 생성
  const formRef = useRef<any>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  
  useEffect(() => {
    const fetchTaskDetails = async () => {
      if (!taskId) return;
      
      try {
        setLoading(true);
        let response;
        
        // 프로젝트 ID가 있는 경우와 없는 경우 구분
        if (projectId) {
          response = await taskApi.getTaskInProject(parseInt(projectId), parseInt(taskId));
        } else {
          response = await taskApi.getTaskById(parseInt(taskId));
        }
        
        setTask(response.data);
      } catch (error) {
        console.error('Error fetching task details:', error);
        message.error('업무 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTaskDetails();
  }, [taskId, projectId]);
  
  // 태스크가 로드된 후 Jobs 목록 불러오기
  useEffect(() => {
    const fetchJobs = async () => {
      if (!taskId) return;
      
      try {
        setJobsLoading(true);
        const pId = projectId ? parseInt(projectId) : 1; // 프로젝트 ID가 없으면 기본값 1 사용
        const response = await jobApi.getJobsForTask(parseInt(taskId), pId);
        console.log('Jobs loaded:', response.data);
        setJobs(response.data || []);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        message.error('작업 목록을 불러오는데 실패했습니다.');
      } finally {
        setJobsLoading(false);
      }
    };
    
    // 태스크가 로드된 후에만 Jobs 조회
    if (task && task.id) {
      fetchJobs();
    }
  }, [taskId, projectId, task]);
  
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
      
      // 상태에 따른 완료 여부 설정
      const isCompleted = ['finished'].includes(values.status);
      
      // 시간 데이터 변환
      const jobData = {
        ...values,
        startTime: values.timeRange ? values.timeRange[0]?.toISOString() : new Date().toISOString(),
        endTime: values.timeRange ? values.timeRange[1]?.toISOString() : new Date(Date.now() + 86400000).toISOString(),
        completed: isCompleted,
        completionTime: isCompleted ? new Date().toISOString() : null,
        status: values.status || 'created'
      };
      delete jobData.timeRange;
      
      if (task && task.id) {
        // 실제 API 호출
        const pId = projectId ? parseInt(projectId) : 1;
        const response = await jobApi.createJob(parseInt(taskId!), jobData, pId);
        
        // 새로 추가된 job
        const newJob = response.data;
        
        // jobs 목록 업데이트
        setJobs([...jobs, newJob]);
        
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
    if (!expanded) {
      setEditingJobId(null);
    }
  };
  
  // 작업 수정 시작
  const startEditing = (job: Job) => {
    setEditingJobId(job.id);
    // 기본값 설정
    editForm.setFieldsValue({
      editName: job.name,
      editAssignedUser: job.assignedUser,
      editDescription: job.description,
      editStatus: job.status || 'created'
    });
    
    // 날짜 값 설정 (dayjs 사용)
    const startDate = job.startTime ? dayjs(job.startTime) : null;
    const endDate = job.endTime ? dayjs(job.endTime) : null;
    
    // 날짜가 유효한 경우에만 설정
    if (startDate && endDate) {
      setTimeout(() => {
        editForm.setFieldsValue({
          editTimeRange: [startDate, endDate]
        });
      }, 0);
    }
  };
  
  // 작업 수정 취소
  const cancelEditing = () => {
    setEditingJobId(null);
    editForm.resetFields();
  };
  
  // 작업 수정 제출 핸들러
  const handleJobUpdate = async (values: any) => {
    try {
      // 상태에 따른 완료 여부 설정
      const isCompleted = ['finished'].includes(values.editStatus);
      
      // 시간 데이터 변환
      const jobData = {
        name: values.editName,
        assignedUser: values.editAssignedUser,
        startTime: values.editTimeRange ? values.editTimeRange[0]?.toISOString() : new Date().toISOString(),
        endTime: values.editTimeRange ? values.editTimeRange[1]?.toISOString() : new Date(Date.now() + 86400000).toISOString(),
        description: values.editDescription,
        status: values.editStatus,
        completed: isCompleted
      };
      
      if (task && editingJobId) {
        // 실제 API 호출
        const pId = projectId ? parseInt(projectId) : 1;
        const response = await jobApi.updateJob(pId, parseInt(taskId!), editingJobId, jobData);
        
        // jobs 목록 업데이트
        const updatedJobs = jobs.map(job => {
          if (job.id === editingJobId) {
            return response.data; // 서버에서 반환한 업데이트된 작업 사용
          }
          return job;
        });
        
        setJobs(updatedJobs);
        
        message.success('작업이 수정되었습니다.');
        setEditingJobId(null);
        editForm.resetFields();
      }
    } catch (error) {
      console.error('Error updating job:', error);
      message.error('작업 수정 중 오류가 발생했습니다.');
    }
  };
  
  // 확장된 행 렌더링
  const expandedRowRender = (record: Job) => {
    if (editingJobId === record.id) {
      // 수정 폼 렌더링
      return (
        <div style={{ padding: '16px 40px', backgroundColor: '#f5f5f5' }}>
          <Form
            form={editForm}
            layout="vertical"
            onFinish={handleJobUpdate}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="editName"
                  label="작업명"
                  rules={[{ required: true, message: '작업명을 입력해주세요' }]}
                >
                  <Input placeholder="작업명을 입력하세요" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="editAssignedUser"
                  label="담당자"
                  rules={[{ required: true, message: '담당자를 입력해주세요' }]}
                >
                  <Input placeholder="담당자를 입력하세요" />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item
              name="editTimeRange"
              label="시작/종료 시간"
              rules={[{ required: true, message: '시간을 선택해주세요' }]}
            >
              <RangePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
            </Form.Item>
            
            <Form.Item
              name="editDescription"
              label="작업 설명"
            >
              <TextArea rows={4} placeholder="작업에 대한 설명을 입력하세요" />
            </Form.Item>
            
            <Form.Item
              name="editStatus"
              label="작업 상태"
              rules={[{ required: true, message: '상태를 선택해주세요' }]}
            >
              <Select>
                {AVAILABLE_STATUSES.map(status => (
                  <Option key={status.value} value={status.value}>{status.label}</Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                  저장
                </Button>
                <Button onClick={cancelEditing} icon={<CloseOutlined />}>
                  취소
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </div>
      );
    }
    
    // 일반 상세 정보 렌더링
    return (
      <div style={{ padding: '16px 40px', backgroundColor: '#f5f5f5' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div></div>
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={(e) => {
              e.stopPropagation();
              startEditing(record);
            }}
          >
            수정
          </Button>
        </div>
        
        <Descriptions bordered column={3}>
          <Descriptions.Item label="작업명" span={1}>{record.name}</Descriptions.Item>
          <Descriptions.Item label="담당자" span={1}>
            <Tag icon={<UserOutlined />}>{record.assignedUser}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="상태" span={1}>
            {record.status ? (
              <JobStatusTag status={record.status} />
            ) : (
              record.completed ? (
                <Tag icon={<CheckCircleOutlined />} color="success">완료</Tag>
              ) : (
                <Tag icon={<ClockCircleOutlined />} color="processing">진행중</Tag>
              )
            )}
          </Descriptions.Item>
          <Descriptions.Item label="시작 시간" span={1}>
            {record.startTime ? new Date(record.startTime).toLocaleString() : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="종료 예정 시간" span={1}>
            {record.endTime ? new Date(record.endTime).toLocaleString() : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="완료 시간" span={1}>
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
        if (record.status) {
          return <JobStatusTag status={record.status} />;
        } else if (record.completed) {
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
            onClick={() => {
              // 프로젝트 ID가 있으면 해당 프로젝트로, 없으면 업무 목록으로 돌아가기
              if (projectId) {
                navigate(`/projects/${projectId}`);
              } else {
                navigate('/tasks');
              }
            }}
          >
            {projectId ? '프로젝트로 돌아가기' : '업무 목록으로 돌아가기'}
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
          onClick={() => {
            // 프로젝트 ID가 있으면 해당 프로젝트로, 없으면 업무 목록으로 돌아가기
            if (projectId) {
              navigate(`/projects/${projectId}`);
            } else {
              navigate('/tasks');
            }
          }}
        >
          {projectId ? '프로젝트로 돌아가기' : '업무 목록으로 돌아가기'}
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
              onClick={() => {
                if (projectId) {
                  navigate(`/projects/${projectId}/tasks/${task.id}/edit`);
                } else {
                  navigate(`/tasks/${task.id}/edit`);
                }
              }}
            >
              수정하기
            </Button>
          </Space>
        </div>
      </Card>
      
      {/* 태스크 상세 정보 */}
      <Card title="업무 상세 정보" style={{ marginBottom: 24 }}>
        <Descriptions bordered column={3}>
          <Descriptions.Item label="업무명" span={1}>{task.name}</Descriptions.Item>
          <Descriptions.Item label="생성자" span={1}>{task.creator}</Descriptions.Item>
          <Descriptions.Item label="시작일" span={1}>{new Date(task.startDate).toLocaleDateString()}</Descriptions.Item>
          <Descriptions.Item label="예정 종료일" span={1}>{new Date(task.plannedEndDate).toLocaleDateString()}</Descriptions.Item>
          <Descriptions.Item label="완료일" span={1}>
            {task.completionDate ? new Date(task.completionDate).toLocaleDateString() : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="상태" span={1}>
            <Tag color={taskStatus.color} icon={taskStatus.icon}>{taskStatus.text}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="담당자" span={3}>
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
              icon={<PlusOutlined />}
              onClick={() => {
                setShowJobForm(!showJobForm);
                // 폼이 표시되면 약간의 시간차를 두고 폼으로 스크롤
                if (!showJobForm) {
                  setTimeout(() => {
                    formRef.current?.scrollIntoView({ behavior: 'smooth' });
                    const nameInput = document.querySelector('#job-name-input');
                    if (nameInput) {
                      (nameInput as HTMLElement).focus();
                    }
                  }, 100);
                }
              }}
            >
              작업 추가
            </Button>
        }
      >
        {jobsLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin />
            <p>작업 목록을 불러오는 중...</p>
          </div>
        ) : jobs.length > 0 ? (
          <Table 
            columns={jobColumns} 
            dataSource={jobs.map(job => ({ ...job, key: job.id }))} 
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
          <div ref={formRef} style={{ marginTop: 24, border: '1px solid #f0f0f0', padding: 24, borderRadius: 2 }}>
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
                status: 'created' // 기본 상태 값
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="작업명"
                    rules={[{ required: true, message: '작업명을 입력해주세요' }]}
                  >
                    <Input id="job-name-input" placeholder="작업명을 입력하세요" />
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
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="timeRange"
                    label="시작/종료 시간"
                    rules={[{ required: true, message: '시간을 선택해주세요' }]}
                  >
                    <RangePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="status"
                    label="작업 상태"
                    rules={[{ required: true, message: '상태를 선택해주세요' }]}
                  >
                    <Select>
                      {AVAILABLE_STATUSES.map(status => (
                        <Option key={status.value} value={status.value}>{status.label}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
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