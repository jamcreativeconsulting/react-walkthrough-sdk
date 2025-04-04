import { Request, Response, NextFunction } from 'express';
import config from '../config';
import { logger } from './logger';

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'AuthError';
  }
}

export const validateApiKey = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'] as string;
  logger.debug('Validating API key:', { apiKey, configKey: config.apiKey });
  
  if (!apiKey) {
    logger.debug('No API key provided');
    res.status(401).json({ error: 'API key is required' });
    return;
  }

  if (apiKey !== config.apiKey) {
    logger.debug('Invalid API key');
    res.status(403).json({ error: 'Invalid API key' });
    return;
  }

  logger.debug('API key validation successful');
  next();
};

export const validateDomain = (req: Request, res: Response, next: NextFunction): void => {
  const origin = req.headers.origin;
  logger.debug('Validating origin:', { origin, allowedOrigins: config.allowedOrigins });
  
  if (!origin) {
    logger.debug('No origin provided');
    res.status(401).json({ error: 'Origin header is required' });
    return;
  }

  if (!config.allowedOrigins || !Array.isArray(config.allowedOrigins) || !config.allowedOrigins.includes(origin)) {
    logger.debug('Invalid origin');
    res.status(403).json({ error: 'Domain not allowed' });
    return;
  }

  logger.debug('Origin validation successful');
  next();
}; 