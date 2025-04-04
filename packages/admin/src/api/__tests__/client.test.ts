import { ApiClientImpl } from '../client';
import { ApiResponse } from '../../types/api';

describe('ApiClientImpl', () => {
  let apiClient: ApiClientImpl;
  const mockBaseUrl = 'http://api.example.com';
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    apiClient = new ApiClientImpl({ baseUrl: mockBaseUrl });
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('API Key Management', () => {
    it('should set and clear API key', () => {
      apiClient.setApiKey(mockApiKey);
      expect(apiClient['config'].apiKey).toBe(mockApiKey);

      apiClient.clearApiKey();
      expect(apiClient['config'].apiKey).toBeUndefined();
    });
  });

  describe('GET requests', () => {
    it('should make GET request with params', async () => {
      const mockResponse = { data: { id: 1, name: 'test' }, status: 200 };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse.data),
      });

      const response = await apiClient.get<typeof mockResponse.data>('/test', { param: 'value' });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://api.example.com/test?param=value',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(response).toEqual({ data: mockResponse.data, status: 200 });
    });

    it('should handle GET request errors', async () => {
      const mockError = { message: 'Not found', status: 404 };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve(mockError),
      });

      await expect(apiClient.get('/test')).rejects.toEqual(
        expect.objectContaining({
          message: 'Not found',
          status: 404,
        })
      );
    });
  });

  describe('POST requests', () => {
    it('should make POST request with data', async () => {
      const mockData = { name: 'test' };
      const mockResponse = { data: { id: 1, ...mockData }, status: 201 };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockResponse.data),
      });

      const response = await apiClient.post<typeof mockResponse.data>('/test', mockData);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://api.example.com/test',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(mockData),
        })
      );
      expect(response).toEqual({ data: mockResponse.data, status: 201 });
    });
  });

  describe('PUT requests', () => {
    it('should make PUT request with data', async () => {
      const mockData = { name: 'updated' };
      const mockResponse = { data: { id: 1, ...mockData }, status: 200 };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse.data),
      });

      const response = await apiClient.put<typeof mockResponse.data>('/test/1', mockData);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://api.example.com/test/1',
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(mockData),
        })
      );
      expect(response).toEqual({ data: mockResponse.data, status: 200 });
    });
  });

  describe('DELETE requests', () => {
    it('should make DELETE request', async () => {
      const mockResponse = { data: { success: true }, status: 204 };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: () => Promise.resolve(mockResponse.data),
      });

      const response = await apiClient.delete<typeof mockResponse.data>('/test/1');

      expect(global.fetch).toHaveBeenCalledWith(
        'http://api.example.com/test/1',
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(response).toEqual({ data: mockResponse.data, status: 204 });
    });
  });

  describe('Authentication', () => {
    it('should include API key in headers when set', async () => {
      apiClient.setApiKey(mockApiKey);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });

      await apiClient.get('/test');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockApiKey}`,
          }),
        })
      );
    });
  });
});
