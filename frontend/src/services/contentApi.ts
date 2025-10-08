import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_CONTENT_SERVICE_URL || 'http://localhost:3002';
console.log('Content API Base URL:', API_BASE_URL);

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

export const contentApi = {
  getPosts: async (params: any = {}) => {
    console.log('Fetching posts with params:', params);
    console.log('API Base URL:', API_BASE_URL);
    try {
      const response = await api.get('/api/posts', { params });
      console.log('Posts response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  },

  getPost: async (id: string) => {
    const response = await api.get(`/api/posts/${id}`);
    return response.data;
  },

  createPost: async (data: any) => {
    const response = await api.post('/api/posts', data);
    return response.data;
  },

  updatePost: async (id: string, data: any) => {
    const response = await api.put(`/api/posts/${id}`, data);
    return response.data;
  },

  deletePost: async (id: string) => {
    const response = await api.delete(`/api/posts/${id}`);
    return response.data;
  },

  publishPost: async (id: string) => {
    const response = await api.post(`/api/posts/${id}/publish`);
    return response.data;
  },

  schedulePost: async (id: string, scheduledAt: string) => {
    const response = await api.post(`/api/posts/${id}/schedule`, { scheduledAt });
    return response.data;
  },

  getPostViews: async (id: string) => {
    const response = await api.get(`/api/posts/${id}/views`);
    return response.data;
  },

  incrementPostViews: async (id: string) => {
    const response = await api.post(`/api/posts/${id}/views`);
    return response.data;
  },
};
