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

export const categoryApi = {
  getCategories: async (params: any = {}) => {
    const response = await api.get('/api/categories', { params });
    return response.data;
  },

  getCategory: async (id: string) => {
    const response = await api.get(`/api/categories/${id}`);
    return response.data;
  },

  createCategory: async (data: any) => {
    const response = await api.post('/api/categories', data);
    return response.data;
  },

  updateCategory: async (id: string, data: any) => {
    const response = await api.put(`/api/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: string) => {
    const response = await api.delete(`/api/categories/${id}`);
    return response.data;
  },

  getCategoryHierarchy: async (id: string) => {
    const response = await api.get(`/api/categories/${id}/hierarchy`);
    return response.data;
  },

  updateCategoryHierarchy: async (id: string, parentId: string | null) => {
    const response = await api.put(`/api/categories/${id}/hierarchy`, { parentId });
    return response.data;
  },
};
