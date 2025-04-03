import express from 'express';
import { DatabaseSchema } from './db/schema';
import sqlite3 from 'sqlite3';
import walkthroughRoutes from './routes/walkthroughs';

const app = express();
const db = new DatabaseSchema(process.env.DATABASE_PATH || './data/walkthrough.db');

// Add database instance to app
app.set('db', db);

// Middleware
app.use(express.json());

// Routes
app.use('/api/walkthroughs', walkthroughRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check request received');
  try {
    // Check database connection by executing a simple query
    db.getDb().get('SELECT 1', (err) => {
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