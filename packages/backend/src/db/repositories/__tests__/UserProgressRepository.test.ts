import { DatabaseSchema } from '../../schema';
import { UserProgressRepository } from '../UserProgressRepository';
import { WalkthroughRepository } from '../WalkthroughRepository';
import { UserProgress } from '../../../types';
import { v4 as uuidv4 } from 'uuid';

describe('UserProgressRepository', () => {
  let db: DatabaseSchema;
  let userProgressRepository: UserProgressRepository;
  let walkthroughRepository: WalkthroughRepository;

  beforeAll(async () => {
    db = new DatabaseSchema(':memory:');
    await db.initializeSchema();
    userProgressRepository = new UserProgressRepository(db.getDatabase());
    walkthroughRepository = new WalkthroughRepository(db.getDatabase());
  });

  beforeEach(async () => {
    await db.initializeSchema();
  });

  afterEach(async () => {
    await db.reset();
  });

  afterAll(async () => {
    await db.close();
  });

  it('should create and find user progress', async () => {
    const walkthrough = await walkthroughRepository.create({
      name: 'Test Walkthrough',
      description: 'Test Description',
      steps: [
        {
          id: 'step1',
          target: 'step1',
          title: 'Step 1',
          content: 'Step 1',
          order: 1
        }
      ],
      isActive: true
    });

    const progress: Omit<UserProgress, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: 'test-user',
      walkthroughId: walkthrough.id,
      currentStep: 0,
      completed: false
    };

    const createdProgress = await userProgressRepository.create(progress);
    expect(createdProgress).toMatchObject(progress);

    const foundProgress = await userProgressRepository.findById(createdProgress.id);
    expect(foundProgress).toMatchObject(createdProgress);
  });

  it('should find progress by user and walkthrough', async () => {
    const walkthrough = await walkthroughRepository.create({
      name: 'Test Walkthrough',
      description: 'Test Description',
      steps: [
        {
          id: 'step1',
          target: 'step1',
          title: 'Step 1',
          content: 'Step 1',
          order: 1
        }
      ],
      isActive: true
    });

    const progress: Omit<UserProgress, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: 'test-user',
      walkthroughId: walkthrough.id,
      currentStep: 0,
      completed: false
    };

    const createdProgress = await userProgressRepository.create(progress);
    const foundProgress = await userProgressRepository.findByUserAndWalkthrough(
      progress.userId,
      progress.walkthroughId
    );
    expect(foundProgress).toMatchObject(createdProgress);
  });

  it('should find all progress for a walkthrough', async () => {
    const walkthrough = await walkthroughRepository.create({
      name: 'Test Walkthrough',
      description: 'Test Description',
      steps: [
        {
          id: 'step1',
          target: 'step1',
          title: 'Step 1',
          content: 'Step 1',
          order: 1
        }
      ],
      isActive: true
    });

    const progress1: Omit<UserProgress, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: 'test-user',
      walkthroughId: walkthrough.id,
      currentStep: 0,
      completed: false
    };

    const progress2: Omit<UserProgress, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: 'test-user-2',
      walkthroughId: walkthrough.id,
      currentStep: 0,
      completed: false
    };

    await userProgressRepository.create(progress1);
    await userProgressRepository.create(progress2);

    const allProgress = await userProgressRepository.findByWalkthrough(walkthrough.id);
    expect(allProgress.map(p => p.userId).sort()).toEqual(['test-user', 'test-user-2'].sort());
  });

  it('should update user progress', async () => {
    const walkthrough = await walkthroughRepository.create({
      name: 'Test Walkthrough',
      description: 'Test Description',
      steps: [
        {
          id: 'step1',
          target: 'step1',
          title: 'Step 1',
          content: 'Step 1',
          order: 1
        }
      ],
      isActive: true
    });

    const progress: Omit<UserProgress, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: 'test-user',
      walkthroughId: walkthrough.id,
      currentStep: 0,
      completed: false
    };

    const createdProgress = await userProgressRepository.create(progress);
    const updatedProgress = await userProgressRepository.update(createdProgress.id, {
      currentStep: 1,
      completed: true
    });

    expect(updatedProgress).toMatchObject({
      ...createdProgress,
      currentStep: 1,
      completed: true
    });
  });

  it('should delete user progress', async () => {
    const walkthrough = await walkthroughRepository.create({
      name: 'Test Walkthrough',
      description: 'Test Description',
      steps: [
        {
          id: 'step1',
          target: 'step1',
          title: 'Step 1',
          content: 'Step 1',
          order: 1
        }
      ],
      isActive: true
    });

    const progress: Omit<UserProgress, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: 'test-user',
      walkthroughId: walkthrough.id,
      currentStep: 0,
      completed: false
    };

    const createdProgress = await userProgressRepository.create(progress);
    const deleted = await userProgressRepository.delete(createdProgress.id);
    expect(deleted).toBe(true);

    const foundProgress = await userProgressRepository.findById(createdProgress.id);
    expect(foundProgress).toBeNull();
  });
}); 