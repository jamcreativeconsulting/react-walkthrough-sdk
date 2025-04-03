import { Database } from 'sqlite';
import { Walkthrough } from '../../types';

interface Row {
  id: string;
  name: string;
  description: string;
  steps: string;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

export class WalkthroughRepository {
  constructor(private db: Database) {}

  async create(walkthrough: Omit<Walkthrough, 'id' | 'createdAt' | 'updatedAt'>): Promise<Walkthrough> {
    const id = Math.random().toString(36).substring(7);
    const now = new Date();

    const row: Row = {
      id,
      name: walkthrough.name,
      description: walkthrough.description,
      steps: JSON.stringify(walkthrough.steps),
      isActive: walkthrough.isActive ? 1 : 0,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };

    await this.db.run(
      'INSERT INTO walkthroughs (id, name, description, steps, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [row.id, row.name, row.description, row.steps, row.isActive, row.createdAt, row.updatedAt]
    );

    return {
      id: row.id,
      name: row.name,
      description: row.description,
      steps: walkthrough.steps,
      isActive: walkthrough.isActive,
      createdAt: now,
      updatedAt: now
    };
  }

  async findById(id: string): Promise<Walkthrough | null> {
    const row = await this.db.get<Row>(
      'SELECT * FROM walkthroughs WHERE id = ?',
      [id]
    );

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      name: row.name,
      description: row.description,
      steps: JSON.parse(row.steps),
      isActive: row.isActive === 1,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    };
  }

  async findAll(): Promise<Walkthrough[]> {
    const rows = await this.db.all<Row[]>('SELECT * FROM walkthroughs ORDER BY createdAt DESC');

    return rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      steps: JSON.parse(row.steps),
      isActive: row.isActive === 1,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    }));
  }

  async update(id: string, walkthrough: Partial<Omit<Walkthrough, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Walkthrough | null> {
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    const now = new Date();
    const updated: Walkthrough = {
      ...existing,
      ...walkthrough,
      updatedAt: now
    };

    const row: Row = {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      steps: JSON.stringify(updated.steps),
      isActive: updated.isActive ? 1 : 0,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: now.toISOString()
    };

    await this.db.run(
      'UPDATE walkthroughs SET name = ?, description = ?, steps = ?, isActive = ?, updatedAt = ? WHERE id = ?',
      [row.name, row.description, row.steps, row.isActive, row.updatedAt, row.id]
    );

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.run('DELETE FROM walkthroughs WHERE id = ?', [id]);
    return result.changes !== undefined && result.changes > 0;
  }
}