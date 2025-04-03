import { DatabaseSchema } from '../schema';
import { BackupManager } from '../BackupManager';
import { WalkthroughRepository } from '../repositories/WalkthroughRepository';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { execAsync } from '../../utils/exec';
import { v4 as uuidv4 } from 'uuid';

describe('BackupManager', () => {
  let schema: DatabaseSchema;
  let manager: BackupManager;
  let walkthroughRepository: WalkthroughRepository;
  let testBackupDir: string;
  let testDbPath: string;

  beforeAll(async () => {
    testBackupDir = `/tmp/backup-test-${uuidv4()}`;
    testDbPath = `/tmp/db-test-${uuidv4()}.sqlite`;
    await execAsync(`mkdir -p ${testBackupDir}`);

    schema = new DatabaseSchema(testDbPath);
    await schema.initializeSchema();
    const db = new sqlite3.Database(testDbPath);
    manager = new BackupManager(db, testDbPath, testBackupDir);
    walkthroughRepository = new WalkthroughRepository(schema.getDatabase());
  });

  beforeEach(async () => {
    // Clear any existing backups
    const existingBackups = manager.listBackups();
    for (const backup of existingBackups) {
      await execAsync(`rm -f ${backup}`);
    }
  });

  afterAll(async () => {
    await schema.close();
    try {
      await execAsync(`rm -rf ${testBackupDir}`);
      await execAsync(`rm -f ${testDbPath}`);
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  });

  it('should create and restore backups', async () => {
    // Create test data
    const walkthrough = await walkthroughRepository.create({
      name: 'Test Walkthrough',
      description: 'Test Description',
      steps: [
        {
          id: 'step-1',
          target: 'step-1',
          title: 'Step 1',
          content: 'Step 1',
          order: 1
        },
        {
          id: 'step-2',
          target: 'step-2',
          title: 'Step 2',
          content: 'Step 2',
          order: 2
        }
      ],
      isActive: true
    });

    // Create backup
    const backupPath = await manager.backup();

    // Delete test data
    await walkthroughRepository.delete(walkthrough.id);

    // Verify data is deleted
    const beforeRestore = await walkthroughRepository.findAll();
    expect(beforeRestore.length).toBe(0);

    // Restore backup
    await manager.restore(backupPath, async (db) => {
      const newSchema = new DatabaseSchema(testDbPath);
      await newSchema.initializeSchema();
      const newWalkthroughRepository = new WalkthroughRepository(newSchema.getDatabase());
      
      // Verify data is restored
      const afterRestore = await newWalkthroughRepository.findAll();
      expect(afterRestore.length).toBe(1);
      expect(afterRestore[0].name).toBe('Test Walkthrough');
      expect(afterRestore[0].steps.length).toBe(2);
      
      // Close the schema to clean up
      await newSchema.close();
    });
  });

  it('should list and delete backups', async () => {
    // Create multiple backups
    await manager.backup();
    await manager.backup();

    // List backups
    const backups = manager.listBackups();
    expect(backups.length).toBe(2);

    // Delete first backup
    await execAsync(`rm -f ${backups[0]}`);

    // Verify backup is deleted
    const remainingBackups = manager.listBackups();
    expect(remainingBackups.length).toBe(1);
  });
}); 