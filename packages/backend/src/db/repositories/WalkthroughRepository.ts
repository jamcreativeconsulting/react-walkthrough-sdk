import sqlite3 from 'sqlite3';
import { Walkthrough, WalkthroughStep } from '../models';

type WalkthroughRow = {
  id: string;
  name: string;
  description: string;
  steps: string;
  is_active: number;
  created_at: string;
  updated_at: string;
};

export class WalkthroughRepository {
  private db: sqlite3.Database;

  constructor(db: sqlite3.Database) {
    this.db = db;
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private mapRowToWalkthrough(row: WalkthroughRow): Walkthrough {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      steps: JSON.parse(row.steps) as WalkthroughStep[],
      isActive: Boolean(row.is_active),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  public create(walkthrough: Omit<Walkthrough, 'id' | 'createdAt' | 'updatedAt'>): Promise<Walkthrough> {
    return new Promise((resolve, reject) => {
      const id = this.generateUUID();
      const now = new Date().toISOString();

      this.db.run(
        `INSERT INTO walkthroughs (id, name, description, steps, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          walkthrough.name,
          walkthrough.description,
          JSON.stringify(walkthrough.steps),
          walkthrough.isActive ? 1 : 0,
          now,
          now
        ],
        (err: Error | null) => {
          if (err) {
            reject(err);
            return;
          }
          this.findById(id)
            .then(walkthrough => {
              if (!walkthrough) {
                reject(new Error('Failed to create walkthrough'));
                return;
              }
              resolve(walkthrough);
            })
            .catch(reject);
        }
      );
    });
  }

  public findById(id: string): Promise<Walkthrough | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM walkthroughs WHERE id = ?',
        [id],
        (err: Error | null, row: WalkthroughRow | undefined) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(row ? this.mapRowToWalkthrough(row) : null);
        }
      );
    });
  }

  public findAll(): Promise<Walkthrough[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM walkthroughs ORDER BY created_at DESC',
        (err: Error | null, rows: WalkthroughRow[]) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(rows.map(row => this.mapRowToWalkthrough(row)));
        }
      );
    });
  }

  public update(id: string, walkthrough: Partial<Omit<Walkthrough, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Walkthrough | null> {
    return new Promise((resolve, reject) => {
      this.findById(id)
        .then(existing => {
          if (!existing) {
            resolve(null);
            return;
          }

          const now = new Date().toISOString();
          this.db.run(
            `UPDATE walkthroughs
             SET name = ?,
                 description = ?,
                 steps = ?,
                 is_active = ?,
                 updated_at = ?
             WHERE id = ?`,
            [
              walkthrough.name ?? existing.name,
              walkthrough.description ?? existing.description,
              walkthrough.steps ? JSON.stringify(walkthrough.steps) : JSON.stringify(existing.steps),
              walkthrough.isActive !== undefined ? (walkthrough.isActive ? 1 : 0) : existing.isActive ? 1 : 0,
              now,
              id
            ],
            (err: Error | null) => {
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
        'DELETE FROM walkthroughs WHERE id = ?',
        [id],
        function(this: sqlite3.RunResult, err: Error | null) {
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