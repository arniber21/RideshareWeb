import axios from 'axios';

const authApi = axios.create({
  baseURL: process.env.AUTH_SERVICE_URL || 'http://localhost:3001/api/auth',
});

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  phone: string | null;
  isDriver: boolean;
}

export async function getUser(userId: string): Promise<User | null> {
  try {
    const response = await authApi.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export default {
  getUser,
}; 