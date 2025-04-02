import { DatabaseSchema } from '../../schema';
import { WalkthroughRepository } from '../WalkthroughRepository';
import { Walkthrough } from '../../models';
import { tmpdir } from 'os';
import { join } from 'path';
import { unlinkSync, existsSync } from 'fs';

describe('WalkthroughRepository', () => {
  let schema: DatabaseSchema;
  let repository: WalkthroughRepository;
  const testDbPath = join(tmpdir(), 'test.db');

  beforeEach(() => {
    // Clean up any existing database file
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }
    schema = new DatabaseSchema(testDbPath);
    repository = new WalkthroughRepository(schema.getDb());
  });

  afterEach(() => {
    schema.close();
    // Clean up the database file
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }
  });

  const sampleWalkthrough: Omit<Walkthrough, 'id' | 'createdAt' | 'updatedAt'> = {
    name: 'Test Walkthrough',
    description: 'Test Description',
    steps: [
      {
        targetId: 'step1',
        content: 'First step'
      },
      {
        targetId: 'step2',
        content: 'Second step'
      }
    ],
    isActive: true
  };

  it('should create a walkthrough', () => {
    const created = repository.create(sampleWalkthrough);
    expect(created.id).toBeDefined();
    expect(created.name).toBe(sampleWalkthrough.name);
    expect(created.description).toBe(sampleWalkthrough.description);
    expect(created.steps).toEqual(sampleWalkthrough.steps);
    expect(created.isActive).toBe(sampleWalkthrough.isActive);
    expect(created.createdAt).toBeInstanceOf(Date);
    expect(created.updatedAt).toBeInstanceOf(Date);
  });

  it('should find a walkthrough by id', () => {
    const created = repository.create(sampleWalkthrough);
    const found = repository.findById(created.id);
    expect(found).toEqual(created);
  });

  it('should find all walkthroughs', () => {
    const walkthrough1 = repository.create(sampleWalkthrough);
    const walkthrough2 = repository.create({
      ...sampleWalkthrough,
      name: 'Test Walkthrough 2'
    });

    const all = repository.findAll();
    expect(all).toHaveLength(2);
    expect(all).toContainEqual(walkthrough1);
    expect(all).toContainEqual(walkthrough2);
  });

  it('should update a walkthrough', () => {
    const created = repository.create(sampleWalkthrough);
    const updated = repository.update(created.id, {
      name: 'Updated Name',
      description: 'Updated Description'
    });

    expect(updated).toBeDefined();
    expect(updated!.name).toBe('Updated Name');
    expect(updated!.description).toBe('Updated Description');
    expect(updated!.steps).toEqual(created.steps);
    expect(updated!.isActive).toBe(created.isActive);
    expect(updated!.updatedAt).not.toEqual(created.updatedAt);
  });

  it('should delete a walkthrough', () => {
    const created = repository.create(sampleWalkthrough);
    const deleted = repository.delete(created.id);
    expect(deleted).toBe(true);

    const found = repository.findById(created.id);
    expect(found).toBeNull();
  });
}); 