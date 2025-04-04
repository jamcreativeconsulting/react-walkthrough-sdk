export interface ApiConfig {
  baseUrl: string;
  apiKey?: string;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export interface ApiClient {
  get<T>(path: string, params?: Record<string, any>): Promise<ApiResponse<T>>;
  post<T>(path: string, data?: any): Promise<ApiResponse<T>>;
  put<T>(path: string, data?: any): Promise<ApiResponse<T>>;
  delete<T>(path: string): Promise<ApiResponse<T>>;
  setApiKey(apiKey: string): void;
  clearApiKey(): void;
}

export interface WalkthroughApiResponse {
  id: string;
  title: string;
  steps: Array<{
    id: string;
    title: string;
    content: string;
    target: string;
    order: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    role: string;
    apiKey: string;
  };
  token: string;
}
