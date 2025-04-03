import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseSchema } from '../db/schema';
import { Walkthrough, WalkthroughStep } from '../types';
import { logger } from '../utils/logger';

const router = express.Router();

// POST /api/walkthroughs
router.post('/', async (req, res) => {
  let db;
  try {
    db = (req.app.get('db') as DatabaseSchema).getDatabase();
  } catch (error) {
    logger.error('Error getting database:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'An unexpected error occurred while accessing the database'
    });
  }
  
  try {
    const { name, description, steps } = req.body;

    // Validate required fields
    if (!name || !description || !steps || !Array.isArray(steps)) {
      return res.status(400).json({
        error: 'Missing required fields: name, description, and steps array are required'
      });
    }

    // Validate steps
    const validSteps = steps.every((step: WalkthroughStep) => {
      return step.title && step.content && step.target && step.order !== undefined;
    });

    if (!validSteps) {
      return res.status(400).json({
        error: 'Invalid steps: each step must have title, content, target, and order'
      });
    }

    const walkthrough: Walkthrough = {
      id: uuidv4(),
      name,
      description,
      steps,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };

    // Begin transaction
    await db.run('BEGIN TRANSACTION');

    try {
      // Insert walkthrough into database
      await db.run(
        `INSERT INTO walkthroughs (
          id, name, description, steps, isActive, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          walkthrough.id,
          walkthrough.name,
          walkthrough.description,
          JSON.stringify(walkthrough.steps),
          walkthrough.isActive ? 1 : 0,
          walkthrough.createdAt.toISOString(),
          walkthrough.updatedAt.toISOString()
        ]
      );

      // Commit transaction
      await db.run('COMMIT');

      logger.info(`Created walkthrough with ID: ${walkthrough.id}`);
      res.status(201).json(walkthrough);
    } catch (error) {
      // Rollback transaction on error
      await db.run('ROLLBACK');
      throw error;
    }
  } catch (error) {
    logger.error('Error creating walkthrough:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'An unexpected error occurred while creating the walkthrough'
    });
  }
});

// GET /api/walkthroughs
router.get('/', async (req, res) => {
  let db;
  try {
    db = (req.app.get('db') as DatabaseSchema).getDatabase();
  } catch (error) {
    logger.error('Error getting database:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'An unexpected error occurred while accessing the database'
    });
  }
  
  try {
    const walkthroughs = await db.all(`
      SELECT 
        id, name, description, steps, isActive, createdAt, updatedAt
      FROM walkthroughs
      ORDER BY createdAt DESC
    `);

    // Convert SQLite results to Walkthrough type
    const formattedWalkthroughs = walkthroughs.map(w => ({
      id: w.id,
      name: w.name,
      description: w.description,
      steps: JSON.parse(w.steps),
      isActive: w.isActive === 1,
      createdAt: new Date(w.createdAt),
      updatedAt: new Date(w.updatedAt)
    }));

    res.json(formattedWalkthroughs);
  } catch (error) {
    logger.error('Error fetching walkthroughs:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'An unexpected error occurred while fetching walkthroughs'
    });
  }
});

// GET /api/walkthroughs/:id
router.get('/:id', async (req, res) => {
  let db;
  try {
    db = (req.app.get('db') as DatabaseSchema).getDatabase();
  } catch (error) {
    logger.error('Error getting database:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'An unexpected error occurred while accessing the database'
    });
  }
  
  try {
    const walkthrough = await db.get(`
      SELECT 
        id, name, description, steps, isActive, createdAt, updatedAt
      FROM walkthroughs
      WHERE id = ?
    `, [req.params.id]);

    if (!walkthrough) {
      return res.status(404).json({
        error: 'Walkthrough not found'
      });
    }

    // Convert SQLite result to Walkthrough type
    const formattedWalkthrough = {
      id: walkthrough.id,
      name: walkthrough.name,
      description: walkthrough.description,
      steps: JSON.parse(walkthrough.steps),
      isActive: walkthrough.isActive === 1,
      createdAt: new Date(walkthrough.createdAt),
      updatedAt: new Date(walkthrough.updatedAt)
    };

    res.json(formattedWalkthrough);
  } catch (error) {
    logger.error('Error fetching walkthrough:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'An unexpected error occurred while fetching the walkthrough'
    });
  }
});

// PUT /api/walkthroughs/:id
router.put('/:id', async (req, res) => {
  let db;
  try {
    db = (req.app.get('db') as DatabaseSchema).getDatabase();
  } catch (error) {
    logger.error('Error getting database:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'An unexpected error occurred while accessing the database'
    });
  }
  
  try {
    const { name, description, steps, isActive } = req.body;

    // Validate required fields
    if (!name || !description || !steps || !Array.isArray(steps)) {
      return res.status(400).json({
        error: 'Missing required fields: name, description, and steps array are required'
      });
    }

    // Validate steps
    const validSteps = steps.every((step: WalkthroughStep) => {
      return step.title && step.content && step.target && step.order !== undefined;
    });

    if (!validSteps) {
      return res.status(400).json({
        error: 'Invalid steps: each step must have title, content, target, and order'
      });
    }

    // Begin transaction
    await db.run('BEGIN TRANSACTION');

    try {
      // Check if walkthrough exists and get current data
      const existing = await db.get(
        'SELECT * FROM walkthroughs WHERE id = ?',
        [req.params.id]
      );

      if (!existing) {
        await db.run('ROLLBACK');
        return res.status(404).json({
          error: 'Walkthrough not found'
        });
      }

      const updatedAt = new Date();

      // Update walkthrough
      await db.run(
        `UPDATE walkthroughs 
         SET name = ?, description = ?, steps = ?, isActive = ?, updatedAt = ?
         WHERE id = ?`,
        [
          name,
          description,
          JSON.stringify(steps),
          isActive === undefined ? existing.isActive : (isActive ? 1 : 0),
          updatedAt.toISOString(),
          req.params.id
        ]
      );

      // Commit transaction
      await db.run('COMMIT');

      logger.info(`Updated walkthrough with ID: ${req.params.id}`);
      res.json({
        id: req.params.id,
        name,
        description,
        steps,
        isActive: isActive === undefined ? existing.isActive === 1 : isActive,
        createdAt: new Date(existing.createdAt),
        updatedAt
      });
    } catch (error) {
      // Rollback transaction on error
      await db.run('ROLLBACK');
      throw error;
    }
  } catch (error) {
    logger.error('Error updating walkthrough:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'An unexpected error occurred while updating the walkthrough'
    });
  }
});

// DELETE /api/walkthroughs/:id
router.delete('/:id', async (req, res) => {
  const db = (req.app.get('db') as DatabaseSchema).getDatabase();
  
  try {
    // Begin transaction
    await db.run('BEGIN TRANSACTION');

    try {
      // Check if walkthrough exists
      const existing = await db.get(
        'SELECT id FROM walkthroughs WHERE id = ?',
        [req.params.id]
      );

      if (!existing) {
        await db.run('ROLLBACK');
        return res.status(404).json({
          error: 'Walkthrough not found'
        });
      }

      // Delete walkthrough (cascade will handle related records)
      await db.run('DELETE FROM walkthroughs WHERE id = ?', [req.params.id]);

      // Commit transaction
      await db.run('COMMIT');

      logger.info(`Deleted walkthrough with ID: ${req.params.id}`);
      res.status(204).send();
    } catch (error) {
      // Rollback transaction on error
      await db.run('ROLLBACK');
      throw error;
    }
  } catch (error) {
    logger.error('Error deleting walkthrough:', error);
    res.status(500).json({
      error: 'An unexpected error occurred while deleting the walkthrough'
    });
  }
});

export default router; 