import sqlite3 from 'sqlite3';
import { createReadStream, createWriteStream, existsSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { pipeline } from 'stream/promises';

export class BackupManager {
  private db: sqlite3.Database;
  private dbPath: string;
  private backupDir: string;

  constructor(db: sqlite3.Database, dbPath: string, backupDir: string) {
    this.db = db;
    this.dbPath = dbPath;
    this.backupDir = backupDir;

    // Ensure backup directory exists
    if (!existsSync(this.backupDir)) {
      mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Creates a backup of the database
   * @returns The path to the backup file
   */
  public async backup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = join(this.backupDir, `backup-${timestamp}.db`);

    return new Promise((resolve, reject) => {
      // Set busy timeout
      this.db.run('PRAGMA busy_timeout = 5000', (err) => {
        if (err) {
          reject(err);
          return;
        }

        // Begin transaction
        this.db.run('BEGIN IMMEDIATE', async (err) => {
          if (err) {
            reject(err);
            return;
          }

          try {
            // Create backup stream
            const source = createReadStream(this.dbPath);
            const destination = createWriteStream(backupPath);

            // Copy database file
            await pipeline(source, destination);

            // Commit transaction
            this.db.run('COMMIT', (err) => {
              if (err) {
                reject(err);
                return;
              }
              resolve(backupPath);
            });
          } catch (error) {
            // Rollback transaction on error
            this.db.run('ROLLBACK', () => {
              reject(error);
            });
          }
        });
      });
    });
  }

  /**
   * Restores the database from a backup file
   * @param backupPath Path to the backup file
   */
  public async restore(backupPath: string, onDatabaseReopen?: (db: sqlite3.Database) => void): Promise<void> {
    if (!existsSync(backupPath)) {
      throw new Error(`Backup file not found: ${backupPath}`);
    }

    return new Promise((resolve, reject) => {
      // Close current database connection
      this.db.close((err) => {
        if (err) {
          reject(err);
          return;
        }

        const restoreDb = async () => {
          try {
            // Create backup of current database before restore
            const currentBackupPath = join(
              dirname(backupPath),
              `pre-restore-${new Date().toISOString().replace(/[:.]/g, '-')}.db`
            );
            
            // Copy current database to backup
            if (existsSync(this.dbPath)) {
              const source = createReadStream(this.dbPath);
              const destination = createWriteStream(currentBackupPath);
              await pipeline(source, destination);
            }

            // Restore from backup
            const source = createReadStream(backupPath);
            const destination = createWriteStream(this.dbPath);
            await pipeline(source, destination);

            // Reopen database connection
            this.db = new sqlite3.Database(this.dbPath, (err) => {
              if (err) {
                reject(err);
                return;
              }

              // Notify about the new database connection
              if (onDatabaseReopen) {
                onDatabaseReopen(this.db);
              }
              resolve();
            });
          } catch (error) {
            // Try to reopen the database even if restore failed
            this.db = new sqlite3.Database(this.dbPath, (err) => {
              if (err) {
                reject(err);
                return;
              }

              // Notify about the new database connection even in case of error
              if (onDatabaseReopen) {
                onDatabaseReopen(this.db);
              }
              reject(error);
            });
          }
        };

        restoreDb().catch(reject);
      });
    });
  }

  /**
   * Lists all available backups
   * @returns Array of backup file paths
   */
  public listBackups(): string[] {
    if (!existsSync(this.backupDir)) {
      return [];
    }

    return readdirSync(this.backupDir)
      .filter(file => file.startsWith('backup-') && file.endsWith('.db'))
      .map(file => join(this.backupDir, file))
      .sort()
      .reverse();
  }

  /**
   * Verifies the integrity of a backup file
   * @param backupPath Path to the backup file
   * @returns true if backup is valid, false otherwise
   */
  public async verifyBackup(backupPath: string): Promise<boolean> {
    if (!existsSync(backupPath)) {
      return false;
    }

    return new Promise<boolean>((resolve) => {
      const tempDb = new sqlite3.Database(backupPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
          resolve(false);
          return;
        }

        tempDb.get('PRAGMA integrity_check', (err, row: { integrity_check: string } | undefined) => {
          tempDb.close(() => {
            resolve(!err && row ? row.integrity_check === 'ok' : false);
          });
        });
      });
    });
  }
} 