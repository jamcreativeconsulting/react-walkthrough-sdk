import { DatabaseSchema } from '../schema';
import { BackupManager } from '../BackupManager';
import { WalkthroughRepository } from '../repositories/WalkthroughRepository';
import { unlinkSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('BackupManager', () => {
  const testDbPath = join(tmpdir(), 'test-backup.db');
  const testBackupDir = join(tmpdir(), 'test-backups');
  let schema: DatabaseSchema;
  let manager: BackupManager;
  let walkthroughRepository: WalkthroughRepository;

  beforeEach(async () => {
    // Remove test database and backup directory if they exist
    try {
      unlinkSync(testDbPath);
      if (existsSync(testBackupDir)) {
        readdirSync(testBackupDir).forEach(file => {
          unlinkSync(join(testBackupDir, file));
        });
      }
    } catch (error) {
      // Ignore if files don't exist
    }

    schema = new DatabaseSchema(testDbPath);
    manager = new BackupManager(schema['db'], testBackupDir);
    walkthroughRepository = new WalkthroughRepository(schema['db']);

    // Create some test data
    walkthroughRepository.create({
      name: 'Test Walkthrough 1',
      description: 'Test Description 1',
      steps: [
        {
          targetId: 'step-1',
          content: 'Content 1',
          position: 'bottom'
        }
      ],
      isActive: true
    });

    walkthroughRepository.create({
      name: 'Test Walkthrough 2',
      description: 'Test Description 2',
      steps: [
        {
          targetId: 'step-2',
          content: 'Content 2',
          position: 'top'
        }
      ],
      isActive: true
    });
  });

  afterEach(() => {
    schema.close();
    try {
      unlinkSync(testDbPath);
      if (existsSync(testBackupDir)) {
        readdirSync(testBackupDir).forEach(file => {
          unlinkSync(join(testBackupDir, file));
        });
      }
    } catch (error) {
      // Ignore if files don't exist
    }
  });

  it('should create a backup', async () => {
    const backupPath = await manager.backup();
    expect(existsSync(backupPath)).toBe(true);
  });

  it('should restore from backup', async () => {
    // Create initial backup
    const backupPath = await manager.backup();

    // Add more data
    walkthroughRepository.create({
      name: 'Test Walkthrough 3',
      description: 'Test Description 3',
      steps: [],
      isActive: true
    });

    // Count walkthroughs before restore
    const beforeRestore = walkthroughRepository.findAll().length;
    expect(beforeRestore).toBe(3);

    // Restore from backup
    await manager.restore(backupPath, (newDb) => {
      walkthroughRepository = new WalkthroughRepository(newDb);
    });

    // Count walkthroughs after restore
    const afterRestore = walkthroughRepository.findAll().length;
    expect(afterRestore).toBe(2);
  });

  it('should list backups', async () => {
    // Create multiple backups
    await manager.backup();
    await manager.backup();
    await manager.backup();

    const backups = manager.listBackups();
    expect(backups.length).toBe(3);
  });

  it('should verify backup integrity', async () => {
    const backupPath = await manager.backup();
    const isValid = await manager.verifyBackup(backupPath);
    expect(isValid).toBe(true);
  });

  it('should return false for invalid backup', async () => {
    const isValid = await manager.verifyBackup('non-existent-backup.db');
    expect(isValid).toBe(false);
  });

  it('should throw error when restoring non-existent backup', async () => {
    await expect(manager.restore('non-existent-backup.db')).rejects.toThrow('Backup file not found');
  });

  it('should create pre-restore backup when restoring', async () => {
    // Create initial backup
    const backupPath = await manager.backup();

    // Add more data
    walkthroughRepository.create({
      name: 'Test Walkthrough 3',
      description: 'Test Description 3',
      steps: [],
      isActive: true
    });

    // Restore from backup
    await manager.restore(backupPath, (newDb) => {
      walkthroughRepository = new WalkthroughRepository(newDb);
    });

    // Check if pre-restore backup was created
    const backupFiles = readdirSync(testBackupDir);
    const preRestoreBackup = backupFiles.find(file => file.startsWith('pre-restore-'));
    expect(preRestoreBackup).toBeDefined();
  });
}); 