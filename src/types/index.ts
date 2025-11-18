export interface SearchResult {
  id: string;
  filename: string;
  url: string;
  thumbnail_url: string;
  similarity_score: number;
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
}