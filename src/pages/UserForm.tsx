import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Switch, Card, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { createUser, getUserById, updateUser, User } from '../services/userService';

const UserForm: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  useEffect(() => {
    if (isEditing) {
      const fetchUser = async () => {
        setLoading(true);
        try {
          const userData = await getUserById(parseInt(id));
          // 비밀번호 필드는 비워둠 (수정시에는 변경할 경우에만 입력)
          const { password, ...userDataWithoutPassword } = userData;
          form.setFieldsValue(userDataWithoutPassword);
        } catch (error) {
          console.error('사용자 정보를 불러오는데 실패했습니다:', error);
          message.error('사용자 정보를 불러오는데 실패했습니다.');
        } finally {
          setLoading(false);
        }
      };

      fetchUser();
    }
  }, [id, form, isEditing]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (isEditing) {
        await updateUser(parseInt(id), values as User);
        message.success('사용자 정보가 수정되었습니다.');
      } else {
        await createUser(values as User);
        message.success('사용자가 추가되었습니다.');
      }
      navigate('/system/users');
    } catch (error: any) {
      console.error('사용자 저장에 실패했습니다:', error);
      const errorMessage = error.response?.data?.message || '사용자 저장에 실패했습니다.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>{isEditing ? '사용자 수정' : '사용자 추가'}</h1>
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ active: true }}
        >
          <Form.Item
            name="username"
            label="아이디"
            rules={[
              { required: true, message: '아이디를 입력해주세요' },
              { min: 4, message: '아이디는 최소 4자 이상이어야 합니다' }
            ]}
          >
            <Input disabled={isEditing} />
          </Form.Item>

          <Form.Item
            name="password"
            label="비밀번호"
            rules={[
              { required: !isEditing, message: '비밀번호를 입력해주세요' },
              { min: 6, message: '비밀번호는 최소 6자 이상이어야 합니다' }
            ]}
          >
            <Input.Password placeholder={isEditing ? '변경시에만 입력하세요' : ''} />
          </Form.Item>

          <Form.Item
            name="name"
            label="이름"
            rules={[{ required: true, message: '이름을 입력해주세요' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="이메일"
            rules={[
              { required: true, message: '이메일을 입력해주세요' },
              { type: 'email', message: '올바른 이메일 형식이 아닙니다' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="department"
            label="부서"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="position"
            label="직위"
          >
            <Input />
          </Form.Item>

          <Form.Item 
            name="active" 
            label="활성화 상태" 
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button onClick={() => navigate('/system/users')}>
                취소
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                저장
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default UserForm;
