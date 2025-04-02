import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { SetupConfig, SetupStep } from './types';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { DatabaseSchema } from '@walkthrough-sdk/backend/dist/db/schema';

export class SetupWizard {
  private config: SetupConfig = {
    projectName: '',
    databasePath: '',
    backupPath: '',
    port: 3000,
    apiKey: '',
    allowedOrigins: []
  };

  private steps: SetupStep[] = [
    {
      name: 'Project Configuration',
      description: 'Configure basic project settings',
      run: async (config) => {
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'projectName',
            message: 'What is your project name?',
            default: 'walkthrough-backend',
            validate: (input: string) => input.length > 0 || 'Project name is required'
          },
          {
            type: 'input',
            name: 'port',
            message: 'What port should the server run on?',
            default: 3000,
            validate: (input: string) => {
              const port = parseInt(input);
              return (port > 0 && port < 65536) || 'Port must be between 1 and 65535';
            }
          }
        ]);

        config.projectName = answers.projectName;
        config.port = answers.port;
      }
    },
    {
      name: 'Database Configuration',
      description: 'Configure database settings',
      run: async (config) => {
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'databasePath',
            message: 'Where should the database be stored?',
            default: join(process.cwd(), 'data', 'walkthrough.db'),
            validate: (input: string) => {
              const dir = input.substring(0, input.lastIndexOf('/'));
              return existsSync(dir) || 'Directory does not exist';
            }
          },
          {
            type: 'input',
            name: 'backupPath',
            message: 'Where should backups be stored?',
            default: join(process.cwd(), 'data', 'backups'),
            validate: (input: string) => {
              const dir = input.substring(0, input.lastIndexOf('/'));
              return existsSync(dir) || 'Directory does not exist';
            }
          }
        ]);

        config.databasePath = answers.databasePath;
        config.backupPath = answers.backupPath;
      }
    },
    {
      name: 'Security Configuration',
      description: 'Configure security settings',
      run: async (config) => {
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'apiKey',
            message: 'Enter your API key (leave empty to generate one):',
            default: ''
          },
          {
            type: 'input',
            name: 'allowedOrigins',
            message: 'Enter allowed origins (comma-separated):',
            default: '*',
            validate: (input: string) => input.length > 0 || 'At least one origin is required'
          }
        ]);

        config.apiKey = answers.apiKey || this.generateApiKey();
        config.allowedOrigins = answers.allowedOrigins.split(',').map((origin: string) => origin.trim());
      }
    },
    {
      name: 'Database Initialization',
      description: 'Initialize the database',
      run: async (config) => {
        const spinner = ora('Initializing database...').start();
        try {
          const schema = new DatabaseSchema(config.databasePath);
          spinner.succeed('Database initialized successfully');
        } catch (error) {
          spinner.fail('Failed to initialize database');
          throw error;
        }
      }
    }
  ];

  private generateApiKey(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  public async run(): Promise<SetupConfig> {
    console.log(chalk.blue('\nWelcome to the Walkthrough SDK Backend Setup Wizard\n'));

    for (const step of this.steps) {
      console.log(chalk.yellow(`\n${step.name}: ${step.description}`));
      await step.run(this.config);
    }

    console.log(chalk.green('\nSetup completed successfully!'));
    return this.config;
  }
} 