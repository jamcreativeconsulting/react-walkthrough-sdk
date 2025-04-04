import { ApiClient, ApiConfig, ApiResponse, ApiError } from '../types/api';
import { Step } from '../components/PointAndClickEditor/types';

export class ApiClientImpl implements ApiClient {
  private config: ApiConfig;
  private defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  constructor(config: ApiConfig) {
    this.config = config;
  }

  private async request<T>(
    method: string,
    path: string,
    data?: any,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    try {
      const url = new URL(path, this.config.baseUrl);

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, String(value));
        });
      }

      const headers: Record<string, string> = {
        ...this.defaultHeaders,
      };

      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      const response = await fetch(url.toString(), {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw {
          message: responseData.message || 'An error occurred',
          status: response.status,
          code: responseData.code,
        } as ApiError;
      }

      return {
        data: responseData,
        status: response.status,
      };
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get<T>(path: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    return this.request<T>('GET', path, undefined, params);
  }

  async post<T>(path: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>('POST', path, data);
  }

  async put<T>(path: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', path, data);
  }

  async delete<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', path);
  }

  setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
  }

  clearApiKey(): void {
    this.config.apiKey = undefined;
  }

  async createStep(
    walkthroughId: string,
    step: Omit<Step, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Step> {
    try {
      const response = await fetch(`/api/walkthroughs/${walkthroughId}/steps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(step),
      });

      if (!response.ok) {
        throw new Error('Failed to create step');
      }

      return response.json();
    } catch (error) {
      console.error('Error creating step:', error);
      throw error;
    }
  }

  async updateStep(walkthroughId: string, stepId: string, step: Partial<Step>): Promise<Step> {
    try {
      const response = await fetch(`/api/walkthroughs/${walkthroughId}/steps/${stepId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(step),
      });

      if (!response.ok) {
        throw new Error('Failed to update step');
      }

      return response.json();
    } catch (error) {
      console.error('Error updating step:', error);
      throw error;
    }
  }

  async deleteStep(walkthroughId: string, stepId: string): Promise<void> {
    try {
      const response = await fetch(`/api/walkthroughs/${walkthroughId}/steps/${stepId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete step');
      }
    } catch (error) {
      console.error('Error deleting step:', error);
      throw error;
    }
  }

  async getSteps(walkthroughId: string): Promise<Step[]> {
    try {
      const response = await fetch(`/api/walkthroughs/${walkthroughId}/steps`);

      if (!response.ok) {
        throw new Error('Failed to get steps');
      }

      return response.json();
    } catch (error) {
      console.error('Error getting steps:', error);
      throw error;
    }
  }
}
