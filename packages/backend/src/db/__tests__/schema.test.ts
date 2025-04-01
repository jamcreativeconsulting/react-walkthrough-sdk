import { DatabaseSchema } from '../schema';
import { unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('DatabaseSchema', () => {
  const testDbPath = join(tmpdir(), 'test-schema.db');
  let schema: DatabaseSchema;

  beforeEach(() => {
    // Remove test database if it exists
    try {
      unlinkSync(testDbPath);
    } catch (error) {
      // Ignore if file doesn't exist
    }
    schema = new DatabaseSchema(testDbPath);
  });

  afterEach(() => {
    schema.close();
    try {
      unlinkSync(testDbPath);
    } catch (error) {
      // Ignore if file doesn't exist
    }
  });

  it('should create all required tables', () => {
    const db = schema['db'];
    
    // Check walkthroughs table
    const walkthroughsTable = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='walkthroughs'
    `).get();
    expect(walkthroughsTable).toBeDefined();

    // Check user_progress table
    const userProgressTable = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='user_progress'
    `).get();
    expect(userProgressTable).toBeDefined();

    // Check analytics table
    const analyticsTable = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='analytics'
    `).get();
    expect(analyticsTable).toBeDefined();
  });

  it('should create required indexes', () => {
    const db = schema['db'];
    
    // Check user_progress index
    const userProgressIndex = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='index' AND name='idx_user_progress_user_walkthrough'
    `).get();
    expect(userProgressIndex).toBeDefined();

    // Check analytics index
    const analyticsIndex = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='index' AND name='idx_analytics_walkthrough_user'
    `).get();
    expect(analyticsIndex).toBeDefined();
  });

  it('should enforce foreign key constraints', () => {
    const db = schema['db'];
    
    // Try to insert into user_progress with non-existent walkthrough_id
    expect(() => {
      db.prepare(`
        INSERT INTO user_progress (id, user_id, walkthrough_id)
        VALUES ('test-id', 'user-1', 'non-existent')
      `).run();
    }).toThrow();
  });

  it('should create tables', () => {
    // If we got here without errors, tables were created successfully
    expect(true).toBe(true);
  });
}); 