import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_CATEGORY_SERVICE_URL || 'http://localhost:3004';

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

export const tagApi = {
  getTags: async (params: any = {}) => {
    const response = await api.get('/api/tags', { params });
    return response.data;
  },

  getTag: async (id: string) => {
    const response = await api.get(`/api/tags/${id}`);
    return response.data;
  },

  createTag: async (data: any) => {
    const response = await api.post('/api/tags', data);
    return response.data;
  },

  updateTag: async (id: string, data: any) => {
    const response = await api.put(`/api/tags/${id}`, data);
    return response.data;
  },

  deleteTag: async (id: string) => {
    const response = await api.delete(`/api/tags/${id}`);
    return response.data;
  },

  getPopularTags: async (limit = 20) => {
    const response = await api.get('/api/tags/popular', { params: { limit } });
    return response.data;
  },
};
