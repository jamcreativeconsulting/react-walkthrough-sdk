import { ApiClientImpl } from '../client';
import { ApiClientConfig } from '../types';

describe('ApiClientImpl', () => {
  const mockConfig: ApiClientConfig = {
    baseUrl: 'http://localhost:3000',
    apiKey: 'test-api-key',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: 'test' }),
    });
  });

  it('initializes with correct config', () => {
    const apiClient = new ApiClientImpl(mockConfig);
    expect(apiClient).toBeDefined();
  });

  it('makes GET request with correct headers', async () => {
    const apiClient = new ApiClientImpl(mockConfig);
    await apiClient.get('/test');
    expect(fetch).toHaveBeenCalledWith(`${mockConfig.baseUrl}/test`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${mockConfig.apiKey}`,
      },
    });
  });

  it('makes POST request with correct headers and body', async () => {
    const apiClient = new ApiClientImpl(mockConfig);
    const testData = { name: 'Test' };
    await apiClient.post('/test', testData);
    expect(fetch).toHaveBeenCalledWith(`${mockConfig.baseUrl}/test`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${mockConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
  });

  it('throws error on failed request', async () => {
    const apiClient = new ApiClientImpl(mockConfig);
    const errorMessage = 'API request failed';
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: errorMessage,
    });

    await expect(apiClient.get('/test')).rejects.toThrow(errorMessage);
  });
});
