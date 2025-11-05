import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_CONTENT_SERVICE_URL || 'http://localhost:3002';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const blogSettingsApi = {
  getBlogSettings: async () => {
    const response = await api.get('/api/blog-settings');
    return response.data;
  },

  updateBlogSettings: async (data: { blogTitle: string; blogDescription?: string }) => {
    const response = await api.put('/api/blog-settings', data);
    return response.data;
  },
};

