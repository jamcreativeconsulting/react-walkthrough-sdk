import { AnalyticsRepository } from '../AnalyticsRepository';
import { WalkthroughRepository } from '../WalkthroughRepository';
import { DatabaseSchema } from '../../schema';
import { Analytics, Walkthrough, WalkthroughStep } from '../../../types';

describe('AnalyticsRepository', () => {
  let db: DatabaseSchema;
  let analyticsRepository: AnalyticsRepository;
  let walkthroughRepository: WalkthroughRepository;

  beforeEach(async () => {
    db = new DatabaseSchema(':memory:');
    await db.initializeSchema();
    const database = db.getDatabase();
    analyticsRepository = new AnalyticsRepository(database);
    walkthroughRepository = new WalkthroughRepository(database);
  });

  afterEach(async () => {
    await db.close();
  });

  it('should create and find analytics', async () => {
    // Create a walkthrough first
    const steps: WalkthroughStep[] = [{
      id: 'step1',
      title: 'Step 1',
      content: 'Content 1',
      target: '#target1',
      order: 1
    }];

    const walkthrough: Omit<Walkthrough, 'id' | 'createdAt' | 'updatedAt'> = {
      name: 'Test Walkthrough',
      description: 'Test Description',
      steps: steps,
      isActive: true
    };

    const createdWalkthrough = await walkthroughRepository.create(walkthrough);

    // Create analytics
    const analytics: Omit<Analytics, 'id'> = {
      walkthroughId: createdWalkthrough.id,
      userId: 'test-user',
      stepId: 'step1',
      action: 'view',
      timestamp: new Date(),
      metadata: { browser: 'Chrome' }
    };

    const createdAnalytics = await analyticsRepository.create(analytics);

    // Find by ID
    const found = await analyticsRepository.findById(createdAnalytics.id);
    expect(found).toBeDefined();
    expect(found?.id).toBe(createdAnalytics.id);
    expect(found?.walkthroughId).toBe(createdAnalytics.walkthroughId);
    expect(found?.userId).toBe(createdAnalytics.userId);
    expect(found?.stepId).toBe(createdAnalytics.stepId);
    expect(found?.action).toBe(createdAnalytics.action);
  });

  it('should find analytics by walkthrough and user', async () => {
    // Create a walkthrough first
    const steps: WalkthroughStep[] = [{
      id: 'step1',
      title: 'Step 1',
      content: 'Content 1',
      target: '#target1',
      order: 1
    }];

    const walkthrough: Omit<Walkthrough, 'id' | 'createdAt' | 'updatedAt'> = {
      name: 'Test Walkthrough',
      description: 'Test Description',
      steps: steps,
      isActive: true
    };

    const createdWalkthrough = await walkthroughRepository.create(walkthrough);

    // Create multiple analytics entries
    const analytics1: Omit<Analytics, 'id'> = {
      walkthroughId: createdWalkthrough.id,
      userId: 'test-user',
      stepId: 'step1',
      action: 'view',
      timestamp: new Date(),
      metadata: { browser: 'Chrome' }
    };

    const analytics2: Omit<Analytics, 'id'> = {
      walkthroughId: createdWalkthrough.id,
      userId: 'test-user',
      stepId: 'step1',
      action: 'complete',
      timestamp: new Date(),
      metadata: { browser: 'Chrome' }
    };

    const created1 = await analyticsRepository.create(analytics1);
    const created2 = await analyticsRepository.create(analytics2);

    // Find by walkthrough and user
    const found = await analyticsRepository.findByUserAndWalkthrough('test-user', createdWalkthrough.id);
    expect(found).toHaveLength(2);
    expect(found[0].action).toBe('view');
    expect(found[1].action).toBe('complete');
  });

  it('should delete analytics', async () => {
    // Create a walkthrough first
    const steps: WalkthroughStep[] = [{
      id: 'step1',
      title: 'Step 1',
      content: 'Content 1',
      target: '#target1',
      order: 1
    }];

    const walkthrough: Omit<Walkthrough, 'id' | 'createdAt' | 'updatedAt'> = {
      name: 'Test Walkthrough',
      description: 'Test Description',
      steps: steps,
      isActive: true
    };

    const createdWalkthrough = await walkthroughRepository.create(walkthrough);

    // Create analytics
    const analytics: Omit<Analytics, 'id'> = {
      walkthroughId: createdWalkthrough.id,
      userId: 'test-user',
      stepId: 'step1',
      action: 'view',
      timestamp: new Date(),
      metadata: { browser: 'Chrome' }
    };

    const createdAnalytics = await analyticsRepository.create(analytics);

    // Delete analytics
    await analyticsRepository.delete(createdAnalytics.id);

    // Try to find deleted analytics
    const found = await analyticsRepository.findById(createdAnalytics.id);
    expect(found).toBeNull();
  });
}); 