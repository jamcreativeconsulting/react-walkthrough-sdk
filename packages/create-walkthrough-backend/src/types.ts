export interface SetupConfig {
  projectName: string;
  databasePath: string;
  backupPath: string;
  port: number;
  apiKey: string;
  allowedOrigins: string[];
}

export interface SetupStep {
  name: string;
  description: string;
  run: (config: SetupConfig) => Promise<void>;
  validate?: (config: SetupConfig) => Promise<boolean>;
} 