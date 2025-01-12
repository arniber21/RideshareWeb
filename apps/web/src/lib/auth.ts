import { authApi } from './api';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData extends LoginData {
  confirmPassword: string;
  role: 'driver' | 'rider';
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export interface UpdateProfileData {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await authApi.post<AuthResponse>('/api/auth/login', data);
  localStorage.setItem('token', response.data.token);
  return response.data;
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const { confirmPassword, ...registerData } = data;
  const response = await authApi.post<AuthResponse>('/api/auth/register', registerData);
  localStorage.setItem('token', response.data.token);
  return response.data;
};

export const loginWithGoogle = async (): Promise<void> => {
  window.location.href = `${authApi.defaults.baseURL}/api/auth/google`;
};

export const logout = async (): Promise<void> => {
  localStorage.removeItem('token');
  window.location.href = '/auth/login';
};

export const updateProfile = async (data: UpdateProfileData) => {
  const response = await authApi.put('/api/auth/profile', data);
  return response.data;
};

export const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append('avatar', file);
  
  const response = await authApi.post('/api/auth/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getCurrentUser = async () => {
  try {
    const response = await authApi.get('/api/auth/current-user');
    return response.data;
  } catch {
    return null;
  }
}; 