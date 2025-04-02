import { SetupWizard } from './setupWizard';
import { existsSync } from 'fs';
import { join } from 'path';

jest.mock('inquirer');
jest.mock('ora');
jest.mock('@walkthrough-sdk/backend');

describe('SetupWizard', () => {
  let wizard: SetupWizard;

  beforeEach(() => {
    wizard = new SetupWizard();
  });

  it('should initialize with default config', () => {
    expect(wizard['config']).toEqual({
      projectName: '',
      databasePath: '',
      backupPath: '',
      port: 3000,
      apiKey: '',
      allowedOrigins: []
    });
  });

  it('should have all required setup steps', () => {
    expect(wizard['steps']).toHaveLength(4);
    expect(wizard['steps'][0].name).toBe('Project Configuration');
    expect(wizard['steps'][1].name).toBe('Database Configuration');
    expect(wizard['steps'][2].name).toBe('Security Configuration');
    expect(wizard['steps'][3].name).toBe('Database Initialization');
  });

  it('should generate a valid API key', () => {
    const apiKey = wizard['generateApiKey']();
    expect(apiKey).toMatch(/^[0-9a-f]{64}$/);
  });

  it('should run all steps successfully', async () => {
    const mockInquirer = require('inquirer');
    mockInquirer.prompt.mockImplementation(() => ({
      projectName: 'test-project',
      port: 3000,
      databasePath: join(process.cwd(), 'data', 'test.db'),
      backupPath: join(process.cwd(), 'data', 'backups'),
      apiKey: '',
      allowedOrigins: '*'
    }));

    const mockOra = require('ora');
    mockOra.mockImplementation(() => ({
      start: jest.fn().mockReturnThis(),
      succeed: jest.fn(),
      fail: jest.fn()
    }));

    const mockDatabaseSchema = require('@walkthrough-sdk/backend').DatabaseSchema;
    mockDatabaseSchema.mockImplementation(() => ({}));

    const config = await wizard.run();

    expect(config).toEqual({
      projectName: 'test-project',
      port: 3000,
      databasePath: join(process.cwd(), 'data', 'test.db'),
      backupPath: join(process.cwd(), 'data', 'backups'),
      apiKey: expect.stringMatching(/^[0-9a-f]{64}$/),
      allowedOrigins: ['*']
    });
  });
}); 