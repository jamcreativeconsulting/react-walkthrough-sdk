import sqlite3 from 'sqlite3';
import { Walkthrough, UserProgress, Analytics } from '../types';

export class DatabaseSchema {
  private db: sqlite3.Database;

  constructor(dbPath: string) {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        throw new Error(`Failed to open database: ${err.message}`);
      }
    });
    this.initializeSchema();
  }

  public getDb(): sqlite3.Database {
    return this.db;
  }

  private initializeSchema(): void {
    // Enable foreign keys
    this.db.run('PRAGMA foreign_keys = ON');

    // Create walkthroughs table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS walkthroughs (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        steps TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create user_progress table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        walkthrough_id TEXT NOT NULL,
        current_step INTEGER NOT NULL DEFAULT 0,
        completed INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (walkthrough_id) REFERENCES walkthroughs(id) ON DELETE CASCADE
      )
    `);

    // Create analytics table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS analytics (
        id TEXT PRIMARY KEY,
        walkthrough_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        step_id TEXT NOT NULL,
        action TEXT NOT NULL,
        timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        metadata TEXT,
        FOREIGN KEY (walkthrough_id) REFERENCES walkthroughs(id) ON DELETE CASCADE
      )
    `);

    // Create indexes
    this.db.run(`
      CREATE INDEX IF NOT EXISTS idx_user_progress_user_walkthrough 
      ON user_progress(user_id, walkthrough_id)
    `);

    this.db.run(`
      CREATE INDEX IF NOT EXISTS idx_analytics_walkthrough_user 
      ON analytics(walkthrough_id, user_id)
    `);
  }

  public close(): void {
    this.db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      }
    });
  }
} 