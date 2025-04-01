import { DatabaseSchema } from '../../schema';
import { UserProgressRepository } from '../UserProgressRepository';
import { WalkthroughRepository } from '../WalkthroughRepository';
import { unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('UserProgressRepository', () => {
  const testDbPath = join(tmpdir(), 'test-progress.db');
  let schema: DatabaseSchema;
  let repository: UserProgressRepository;
  let walkthroughRepository: WalkthroughRepository;
  let walkthroughId: string;

  beforeEach(async () => {
    // Remove test database if it exists
    try {
      unlinkSync(testDbPath);
    } catch (error) {
      // Ignore if file doesn't exist
    }
    schema = new DatabaseSchema(testDbPath);
    repository = new UserProgressRepository(schema['db']);
    walkthroughRepository = new WalkthroughRepository(schema['db']);

    // Create a test walkthrough
    const walkthrough = walkthroughRepository.create({
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
    });
    walkthroughId = walkthrough.id;
  });

  afterEach(() => {
    schema.close();
    try {
      unlinkSync(testDbPath);
    } catch (error) {
      // Ignore if file doesn't exist
    }
  });

  const sampleProgress = {
    userId: 'user-1',
    walkthroughId: 'will-be-replaced',
    currentStep: 0,
    completed: false
  };

  it('should create user progress', () => {
    const progress = repository.create({
      ...sampleProgress,
      walkthroughId
    });
    
    expect(progress.id).toBeDefined();
    expect(progress.userId).toBe(sampleProgress.userId);
    expect(progress.walkthroughId).toBe(walkthroughId);
    expect(progress.currentStep).toBe(sampleProgress.currentStep);
    expect(progress.completed).toBe(sampleProgress.completed);
    expect(progress.createdAt).toBeDefined();
    expect(progress.updatedAt).toBeDefined();
  });

  it('should find user progress by id', () => {
    const created = repository.create({
      ...sampleProgress,
      walkthroughId
    });
    const found = repository.findById(created.id);
    
    expect(found).toBeDefined();
    expect(found?.id).toBe(created.id);
    expect(found?.userId).toBe(created.userId);
  });

  it('should find user progress by user and walkthrough', () => {
    const created = repository.create({
      ...sampleProgress,
      walkthroughId
    });
    const found = repository.findByUserAndWalkthrough(created.userId, created.walkthroughId);
    
    expect(found).toBeDefined();
    expect(found?.id).toBe(created.id);
    expect(found?.userId).toBe(created.userId);
    expect(found?.walkthroughId).toBe(created.walkthroughId);
  });

  it('should find all progress by user', () => {
    const progress1 = repository.create({
      ...sampleProgress,
      walkthroughId
    });

    const walkthrough2 = walkthroughRepository.create({
      name: 'Test Walkthrough 2',
      description: 'Test Description 2',
      steps: [],
      isActive: true
    });

    const progress2 = repository.create({
      ...sampleProgress,
      walkthroughId: walkthrough2.id
    });

    const allByUser = repository.findAllByUser(sampleProgress.userId);
    
    expect(allByUser).toHaveLength(2);
    expect(allByUser.map(p => p.id).sort()).toEqual([progress1.id, progress2.id].sort());
  });

  it('should find all progress by walkthrough', () => {
    const progress1 = repository.create({
      ...sampleProgress,
      walkthroughId,
      userId: 'user-1'
    });

    const progress2 = repository.create({
      ...sampleProgress,
      walkthroughId,
      userId: 'user-2'
    });

    const allByWalkthrough = repository.findAllByWalkthrough(walkthroughId);
    
    expect(allByWalkthrough).toHaveLength(2);
    expect(allByWalkthrough.map(p => p.id).sort()).toEqual([progress1.id, progress2.id].sort());
  });

  it('should update user progress', () => {
    const created = repository.create({
      ...sampleProgress,
      walkthroughId
    });

    const updated = repository.update(created.id, {
      currentStep: 1,
      completed: true
    });

    expect(updated).toBeDefined();
    expect(updated?.id).toBe(created.id);
    expect(updated?.currentStep).toBe(1);
    expect(updated?.completed).toBe(true);
  });

  it('should delete user progress', () => {
    const created = repository.create({
      ...sampleProgress,
      walkthroughId
    });

    const deleted = repository.delete(created.id);
    expect(deleted).toBe(true);
    expect(repository.findById(created.id)).toBeNull();
  });

  it('should delete all progress for a walkthrough', () => {
    repository.create({
      ...sampleProgress,
      walkthroughId,
      userId: 'user-1'
    });

    repository.create({
      ...sampleProgress,
      walkthroughId,
      userId: 'user-2'
    });

    const deleted = repository.deleteAllByWalkthrough(walkthroughId);
    expect(deleted).toBe(true);
    expect(repository.findAllByWalkthrough(walkthroughId)).toHaveLength(0);
  });

  it('should enforce foreign key constraint', () => {
    expect(() => {
      repository.create({
        ...sampleProgress,
        walkthroughId: 'non-existent'
      });
    }).toThrow();
  });
}); 