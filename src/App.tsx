import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { ConfigProvider, Card, Typography, Button, App as AntApp } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import koKR from 'antd/locale/ko_KR';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TaskList from './pages/TaskList';
import ProjectList from './pages/ProjectList';
import ProjectCreate from './pages/ProjectCreate';
import ProjectDetail from './pages/ProjectDetail';
import ProjectEdit from './pages/ProjectEdit';
import TaskCreate from './pages/TaskCreate';
import TaskEdit from './pages/TaskEdit';
import TaskDetail from './pages/TaskDetail';
import UserList from './pages/system/UserList';
import UserForm from './pages/system/UserForm';
import SystemManagement from './pages/system/SystemManagement';
import PrivateRoute from './components/PrivateRoute';
import { useAuthStore } from './store/authStore';

// 기본 페이지 컴포넌트
const Unauthorized = () => (
  <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
    <Card style={{ width: 400, textAlign: 'center' }}>
      <ExclamationCircleOutlined style={{ fontSize: 48, color: '#ff4d4f', marginBottom: 16 }} />
      <Typography.Title level={3}>접근 권한이 없습니다</Typography.Title>
      <Typography.Paragraph>
        해당 페이지에 접근할 권한이 없습니다. 관리자에게 문의하세요.
      </Typography.Paragraph>
      <Button type="primary" onClick={() => window.history.back()}>
        이전 페이지로 돌아가기
      </Button>
    </Card>
  </div>
);

const NotFound = () => (
  <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
    <Card style={{ width: 400, textAlign: 'center' }}>
      <Typography.Title level={1} style={{ color: '#bfbfbf' }}>404</Typography.Title>
      <Typography.Title level={3}>페이지를 찾을 수 없습니다</Typography.Title>
      <Typography.Paragraph>
        요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
      </Typography.Paragraph>
      <Button type="primary" onClick={() => window.location.href = '/'}>
        메인으로 돌아가기
      </Button>
    </Card>
  </div>
);

function App() {
  const initAuth = useAuthStore(state => state.initAuth);
  
  // 애플리케이션 시작 시 인증 상태 초기화
  useEffect(() => {
    initAuth();
  }, [initAuth]);
  
  return (
    <ConfigProvider
      locale={koKR}
      theme={{
        token: {
          colorPrimary: '#1890ff',
        },
      }}
    >
      <AntApp>
        <BrowserRouter>
          <Routes>
          {/* 공개 경로 */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* 인증 필요 경로 */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<ProjectList />} />
            <Route path="/projects/new" element={<ProjectCreate />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/projects/:id/edit" element={<ProjectEdit />} />
            <Route path="/tasks" element={<TaskList />} />
            <Route path="/projects/:projectId/tasks/new" element={<TaskCreate />} />
            <Route path="/projects/:projectId/tasks/:taskId" element={<TaskDetail />} />
            <Route path="/projects/:projectId/tasks/:taskId/edit" element={<TaskEdit />} />
            <Route path="/projects/:projectId/tasks/:taskId/jobs" element={<TaskDetail />} />
            
            {/* 시스템 관리 경로 */}
            <Route path="/system" element={<SystemManagement />} />
            <Route path="/system/users" element={<UserList />} />
            <Route path="/system/users/add" element={<UserForm />} />
            <Route path="/system/users/edit/:id" element={<UserForm />} />
          </Route>
          
          {/* 관리자 전용 경로 */}
          <Route element={<PrivateRoute requiredRole="ROLE_ADMIN" />}>
            {/* 관리자 페이지들은 여기에 추가 */}
          </Route>
          
          {/* 기본 리다이렉트 */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
