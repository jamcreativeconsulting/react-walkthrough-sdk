import dotenv from 'dotenv';

dotenv.config();

interface Config {
  apiKey: string;
  allowedOrigins: string[];
  port: number;
  databasePath: string;
}

const config: Config = {
  apiKey: process.env.API_KEY || '',
  allowedOrigins: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()).filter(origin => origin !== '') : [],
  port: parseInt(process.env.PORT || '3000', 10),
  databasePath: process.env.DATABASE_PATH || './data/walkthrough.db'
};

// Validate required environment variables
if (!config.apiKey) {
  throw new Error('API_KEY environment variable is required');
}

if (!process.env.ALLOWED_ORIGINS || config.allowedOrigins.length === 0) {
  throw new Error('ALLOWED_ORIGINS environment variable is required');
}

export default config; 