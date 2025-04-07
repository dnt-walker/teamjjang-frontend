import React, { useState } from 'react';
import { Layout, Menu, Button, theme, Dropdown, Space } from 'antd';
import type { MenuProps } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  DashboardOutlined,
  UnorderedListOutlined,
  CalendarOutlined,
  UserOutlined,
  LogoutOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';

const { Header, Sider, Content } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const dropdownItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: '프로필',
      icon: <UserOutlined />,
      onClick: () => navigate('/profile'),
    },
    {
      key: 'logout',
      label: '로그아웃',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];
  
  // 현재 경로에 따라 선택된 메뉴 아이템 결정
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/') return ['dashboard'];
    if (path.startsWith('/tasks')) return ['tasks'];
    if (path.startsWith('/calendar')) return ['calendar'];
    return ['dashboard'];
  };
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null} 
        collapsible 
        collapsed={collapsed} 
        width={250}
      >
        <div style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#001529', // antd dark theme 기본 배경색과 동일
          borderBottom: 'none'
        }}>
          <h2 style={{
            color: 'white',
            margin: 0,
            padding: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontSize: collapsed ? '16px' : '18px',
            maxWidth: collapsed ? '60px' : '200px'
          }}>
            {collapsed ? 'TJ' : 'TeamJJang'}
          </h2>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={getSelectedKey()}
          items={[
            {
              key: 'dashboard',
              icon: <DashboardOutlined />,
              label: '대시보드',
              onClick: () => navigate('/'),
            },
            {
              key: 'tasks',
              icon: <UnorderedListOutlined />,
              label: '업무 관리',
              onClick: () => navigate('/tasks'),
            },
            {
              key: 'calendar',
              icon: <CalendarOutlined />,
              label: '일정 관리',
              onClick: () => navigate('/calendar'),
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 64,
                height: 64,
              }}
            />
            <div>
              <Dropdown menu={{ items: dropdownItems }} placement="bottomRight">
                <a onClick={(e) => e.preventDefault()}>
                  <Space>
                    <UserOutlined /> {user?.username || '사용자'}
                    <DownOutlined />
                  </Space>
                </a>
              </Dropdown>
            </div>
          </div>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: colorBgContainer, borderRadius: borderRadiusLG }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
