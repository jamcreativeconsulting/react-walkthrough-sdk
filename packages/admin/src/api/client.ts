import { Step } from '../types/walkthrough';

export interface ApiClientConfig {
  baseUrl: string;
  apiKey: string;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
}

export class ApiClientImpl {
  private baseUrl: string;
  private apiKey: string;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
  }

  private async request<T>(
    endpoint: string,
    method: string,
    body?: unknown
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
    };

    if (body) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      data,
      status: response.status,
    };
  }

  async get<T>(path: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<T>(`${path}${queryString}`, 'GET');
  }

  async post<T>(path: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(path, 'POST', data);
  }

  async put<T>(path: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(path, 'PUT', data);
  }

  async delete<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>(path, 'DELETE');
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  async createStep(walkthroughId: string, step: Omit<Step, 'id'>): Promise<Step> {
    const response = await this.request<Step>(
      `/api/walkthroughs/${walkthroughId}/steps`,
      'POST',
      step
    );
    return response.data;
  }

  async updateStep(walkthroughId: string, step: Step): Promise<Step> {
    const response = await this.request<Step>(
      `/api/walkthroughs/${walkthroughId}/steps/${step.id}`,
      'PUT',
      step
    );
    return response.data;
  }

  async deleteStep(walkthroughId: string, stepId: string): Promise<void> {
    await this.request<void>(`/api/walkthroughs/${walkthroughId}/steps/${stepId}`, 'DELETE');
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
