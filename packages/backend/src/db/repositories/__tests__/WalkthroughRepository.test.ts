import { DatabaseSchema } from '../../schema';
import { WalkthroughRepository } from '../WalkthroughRepository';
import { Walkthrough } from '../../../types';

describe('WalkthroughRepository', () => {
  let db: DatabaseSchema;
  let repository: WalkthroughRepository;

  beforeAll(async () => {
    db = new DatabaseSchema(':memory:');
    await db.initializeSchema();
    repository = new WalkthroughRepository(db.getDatabase());
  });

  afterAll(async () => {
    await db.close();
  });

  beforeEach(async () => {
    await db.reset();
    repository = new WalkthroughRepository(db.getDatabase());
  });

  afterEach(async () => {
    await db.reset();
  });

  it('should create and retrieve a walkthrough', async () => {
    const walkthrough = {
      name: 'Test Walkthrough',
      description: 'A test walkthrough',
      steps: [
        {
          id: 'step1',
          title: 'Step 1',
          content: 'Step 1 content',
          target: 'step1',
          order: 1
        },
        {
          id: 'step2',
          title: 'Step 2',
          content: 'Step 2 content',
          target: 'step2',
          order: 2
        }
      ],
      isActive: true
    };

    const created = await repository.create(walkthrough);
    expect(created.id).toBeDefined();
    expect(created.name).toBe(walkthrough.name);
    expect(created.description).toBe(walkthrough.description);
    expect(created.steps).toEqual(walkthrough.steps);
    expect(created.isActive).toBe(walkthrough.isActive);
    expect(created.createdAt).toBeInstanceOf(Date);
    expect(created.updatedAt).toBeInstanceOf(Date);

    const found = await repository.findById(created.id);
    expect(found).toEqual(created);
  });

  it('should update a walkthrough', async () => {
    const walkthrough = {
      name: 'Test Walkthrough',
      description: 'A test walkthrough',
      steps: [
        {
          id: 'step1',
          title: 'Step 1',
          content: 'Step 1 content',
          target: 'step1',
          order: 1
        }
      ],
      isActive: true
    };

    const created = await repository.create(walkthrough);
    
    // Add a small delay to ensure timestamps are different
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const updatedData = {
      name: 'Updated Name',
      description: 'Updated Description'
    };

    const updated = await repository.update(created.id, updatedData);
    expect(updated).toBeDefined();
    expect(updated?.name).toBe(updatedData.name);
    expect(updated?.description).toBe(updatedData.description);
    expect(updated?.steps).toEqual(walkthrough.steps);
    expect(updated?.updatedAt.getTime()).toBeGreaterThan(created.updatedAt.getTime());
  });

  it('should delete a walkthrough', async () => {
    const walkthrough = {
      name: 'Test Walkthrough',
      description: 'A test walkthrough',
      steps: [
        {
          id: 'step1',
          title: 'Step 1',
          content: 'Step 1 content',
          target: 'step1',
          order: 1
        }
      ],
      isActive: true
    };

    const created = await repository.create(walkthrough);
    const deleted = await repository.delete(created.id);
    expect(deleted).toBe(true);

    const found = await repository.findById(created.id);
    expect(found).toBeNull();
  });
}); 