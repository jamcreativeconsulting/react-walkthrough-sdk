import { Database } from 'sqlite';
import { Analytics } from '../../types';

interface Row {
  id: string;
  walkthroughId: string;
  userId: string;
  stepId: string;
  action: string;
  timestamp: string;
  metadata: string;
}

export class AnalyticsRepository {
  constructor(private db: Database) {}

  async create(analytics: Omit<Analytics, 'id' | 'timestamp'>): Promise<Analytics> {
    const id = Math.random().toString(36).substring(7);
    const now = new Date();

    const row: Row = {
      id,
      walkthroughId: analytics.walkthroughId,
      userId: analytics.userId,
      stepId: analytics.stepId,
      action: analytics.action,
      timestamp: now.toISOString(),
      metadata: JSON.stringify(analytics.metadata || {})
    };

    await this.db.run(
      'INSERT INTO analytics (id, walkthroughId, userId, stepId, action, timestamp, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [row.id, row.walkthroughId, row.userId, row.stepId, row.action, row.timestamp, row.metadata]
    );

    return {
      id: row.id,
      walkthroughId: row.walkthroughId,
      userId: row.userId,
      stepId: row.stepId,
      action: analytics.action,
      timestamp: now,
      metadata: analytics.metadata
    };
  }

  async findById(id: string): Promise<Analytics | null> {
    const row = await this.db.get<Row>(
      'SELECT * FROM analytics WHERE id = ?',
      [id]
    );

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      walkthroughId: row.walkthroughId,
      userId: row.userId,
      stepId: row.stepId,
      action: row.action as Analytics['action'],
      timestamp: new Date(row.timestamp),
      metadata: JSON.parse(row.metadata)
    };
  }

  async findByWalkthrough(walkthroughId: string): Promise<Analytics[]> {
    const rows = await this.db.all<Row[]>(
      'SELECT * FROM analytics WHERE walkthroughId = ? ORDER BY timestamp DESC',
      [walkthroughId]
    );

    return rows.map(row => ({
      id: row.id,
      walkthroughId: row.walkthroughId,
      userId: row.userId,
      stepId: row.stepId,
      action: row.action as Analytics['action'],
      timestamp: new Date(row.timestamp),
      metadata: JSON.parse(row.metadata)
    }));
  }

  async findByUser(userId: string): Promise<Analytics[]> {
    const rows = await this.db.all<Row[]>(
      'SELECT * FROM analytics WHERE userId = ? ORDER BY timestamp DESC',
      [userId]
    );

    return rows.map(row => ({
      id: row.id,
      walkthroughId: row.walkthroughId,
      userId: row.userId,
      stepId: row.stepId,
      action: row.action as Analytics['action'],
      timestamp: new Date(row.timestamp),
      metadata: JSON.parse(row.metadata)
    }));
  }

  async findByUserAndWalkthrough(userId: string, walkthroughId: string): Promise<Analytics[]> {
    const rows = await this.db.all<Row[]>(
      'SELECT * FROM analytics WHERE userId = ? AND walkthroughId = ? ORDER BY timestamp DESC',
      [userId, walkthroughId]
    );

    return rows.map(row => ({
      id: row.id,
      walkthroughId: row.walkthroughId,
      userId: row.userId,
      stepId: row.stepId,
      action: row.action as Analytics['action'],
      timestamp: new Date(row.timestamp),
      metadata: JSON.parse(row.metadata)
    }));
  }

  async findAll(): Promise<Analytics[]> {
    const rows = await this.db.all<Row[]>('SELECT * FROM analytics ORDER BY timestamp DESC');

    return rows.map(row => ({
      id: row.id,
      walkthroughId: row.walkthroughId,
      userId: row.userId,
      stepId: row.stepId,
      action: row.action as Analytics['action'],
      timestamp: new Date(row.timestamp),
      metadata: JSON.parse(row.metadata)
    }));
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.run('DELETE FROM analytics WHERE id = ?', [id]);
    return result.changes !== undefined && result.changes > 0;
  }
} 