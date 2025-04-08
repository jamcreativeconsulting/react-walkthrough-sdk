import request from 'supertest';
import express from 'express';
import { DatabaseSchema } from '../../db/schema';
import walkthroughRoutes from '../../routes/walkthroughs';
import { logger } from '../../utils/logger';
import { validateApiKey, validateDomain } from '../../utils/authMiddleware';
import { AuthError } from '../../utils/authMiddleware';
import { errorHandler } from '../../utils/errorMiddleware';

// Mock the config
jest.mock('../../config', () => {
  const config = {
    apiKey: 'test-api-key',
    allowedOrigins: ['http://localhost:3000', 'https://example.com'],
    port: 3000,
    databasePath: ':memory:',
  };
  return { __esModule: true, default: config };
});

describe('Walkthrough Routes', () => {
  let app: express.Application;
  let db: DatabaseSchema;
  let errorDb: DatabaseSchema | null = null;

  const validHeaders = {
    'x-api-key': 'test-api-key',
    origin: 'http://localhost:3000',
  };

  beforeAll(async () => {
    try {
      db = new DatabaseSchema(':memory:');
      await db.initializeSchema();
      logger.info('Test database initialized');
    } catch (error) {
      logger.error('Failed to initialize test database:', error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      if (errorDb) {
        await errorDb.close();
      }
      await db.close();
      logger.info('Test database closed');
    } catch (error) {
      logger.error('Failed to close test database:', error);
      throw error;
    }
  });

  beforeEach(async () => {
    try {
      // Create a fresh Express app for each test
      app = express();
      app.use(express.json());

      // Reset database to a clean state
      await db.reset();
      logger.info('Database reset for new test');

      // Set up the database and routes
      app.set('db', db);

      // Apply domain validation first
      app.use((req, res, next) => {
        if (req.path === '/health') {
          return next();
        }
        validateDomain(req, res, next);
      });

      // Then apply API key validation
      app.use((req, res, next) => {
        if (req.path === '/health') {
          return next();
        }
        validateApiKey(req, res, next);
      });

      app.use('/api/walkthroughs', walkthroughRoutes);

      // Add error middleware
      app.use(errorHandler);
    } catch (error) {
      logger.error('Failed to set up test:', error);
      throw error;
    }
  });

  afterEach(async () => {
    try {
      if (errorDb) {
        await errorDb.close();
        errorDb = null;
      }
    } catch (error) {
      logger.error('Failed to clean up error database:', error);
    }
  });

  describe('Authentication', () => {
    it('should return 401 when no API key is provided', async () => {
      const response = await request(app)
        .get('/api/walkthroughs')
        .set('origin', validHeaders.origin);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('API key is required');
    });

    it('should return 401 when no origin is provided', async () => {
      const response = await request(app)
        .get('/api/walkthroughs')
        .set('x-api-key', validHeaders['x-api-key']);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Origin header is required');
    });

    it('should return 403 when invalid API key is provided', async () => {
      const response = await request(app)
        .get('/api/walkthroughs')
        .set('x-api-key', 'invalid-key')
        .set('origin', validHeaders.origin);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Invalid API key');
    });

    it('should return 403 when invalid origin is provided', async () => {
      const response = await request(app)
        .get('/api/walkthroughs')
        .set('x-api-key', validHeaders['x-api-key'])
        .set('origin', 'http://invalid-domain.com');

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Domain not allowed');
    });
  });

  describe('POST /api/walkthroughs', () => {
    it('should create a new walkthrough', async () => {
      const walkthroughData = {
        name: 'Test Walkthrough',
        description: 'A test walkthrough',
        steps: [
          {
            id: 'step1',
            title: 'Step 1',
            content: 'This is step 1',
            target: '#element1',
            order: 1,
          },
        ],
      };

      const response = await request(app)
        .post('/api/walkthroughs')
        .set(validHeaders)
        .send(walkthroughData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(walkthroughData.name);
      expect(response.body.description).toBe(walkthroughData.description);
      expect(response.body.steps).toHaveLength(1);
      expect(response.body.isActive).toBe(true);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app).post('/api/walkthroughs').set(validHeaders).send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required fields');
    });

    it('should return 400 for invalid steps', async () => {
      const invalidWalkthroughData = {
        name: 'Test Walkthrough',
        description: 'A test walkthrough',
        steps: [
          {
            title: 'Step 1',
            // Missing content and target
            order: 1,
          },
        ],
      };

      const response = await request(app)
        .post('/api/walkthroughs')
        .set(validHeaders)
        .send(invalidWalkthroughData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        'Invalid steps: each step must have title, content, target, and order'
      );
    });

    it('should handle database errors gracefully', async () => {
      // Create a new database instance and simulate a database error
      errorDb = new DatabaseSchema(':memory:');
      await errorDb.initializeSchema();

      // Store the original database
      const originalDb = app.get('db');

      // Replace the app's database with the error-prone one
      app.set('db', errorDb);

      // Mock the database methods to throw errors
      const originalGetDatabase = errorDb.getDatabase;
      errorDb.getDatabase = () => {
        throw new Error('Simulated database error');
      };

      const walkthroughData = {
        name: 'Test Walkthrough',
        description: 'A test walkthrough',
        steps: [
          {
            id: 'step1',
            title: 'Step 1',
            content: 'Step 1 content',
            target: '#element1',
            order: 1,
          },
        ],
      };

      try {
        const response = await request(app)
          .post('/api/walkthroughs')
          .set(validHeaders)
          .send(walkthroughData);

        expect(response.status).toBe(500);
        expect(response.body.status).toBe('error');
        expect(response.body.error).toBe('Database error occurred');
      } finally {
        // Restore the original database and cleanup
        app.set('db', originalDb);
        errorDb.getDatabase = originalGetDatabase;
        await errorDb.close();
        errorDb = null;
      }
    });
  });

  describe('GET /api/walkthroughs', () => {
    it('should return an empty array when no walkthroughs exist', async () => {
      const response = await request(app).get('/api/walkthroughs').set(validHeaders);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return all walkthroughs', async () => {
      // Create a walkthrough first
      const walkthroughData = {
        name: 'Test Walkthrough',
        description: 'A test walkthrough',
        steps: [
          {
            title: 'Step 1',
            content: 'This is step 1',
            target: '#element1',
            order: 1,
          },
        ],
      };

      await request(app).post('/api/walkthroughs').set(validHeaders).send(walkthroughData);

      const response = await request(app).get('/api/walkthroughs').set(validHeaders);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
    });
  });

  describe('GET /api/walkthroughs/:id', () => {
    it('should return 404 for non-existent walkthrough', async () => {
      const response = await request(app)
        .get('/api/walkthroughs/non-existent-id')
        .set(validHeaders);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Walkthrough not found');
    });

    it('should return walkthrough by id', async () => {
      // First create a walkthrough
      const walkthroughData = {
        name: 'Test Walkthrough',
        description: 'A test walkthrough',
        steps: [
          {
            id: 'step1',
            title: 'Step 1',
            content: 'This is step 1',
            target: '#element1',
            order: 1,
          },
        ],
      };

      const createResponse = await request(app)
        .post('/api/walkthroughs')
        .set(validHeaders)
        .send(walkthroughData);

      const walkthroughId = createResponse.body.id;

      // Then get it by id
      const response = await request(app)
        .get(`/api/walkthroughs/${walkthroughId}`)
        .set(validHeaders);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(walkthroughId);
      expect(response.body.name).toBe(walkthroughData.name);
      expect(response.body.description).toBe(walkthroughData.description);
      expect(response.body.steps).toHaveLength(1);
    });
  });

  describe('PUT /api/walkthroughs/:id', () => {
    it('should return 404 for non-existent walkthrough', async () => {
      const response = await request(app)
        .put('/api/walkthroughs/non-existent-id')
        .set(validHeaders)
        .send({
          name: 'Updated Walkthrough',
          description: 'Updated description',
          steps: [
            {
              title: 'Updated Step',
              content: 'Updated content',
              target: '#updated',
              order: 1,
            },
          ],
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Walkthrough not found');
    });

    it('should update an existing walkthrough', async () => {
      // Create a walkthrough first
      const walkthroughData = {
        name: 'Test Walkthrough',
        description: 'A test walkthrough',
        steps: [
          {
            title: 'Step 1',
            content: 'This is step 1',
            target: '#element1',
            order: 1,
          },
        ],
      };

      const createResponse = await request(app)
        .post('/api/walkthroughs')
        .set(validHeaders)
        .send(walkthroughData);

      const walkthroughId = createResponse.body.id;

      const updatedData = {
        name: 'Updated Walkthrough',
        description: 'Updated description',
        steps: [
          {
            title: 'Updated Step',
            content: 'Updated content',
            target: '#updated',
            order: 1,
          },
        ],
      };

      const response = await request(app)
        .put(`/api/walkthroughs/${walkthroughId}`)
        .set(validHeaders)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(walkthroughId);
      expect(response.body.name).toBe(updatedData.name);
      expect(response.body.description).toBe(updatedData.description);
      expect(response.body.steps).toHaveLength(1);
      expect(response.body.steps[0].title).toBe(updatedData.steps[0].title);
    });

    it('should return 400 for invalid update data', async () => {
      // Create a walkthrough first
      const walkthroughData = {
        name: 'Test Walkthrough',
        description: 'A test walkthrough',
        steps: [
          {
            title: 'Step 1',
            content: 'This is step 1',
            target: '#element1',
            order: 1,
          },
        ],
      };

      const createResponse = await request(app)
        .post('/api/walkthroughs')
        .set(validHeaders)
        .send(walkthroughData);

      const walkthroughId = createResponse.body.id;

      const response = await request(app)
        .put(`/api/walkthroughs/${walkthroughId}`)
        .set(validHeaders)
        .send({
          name: 'Updated Walkthrough',
          description: 'Updated description',
          steps: [
            {
              // Missing required fields
              order: 1,
            },
          ],
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe(
        'Invalid steps: each step must have title, content, target, and order'
      );
    });
  });

  describe('DELETE /api/walkthroughs/:id', () => {
    it('should return 404 for non-existent walkthrough', async () => {
      const response = await request(app)
        .delete('/api/walkthroughs/non-existent-id')
        .set(validHeaders);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Walkthrough not found');
    });

    it('should delete an existing walkthrough', async () => {
      // Create a walkthrough first
      const walkthroughData = {
        name: 'Test Walkthrough',
        description: 'A test walkthrough',
        steps: [
          {
            title: 'Step 1',
            content: 'This is step 1',
            target: '#element1',
            order: 1,
          },
        ],
      };

      const createResponse = await request(app)
        .post('/api/walkthroughs')
        .set(validHeaders)
        .send(walkthroughData);

      const walkthroughId = createResponse.body.id;

      const deleteResponse = await request(app)
        .delete(`/api/walkthroughs/${walkthroughId}`)
        .set(validHeaders);

      expect(deleteResponse.status).toBe(204);

      // Verify the walkthrough is deleted
      const getResponse = await request(app)
        .get(`/api/walkthroughs/${walkthroughId}`)
        .set(validHeaders);

      expect(getResponse.status).toBe(404);
    });
  });
});
