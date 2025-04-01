import Database from 'better-sqlite3';
import { Walkthrough, WalkthroughStep } from '../../types';

interface WalkthroughRow {
  id: string;
  name: string;
  description: string;
  steps: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export class WalkthroughRepository {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
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

  public create(walkthrough: Omit<Walkthrough, 'id' | 'createdAt' | 'updatedAt'>): Walkthrough {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO walkthroughs (
        id, name, description, steps, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      walkthrough.name,
      walkthrough.description,
      JSON.stringify(walkthrough.steps),
      walkthrough.isActive ? 1 : 0,
      now,
      now
    );

    return this.findById(id)!;
  }

  public findById(id: string): Walkthrough | null {
    const stmt = this.db.prepare(`
      SELECT * FROM walkthroughs WHERE id = ?
    `);

    const row = stmt.get(id) as WalkthroughRow | undefined;
    if (!row) return null;

    return this.mapRowToWalkthrough(row);
  }

  public findAll(): Walkthrough[] {
    const stmt = this.db.prepare(`
      SELECT * FROM walkthroughs ORDER BY created_at DESC
    `);

    const rows = stmt.all() as WalkthroughRow[];
    return rows.map(row => this.mapRowToWalkthrough(row));
  }

  public update(id: string, walkthrough: Partial<Walkthrough>): Walkthrough | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const updates: string[] = [];
    const values: any[] = [];

    if (walkthrough.name !== undefined) {
      updates.push('name = ?');
      values.push(walkthrough.name);
    }

    if (walkthrough.description !== undefined) {
      updates.push('description = ?');
      values.push(walkthrough.description);
    }

    if (walkthrough.steps !== undefined) {
      updates.push('steps = ?');
      values.push(JSON.stringify(walkthrough.steps));
    }

    if (walkthrough.isActive !== undefined) {
      updates.push('is_active = ?');
      values.push(walkthrough.isActive ? 1 : 0);
    }

    updates.push('updated_at = ?');
    values.push(new Date().toISOString());

    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE walkthroughs 
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);

    return this.findById(id);
  }

  public delete(id: string): boolean {
    const stmt = this.db.prepare(`
      DELETE FROM walkthroughs WHERE id = ?
    `);

    const result = stmt.run(id);
    return result.changes > 0;
  }
} 