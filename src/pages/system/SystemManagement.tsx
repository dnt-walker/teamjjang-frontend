import React, { useState } from 'react';
import { Tabs, Card } from 'antd';
import { UserOutlined, SettingOutlined, DatabaseOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import AppLayout from '../../components/layout/AppLayout';
import UserManagement from './components/UserManagement';

type TabKey = 'users' | 'settings' | 'database' | 'security';

const SystemManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('users');

  const handleTabChange = (key: string) => {
    setActiveTab(key as TabKey);
  };

  const items = [
    {
      key: 'users',
      label: (
        <span>
          <UserOutlined />
          사용자 관리
        </span>
      ),
      children: <UserManagement />,
    },
    {
      key: 'settings',
      label: (
        <span>
          <SettingOutlined />
          일반 설정
        </span>
      ),
      children: <div>일반 설정 내용이 이곳에 표시됩니다.</div>,
    },
    {
      key: 'database',
      label: (
        <span>
          <DatabaseOutlined />
          데이터베이스
        </span>
      ),
      children: <div>데이터베이스 관리 내용이 이곳에 표시됩니다.</div>,
    },
    {
      key: 'security',
      label: (
        <span>
          <SafetyCertificateOutlined />
          보안 설정
        </span>
      ),
      children: <div>보안 설정 내용이 이곳에 표시됩니다.</div>,
    },
  ];

  return (
    <AppLayout>
      <Card title="시스템 관리" bordered={false}>
        <Tabs 
          activeKey={activeTab} 
          onChange={handleTabChange}
          items={items}
          size="large"
          style={{ marginTop: '16px' }}
        />
      </Card>
    </AppLayout>
  );
};

export default SystemManagement;
