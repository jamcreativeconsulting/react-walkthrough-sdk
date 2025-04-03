import request from 'supertest';
import express from 'express';
import { DatabaseSchema } from '../../db/schema';
import walkthroughRoutes from '../../routes/walkthroughs';
import { logger } from '../../utils/logger';

describe('Walkthrough Routes', () => {
  let app: express.Application;
  let db: DatabaseSchema;
  let errorDb: DatabaseSchema | null = null;

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
      app.use('/api/walkthroughs', walkthroughRoutes);
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
            order: 1
          }
        ]
      };

      const response = await request(app)
        .post('/api/walkthroughs')
        .send(walkthroughData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(walkthroughData.name);
      expect(response.body.description).toBe(walkthroughData.description);
      expect(response.body.steps).toHaveLength(1);
      expect(response.body.isActive).toBe(true);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/walkthroughs')
        .send({});

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
            order: 1
          }
        ]
      };

      const response = await request(app)
        .post('/api/walkthroughs')
        .send(invalidWalkthroughData);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid steps');
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
            order: 1
          }
        ]
      };

      const response = await request(app)
        .post('/api/walkthroughs')
        .send(walkthroughData);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Simulated database error');

      // Restore the original database
      app.set('db', originalDb);
      errorDb.getDatabase = originalGetDatabase;
    });
  });

  describe('GET /api/walkthroughs', () => {
    it('should return an empty array when no walkthroughs exist', async () => {
      const response = await request(app)
        .get('/api/walkthroughs');

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
            order: 1
          }
        ]
      };

      await request(app)
        .post('/api/walkthroughs')
        .send(walkthroughData);

      const response = await request(app)
        .get('/api/walkthroughs');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe(walkthroughData.name);
      expect(response.body[0].description).toBe(walkthroughData.description);
      expect(response.body[0].steps).toHaveLength(1);
    });
  });

  describe('GET /api/walkthroughs/:id', () => {
    it('should return 404 for non-existent walkthrough', async () => {
      const response = await request(app)
        .get('/api/walkthroughs/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Walkthrough not found');
    });

    it('should return the walkthrough by id', async () => {
      // Create a walkthrough first
      const walkthroughData = {
        name: 'Test Walkthrough',
        description: 'A test walkthrough',
        steps: [
          {
            title: 'Step 1',
            content: 'This is step 1',
            target: '#element1',
            order: 1
          }
        ]
      };

      const createResponse = await request(app)
        .post('/api/walkthroughs')
        .send(walkthroughData);

      const walkthroughId = createResponse.body.id;

      const response = await request(app)
        .get(`/api/walkthroughs/${walkthroughId}`);

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
        .send({
          name: 'Updated Walkthrough',
          description: 'Updated description',
          steps: [
            {
              title: 'Step 1',
              content: 'This is step 1',
              target: '#element1',
              order: 1
            }
          ]
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
            order: 1
          }
        ]
      };

      const createResponse = await request(app)
        .post('/api/walkthroughs')
        .send(walkthroughData);

      const walkthroughId = createResponse.body.id;

      const updatedData = {
        name: 'Updated Walkthrough',
        description: 'Updated description',
        steps: [
          {
            title: 'Updated Step 1',
            content: 'This is updated step 1',
            target: '#element1',
            order: 1
          }
        ],
        isActive: false
      };

      const response = await request(app)
        .put(`/api/walkthroughs/${walkthroughId}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(walkthroughId);
      expect(response.body.name).toBe(updatedData.name);
      expect(response.body.description).toBe(updatedData.description);
      expect(response.body.steps).toHaveLength(1);
      expect(response.body.steps[0].title).toBe(updatedData.steps[0].title);
      expect(response.body.isActive).toBe(false);
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
            order: 1
          }
        ]
      };

      const createResponse = await request(app)
        .post('/api/walkthroughs')
        .send(walkthroughData);

      const walkthroughId = createResponse.body.id;

      const response = await request(app)
        .put(`/api/walkthroughs/${walkthroughId}`)
        .send({
          name: 'Updated Walkthrough',
          description: 'Updated description',
          steps: [
            {
              title: 'Step 1',
              // Missing content and target
              order: 1
            }
          ]
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid steps');
    });
  });

  describe('DELETE /api/walkthroughs/:id', () => {
    it('should return 404 for non-existent walkthrough', async () => {
      const response = await request(app)
        .delete('/api/walkthroughs/non-existent-id');

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
            order: 1
          }
        ]
      };

      const createResponse = await request(app)
        .post('/api/walkthroughs')
        .send(walkthroughData);

      const walkthroughId = createResponse.body.id;

      const deleteResponse = await request(app)
        .delete(`/api/walkthroughs/${walkthroughId}`);

      expect(deleteResponse.status).toBe(204);

      // Verify the walkthrough is deleted
      const getResponse = await request(app)
        .get(`/api/walkthroughs/${walkthroughId}`);

      expect(getResponse.status).toBe(404);
    });
  });
}); 