import Database from 'better-sqlite3';
import { Walkthrough, UserProgress, Analytics } from '../types';

export class DatabaseSchema {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.initializeSchema();
  }

  private initializeSchema(): void {
    // Enable foreign keys
    this.db.pragma('foreign_keys = ON');

    // Create walkthroughs table
    this.db.exec(`
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
    this.db.exec(`
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
    this.db.exec(`
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
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_user_progress_user_walkthrough 
      ON user_progress(user_id, walkthrough_id);
      
      CREATE INDEX IF NOT EXISTS idx_analytics_walkthrough_user 
      ON analytics(walkthrough_id, user_id);
    `);
  }

  public close(): void {
    this.db.close();
  }
} 