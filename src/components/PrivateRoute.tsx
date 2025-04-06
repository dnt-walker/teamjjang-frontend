import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useEffect } from 'react';
import { Spin } from 'antd';

interface PrivateRouteProps {
  requiredRole?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ requiredRole }) => {
  const { isAuthenticated, hasRole, loading, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // 로딩 중이면 로딩 표시
  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <Spin size="large" />
        </div>
    );
  }

  // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 필요한 역할이 있고, 사용자가 그 역할이 없는 경우 접근 거부 페이지로 리다이렉트
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 인증된 사용자는 자식 라우트 렌더링
  return <Outlet />;
};

export default PrivateRoute;
