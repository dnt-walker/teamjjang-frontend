import React, { useState, useEffect, useRef } from 'react';
import './AppLayout.css';
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
  ProjectOutlined,
  SettingOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';

const { Header, Sider, Content } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [bottomMenuWidth, setBottomMenuWidth] = useState(collapsed ? 80 : 250);
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  
  // 사이드바 확장/축소 시 하단 메뉴 너비 조정
  useEffect(() => {
    setBottomMenuWidth(collapsed ? 80 : 250);
  }, [collapsed]);
  
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
    if (path.startsWith('/projects')) return ['projects'];
    if (path.startsWith('/tasks')) return ['tasks'];
    if (path.startsWith('/system')) {
      return ['system'];
    }
    return ['dashboard'];
  };
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null} 
        collapsible 
        collapsed={collapsed} 
        width={250}
        className="custom-sider"
      >
        <div style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          backgroundColor: '#001529', // antd dark theme 기본 배경색과 동일
          borderBottom: 'none',
          paddingLeft: collapsed ? '0' : '16px'
        }}>
          <h2 style={{
            color: 'white',
            margin: 0,
            padding: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textAlign: collapsed ? 'center' : 'left',
            fontSize: collapsed ? '16px' : '18px',
            maxWidth: collapsed ? '60px' : '200px'
          }}>
            {collapsed ? 'TJ' : 'TeamJJang'}
          </h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ flex: '1 1 auto', overflow: 'auto', paddingBottom: '48px' }}>
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
              key: 'projects',
              icon: <ProjectOutlined />,
              label: '프로젝트 관리',
              onClick: () => navigate('/projects'),
            },
            {
              key: 'tasks',
              icon: <UnorderedListOutlined />,
              label: '업무 관리',
              onClick: () => navigate('/tasks'),
            }
          ]}
            />
          </div>
          <div className="bottom-fixed-menu" style={{ position: 'fixed', bottom: 0, width: `${bottomMenuWidth}px`, zIndex: 10 }}>
            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={getSelectedKey()}
              items={[
                {
                  key: 'system',
                  icon: <SettingOutlined />,
                  label: '시스템 설정',
                  onClick: () => navigate('/system'),
                },
              ]}
            />
          </div>
        </div>
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
