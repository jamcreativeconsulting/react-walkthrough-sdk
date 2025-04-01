import { DatabaseSchema } from '../../schema';
import { WalkthroughRepository } from '../WalkthroughRepository';
import { unlinkSync } from 'fs';
import { join } from 'path';

describe('WalkthroughRepository', () => {
  const testDbPath = join(__dirname, 'test.db');
  let schema: DatabaseSchema;
  let repository: WalkthroughRepository;

  beforeEach(() => {
    // Remove test database if it exists
    try {
      unlinkSync(testDbPath);
    } catch (error) {
      // Ignore if file doesn't exist
    }
    schema = new DatabaseSchema(testDbPath);
    repository = new WalkthroughRepository(schema['db']);
  });

  afterEach(() => {
    schema.close();
    try {
      unlinkSync(testDbPath);
    } catch (error) {
      // Ignore if file doesn't exist
    }
  });

  const sampleWalkthrough = {
    name: 'Test Walkthrough',
    description: 'Test Description',
    steps: [
      {
        id: 'step-1',
        title: 'Step 1',
        content: 'Content 1',
        target: '#target1',
        order: 1
      }
    ],
    isActive: true
  };

  it('should create a walkthrough', () => {
    const walkthrough = repository.create(sampleWalkthrough);
    
    expect(walkthrough.id).toBeDefined();
    expect(walkthrough.name).toBe(sampleWalkthrough.name);
    expect(walkthrough.description).toBe(sampleWalkthrough.description);
    expect(walkthrough.steps).toEqual(sampleWalkthrough.steps);
    expect(walkthrough.isActive).toBe(true);
    expect(walkthrough.createdAt).toBeDefined();
    expect(walkthrough.updatedAt).toBeDefined();
  });

  it('should find a walkthrough by id', () => {
    const created = repository.create(sampleWalkthrough);
    const found = repository.findById(created.id);
    
    expect(found).toBeDefined();
    expect(found?.id).toBe(created.id);
    expect(found?.name).toBe(created.name);
  });

  it('should return null when finding non-existent walkthrough', () => {
    const found = repository.findById('non-existent-id');
    expect(found).toBeNull();
  });

  it('should find all walkthroughs', () => {
    const walkthrough1 = repository.create(sampleWalkthrough);
    const walkthrough2 = repository.create({
      ...sampleWalkthrough,
      name: 'Test Walkthrough 2'
    });

    const all = repository.findAll();
    
    expect(all).toHaveLength(2);
    expect(all.map(w => w.id).sort()).toEqual([walkthrough1.id, walkthrough2.id].sort());
    expect(all.map(w => w.name).sort()).toEqual(['Test Walkthrough', 'Test Walkthrough 2'].sort());
  });

  it('should update a walkthrough', () => {
    const created = repository.create(sampleWalkthrough);
    const updated = repository.update(created.id, {
      name: 'Updated Name',
      description: 'Updated Description'
    });

    expect(updated).toBeDefined();
    expect(updated?.id).toBe(created.id);
    expect(updated?.name).toBe('Updated Name');
    expect(updated?.description).toBe('Updated Description');
    expect(updated?.steps).toEqual(created.steps);
  });

  it('should return null when updating non-existent walkthrough', () => {
    const updated = repository.update('non-existent-id', {
      name: 'Updated Name'
    });
    expect(updated).toBeNull();
  });

  it('should delete a walkthrough', () => {
    const created = repository.create(sampleWalkthrough);
    const deleted = repository.delete(created.id);
    
    expect(deleted).toBe(true);
    expect(repository.findById(created.id)).toBeNull();
  });

  it('should return false when deleting non-existent walkthrough', () => {
    const deleted = repository.delete('non-existent-id');
    expect(deleted).toBe(false);
  });
}); 