import { DatabaseSchema } from '../../schema';
import { WalkthroughRepository } from '../WalkthroughRepository';
import { UserProgressRepository } from '../UserProgressRepository';
import { Walkthrough, UserProgress } from '../../models';
import { tmpdir } from 'os';
import { join } from 'path';
import { unlinkSync, existsSync } from 'fs';

describe('UserProgressRepository', () => {
  let schema: DatabaseSchema;
  let walkthroughRepository: WalkthroughRepository;
  let userProgressRepository: UserProgressRepository;
  const testDbPath = join(tmpdir(), 'test.db');

  beforeEach(() => {
    // Clean up any existing database file
    if (existsSync(testDbPath)) {
      unlinkSync(testDbPath);
    }
    schema = new DatabaseSchema(testDbPath);
    walkthroughRepository = new WalkthroughRepository(schema.getDb());
    userProgressRepository = new UserProgressRepository(schema.getDb());
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

  const createSampleProgress = async () => {
    const walkthrough = walkthroughRepository.create(sampleWalkthrough);
    const progress = userProgressRepository.create({
      userId: 'test-user',
      walkthroughId: walkthrough.id,
      currentStep: 0,
      completed: false
    });
    return { walkthrough, progress };
  };

  it('should create user progress', async () => {
    const { walkthrough, progress } = await createSampleProgress();

    expect(progress.id).toBeDefined();
    expect(progress.userId).toBe('test-user');
    expect(progress.walkthroughId).toBe(walkthrough.id);
    expect(progress.currentStep).toBe(0);
    expect(progress.completed).toBe(false);
    expect(progress.createdAt).toBeInstanceOf(Date);
    expect(progress.updatedAt).toBeInstanceOf(Date);
  });

  it('should find user progress by id', async () => {
    const { progress } = await createSampleProgress();
    const found = userProgressRepository.findById(progress.id);
    expect(found).toEqual(progress);
  });

  it('should find user progress by user and walkthrough', async () => {
    const { walkthrough, progress } = await createSampleProgress();
    const found = userProgressRepository.findByUserAndWalkthrough('test-user', walkthrough.id);
    expect(found).toEqual(progress);
  });

  it('should find all progress by user', async () => {
    const { walkthrough } = await createSampleProgress();
    const walkthrough2 = walkthroughRepository.create({
      ...sampleWalkthrough,
      name: 'Test Walkthrough 2'
    });

    const progress2 = userProgressRepository.create({
      userId: 'test-user',
      walkthroughId: walkthrough2.id,
      currentStep: 1,
      completed: true
    });

    const allProgress = userProgressRepository.findAllByUser('test-user');
    expect(allProgress).toHaveLength(2);
    expect(allProgress.map(p => p.walkthroughId).sort()).toEqual([walkthrough.id, walkthrough2.id].sort());
  });

  it('should find all progress by walkthrough', async () => {
    const { walkthrough } = await createSampleProgress();
    const progress2 = userProgressRepository.create({
      userId: 'test-user-2',
      walkthroughId: walkthrough.id,
      currentStep: 1,
      completed: true
    });

    const allProgress = userProgressRepository.findAllByWalkthrough(walkthrough.id);
    expect(allProgress).toHaveLength(2);
    expect(allProgress.map(p => p.userId).sort()).toEqual(['test-user', 'test-user-2'].sort());
  });

  it('should update user progress', async () => {
    const { progress } = await createSampleProgress();
    const updated = userProgressRepository.update(progress.id, {
      currentStep: 1,
      completed: true
    });

    expect(updated).toBeDefined();
    expect(updated!.currentStep).toBe(1);
    expect(updated!.completed).toBe(true);
    expect(updated!.updatedAt).not.toEqual(progress.updatedAt);
  });

  it('should delete user progress', async () => {
    const { progress } = await createSampleProgress();
    const deleted = userProgressRepository.delete(progress.id);
    expect(deleted).toBe(true);

    const found = userProgressRepository.findById(progress.id);
    expect(found).toBeNull();
  });

  it('should delete all progress for a walkthrough', async () => {
    const { walkthrough } = await createSampleProgress();
    userProgressRepository.create({
      userId: 'test-user-2',
      walkthroughId: walkthrough.id,
      currentStep: 1,
      completed: true
    });

    const deleted = userProgressRepository.deleteAllByWalkthrough(walkthrough.id);
    expect(deleted).toBe(true);

    const allProgress = userProgressRepository.findAllByWalkthrough(walkthrough.id);
    expect(allProgress).toHaveLength(0);
  });

  it('should enforce foreign key constraint', async () => {
    expect(() => {
      userProgressRepository.create({
        userId: 'test-user',
        walkthroughId: 'non-existent-walkthrough',
        currentStep: 0,
        completed: false
      });
    }).toThrow();
  });
}); 