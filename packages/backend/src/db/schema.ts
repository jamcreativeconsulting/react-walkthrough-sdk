import sqlite3 from 'sqlite3';
import { Database, Statement } from 'sqlite';
import { open } from 'sqlite';
import { logger } from '../utils/logger';

export class DatabaseSchema {
  private db: Database | null = null;
  private statements: Statement[] = [];
  private isInitialized = false;

  constructor(private dbPath: string = process.env.DB_PATH || './database.sqlite') {}

  async initializeSchema(): Promise<void> {
    try {
      logger.info('Initializing database schema...');
      
      // Open database connection
      this.db = await open({
        filename: this.dbPath,
        driver: sqlite3.Database
      });

      // Enable foreign keys
      await this.runQuery('PRAGMA foreign_keys = ON');

      // Drop existing tables to ensure clean state
      await this.runQuery('DROP TABLE IF EXISTS analytics');
      await this.runQuery('DROP TABLE IF EXISTS user_progress');
      await this.runQuery('DROP TABLE IF EXISTS walkthroughs');

      // Create tables
      await this.runQuery(`
        CREATE TABLE IF NOT EXISTS walkthroughs (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          steps TEXT NOT NULL CHECK(json_valid(steps)),
          isActive INTEGER NOT NULL DEFAULT 1 CHECK(isActive IN (0, 1)),
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL
        )
      `);

      await this.runQuery(`
        CREATE TABLE IF NOT EXISTS user_progress (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          walkthroughId TEXT NOT NULL,
          currentStep INTEGER NOT NULL CHECK(currentStep >= 0),
          completed INTEGER NOT NULL CHECK(completed IN (0, 1)),
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL,
          FOREIGN KEY (walkthroughId) REFERENCES walkthroughs(id) ON DELETE CASCADE
        )
      `);

      await this.runQuery(`
        CREATE TABLE IF NOT EXISTS analytics (
          id TEXT PRIMARY KEY,
          walkthroughId TEXT NOT NULL,
          userId TEXT NOT NULL,
          stepId TEXT NOT NULL,
          action TEXT NOT NULL CHECK(action IN ('view', 'complete', 'skip')),
          timestamp TEXT NOT NULL,
          metadata TEXT CHECK(json_valid(metadata)),
          FOREIGN KEY (walkthroughId) REFERENCES walkthroughs(id) ON DELETE CASCADE
        )
      `);

      // Verify tables were created
      const tables = await this.db.all("SELECT name FROM sqlite_master WHERE type='table'");
      logger.info('Database tables:', tables);
      
      if (!tables?.some(t => t.name === 'walkthroughs') || 
          !tables?.some(t => t.name === 'user_progress') || 
          !tables?.some(t => t.name === 'analytics')) {
        throw new Error('Failed to create all required tables');
      }

      this.isInitialized = true;
      logger.info('Database schema initialized successfully');
    } catch (error) {
      logger.error('Error initializing database schema:', error);
      throw error;
    }
  }

  private async runQuery(sql: string, params: any[] = []): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const stmt = await this.db.prepare(sql);
      this.statements.push(stmt);
      await stmt.run(params);
    } catch (error) {
      logger.error('Error executing query:', error);
      throw error;
    }
  }

  async reset(): Promise<void> {
    try {
      logger.info('Resetting database...');
      
      // Finalize all statements
      await this.finalizeStatements();
      
      // Drop existing tables
      await this.runQuery('DROP TABLE IF EXISTS analytics');
      await this.runQuery('DROP TABLE IF EXISTS user_progress');
      await this.runQuery('DROP TABLE IF EXISTS walkthroughs');
      
      // Reset initialization flag
      this.isInitialized = false;
      
      // Reinitialize schema
      await this.initializeSchema();
      
      logger.info('Database reset completed successfully');
    } catch (error) {
      logger.error('Error resetting database:', error);
      throw error;
    }
  }

  private async finalizeStatements(): Promise<void> {
    for (const stmt of this.statements) {
      try {
        await stmt.finalize();
      } catch (error) {
        logger.error('Error finalizing statement:', error);
      }
    }
    this.statements = [];
  }

  async close(): Promise<void> {
    try {
      logger.info('Closing database connection...');
      
      // Finalize all statements
      await this.finalizeStatements();
      
      // Close database connection
      if (this.db) {
        await this.db.close();
        this.db = null;
      }
      
      this.isInitialized = false;
      logger.info('Database connection closed successfully');
    } catch (error) {
      logger.error('Error closing database connection:', error);
      throw error;
    }
  }

  getDatabase(): Database {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }
} 