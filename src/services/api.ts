import axios from 'axios';
import type { SearchResult, SearchResponse, TextSearchRequest, ImageSearchRequest, UploadResponse } from '../types';

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

export const uploadImage = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getImageUrl = (imageId: string): string => {
  return `${API_BASE_URL}/api/images/${imageId}`;
};

export const getThumbnailUrl = (imageId: string): string => {
  return `${API_BASE_URL}/api/thumbnails/${imageId}`;
};