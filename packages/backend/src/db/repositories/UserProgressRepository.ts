import Database from 'better-sqlite3';
import { UserProgress } from '../../types';

interface UserProgressRow {
  id: string;
  user_id: string;
  walkthrough_id: string;
  current_step: number;
  completed: number;
  created_at: string;
  updated_at: string;
}

export class UserProgressRepository {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  private mapRowToUserProgress(row: UserProgressRow): UserProgress {
    return {
      id: row.id,
      userId: row.user_id,
      walkthroughId: row.walkthrough_id,
      currentStep: row.current_step,
      completed: Boolean(row.completed),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  public create(progress: Omit<UserProgress, 'id' | 'createdAt' | 'updatedAt'>): UserProgress {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO user_progress (
        id, user_id, walkthrough_id, current_step, completed, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      progress.userId,
      progress.walkthroughId,
      progress.currentStep,
      progress.completed ? 1 : 0,
      now,
      now
    );

    return this.findById(id)!;
  }

  public findById(id: string): UserProgress | null {
    const stmt = this.db.prepare(`
      SELECT * FROM user_progress WHERE id = ?
    `);

    const row = stmt.get(id) as UserProgressRow | undefined;
    if (!row) return null;

    return this.mapRowToUserProgress(row);
  }

  public findByUserAndWalkthrough(userId: string, walkthroughId: string): UserProgress | null {
    const stmt = this.db.prepare(`
      SELECT * FROM user_progress 
      WHERE user_id = ? AND walkthrough_id = ?
    `);

    const row = stmt.get(userId, walkthroughId) as UserProgressRow | undefined;
    if (!row) return null;

    return this.mapRowToUserProgress(row);
  }

  public findAllByUser(userId: string): UserProgress[] {
    const stmt = this.db.prepare(`
      SELECT * FROM user_progress 
      WHERE user_id = ?
      ORDER BY created_at DESC
    `);

    const rows = stmt.all(userId) as UserProgressRow[];
    return rows.map(row => this.mapRowToUserProgress(row));
  }

  public findAllByWalkthrough(walkthroughId: string): UserProgress[] {
    const stmt = this.db.prepare(`
      SELECT * FROM user_progress 
      WHERE walkthrough_id = ?
      ORDER BY created_at DESC
    `);

    const rows = stmt.all(walkthroughId) as UserProgressRow[];
    return rows.map(row => this.mapRowToUserProgress(row));
  }

  public update(id: string, progress: Partial<UserProgress>): UserProgress | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const updates: string[] = [];
    const values: any[] = [];

    if (progress.currentStep !== undefined) {
      updates.push('current_step = ?');
      values.push(progress.currentStep);
    }

    if (progress.completed !== undefined) {
      updates.push('completed = ?');
      values.push(progress.completed ? 1 : 0);
    }

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());

    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE user_progress 
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);

    return this.findById(id);
  }

  public delete(id: string): boolean {
    const stmt = this.db.prepare(`
      DELETE FROM user_progress WHERE id = ?
    `);

    const result = stmt.run(id);
    return result.changes > 0;
  }

  public deleteAllByWalkthrough(walkthroughId: string): boolean {
    const stmt = this.db.prepare(`
      DELETE FROM user_progress WHERE walkthrough_id = ?
    `);

    const result = stmt.run(walkthroughId);
    return result.changes > 0;
  }
} 