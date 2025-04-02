import sqlite3 from 'sqlite3';
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
  private db: sqlite3.Database;

  constructor(db: sqlite3.Database) {
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

  public create(progress: Omit<UserProgress, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserProgress> {
    return new Promise((resolve, reject) => {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();

      this.db.run(
        `INSERT INTO user_progress (
          id, user_id, walkthrough_id, current_step, completed, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          progress.userId,
          progress.walkthroughId,
          progress.currentStep,
          progress.completed ? 1 : 0,
          now,
          now
        ],
        (err) => {
          if (err) {
            reject(err);
            return;
          }
          this.findById(id)
            .then(progress => {
              if (!progress) {
                reject(new Error('Failed to create user progress'));
                return;
              }
              resolve(progress);
            })
            .catch(reject);
        }
      );
    });
  }

  public findById(id: string): Promise<UserProgress | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM user_progress WHERE id = ?',
        [id],
        (err, row: UserProgressRow | undefined) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(row ? this.mapRowToUserProgress(row) : null);
        }
      );
    });
  }

  public findByUserAndWalkthrough(userId: string, walkthroughId: string): Promise<UserProgress | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM user_progress WHERE user_id = ? AND walkthrough_id = ?',
        [userId, walkthroughId],
        (err, row: UserProgressRow | undefined) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(row ? this.mapRowToUserProgress(row) : null);
        }
      );
    });
  }

  public findAllByUser(userId: string): Promise<UserProgress[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM user_progress WHERE user_id = ? ORDER BY created_at DESC',
        [userId],
        (err, rows: UserProgressRow[]) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(rows.map(row => this.mapRowToUserProgress(row)));
        }
      );
    });
  }

  public findAllByWalkthrough(walkthroughId: string): Promise<UserProgress[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM user_progress WHERE walkthrough_id = ? ORDER BY created_at DESC',
        [walkthroughId],
        (err, rows: UserProgressRow[]) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(rows.map(row => this.mapRowToUserProgress(row)));
        }
      );
    });
  }

  public update(id: string, progress: Partial<UserProgress>): Promise<UserProgress | null> {
    return new Promise((resolve, reject) => {
      this.findById(id)
        .then(existing => {
          if (!existing) {
            resolve(null);
            return;
          }

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

          this.db.run(
            `UPDATE user_progress 
             SET ${updates.join(', ')}
             WHERE id = ?`,
            values,
            (err) => {
              if (err) {
                reject(err);
                return;
              }
              this.findById(id)
                .then(resolve)
                .catch(reject);
            }
          );
        })
        .catch(reject);
    });
  }

  public delete(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM user_progress WHERE id = ?',
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

  public deleteAllByWalkthrough(walkthroughId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM user_progress WHERE walkthrough_id = ?',
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
} 