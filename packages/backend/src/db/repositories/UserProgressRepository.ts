import { Database } from 'sqlite';
import { UserProgress } from '../../types';

interface Row {
  id: string;
  userId: string;
  walkthroughId: string;
  currentStep: number;
  completed: number;
  createdAt: string;
  updatedAt: string;
}

export class UserProgressRepository {
  constructor(private db: Database) {}

  async create(progress: Omit<UserProgress, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserProgress> {
    const id = Math.random().toString(36).substring(7);
    const now = new Date();

    const row: Row = {
      id,
      userId: progress.userId,
      walkthroughId: progress.walkthroughId,
      currentStep: progress.currentStep,
      completed: progress.completed ? 1 : 0,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    await this.db.run(
      'INSERT INTO user_progress (id, userId, walkthroughId, currentStep, completed, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [row.id, row.userId, row.walkthroughId, row.currentStep, row.completed, row.createdAt, row.updatedAt]
    );

    return {
      id: row.id,
      userId: row.userId,
      walkthroughId: row.walkthroughId,
      currentStep: row.currentStep,
      completed: row.completed === 1,
      createdAt: now,
      updatedAt: now
    };
  }

  async findById(id: string): Promise<UserProgress | null> {
    const row = await this.db.get<Row>(
      'SELECT * FROM user_progress WHERE id = ?',
      [id]
    );

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      userId: row.userId,
      walkthroughId: row.walkthroughId,
      currentStep: row.currentStep,
      completed: row.completed === 1,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    };
  }

  async findByUser(userId: string): Promise<UserProgress[]> {
    const rows = await this.db.all<Row[]>(
      'SELECT * FROM user_progress WHERE userId = ? ORDER BY createdAt DESC',
      [userId]
    );

    return rows.map(row => ({
      id: row.id,
      userId: row.userId,
      walkthroughId: row.walkthroughId,
      currentStep: row.currentStep,
      completed: row.completed === 1,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    }));
  }

  async findByWalkthrough(walkthroughId: string): Promise<UserProgress[]> {
    const rows = await this.db.all<Row[]>(
      'SELECT * FROM user_progress WHERE walkthroughId = ? ORDER BY createdAt DESC',
      [walkthroughId]
    );

    return rows.map(row => ({
      id: row.id,
      userId: row.userId,
      walkthroughId: row.walkthroughId,
      currentStep: row.currentStep,
      completed: row.completed === 1,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    }));
  }

  async findByUserAndWalkthrough(userId: string, walkthroughId: string): Promise<UserProgress | null> {
    const row = await this.db.get<Row>(
      'SELECT * FROM user_progress WHERE userId = ? AND walkthroughId = ?',
      [userId, walkthroughId]
    );

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      userId: row.userId,
      walkthroughId: row.walkthroughId,
      currentStep: row.currentStep,
      completed: row.completed === 1,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    };
  }

  async findAll(): Promise<UserProgress[]> {
    const rows = await this.db.all<Row[]>('SELECT * FROM user_progress ORDER BY createdAt DESC');

    return rows.map(row => ({
      id: row.id,
      userId: row.userId,
      walkthroughId: row.walkthroughId,
      currentStep: row.currentStep,
      completed: row.completed === 1,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    }));
  }

  async update(id: string, progress: Partial<Omit<UserProgress, 'id' | 'createdAt' | 'updatedAt'>>): Promise<UserProgress | null> {
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    const now = new Date();
    const updated: UserProgress = {
      ...existing,
      ...progress,
      updatedAt: now
    };

    const row: Row = {
      id: updated.id,
      userId: updated.userId,
      walkthroughId: updated.walkthroughId,
      currentStep: updated.currentStep,
      completed: updated.completed ? 1 : 0,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: now.toISOString()
    };

    await this.db.run(
      'UPDATE user_progress SET userId = ?, walkthroughId = ?, currentStep = ?, completed = ?, updatedAt = ? WHERE id = ?',
      [row.userId, row.walkthroughId, row.currentStep, row.completed, row.updatedAt, row.id]
    );

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.run('DELETE FROM user_progress WHERE id = ?', [id]);
    return result.changes !== undefined && result.changes > 0;
  }

  async deleteAllByWalkthrough(walkthroughId: string): Promise<boolean> {
    const result = await this.db.run('DELETE FROM user_progress WHERE walkthroughId = ?', [walkthroughId]);
    return result.changes !== undefined && result.changes > 0;
  }
} 