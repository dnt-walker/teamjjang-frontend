import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Form, 
  Input, 
  DatePicker, 
  Button, 
  Card, 
  Row, 
  Col, 
  Select,
  message, 
  Spin, 
  Space,
  Divider
} from 'antd';
import { 
  ArrowLeftOutlined,
  SaveOutlined,
  CloseOutlined,
  UserOutlined,
  ProjectOutlined
} from '@ant-design/icons';
import { projectApi, taskApi, userApi } from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  manager: string;
  active: boolean;
}

interface TaskFormValues {
  name: string;
  description: string;
  startDate: any; // dayjs object
  plannedEndDate: any; // dayjs object
  assignees: string[];
}

const TaskCreate = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const [project, setProject] = useState<Project | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  
  // 현재 로그인한 사용자 정보
  const username = localStorage.getItem('username') || '';
  
  useEffect(() => {
    const fetchProjectAndUsers = async () => {
      if (!projectId) return;
      
      try {
        setLoading(true);
        
        // 프로젝트 정보 가져오기
        const projectResponse = await projectApi.getProjectById(parseInt(projectId));
        setProject(projectResponse.data);
        
        // 사용자 목록 가져오기
        const usersResponse = await userApi.searchUsers({});
        setUsers(usersResponse.data);
        
        // 초기값 설정
        form.setFieldsValue({
          creator: username,
          startDate: dayjs(),
          plannedEndDate: dayjs().add(7, 'day')
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        message.error('데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjectAndUsers();
  }, [projectId, form, username]);
  
  const handleCancel = () => {
    navigate(`/projects/${projectId}`);
  };
  
  const handleSubmit = async (values: TaskFormValues) => {
    if (!projectId || !project) return;
    
    try {
      setSubmitting(true);
      
      const taskData = {
        ...values,
        creator: username,
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : null,
        plannedEndDate: values.plannedEndDate ? values.plannedEndDate.format('YYYY-MM-DD') : null,
        completionDate: null,
        project: {
          id: parseInt(projectId)
        }
      };
      
      // 태스크 생성 API 호출
      await taskApi.createTask(taskData);
      message.success('태스크가 성공적으로 생성되었습니다.');
      
      // 프로젝트 상세 페이지로 이동
      navigate(`/projects/${projectId}`);
    } catch (error) {
      console.error('Error creating task:', error);
      message.error('태스크 생성 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <AppLayout>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" />
          <p>데이터를 불러오는 중...</p>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={handleCancel}
          >
            프로젝트로 돌아가기
          </Button>
        </div>
        
        <div style={{ marginBottom: 16 }}>
          <Title level={2}>새 태스크 생성</Title>
        </div>
        
        {project && (
          <div style={{ marginBottom: 16 }}>
            <Space align="center">
              <ProjectOutlined />
              <span>프로젝트: <strong>{project.name}</strong></span>
            </Space>
          </div>
        )}
        
        <Divider />
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            assignees: [username]
          }}
        >
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item 
                name="name" 
                label="태스크 이름" 
                rules={[{ required: true, message: '태스크 이름을 입력해주세요' }]}
              >
                <Input placeholder="태스크 이름을 입력하세요" />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item 
                name="startDate" 
                label="시작일" 
                rules={[{ required: true, message: '시작일을 선택해주세요' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item 
                name="plannedEndDate" 
                label="종료 예정일" 
                rules={[{ required: true, message: '종료 예정일을 선택해주세요' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            
            <Col span={24}>
              <Form.Item 
                name="assignees" 
                label="담당자" 
                rules={[{ required: true, message: '담당자를 선택해주세요' }]}
              >
                <Select
                  mode="multiple"
                  placeholder="담당자를 선택하세요"
                  style={{ width: '100%' }}
                  optionFilterProp="children"
                  showSearch
                >
                  {users.map(user => (
                    <Option key={user.username} value={user.username}>
                      {user.fullName ? `${user.username} (${user.fullName})` : user.username}
                    </Option>
                  ))}
                  
                  {/* 기본 옵션 (API 호출 실패 시 대비) */}
                  {users.length === 0 && (
                    <>
                      <Option value="admin">관리자</Option>
                      <Option value="user">일반사용자</Option>
                    </>
                  )}
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={24}>
              <Form.Item 
                name="description" 
                label="설명" 
              >
                <TextArea
                  rows={4}
                  placeholder="태스크에 대한 설명을 입력하세요"
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row justify="end" gutter={16}>
            <Col>
              <Button 
                onClick={handleCancel}
                icon={<CloseOutlined />}
              >
                취소
              </Button>
            </Col>
            <Col>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={submitting}
                icon={<SaveOutlined />}
              >
                저장
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </AppLayout>
  );
};

export default TaskCreate;
