import { create } from 'zustand';
import { authApi } from '../services/api';

interface User {
  username: string;
  roles: string[];
}

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  
  // 액션
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  isAuthenticated: false,
  
  // 로컬 스토리지에서 사용자 정보 초기화
  initAuth: () => {
    const username = localStorage.getItem('username');
    const rolesString = localStorage.getItem('roles');
    
    if (username && rolesString) {
      try {
        const roles = JSON.parse(rolesString);
        set({ 
          user: { username, roles },
          isAuthenticated: true, 
          loading: false 
        });
      } catch (error) {
        console.error('Failed to parse roles:', error);
        localStorage.removeItem('username');
        localStorage.removeItem('roles');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, isAuthenticated: false, loading: false });
      }
    } else {
      set({ loading: false });
    }
  },
  
  // 로그인
  login: async (username: string, password: string) => {
    set({ loading: true });
    
    try {
      const response = await authApi.login(username, password);
      
      const { accessToken, refreshToken, roles } = response.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('username', username);
      localStorage.setItem('roles', JSON.stringify(roles));
      
      set({ 
        user: { username, roles },
        isAuthenticated: true,
        loading: false 
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  
  // 로그아웃
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('username');
    localStorage.removeItem('roles');
    
    set({ 
      user: null,
      isAuthenticated: false
    });
  },
  
  // 역할 확인
  hasRole: (role: string) => {
    const { user } = get();
    return user?.roles.includes(role) || false;
  }
}));

export default useAuthStore;
