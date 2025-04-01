import Database from 'better-sqlite3';
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
  private db: Database.Database;

  constructor(db: Database.Database) {
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

  public create(analytics: Omit<Analytics, 'id'>): Analytics {
    const id = crypto.randomUUID();

    const stmt = this.db.prepare(`
      INSERT INTO analytics (
        id, walkthrough_id, user_id, step_id, action, timestamp, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      analytics.walkthroughId,
      analytics.userId,
      analytics.stepId,
      analytics.action,
      analytics.timestamp.toISOString(),
      analytics.metadata ? JSON.stringify(analytics.metadata) : null
    );

    return this.findById(id)!;
  }

  public findById(id: string): Analytics | null {
    const stmt = this.db.prepare(`
      SELECT * FROM analytics WHERE id = ?
    `);

    const row = stmt.get(id) as AnalyticsRow | undefined;
    if (!row) return null;

    return this.mapRowToAnalytics(row);
  }

  public findByWalkthrough(walkthroughId: string): Analytics[] {
    const stmt = this.db.prepare(`
      SELECT * FROM analytics 
      WHERE walkthrough_id = ?
      ORDER BY timestamp DESC
    `);

    const rows = stmt.all(walkthroughId) as AnalyticsRow[];
    return rows.map(row => this.mapRowToAnalytics(row));
  }

  public findByUser(userId: string): Analytics[] {
    const stmt = this.db.prepare(`
      SELECT * FROM analytics 
      WHERE user_id = ?
      ORDER BY timestamp DESC
    `);

    const rows = stmt.all(userId) as AnalyticsRow[];
    return rows.map(row => this.mapRowToAnalytics(row));
  }

  public findByUserAndWalkthrough(userId: string, walkthroughId: string): Analytics[] {
    const stmt = this.db.prepare(`
      SELECT * FROM analytics 
      WHERE user_id = ? AND walkthrough_id = ?
      ORDER BY timestamp DESC
    `);

    const rows = stmt.all(userId, walkthroughId) as AnalyticsRow[];
    return rows.map(row => this.mapRowToAnalytics(row));
  }

  public findByDateRange(startDate: Date, endDate: Date): Analytics[] {
    const stmt = this.db.prepare(`
      SELECT * FROM analytics 
      WHERE timestamp BETWEEN ? AND ?
      ORDER BY timestamp DESC
    `);

    const rows = stmt.all(
      startDate.toISOString(),
      endDate.toISOString()
    ) as AnalyticsRow[];
    return rows.map(row => this.mapRowToAnalytics(row));
  }

  public deleteByWalkthrough(walkthroughId: string): boolean {
    const stmt = this.db.prepare(`
      DELETE FROM analytics WHERE walkthrough_id = ?
    `);

    const result = stmt.run(walkthroughId);
    return result.changes > 0;
  }

  public deleteByUser(userId: string): boolean {
    const stmt = this.db.prepare(`
      DELETE FROM analytics WHERE user_id = ?
    `);

    const result = stmt.run(userId);
    return result.changes > 0;
  }

  public delete(id: string): boolean {
    const stmt = this.db.prepare(`
      DELETE FROM analytics WHERE id = ?
    `);

    const result = stmt.run(id);
    return result.changes > 0;
  }
} 