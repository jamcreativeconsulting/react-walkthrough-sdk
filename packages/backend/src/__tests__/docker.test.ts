import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';
import { join } from 'path';

const execAsync = promisify(exec);

const waitForContainer = async (containerName: string, maxAttempts = 30) => {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const { stdout } = await execAsync(`docker inspect --format='{{.State.Health.Status}}' ${containerName}`);
      if (stdout.trim() === 'healthy') {
        return true;
      }
      console.log(`Attempt ${i + 1}: Container status: ${stdout.trim()}`);
    } catch (error) {
      console.log(`Attempt ${i + 1}: Container not ready yet`);
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  throw new Error('Container failed to become healthy');
};

const getContainerLogs = async (containerName: string) => {
  try {
    const { stdout } = await execAsync(`docker logs ${containerName}`);
    console.log('Container logs:', stdout);
  } catch (error) {
    console.error('Failed to get container logs:', error);
  }
};

describe('Docker Container', () => {
  const testDir = join(__dirname, '../../test-docker');
  const dockerComposeFile = join(__dirname, '../../docker-compose.yml');
  const containerName = 'backend-backend-1';

  beforeAll(async () => {
    // Create test directory
    await execAsync(`mkdir -p ${testDir}`);
    
    // Ensure Docker is running
    try {
      await execAsync('docker info');
    } catch (error) {
      throw new Error('Docker is not running. Please start Docker and try again.');
    }

    // Clean up any existing containers and volumes
    try {
      await execAsync('docker-compose -f docker-compose.yml down -v');
    } catch (error) {
      console.log('No existing containers to clean up');
    }
  });

  afterAll(async () => {
    // Clean up test directory and Docker resources
    try {
      await execAsync('docker-compose -f docker-compose.yml down -v');
      await execAsync(`rm -rf ${testDir}`);
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  });

  it('should build Docker image successfully', async () => {
    const { stdout, stderr } = await execAsync('docker build -t walkthrough-backend .');
    // Check for successful build in either stdout or stderr
    expect(stdout + stderr).toMatch(/naming to docker.io\/library\/walkthrough-backend/);
  }, 60000); // 60 second timeout

  it('should create and manage SQLite volume', async () => {
    // Start container
    await execAsync('docker-compose -f docker-compose.yml up -d');
    
    try {
      // Wait for container to be healthy
      await waitForContainer(containerName);
      
      // Check if volume is created
      const { stdout } = await execAsync('docker volume ls');
      expect(stdout).toContain('backend_walkthrough_data');
    } catch (error) {
      await getContainerLogs(containerName);
      throw error;
    } finally {
      // Stop container
      await execAsync('docker-compose -f docker-compose.yml down');
    }
  }, 120000); // 120 second timeout

  it('should persist data across container restarts', async () => {
    // Start container
    await execAsync('docker-compose -f docker-compose.yml up -d');
    
    try {
      // Wait for container to be healthy
      await waitForContainer(containerName);
      
      // Create test data
      await execAsync('docker-compose -f docker-compose.yml exec -T backend touch /data/test.txt');
      
      // Restart container
      await execAsync('docker-compose -f docker-compose.yml restart');
      
      // Wait for container to be healthy again
      await waitForContainer(containerName);
      
      // Check if data persists
      const { stdout } = await execAsync('docker-compose -f docker-compose.yml exec -T backend ls /data');
      expect(stdout).toContain('test.txt');
    } catch (error) {
      await getContainerLogs(containerName);
      throw error;
    } finally {
      // Stop container
      await execAsync('docker-compose -f docker-compose.yml down');
    }
  }, 120000); // 120 second timeout
}); 