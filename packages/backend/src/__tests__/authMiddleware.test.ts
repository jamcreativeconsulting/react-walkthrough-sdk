import { Request, Response, NextFunction } from 'express';
import { validateApiKey, validateDomain } from '../utils/authMiddleware';
import { logger } from '../utils/logger';

// Mock the config
jest.mock('../config', () => ({
  __esModule: true,
  default: {
    apiKey: 'test-api-key',
    allowedOrigins: ['http://localhost:3000', 'https://example.com']
  }
}));

const mockConfig = {
  apiKey: 'test-api-key',
  allowedOrigins: ['http://localhost:3000', 'https://example.com']
};

describe('Authentication Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      headers: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      end: jest.fn()
    };
    nextFunction = jest.fn();
  });

  describe('validateApiKey', () => {
    it('should call next() when valid API key is provided', () => {
      mockRequest.headers = {
        'x-api-key': mockConfig.apiKey
      };

      logger.debug('Test: Validating API key with valid key', {
        headers: mockRequest.headers,
        mockConfig
      });

      validateApiKey(mockRequest as Request, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should return 401 when no API key is provided', () => {
      mockRequest.headers = {};

      validateApiKey(mockRequest as Request, mockResponse as Response, nextFunction);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'API key is required' });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 403 when invalid API key is provided', () => {
      mockRequest.headers = {
        'x-api-key': 'invalid-key'
      };

      validateApiKey(mockRequest as Request, mockResponse as Response, nextFunction);
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid API key' });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('validateDomain', () => {
    it('should call next() when valid origin is provided', () => {
      mockRequest.headers = {
        'origin': mockConfig.allowedOrigins[0]
      };

      logger.debug('Test: Validating domain with valid origin', {
        headers: mockRequest.headers,
        mockConfig
      });

      validateDomain(mockRequest as Request, mockResponse as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should return 401 when no origin is provided', () => {
      mockRequest.headers = {};

      validateDomain(mockRequest as Request, mockResponse as Response, nextFunction);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Origin header is required' });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 403 when invalid origin is provided', () => {
      mockRequest.headers = {
        'origin': 'http://invalid-domain.com'
      };

      validateDomain(mockRequest as Request, mockResponse as Response, nextFunction);
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Domain not allowed' });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });
}); 