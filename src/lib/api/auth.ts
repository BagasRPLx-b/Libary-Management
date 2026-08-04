import apiClient from './client';

export const loginUser = async (data: any): Promise<any> => {
  const response = await apiClient.post('/login', data);
  return response.data;
};

export const registerUser = async (data: any): Promise<any> => {
  const response = await apiClient.post('/register', data);
  return response.data;
};

export const logoutUser = async (): Promise<any> => {
  const response = await apiClient.post('/logout');
  return response.data;
};

export const fetchUser = async (): Promise<any> => {
  const response = await apiClient.get('/user');
  return response.data;
};
