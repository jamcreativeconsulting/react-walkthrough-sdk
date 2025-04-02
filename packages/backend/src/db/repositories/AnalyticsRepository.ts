import sqlite3 from 'sqlite3';
import { Analytics } from '../../types';

interface AnalyticsRow {
  id: string;
  walkthrough_id: string;
  user_id: string;
  step_id: string;
  action: string;
  timestamp: string;
  metadata: string | null;
}

export class AnalyticsRepository {
  private db: sqlite3.Database;

  constructor(db: sqlite3.Database) {
    this.db = db;
  }

  private mapRowToAnalytics(row: AnalyticsRow): Analytics {
    return {
      id: row.id,
      walkthroughId: row.walkthrough_id,
      userId: row.user_id,
      stepId: row.step_id,
      action: row.action as 'view' | 'complete' | 'skip',
      timestamp: new Date(row.timestamp),
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined
    };
  }

  public create(analytics: Omit<Analytics, 'id'>): Promise<Analytics> {
    return new Promise((resolve, reject) => {
      const id = crypto.randomUUID();

      this.db.run(
        `INSERT INTO analytics (
          id, walkthrough_id, user_id, step_id, action, timestamp, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          analytics.walkthroughId,
          analytics.userId,
          analytics.stepId,
          analytics.action,
          analytics.timestamp.toISOString(),
          analytics.metadata ? JSON.stringify(analytics.metadata) : null
        ],
        (err) => {
          if (err) {
            reject(err);
            return;
          }
          this.findById(id)
            .then((result) => {
              if (!result) {
                reject(new Error('Failed to create analytics entry'));
                return;
              }
              resolve(result);
            })
            .catch(reject);
        }
      );
    });
  }

  public findById(id: string): Promise<Analytics | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM analytics WHERE id = ?',
        [id],
        (err, row: AnalyticsRow | undefined) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(row ? this.mapRowToAnalytics(row) : null);
        }
      );
    });
  }

  public findByWalkthrough(walkthroughId: string): Promise<Analytics[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM analytics WHERE walkthrough_id = ? ORDER BY timestamp DESC',
        [walkthroughId],
        (err, rows: AnalyticsRow[]) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(rows.map(row => this.mapRowToAnalytics(row)));
        }
      );
    });
  }

  public findByUser(userId: string): Promise<Analytics[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM analytics WHERE user_id = ? ORDER BY timestamp DESC',
        [userId],
        (err, rows: AnalyticsRow[]) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(rows.map(row => this.mapRowToAnalytics(row)));
        }
      );
    });
  }

  public findByUserAndWalkthrough(userId: string, walkthroughId: string): Promise<Analytics[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM analytics WHERE user_id = ? AND walkthrough_id = ? ORDER BY timestamp DESC',
        [userId, walkthroughId],
        (err, rows: AnalyticsRow[]) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(rows.map(row => this.mapRowToAnalytics(row)));
        }
      );
    });
  }

  public findByDateRange(startDate: Date, endDate: Date): Promise<Analytics[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM analytics WHERE timestamp BETWEEN ? AND ? ORDER BY timestamp DESC',
        [startDate.toISOString(), endDate.toISOString()],
        (err, rows: AnalyticsRow[]) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(rows.map(row => this.mapRowToAnalytics(row)));
        }
      );
    });
  }

  public deleteByWalkthrough(walkthroughId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM analytics WHERE walkthrough_id = ?',
        [walkthroughId],
        function(err) {
          if (err) {
            reject(err);
            return;
          }
          resolve(this.changes > 0);
        }
      );
    });
  }

  public deleteByUser(userId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM analytics WHERE user_id = ?',
        [userId],
        function(err) {
          if (err) {
            reject(err);
            return;
          }
          resolve(this.changes > 0);
        }
      );
    });
  }

  public delete(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM analytics WHERE id = ?',
        [id],
        function(err) {
          if (err) {
            reject(err);
            return;
          }
          resolve(this.changes > 0);
        }
      );
    });
  }
} 