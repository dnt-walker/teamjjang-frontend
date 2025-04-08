import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Popconfirm, App, Typography } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, deleteUser, User } from '../../../services/userService';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const { message } = App.useApp();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('사용자 목록을 불러오는데 실패했습니다:', error);
      message.error('사용자 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await deleteUser(id);
      message.success('사용자가 삭제되었습니다.');
      fetchUsers();
    } catch (error) {
      console.error('사용자 삭제에 실패했습니다:', error);
      message.error('사용자 삭제에 실패했습니다.');
    }
  };

  const columns = [
    {
      title: '아이디',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '이름',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: '이메일',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '역할',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles: string[]) => (
        <>
          {roles && roles.map(role => {
            const displayName = 
              role === 'ROLE_ADMIN' ? '관리자' :
              role === 'ROLE_MANAGER' ? '매니저' :
              role === 'ROLE_USER' ? '사용자' : role;
            return <div key={role}>{displayName}</div>;
          })}
        </>
      ),
    },
    {
      title: '상태',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean) => (
        <span style={{ color: active ? 'green' : 'red' }}>
          {active ? '활성' : '비활성'}
        </span>
      ),
    },
    {
      title: '관리',
      key: 'action',
      render: (_: any, record: User) => (
        <Space size="middle">
          <Button 
            icon={<EditOutlined />} 
            onClick={() => navigate(`/system/users/edit/${record.id}`)}
            type="text"
          />
          <Popconfirm
            title="사용자 삭제"
            description="이 사용자를 정말 삭제하시겠습니까?"
            onConfirm={() => record.id && handleDelete(record.id)}
            okText="예"
            cancelText="아니오"
          >
            <Button 
              icon={<DeleteOutlined />} 
              danger 
              type="text"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <Typography.Title level={5} style={{ margin: 0 }}>사용자 목록</Typography.Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => navigate('/system/users/add')}
        >
          사용자 추가
        </Button>
      </div>
      <Table 
        columns={columns} 
        dataSource={users.map(user => ({ ...user, key: user.id }))} 
        loading={loading} 
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default UserManagement;
