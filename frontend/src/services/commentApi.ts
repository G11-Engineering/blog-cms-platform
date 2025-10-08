import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_COMMENT_SERVICE_URL || 'http://localhost:3005';

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

export const commentApi = {
  getComments: async (params: any = {}) => {
    const response = await api.get('/api/comments', { params });
    return response.data;
  },

  getComment: async (id: string) => {
    const response = await api.get(`/api/comments/${id}`);
    return response.data;
  },

  createComment: async (data: any) => {
    const response = await api.post('/api/comments', data);
    return response.data;
  },

  updateComment: async (id: string, data: any) => {
    const response = await api.put(`/api/comments/${id}`, data);
    return response.data;
  },

  deleteComment: async (id: string) => {
    const response = await api.delete(`/api/comments/${id}`);
    return response.data;
  },

  moderateComment: async (id: string, action: string, reason?: string) => {
    const response = await api.post(`/api/comments/${id}/moderate`, { action, reason });
    return response.data;
  },

  likeComment: async (id: string) => {
    const response = await api.post(`/api/comments/${id}/like`);
    return response.data;
  },

  getCommentLikes: async (id: string) => {
    const response = await api.get(`/api/comments/${id}/likes`);
    return response.data;
  },

  getCommentModeration: async (id: string) => {
    const response = await api.get(`/api/comments/${id}/moderation`);
    return response.data;
  },
};
