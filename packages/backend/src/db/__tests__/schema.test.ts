import { DatabaseSchema } from '../schema';
import { open, Database } from 'sqlite';
import sqlite3 from 'sqlite3';

describe('DatabaseSchema', () => {
  let db: DatabaseSchema;
  let sqliteDb: Database;
  const testDbPath = ':memory:';

  beforeAll(async () => {
    db = new DatabaseSchema(testDbPath);
    await db.initializeSchema();
    sqliteDb = db.getDatabase();
  });

  afterAll(async () => {
    await db.close();
  });

  it('should create the correct schema', async () => {
    // Check walkthroughs table
    const tables = await sqliteDb.all("SELECT name FROM sqlite_master WHERE type='table'");
    const walkthroughsTable = tables.find((t: { name: string }) => t.name === 'walkthroughs');
    expect(walkthroughsTable).toBeDefined();

    const walkthroughsColumns = await sqliteDb.all("PRAGMA table_info(walkthroughs)");
    expect(walkthroughsColumns).toHaveLength(7);
    expect(walkthroughsColumns.find((c: { name: string }) => c.name === 'id')).toBeDefined();
    expect(walkthroughsColumns.find((c: { name: string }) => c.name === 'name')).toBeDefined();
    expect(walkthroughsColumns.find((c: { name: string }) => c.name === 'description')).toBeDefined();
    expect(walkthroughsColumns.find((c: { name: string }) => c.name === 'steps')).toBeDefined();
    expect(walkthroughsColumns.find((c: { name: string }) => c.name === 'isActive')).toBeDefined();
    expect(walkthroughsColumns.find((c: { name: string }) => c.name === 'createdAt')).toBeDefined();
    expect(walkthroughsColumns.find((c: { name: string }) => c.name === 'updatedAt')).toBeDefined();

    // Check user_progress table
    const userProgressTable = tables.find((t: { name: string }) => t.name === 'user_progress');
    expect(userProgressTable).toBeDefined();

    const userProgressColumns = await sqliteDb.all("PRAGMA table_info(user_progress)");
    expect(userProgressColumns).toHaveLength(7);
    expect(userProgressColumns.find((c: { name: string }) => c.name === 'id')).toBeDefined();
    expect(userProgressColumns.find((c: { name: string }) => c.name === 'userId')).toBeDefined();
    expect(userProgressColumns.find((c: { name: string }) => c.name === 'walkthroughId')).toBeDefined();
    expect(userProgressColumns.find((c: { name: string }) => c.name === 'currentStep')).toBeDefined();
    expect(userProgressColumns.find((c: { name: string }) => c.name === 'completed')).toBeDefined();
    expect(userProgressColumns.find((c: { name: string }) => c.name === 'createdAt')).toBeDefined();
    expect(userProgressColumns.find((c: { name: string }) => c.name === 'updatedAt')).toBeDefined();

    // Check analytics table
    const analyticsTable = tables.find((t: { name: string }) => t.name === 'analytics');
    expect(analyticsTable).toBeDefined();

    const analyticsColumns = await sqliteDb.all("PRAGMA table_info(analytics)");
    expect(analyticsColumns).toHaveLength(7);
    expect(analyticsColumns.find((c: { name: string }) => c.name === 'id')).toBeDefined();
    expect(analyticsColumns.find((c: { name: string }) => c.name === 'walkthroughId')).toBeDefined();
    expect(analyticsColumns.find((c: { name: string }) => c.name === 'userId')).toBeDefined();
    expect(analyticsColumns.find((c: { name: string }) => c.name === 'stepId')).toBeDefined();
    expect(analyticsColumns.find((c: { name: string }) => c.name === 'action')).toBeDefined();
    expect(analyticsColumns.find((c: { name: string }) => c.name === 'timestamp')).toBeDefined();
    expect(analyticsColumns.find((c: { name: string }) => c.name === 'metadata')).toBeDefined();
  });

  it('should enable foreign key constraints', async () => {
    const database = db.getDatabase();

    // Try to insert a user progress record with non-existent walkthrough ID
    await expect(database.run(`
      INSERT INTO user_progress (
        id, userId, walkthroughId, currentStep, completed, createdAt, updatedAt
      ) VALUES (
        'test', 'user1', 'nonexistent', 0, 0, '2024-01-01', '2024-01-01'
      )
    `)).rejects.toThrow();
  });
}); 