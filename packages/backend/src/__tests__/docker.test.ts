import { execAsync } from '../utils/exec';
import { join } from 'path';
import { existsSync, mkdirSync, rmdirSync } from 'fs';

describe('Docker Container', () => {
  let testDir: string;

  beforeAll(async () => {
    testDir = join(__dirname, 'test-docker');
    if (!existsSync(testDir)) {
      mkdirSync(testDir);
    }
  });

  afterAll(async () => {
    try {
      await execAsync(`rm -rf ${testDir}`);
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  });

  const checkDockerAvailable = async () => {
    try {
      await execAsync('docker info');
      return true;
    } catch (error) {
      return false;
    }
  };

  it('should build Docker image successfully', async () => {
    const isDockerAvailable = await checkDockerAvailable();
    if (!isDockerAvailable) {
      console.warn('Docker is not running. Skipping test.');
      return;
    }

    // Clean up any existing containers and volumes
    try {
      await execAsync('docker-compose -f docker-compose.yml down -v');
    } catch (error) {
      // Ignore errors during cleanup
    }

    // Build Docker image
    await execAsync('docker-compose -f docker-compose.yml build');

    // Verify image was built
    const result = await execAsync('docker images');
    expect(result.stdout).toContain('walkthrough-sdk');
  });

  it('should create and manage SQLite volume', async () => {
    const isDockerAvailable = await checkDockerAvailable();
    if (!isDockerAvailable) {
      console.warn('Docker is not running. Skipping test.');
      return;
    }

    // Clean up any existing containers and volumes
    try {
      await execAsync('docker-compose -f docker-compose.yml down -v');
    } catch (error) {
      // Ignore errors during cleanup
    }

    // Start container
    await execAsync('docker-compose -f docker-compose.yml up -d');

    // Verify volume was created
    const result = await execAsync('docker volume ls');
    expect(result.stdout).toContain('walkthrough-sdk_sqlite-data');

    // Stop container
    await execAsync('docker-compose -f docker-compose.yml down');
  });

  it('should persist data across container restarts', async () => {
    const isDockerAvailable = await checkDockerAvailable();
    if (!isDockerAvailable) {
      console.warn('Docker is not running. Skipping test.');
      return;
    }

    // Clean up any existing containers and volumes
    try {
      await execAsync('docker-compose -f docker-compose.yml down -v');
    } catch (error) {
      // Ignore errors during cleanup
    }

    // Start container
    await execAsync('docker-compose -f docker-compose.yml up -d');

    // Create test data
    await execAsync('docker-compose -f docker-compose.yml exec -T app npm run test:seed');

    // Stop container
    await execAsync('docker-compose -f docker-compose.yml down');

    // Start container again
    await execAsync('docker-compose -f docker-compose.yml up -d');

    // Verify data persisted
    const result = await execAsync('docker-compose -f docker-compose.yml exec -T app npm run test:verify');
    expect(result.stdout).toContain('Data verification successful');

    // Clean up
    await execAsync('docker-compose -f docker-compose.yml down -v');
  });
}); 