import { DatabaseSchema } from '../db/schema';
import { logger } from '../utils/logger';

// Load environment variables
require('dotenv').config();

// Set default database path for tests
process.env.DB_PATH = ':memory:';

// Initialize database schema
const db = new DatabaseSchema();

// Increase timeout for tests
jest.setTimeout(30000);

// Initialize database before tests
beforeAll(async () => {
  try {
    await db.initializeSchema();
    
    // Verify tables were created
    const database = db.getDatabase();
    const tables = await database.all("SELECT name FROM sqlite_master WHERE type='table'");
    logger.info('Database tables:', tables);
    
    if (!tables.some((table: { name: string }) => table.name === 'walkthroughs')) {
      throw new Error('Walkthroughs table was not created');
    }
  } catch (error) {
    logger.error('Error initializing database:', error);
    throw error;
  }
});

// Reset database before each test
beforeEach(async () => {
  try {
    await db.reset();
    // Ensure database is initialized after reset
    await db.initializeSchema();
  } catch (error) {
    logger.error('Error resetting database:', error);
    throw error;
  }
});

// Close database after tests
afterAll(async () => {
  try {
    await db.close();
  } catch (error) {
    logger.error('Error closing database:', error);
    throw error;
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

export { db }; 