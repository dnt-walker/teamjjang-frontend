import { useState } from 'react';
import { 
  Typography, 
  Form, 
  Input, 
  DatePicker, 
  Button, 
  Card, 
  Switch, 
  App,
  Space
} from 'antd';
import { 
  ArrowLeftOutlined, 
  SaveOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { projectApi } from '../services/api';
import AppLayout from '../components/layout/AppLayout';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface ProjectFormValues {
  name: string;
  description: string;
  dateRange: [Dayjs, Dayjs];
  manager: string;
  active: boolean;
}

const ProjectCreate = () => {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: ProjectFormValues) => {
    try {
      setLoading(true);

      const projectData = {
        name: values.name,
        description: values.description,
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1].format('YYYY-MM-DD'),
        manager: values.manager,
        active: values.active,
      };

      await projectApi.createProject(projectData);
      message.success('프로젝트가 성공적으로 생성되었습니다.');
      navigate('/projects');
    } catch (err) {
      console.error('Error creating project:', err);
      message.error('프로젝트 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          style={{ marginRight: 16 }}
          onClick={() => navigate('/projects')}
        >
          프로젝트 목록으로
        </Button>
        <Title level={2} style={{ margin: 0 }}>새 프로젝트 생성</Title>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            active: true,
            manager: '관리자', // 예시 기본값
          }}
        >
          <Form.Item
            name="name"
            label="프로젝트명"
            rules={[{ required: true, message: '프로젝트명을 입력해주세요' }]}
          >
            <Input placeholder="프로젝트 이름을 입력하세요" />
          </Form.Item>

          <Form.Item
            name="description"
            label="프로젝트 설명"
            rules={[{ required: true, message: '프로젝트 설명을 입력해주세요' }]}
          >
            <TextArea
              placeholder="프로젝트에 대한 상세 설명을 입력하세요"
              rows={4}
            />
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="프로젝트 기간"
            rules={[{ required: true, message: '프로젝트 기간을 선택해주세요' }]}
          >
            <RangePicker 
              style={{ width: '100%' }} 
              format="YYYY-MM-DD" 
            />
          </Form.Item>

          <Form.Item
            name="manager"
            label="관리자"
            rules={[{ required: true, message: '관리자를 입력해주세요' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="프로젝트 관리자 이름을 입력하세요"
            />
          </Form.Item>

          <Form.Item
            name="active"
            label="활성화 상태"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="활성" 
              unCheckedChildren="비활성" 
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
              >
                프로젝트 생성
              </Button>
              <Button
                onClick={() => navigate('/projects')}
              >
                취소
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </AppLayout>
  );
};

export default ProjectCreate;
