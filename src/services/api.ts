import axios from 'axios';
//import { projects, tasks } from '../mocks/data';

const API_URL = 'http://localhost:8080/api';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // 액세스 토큰 만료 시 리프레시 토큰으로 재발급 시도
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });
        
        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (error) {
        // 리프레시 토큰도 만료된 경우 로그아웃
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('username');
        localStorage.removeItem('roles');
        
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

// 인증 관련 API
export const authApi = {
  login: (username: string, password: string) => {
    if (useMockData) {
      if ((username === 'admin' && password === 'password') || 
          (username === 'user' && password === 'password')) {
        return Promise.resolve({
          data: {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
            username: username,
            roles: username === 'admin' ? ['ROLE_ADMIN', 'ROLE_USER'] : ['ROLE_USER']
          }
        });
      }
      return Promise.reject({ 
        response: { status: 401, data: { message: '아이디 또는 비밀번호가 올바르지 않습니다.' } }
      });
    }
    return api.post('/auth/login', { username, password });
  },
  register: (username: string, password: string, email: string, fullName: string) => {
    return api.post('/auth/register', { username, password, email, fullName });
  },
  logout: () => {
    return api.post('/auth/logout');
  },
  refreshToken: (refreshToken: string) => {
    return api.post('/auth/refresh', { refreshToken });
  },
};

// 백엔드 API 호출을 사용
const useMockData = false;

// 프로젝트 관련 API
export const projectApi = {
  getAllProjects: () => {
    if (useMockData) {
      return Promise.resolve({ data: projects });
    }
    return api.get('/projects');
  },
  getProjectById: (id: number) => {
    if (useMockData) {
      const project = projects.find(p => p.id === id);
      return Promise.resolve({ data: project });
    }
    return api.get(`/projects/${id}`);
  },
  createProject: (projectData: any) => {
    if (useMockData) {
      const newProject = { ...projectData, id: Date.now() };
      projects.push(newProject);
      return Promise.resolve({ data: newProject });
    }
    return api.post('/projects', projectData);
  },
  updateProject: (id: number, projectData: any) => {
    if (useMockData) {
      const index = projects.findIndex(p => p.id === id);
      if (index !== -1) {
        projects[index] = { ...projects[index], ...projectData };
        return Promise.resolve({ data: projects[index] });
      }
      return Promise.reject(new Error('Project not found'));
    }
    return api.put(`/projects/${id}`, projectData);
  },
  deleteProject: (id: number) => {
    if (useMockData) {
      const index = projects.findIndex(p => p.id === id);
      if (index !== -1) {
        projects.splice(index, 1);
        return Promise.resolve({ data: {} });
      }
      return Promise.reject(new Error('Project not found'));
    }
    return api.delete(`/projects/${id}`);
  },
  getMyProjects: () => {
    if (useMockData) {
      const username = localStorage.getItem('username') || '';
      return Promise.resolve({ 
        data: projects.filter(p => p.manager === username) 
      });
    }
    return api.get('/projects/my');
  },
};

// 태스크 관련 API
export const taskApi = {
  // 모든 태스크 조회 (필터링 가능)
  getAllTasks: (params?: {
    completed?: boolean,
    assignee?: string,
    creator?: string,
    projectId?: number,
    jobStatus?: string
  }) => {
    if (useMockData) {
      let filtered = [...tasks];
      
      // 영구 목업 필터링 로직
      if (params?.projectId !== undefined) {
        filtered = filtered.filter(task => task.project?.id === params.projectId);
      }
      if (params?.completed !== undefined) {
        filtered = filtered.filter(task => 
          params.completed ? task.completionDate !== null : task.completionDate === null
        );
      }
      if (params?.assignee) {
        filtered = filtered.filter(task => 
          task.assignees.includes(params.assignee || '')
        );
      }
      if (params?.creator) {
        filtered = filtered.filter(task => 
          task.creator === params.creator
        );
      }
      
      return Promise.resolve({ data: filtered });
    }
    
    // 실제 API 호출
    if (params?.projectId) {
      return api.get(`/projects/${params.projectId}/tasks`, { params: {
        jobStatus: params.jobStatus,
      }});
    }
    return api.get('/tasks', { params });
  },
  
  // 전체 태스크 조회
  getAllTasksGlobal: () => {
    if (useMockData) {
      return Promise.resolve({ data: tasks });
    }
    return api.get('/tasks');
  },
  
  // 프로젝트별 태스크 조회
  getTasksByProject: (projectId: number, jobStatus?: string) => {
    if (useMockData) {
      const filtered = tasks.filter(task => task.project?.id === projectId);
      return Promise.resolve({ data: filtered });
    }
    return api.get(`/projects/${projectId}/tasks`, { 
      params: { jobStatus }
    });
  },
  
  // 태스크 상세 조회
  getTaskById: (id: number) => {
    if (useMockData) {
      const task = tasks.find(t => t.id === id);
      return Promise.resolve({ data: task });
    }
    // 프로젝트 ID가 없는 경우 기본값 1 사용 (모든 태스크는 프로젝트에 속해야 함)
    return api.get(`/projects/1/tasks/${id}`);
  },
  
  // 프로젝트 내 태스크 상세 조회
  getTaskInProject: (projectId: number, taskId: number) => {
    if (useMockData) {
      const task = tasks.find(t => t.id === taskId && t.project?.id === projectId);
      return Promise.resolve({ data: task });
    }
    return api.get(`/projects/${projectId}/tasks/${taskId}`);
  },
  
  // 태스크 생성
  createTask: (taskData: any) => {
    if (useMockData) {
      const newTask = { ...taskData, id: Date.now() };
      tasks.push(newTask);
      return Promise.resolve({ data: newTask });
    }
    
    // 프로젝트에 태스크 추가
    if (taskData.project?.id) {
      return api.post(`/projects/${taskData.project.id}/tasks`, taskData);
    }
    return api.post('/tasks', taskData);
  },
  
  // 태스크 업데이트
  updateTask: (id: number, taskData: any) => {
    if (useMockData) {
      const index = tasks.findIndex(t => t.id === id);
      if (index !== -1) {
        tasks[index] = { ...tasks[index], ...taskData };
        return Promise.resolve({ data: tasks[index] });
      }
      return Promise.reject(new Error('Task not found'));
    }
    return api.put(`/tasks/${id}`, taskData);
  },
  
  // 프로젝트의 태스크 업데이트
  updateProjectTask: (projectId: number, taskId: number, taskData: any) => {
    if (useMockData) {
      const index = tasks.findIndex(t => t.id === taskId && t.project?.id === projectId);
      if (index !== -1) {
        tasks[index] = { ...tasks[index], ...taskData };
        return Promise.resolve({ data: tasks[index] });
      }
      return Promise.reject(new Error('Task not found in project'));
    }
    return api.put(`/projects/${projectId}/tasks/${taskId}`, taskData);
  },
  
  // 태스크 삭제
  deleteTask: (id: number) => {
    if (useMockData) {
      const index = tasks.findIndex(t => t.id === id);
      if (index !== -1) {
        tasks.splice(index, 1);
        return Promise.resolve({ data: {} });
      }
      return Promise.reject(new Error('Task not found'));
    }
    return api.delete(`/tasks/${id}`);
  },
  
  // 프로젝트에서 태스크 제거
  removeTaskFromProject: (projectId: number, taskId: number) => {
    if (useMockData) {
      const index = tasks.findIndex(t => t.id === taskId);
      if (index !== -1 && tasks[index].project?.id === projectId) {
        tasks[index].project = undefined;
        return Promise.resolve({ data: {} });
      }
      return Promise.reject(new Error('Task not found in project'));
    }
    return api.delete(`/projects/${projectId}/tasks/${taskId}`);
  },
};

// 작업 관련 API
export const jobApi = {
  getJobsForTask: (taskId: number, projectId: number = 1) => {
    return api.get(`/projects/${projectId}/tasks/${taskId}/jobs`);
  },
  getJobById: (projectId: number, taskId: number, jobId: number) => {
    return api.get(`/projects/${projectId}/tasks/${taskId}/jobs/${jobId}`);
  },
  createJob: (taskId: number, jobData: any, projectId: number = 1) => {
    return api.post(`/projects/${projectId}/tasks/${taskId}/jobs`, jobData);
  },
  updateJob: (projectId: number, taskId: number, jobId: number, jobData: any) => {
    return api.put(`/projects/${projectId}/tasks/${taskId}/jobs/${jobId}`, jobData);
  },
  deleteJob: (projectId: number, taskId: number, jobId: number) => {
    return api.delete(`/projects/${projectId}/tasks/${taskId}/jobs/${jobId}`);
  },
  completeJob: (projectId: number, taskId: number, jobId: number) => {
    return api.patch(`/projects/${projectId}/tasks/${taskId}/jobs/${jobId}/complete`);
  },
  reopenJob: (projectId: number, taskId: number, jobId: number) => {
    return api.patch(`/projects/${projectId}/tasks/${taskId}/jobs/${jobId}/reopen`);
  },
  updateJobStatus: (projectId: number, taskId: number, jobId: number, status: string) => {
    return api.patch(`/projects/${projectId}/tasks/${taskId}/jobs/${jobId}/status?status=${status}`);
  },
  getJobSummary: (projectId: number, taskId: number) => {
    return api.get(`/projects/${projectId}/tasks/${taskId}/jobs/summary`);
  },
  getJobStatsByUser: (projectId: number) => {
    return api.get(`/projects/${projectId}/tasks/1/jobs/stats/users`);
  }
};

// 사용자 관련 API
export const userApi = {
  getCurrentUser: () => {
    return api.get('/users/current');
  },
  getUserById: (id: number) => {
    return api.get(`/users/${id}`);
  },
  getUserByUsername: (username: string) => {
    return api.get(`/users/username/${username}`);
  },
  updateUser: (id: number, userData: any) => {
    return api.put(`/users/${id}`, userData);
  },
  searchUsers: (params: { username?: string, email?: string, fullName?: string }) => {
    return api.get('/users/search', { params });
  },
  getAllUsers: () => {
    // 목업 데이터 사용
    if (useMockData) {
      return Promise.resolve({
        data: [
          { id: 1, username: 'admin', email: 'admin@example.com', fullName: '관리자' },
          { id: 2, username: 'user1', email: 'user1@example.com', fullName: '사용자 1' },
          { id: 3, username: 'user2', email: 'user2@example.com', fullName: '사용자 2' },
          { id: 4, username: 'user3', email: 'user3@example.com', fullName: '사용자 3' }
        ]
      });
    }
    return api.get('/users');
  }
};

// 대시보드 관련 API
export const dashboardApi = {
  getSummary: () => {
    if (useMockData) {
      // 목업 데이터
      return Promise.resolve({
        data: {
          totalProjects: 10,
          activeProjects: 5,
          myProjects: 3,
          totalTasks: 45,
          completedTasks: 23,
          myTasks: 12,
          overdueTasks: 2,
          tasksDueThisWeek: 8,
          taskStatusCounts: {
            "미시작": 5,
            "진행중": 17,
            "완료": 23,
            "지연": 2
          },
          jobStatusCounts: {
            "created": 10,
            "waiting": 15,
            "in-process": 20,
            "succeeded": 30,
            "failed": 5,
            "finished": 25,
            "removed": 2
          },
          monthlyCompletionStats: {
            "2025-01": 5,
            "2025-02": 7,
            "2025-03": 8,
            "2025-04": 12,
            "2025-05": 14,
            "2025-06": 9
          },
          assigneeStats: {
            "user1": 8,
            "user2": 12,
            "admin": 15,
            "미할당": 10
          }
        }
      });
    }
    return api.get('/dashboard/summary');
  },
  
  getUpcomingTasks: (days = 7) => {
    if (useMockData) {
      // 목업 데이터
      const today = new Date();
      return Promise.resolve({
        data: tasks.filter(task => {
          if (task.completionDate) return false;
          
          const plannedEndDate = new Date(task.plannedEndDate);
          const diffDays = Math.floor((plannedEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return diffDays >= 0 && diffDays <= days;
        }).slice(0, 5)
      });
    }
    return api.get(`/dashboard/upcoming-tasks?days=${days}`);
  },
  
  getOverdueTasks: () => {
    if (useMockData) {
      // 목업 데이터
      const today = new Date();
      return Promise.resolve({
        data: tasks.filter(task => {
          if (task.completionDate) return false;
          
          const plannedEndDate = new Date(task.plannedEndDate);
          return plannedEndDate < today;
        }).slice(0, 5)
      });
    }
    return api.get('/dashboard/overdue-tasks');
  },
  
  getTaskCompletionStats: (months = 6) => {
    if (useMockData) {
      // 목업 데이터
      return Promise.resolve({
        data: {
          "2025-01": 5,
          "2025-02": 7,
          "2025-03": 8,
          "2025-04": 12,
          "2025-05": 14,
          "2025-06": 9
        }
      });
    }
    return api.get(`/dashboard/task-completion-stats?months=${months}`);
  },
  
  getAssigneeStats: () => {
    if (useMockData) {
      // 목업 데이터
      return Promise.resolve({
        data: {
          "user1": 8,
          "user2": 12,
          "admin": 15,
          "미할당": 10
        }
      });
    }
    return api.get('/dashboard/assignee-stats');
  },
  
  getJobStatusStats: () => {
    if (useMockData) {
      // 목업 데이터
      return Promise.resolve({
        data: {
          "created": 10,
          "waiting": 15,
          "in-process": 20,
          "succeeded": 30,
          "failed": 5,
          "finished": 25,
          "removed": 2
        }
      });
    }
    return api.get('/dashboard/job-status-stats');
  }
};

export default api;
