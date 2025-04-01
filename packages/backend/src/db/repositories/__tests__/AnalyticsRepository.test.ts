import { DatabaseSchema } from '../../schema';
import { AnalyticsRepository } from '../AnalyticsRepository';
import { WalkthroughRepository } from '../WalkthroughRepository';
import { unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('AnalyticsRepository', () => {
  const testDbPath = join(tmpdir(), 'test-analytics.db');
  let schema: DatabaseSchema;
  let repository: AnalyticsRepository;
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
    repository = new AnalyticsRepository(schema['db']);
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

  const sampleAnalytics = {
    walkthroughId: 'will-be-replaced',
    userId: 'user-1',
    stepId: 'step-1',
    action: 'view' as const,
    timestamp: new Date(),
    metadata: { browser: 'Chrome', os: 'MacOS' }
  };

  it('should create analytics entry', () => {
    const analytics = repository.create({
      ...sampleAnalytics,
      walkthroughId
    });
    
    expect(analytics.id).toBeDefined();
    expect(analytics.walkthroughId).toBe(walkthroughId);
    expect(analytics.userId).toBe(sampleAnalytics.userId);
    expect(analytics.stepId).toBe(sampleAnalytics.stepId);
    expect(analytics.action).toBe(sampleAnalytics.action);
    expect(analytics.metadata).toEqual(sampleAnalytics.metadata);
  });

  it('should find analytics by id', () => {
    const created = repository.create({
      ...sampleAnalytics,
      walkthroughId
    });
    const found = repository.findById(created.id);
    
    expect(found).toBeDefined();
    expect(found?.id).toBe(created.id);
    expect(found?.userId).toBe(created.userId);
  });

  it('should find analytics by walkthrough', () => {
    const analytics1 = repository.create({
      ...sampleAnalytics,
      walkthroughId,
      userId: 'user-1'
    });

    const analytics2 = repository.create({
      ...sampleAnalytics,
      walkthroughId,
      userId: 'user-2'
    });

    const found = repository.findByWalkthrough(walkthroughId);
    
    expect(found).toHaveLength(2);
    expect(found.map(a => a.id).sort()).toEqual([analytics1.id, analytics2.id].sort());
  });

  it('should find analytics by user', () => {
    const analytics1 = repository.create({
      ...sampleAnalytics,
      walkthroughId,
      action: 'view'
    });

    const analytics2 = repository.create({
      ...sampleAnalytics,
      walkthroughId,
      action: 'complete'
    });

    const found = repository.findByUser(sampleAnalytics.userId);
    
    expect(found).toHaveLength(2);
    expect(found.map(a => a.id).sort()).toEqual([analytics1.id, analytics2.id].sort());
  });

  it('should find analytics by user and walkthrough', () => {
    const analytics1 = repository.create({
      ...sampleAnalytics,
      walkthroughId,
      action: 'view'
    });

    const analytics2 = repository.create({
      ...sampleAnalytics,
      walkthroughId,
      action: 'complete'
    });

    const found = repository.findByUserAndWalkthrough(sampleAnalytics.userId, walkthroughId);
    
    expect(found).toHaveLength(2);
    expect(found.map(a => a.id).sort()).toEqual([analytics1.id, analytics2.id].sort());
  });

  it('should find analytics by date range', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    const analytics = repository.create({
      ...sampleAnalytics,
      walkthroughId,
      timestamp: new Date()
    });

    const found = repository.findByDateRange(pastDate, futureDate);
    
    expect(found).toHaveLength(1);
    expect(found[0].id).toBe(analytics.id);
  });

  it('should delete analytics by walkthrough', () => {
    repository.create({
      ...sampleAnalytics,
      walkthroughId,
      userId: 'user-1'
    });

    repository.create({
      ...sampleAnalytics,
      walkthroughId,
      userId: 'user-2'
    });

    const deleted = repository.deleteByWalkthrough(walkthroughId);
    expect(deleted).toBe(true);
    expect(repository.findByWalkthrough(walkthroughId)).toHaveLength(0);
  });

  it('should delete analytics by user', () => {
    repository.create({
      ...sampleAnalytics,
      walkthroughId,
      action: 'view'
    });

    repository.create({
      ...sampleAnalytics,
      walkthroughId,
      action: 'complete'
    });

    const deleted = repository.deleteByUser(sampleAnalytics.userId);
    expect(deleted).toBe(true);
    expect(repository.findByUser(sampleAnalytics.userId)).toHaveLength(0);
  });

  it('should delete single analytics entry', () => {
    const created = repository.create({
      ...sampleAnalytics,
      walkthroughId
    });

    const deleted = repository.delete(created.id);
    expect(deleted).toBe(true);
    expect(repository.findById(created.id)).toBeNull();
  });

  it('should enforce foreign key constraint', () => {
    expect(() => {
      repository.create({
        ...sampleAnalytics,
        walkthroughId: 'non-existent'
      });
    }).toThrow();
  });
}); 