import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'editor' | 'author' | 'reader';
  avatar_url?: string;
  bio?: string;
  is_active: boolean;
  created_at: string;
}

export interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UpdateUserData {
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}

export const userApi = {
  // Get all users with pagination and filters
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
    status?: string;
  }): Promise<UsersResponse> => {
    const response = await api.get('/api/users', { params });
    return response.data;
  },

  // Get single user by ID
  getUserById: async (id: string): Promise<{ user: User }> => {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },

  // Update user (role, status, etc.)
  updateUser: async (id: string, data: UpdateUserData): Promise<{ user: User }> => {
    const response = await api.put(`/api/users/${id}`, data);
    return response.data;
  },

  // Delete user
  deleteUser: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/api/users/${id}`);
    return response.data;
  },
};
