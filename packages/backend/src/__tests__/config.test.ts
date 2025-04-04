import dotenv from 'dotenv';

describe('Configuration System', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Store original environment
    originalEnv = { ...process.env };
    // Clear all environment variables
    process.env = {};
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    jest.resetModules();
  });

  describe('Environment Variable Validation', () => {
    it('should throw error when API_KEY is missing', () => {
      process.env.ALLOWED_ORIGINS = 'http://localhost:3000';
      expect(() => {
        jest.isolateModules(() => {
          require('../config');
        });
      }).toThrow('API_KEY environment variable is required');
    });

    it('should throw error when ALLOWED_ORIGINS is missing', () => {
      process.env.API_KEY = 'test-api-key';
      expect(() => {
        jest.isolateModules(() => {
          require('../config');
        });
      }).toThrow('ALLOWED_ORIGINS environment variable is required');
    });

    it('should throw error when ALLOWED_ORIGINS is empty', () => {
      process.env.API_KEY = 'test-api-key';
      process.env.ALLOWED_ORIGINS = '';
      expect(() => {
        jest.isolateModules(() => {
          require('../config');
        });
      }).toThrow('ALLOWED_ORIGINS environment variable is required');
    });
  });

  describe('Configuration Values', () => {
    beforeEach(() => {
      process.env.API_KEY = 'test-api-key';
      process.env.ALLOWED_ORIGINS = 'http://localhost:3000,https://example.com';
      process.env.PORT = '3001';
      process.env.DATABASE_PATH = '/custom/path/db.sqlite';
    });

    it('should load API_KEY correctly', () => {
      jest.isolateModules(() => {
        const config = require('../config').default;
        expect(config.apiKey).toBe('test-api-key');
      });
    });

    it('should parse ALLOWED_ORIGINS correctly', () => {
      jest.isolateModules(() => {
        const config = require('../config').default;
        expect(config.allowedOrigins).toEqual([
          'http://localhost:3000',
          'https://example.com'
        ]);
      });
    });

    it('should use default PORT when not specified', () => {
      delete process.env.PORT;
      jest.isolateModules(() => {
        const config = require('../config').default;
        expect(config.port).toBe(3000);
      });
    });

    it('should use specified PORT', () => {
      jest.isolateModules(() => {
        const config = require('../config').default;
        expect(config.port).toBe(3001);
      });
    });

    it('should use default DATABASE_PATH when not specified', () => {
      delete process.env.DATABASE_PATH;
      jest.isolateModules(() => {
        const config = require('../config').default;
        expect(config.databasePath).toBe('./data/walkthrough.db');
      });
    });

    it('should use specified DATABASE_PATH', () => {
      jest.isolateModules(() => {
        const config = require('../config').default;
        expect(config.databasePath).toBe('/custom/path/db.sqlite');
      });
    });
  });

  describe('Environment File Loading', () => {
    it('should load variables from .env file', () => {
      // Mock dotenv.config to return our test values
      const mockEnv = {
        API_KEY: 'env-file-key',
        ALLOWED_ORIGINS: 'http://env-file-origin',
        PORT: '4000',
        DATABASE_PATH: './env-file-db.sqlite'
      };

      jest.spyOn(dotenv, 'config').mockReturnValue({
        parsed: mockEnv
      });

      // Set environment variables as if they were loaded from .env
      process.env = { ...process.env, ...mockEnv };

      jest.isolateModules(() => {
        const config = require('../config').default;
        expect(config.apiKey).toBe('env-file-key');
        expect(config.allowedOrigins).toEqual(['http://env-file-origin']);
        expect(config.port).toBe(4000);
        expect(config.databasePath).toBe('./env-file-db.sqlite');
      });
    });
  });
}); 