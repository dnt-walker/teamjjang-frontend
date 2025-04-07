import api from './api';

export interface User {
  id?: number;
  username: string;
  password?: string;
  fullName: string;
  email: string;
  department: string;
  position: string;
  active: boolean;
  roles?: string[];
}

// 비인증 또는 테스트용 공용 API 호출

export const getAllUsers = async (): Promise<User[]> => {
  const response = await api.get('/users');
  return response.data;
};

export const getUserById = async (id: number): Promise<User> => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const createUser = async (user: User): Promise<User> => {
  const response = await api.post('/users', user);
  return response.data;
};

export const updateUser = async (id: number, user: User): Promise<User> => {
  const response = await api.put(`/users/${id}`, user);
  return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/users/${id}`);
};
