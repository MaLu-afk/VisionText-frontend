export interface SearchResult {
  id: string;
  filename: string;
  url: string;
  thumbnail_url: string;
  similarity_score: number;
  description?: string;
  metadata?: {
    width: number;
    height: number;
    size: number;
    format: string;
  };
}

export interface SearchResponse {
  results: SearchResult[];
  total_count: number;
  query_time: number;
}

export interface TextSearchRequest {
  query: string;
  limit?: number;
  threshold?: number;
}

export interface ImageSearchRequest {
  image: File;
  limit?: number;
  threshold?: number;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  image_id?: string;
  filename?: string;
  status?: string;
  similarity_score?: number;
  required_similarity?: number;
  banned_words?: string[];
}

export interface SimilarityValidationResult {
  is_valid: boolean;
  similarity_score: number;
  threshold: number;
  message: string;
}

export interface AdminImage {
  id: string;
  filename: string;
  description?: string;
  thumbnail_url: string;
  metadata: {
    width: number;
    height: number;
    size: number;
    format: string;
    created_at: string;
    similarity_score?: number;
  };
  vector_id: string;
}