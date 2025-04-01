import mongoose from 'mongoose';
import { WalkthroughFlow } from '../WalkthroughFlow';
import { UserProgress } from '../UserProgress';
import { User } from '../User';

describe('Database Models', () => {
  beforeAll(async () => {
    try {
      // Connect to test database with timeout
      await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/walkthrough-test', {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log('Connected to test database');
    } catch (error) {
      console.error('Failed to connect to test database:', error);
      throw error;
    }
  }, 30000); // Increase timeout to 30 seconds

  afterAll(async () => {
    try {
      await mongoose.connection.close();
      console.log('Closed database connection');
    } catch (error) {
      console.error('Error closing database connection:', error);
    }
  }, 30000);

  beforeEach(async () => {
    // Clear all collections before each test
    await Promise.all([
      WalkthroughFlow.deleteMany({}),
      UserProgress.deleteMany({}),
      User.deleteMany({}),
    ]);
  }, 10000);

  describe('WalkthroughFlow Model', () => {
    it('should create a valid walkthrough flow', async () => {
      const flow = new WalkthroughFlow({
        name: 'Test Flow',
        description: 'Test Description',
        steps: [
          {
            id: 'step-1',
            title: 'Step 1',
            content: 'Content 1',
            target: '#target1',
          },
        ],
      });

      const savedFlow = await flow.save();
      expect(savedFlow._id).toBeDefined();
      expect(savedFlow.name).toBe('Test Flow');
      expect(savedFlow.steps).toHaveLength(1);
    }, 10000);

    it('should validate required fields', async () => {
      const flow = new WalkthroughFlow({});
      await expect(flow.save()).rejects.toThrow();
    }, 10000);
  });

  describe('UserProgress Model', () => {
    it('should create valid user progress', async () => {
      const progress = new UserProgress({
        userId: 'user123',
        flowId: 'flow123',
        currentStep: 0,
        completed: false,
      });

      const savedProgress = await progress.save();
      expect(savedProgress._id).toBeDefined();
      expect(savedProgress.userId).toBe('user123');
      expect(savedProgress.currentStep).toBe(0);
    }, 10000);

    it('should enforce unique user-walkthrough combination', async () => {
      const progress = new UserProgress({
        userId: 'user123',
        flowId: 'flow123',
        currentStep: 0,
        completed: false,
      });

      await progress.save();
      const duplicateProgress = new UserProgress({
        userId: 'user123',
        flowId: 'flow123',
        currentStep: 1,
        completed: false,
      });

      await expect(duplicateProgress.save()).rejects.toThrow();
    }, 10000);
  });

  describe('User Model', () => {
    it('should create a valid user', async () => {
      const user = new User({
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      });

      const savedUser = await user.save();
      expect(savedUser._id).toBeDefined();
      expect(savedUser.email).toBe('test@example.com');
      expect(savedUser.name).toBe('Test User');
    }, 10000);

    it('should enforce unique email', async () => {
      const user = new User({
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
      });

      await user.save();
      const duplicateUser = new User({
        email: 'test@example.com',
        name: 'Another User',
        role: 'user',
      });

      await expect(duplicateUser.save()).rejects.toThrow();
    }, 10000);
  });
}); 