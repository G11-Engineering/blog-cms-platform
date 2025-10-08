import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_SERVICE_URL || 'http://localhost:3003';

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

export const mediaApi = {
  getMediaFiles: async (params: any = {}) => {
    const response = await api.get('/api/media', { params });
    return response.data;
  },

  getMediaFile: async (id: string) => {
    const response = await api.get(`/api/media/${id}`);
    return response.data;
  },

  uploadMediaFiles: async (files: File[], altText?: string, caption?: string, isPublic = true) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    if (altText) formData.append('altText', altText);
    if (caption) formData.append('caption', caption);
    formData.append('isPublic', isPublic.toString());

    const response = await api.post('/api/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateMediaFile: async (id: string, data: any) => {
    const response = await api.put(`/api/media/${id}`, data);
    return response.data;
  },

  deleteMediaFile: async (id: string) => {
    const response = await api.delete(`/api/media/${id}`);
    return response.data;
  },

  getMediaThumbnails: async (id: string) => {
    const response = await api.get(`/api/media/${id}/thumbnails`);
    return response.data;
  },

  generateThumbnails: async (id: string) => {
    const response = await api.post(`/api/media/${id}/thumbnails`);
    return response.data;
  },
};
