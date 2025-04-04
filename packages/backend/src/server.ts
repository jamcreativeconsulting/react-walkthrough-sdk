import express from 'express';
import { DatabaseSchema } from './db/schema';
import sqlite3 from 'sqlite3';
import walkthroughRoutes from './routes/walkthroughs';
import { validateApiKey, validateDomain } from './utils/authMiddleware';
import config from './config';

const app = express();
const db = new DatabaseSchema(config.databasePath);

// Add database instance to app
app.set('db', db);

// Middleware
app.use(express.json());

// Authentication middleware for all routes except health check
app.use((req, res, next) => {
  if (req.path === '/health') {
    return next();
  }
  next();
});

app.use(validateApiKey);
app.use(validateDomain);

// Routes
app.use('/api/walkthroughs', walkthroughRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check request received');
  try {
    // Check database connection by executing a simple query
    db.getDatabase().get('SELECT 1', (err: Error | null) => {
      if (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('Health check failed:', errorMessage);
        res.status(500).json({ status: 'unhealthy', error: errorMessage });
        return;
      }
      console.log('Health check successful');
      res.status(200).json({ status: 'healthy' });
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Health check failed:', errorMessage);
    res.status(500).json({ status: 'unhealthy', error: errorMessage });
  }
});

export default app; 