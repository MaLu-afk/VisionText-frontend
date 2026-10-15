import axios from 'axios';
import type { SearchResponse, TextSearchRequest, ImageSearchRequest, UploadResponse, AdminImage } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const ADMIN_TOKEN_KEY = 'admin_token';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// ==================== AUTH ====================

export const getAdminToken = (): string | null => localStorage.getItem(ADMIN_TOKEN_KEY);

export const setAdminToken = (token: string): void => {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
};

export const clearAdminToken = (): void => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
};

// Adjunta el token de admin, si existe, a todas las peticiones
api.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const isUnauthorized = (error: unknown): boolean =>
  axios.isAxiosError(error) && error.response?.status === 401;

export const getErrorDetail = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (error.message) return error.message;
  }
  return fallback;
};

// ==================== SEARCH ====================

export const searchByText = async (request: TextSearchRequest): Promise<SearchResponse> => {
  const response = await api.post('/api/search/text', request);
  return response.data;
};

export const searchByImage = async (request: ImageSearchRequest): Promise<SearchResponse> => {
  const formData = new FormData();
  formData.append('image', request.image);
  if (request.limit) formData.append('limit', request.limit.toString());
  if (request.threshold) formData.append('threshold', request.threshold.toString());

  const response = await api.post('/api/search/image', formData);
  return response.data;
};

// ==================== UPLOAD (requiere admin) ====================

export const uploadImage = async (formData: FormData): Promise<UploadResponse> => {
  try {
    const response = await api.post<UploadResponse>('/api/upload', formData, {
      timeout: 60000,
    });
    return response.data;
  } catch (error) {
    // 422 con cuerpo UploadResponse = imagen rechazada por validación (no es un fallo técnico)
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 422 &&
      typeof error.response.data?.success === 'boolean'
    ) {
      return error.response.data as UploadResponse;
    }
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
  const response = await api.get('/api/admin/images');
  return response.data;
};

export const deleteImageAdmin = async (imageId: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/api/admin/images/${imageId}`);
  return response.data;
};
