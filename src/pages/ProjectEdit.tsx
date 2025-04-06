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
  Switch, 
  message, 
  Spin, 
  Space
} from 'antd';
import { 
  ArrowLeftOutlined,
  SaveOutlined,
  CloseOutlined,
  UserOutlined
} from '@ant-design/icons';
import { projectApi, userApi } from '../services/api';
import AppLayout from '../components/layout/AppLayout';
// dayjs는 Ant Design의 DatePicker에 필요합니다
// npm install dayjs가 필요합니다
import dayjs from 'dayjs';

const { Title, Text } = Typography;
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

const ProjectEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  
  // 사용자 목록 가져오기
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        // 사용자 검색 API 호출
        const response = await userApi.searchUsers({});
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
        message.error('사용자 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoadingUsers(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const projectId = parseInt(id);
        const response = await projectApi.getProjectById(projectId);
        const project = response.data;
        
        // DatePicker용 dayjs 객체로 변환
        form.setFieldsValue({
          ...project,
          startDate: project.startDate ? dayjs(project.startDate) : null,
          endDate: project.endDate ? dayjs(project.endDate) : null,
        });
      } catch (error) {
        console.error('Error fetching project details:', error);
        message.error('프로젝트 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjectDetails();
  }, [id, form]);
  
  const handleCancel = () => {
    navigate(`/projects/${id}`);
  };
  
  const handleSubmit = async (values: any) => {
    if (!id) return;
    
    try {
      setSubmitting(true);
      
      // 날짜 형식 변환
      const formattedValues = {
        ...values,
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : null,
        endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : null,
      };
      
      await projectApi.updateProject(parseInt(id), formattedValues);
      message.success('프로젝트가 성공적으로 수정되었습니다.');
      
      // 수정 완료 후 상세 페이지로 이동
      navigate(`/projects/${id}`);
    } catch (error) {
      console.error('Error updating project:', error);
      message.error('프로젝트 수정 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <AppLayout>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" />
          <p>프로젝트 정보를 불러오는 중...</p>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <Card>
        <div style={{ marginBottom: 24 }}>
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate(`/projects/${id}`)}
            >
              프로젝트로 돌아가기
            </Button>
            <Title level={2} style={{ margin: 0 }}>프로젝트 수정</Title>
          </Space>
        </div>
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item 
                label="프로젝트명" 
                name="name"
                rules={[{ required: true, message: '프로젝트명을 입력해주세요.' }]}
              >
                <Input placeholder="프로젝트명을 입력하세요" />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item 
                label="시작일" 
                name="startDate"
                rules={[{ required: true, message: '시작일을 선택해주세요.' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item 
                label="종료 예정일" 
                name="endDate"
                rules={[{ required: true, message: '종료 예정일을 선택해주세요.' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item 
                label="프로젝트 관리자" 
                name="manager"
                rules={[{ required: true, message: '관리자를 선택해주세요.' }]}
              >
                <Select
                  placeholder="관리자를 선택하세요"
                  suffixIcon={<UserOutlined />}
                  loading={loadingUsers}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option?.children?.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {/* API에서 가져온 사용자 목록 */}
                  {users.map(user => (
                    <Option key={user.id} value={user.username}>
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
            
            <Col span={12}>
              <Form.Item 
                label="활성 상태" 
                name="active"
                valuePropName="checked"
              >
                <Switch 
                  checkedChildren="활성" 
                  unCheckedChildren="비활성" 
                />
              </Form.Item>
            </Col>
            
            <Col span={24}>
              <Form.Item 
                label="설명" 
                name="description"
              >
                <TextArea 
                  rows={4} 
                  placeholder="프로젝트에 대한 설명을 입력하세요" 
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

export default ProjectEdit;
