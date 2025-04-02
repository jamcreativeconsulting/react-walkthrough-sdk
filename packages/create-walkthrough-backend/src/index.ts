#!/usr/bin/env node

import { SetupWizard } from './setupWizard';

async function main() {
  try {
    const wizard = new SetupWizard();
    const config = await wizard.run();
    
    // Save configuration to .env file
    const envContent = `
# Walkthrough SDK Backend Configuration
PROJECT_NAME=${config.projectName}
PORT=${config.port}
DATABASE_PATH=${config.databasePath}
BACKUP_PATH=${config.backupPath}
API_KEY=${config.apiKey}
ALLOWED_ORIGINS=${config.allowedOrigins.join(',')}
`;

    console.log('\nConfiguration saved to .env file');
    console.log('You can now start the backend server with:');
    console.log('npm start\n');
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

main(); 