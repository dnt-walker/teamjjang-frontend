import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';

interface User {
  username: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // 페이지 로드 시 로컬 스토리지에서 사용자 정보 가져오기
  useEffect(() => {
    const username = localStorage.getItem('username');
    const rolesString = localStorage.getItem('roles');
    
    if (username && rolesString) {
      try {
        const roles = JSON.parse(rolesString);
        setUser({ username, roles });
      } catch (error) {
        console.error('Failed to parse roles:', error);
        localStorage.removeItem('username');
        localStorage.removeItem('roles');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
    
    setLoading(false);
  }, []);

  // 로그인 함수
  const login = async (username: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      const response = await authApi.login(username, password);
      
      const { accessToken, refreshToken, roles } = response.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('username', username);
      localStorage.setItem('roles', JSON.stringify(roles));
      
      setUser({ username, roles });
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃 함수
  const logout = (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    localStorage.removeItem('roles');
    
    setUser(null);
    navigate('/login');
  };

  // 인증 여부 확인
  const isAuthenticated = !!user;

  // 역할 확인 함수
  const hasRole = (role: string): boolean => {
    return user?.roles.includes(role) || false;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
