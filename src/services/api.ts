import axios from 'axios';
import type { SearchResult, SearchResponse, TextSearchRequest, ImageSearchRequest, UploadResponse, AdminImage } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const searchByText = async (request: TextSearchRequest): Promise<SearchResponse> => {
  const response = await api.post('/api/search/text', request);
  return response.data;
};

export const searchByImage = async (request: ImageSearchRequest): Promise<SearchResponse> => {
  const formData = new FormData();
  formData.append('image', request.image);
  if (request.limit) formData.append('limit', request.limit.toString());
  if (request.threshold) formData.append('threshold', request.threshold.toString());

  const response = await api.post('/api/search/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const uploadImage = async (formData: FormData): Promise<UploadResponse> => {
  console.log('🚀 Iniciando upload...');

  try {
    // Verificar qué estamos enviando
    console.log('📦 FormData contents:');
    for (let pair of formData.entries()) {
      console.log('  ', pair[0], ':', pair[1]);
    }

    const response = await api.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000,
    });

    console.log('✅ Upload exitoso:', response.status, response.data);
    return response.data;

  } catch (error: any) {
    console.error('❌ ERROR COMPLETO EN UPLOAD:', {
      name: error.name,
      message: error.message,
      code: error.code,
      response: {
        data: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        headers: error.response?.headers,
      },
      request: error.request,
      config: error.config
    });

    throw error;
  }
};

export const getImageUrl = (imageId: string): string => {
  return `${API_BASE_URL}/api/images/${imageId}`;
};

export const getThumbnailUrl = (imageId: string): string => {
  return `${API_BASE_URL}/api/thumbnails/${imageId}`;
};

// ==================== ADMIN API ====================

export const adminLogin = async (username: string, password: string): Promise<{ access_token: string; token_type: string }> => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);

  const response = await api.post('/api/admin/login', formData);
  return response.data;
};

export const getAllImagesAdmin = async (): Promise<{ images: AdminImage[]; total: number }> => {
  const token = localStorage.getItem('admin_token');
  const response = await api.get('/api/admin/images', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

export const deleteImageAdmin = async (imageId: string): Promise<{ success: boolean; message: string }> => {
  const token = localStorage.getItem('admin_token');
  const response = await api.delete(`/api/admin/images/${imageId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};