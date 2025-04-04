import express, { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseSchema } from '../db/schema';
import { Walkthrough, WalkthroughStep } from '../types';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errorMiddleware';

const router: Router = express.Router();

// POST /api/walkthroughs
router.post('/', async (req, res, next) => {
  let db;
  try {
    db = (req.app.get('db') as DatabaseSchema).getDatabase();
  } catch (error: any) {
    logger.error('Error getting database:', error);
    next(error);
    return;
  }

  try {
    const { name, description, steps } = req.body;

    // Validate required fields
    if (!name || !description || !steps || !Array.isArray(steps)) {
      next(
        new AppError(
          'Missing required fields: name, description, and steps array are required',
          400
        )
      );
      return;
    }

    // Validate steps
    const validSteps = steps.every((step: WalkthroughStep) => {
      return step.title && step.content && step.target && step.order !== undefined;
    });

    if (!validSteps) {
      next(
        new AppError('Invalid steps: each step must have title, content, target, and order', 400)
      );
      return;
    }

    const walkthrough: Walkthrough = {
      id: uuidv4(),
      name,
      description,
      steps,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
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
          walkthrough.updatedAt.toISOString(),
        ]
      );

      // Commit transaction
      await db.run('COMMIT');

      logger.info(`Created walkthrough with ID: ${walkthrough.id}`);
      res.status(201).json(walkthrough);
    } catch (error: any) {
      // Rollback transaction on error
      await db.run('ROLLBACK');
      logger.error('Error in database transaction:', error);
      next(error);
    }
  } catch (error: any) {
    logger.error('Error creating walkthrough:', error);
    next(error);
  }
});

// GET /api/walkthroughs
router.get('/', async (req, res, next) => {
  let db;
  try {
    db = (req.app.get('db') as DatabaseSchema).getDatabase();
  } catch (error: any) {
    logger.error('Error getting database:', error);
    next(error);
    return;
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
      updatedAt: new Date(w.updatedAt),
    }));

    res.json(formattedWalkthroughs);
  } catch (error: any) {
    logger.error('Error fetching walkthroughs:', error);
    next(error);
  }
});

// GET /api/walkthroughs/:id
router.get('/:id', async (req, res, next) => {
  let db;
  try {
    db = (req.app.get('db') as DatabaseSchema).getDatabase();
  } catch (error: any) {
    logger.error('Error getting database:', error);
    next(error);
    return;
  }

  try {
    const walkthrough = await db.get(
      `
      SELECT 
        id, name, description, steps, isActive, createdAt, updatedAt
      FROM walkthroughs
      WHERE id = ?
    `,
      [req.params.id]
    );

    if (!walkthrough) {
      next(new AppError('Walkthrough not found', 404));
      return;
    }

    // Convert SQLite result to Walkthrough type
    const formattedWalkthrough = {
      id: walkthrough.id,
      name: walkthrough.name,
      description: walkthrough.description,
      steps: JSON.parse(walkthrough.steps),
      isActive: walkthrough.isActive === 1,
      createdAt: new Date(walkthrough.createdAt),
      updatedAt: new Date(walkthrough.updatedAt),
    };

    res.json(formattedWalkthrough);
  } catch (error: any) {
    logger.error('Error fetching walkthrough:', error);
    next(error);
  }
});

// PUT /api/walkthroughs/:id
router.put('/:id', async (req, res, next) => {
  let db;
  try {
    db = (req.app.get('db') as DatabaseSchema).getDatabase();
  } catch (error: any) {
    logger.error('Error getting database:', error);
    next(error);
    return;
  }

  try {
    const { name, description, steps, isActive } = req.body;

    // Validate required fields
    if (!name || !description || !steps || !Array.isArray(steps)) {
      next(
        new AppError(
          'Missing required fields: name, description, and steps array are required',
          400
        )
      );
      return;
    }

    // Validate steps
    const validSteps = steps.every((step: WalkthroughStep) => {
      return step.title && step.content && step.target && step.order !== undefined;
    });

    if (!validSteps) {
      next(
        new AppError('Invalid steps: each step must have title, content, target, and order', 400)
      );
      return;
    }

    // Begin transaction
    await db.run('BEGIN TRANSACTION');

    try {
      // Check if walkthrough exists and get current isActive value
      const existingWalkthrough = await db.get(
        'SELECT id, isActive FROM walkthroughs WHERE id = ?',
        [req.params.id]
      );

      if (!existingWalkthrough) {
        await db.run('ROLLBACK');
        next(new AppError('Walkthrough not found', 404));
        return;
      }

      // Use provided isActive value or keep existing one
      const newIsActive = isActive !== undefined ? isActive : existingWalkthrough.isActive === 1;

      // Update walkthrough
      await db.run(
        `UPDATE walkthroughs 
        SET name = ?, description = ?, steps = ?, isActive = ?, updatedAt = ?
        WHERE id = ?`,
        [
          name,
          description,
          JSON.stringify(steps),
          newIsActive ? 1 : 0,
          new Date().toISOString(),
          req.params.id,
        ]
      );

      // Commit transaction
      await db.run('COMMIT');

      // Get updated walkthrough
      const updatedWalkthrough = await db.get('SELECT * FROM walkthroughs WHERE id = ?', [
        req.params.id,
      ]);

      // Convert SQLite result to Walkthrough type
      const formattedWalkthrough = {
        id: updatedWalkthrough.id,
        name: updatedWalkthrough.name,
        description: updatedWalkthrough.description,
        steps: JSON.parse(updatedWalkthrough.steps),
        isActive: updatedWalkthrough.isActive === 1,
        createdAt: new Date(updatedWalkthrough.createdAt),
        updatedAt: new Date(updatedWalkthrough.updatedAt),
      };

      logger.info(`Updated walkthrough with ID: ${req.params.id}`);
      res.json(formattedWalkthrough);
    } catch (error: any) {
      // Rollback transaction on error
      await db.run('ROLLBACK');
      logger.error('Error in database transaction:', error);
      next(error);
    }
  } catch (error: any) {
    logger.error('Error updating walkthrough:', error);
    next(error);
  }
});

// DELETE /api/walkthroughs/:id
router.delete('/:id', async (req, res, next) => {
  let db;
  try {
    db = (req.app.get('db') as DatabaseSchema).getDatabase();
  } catch (error: any) {
    logger.error('Error getting database:', error);
    throw error;
  }

  try {
    // Begin transaction
    await db.run('BEGIN TRANSACTION');

    try {
      // Check if walkthrough exists
      const existingWalkthrough = await db.get('SELECT id FROM walkthroughs WHERE id = ?', [
        req.params.id,
      ]);

      if (!existingWalkthrough) {
        await db.run('ROLLBACK');
        next(new AppError('Walkthrough not found', 404));
        return;
      }

      // Delete walkthrough
      await db.run('DELETE FROM walkthroughs WHERE id = ?', [req.params.id]);

      // Commit transaction
      await db.run('COMMIT');

      logger.info(`Deleted walkthrough with ID: ${req.params.id}`);
      res.status(204).end();
    } catch (error: any) {
      // Rollback transaction on error
      await db.run('ROLLBACK');
      logger.error('Error in database transaction:', error);
      next(error);
    }
  } catch (error: any) {
    logger.error('Error deleting walkthrough:', error);
    next(error);
  }
});

export default router;
