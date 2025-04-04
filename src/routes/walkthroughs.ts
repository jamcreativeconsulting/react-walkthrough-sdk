import express from 'express';
import { DatabaseSchema } from '../db/schema';
import { WalkthroughRepository } from '../db/repositories/WalkthroughRepository';
import { logger } from '../utils/logger';

const router = express.Router();

// Get all walkthroughs
router.get('/', async (req, res) => {
  try {
    const db = (req.app.get('db') as DatabaseSchema).getDatabase();
    const repository = new WalkthroughRepository(db);
    const walkthroughs = await repository.findAll();
    res.json(walkthroughs);
  } catch (err: any) {
    logger.error('Error getting walkthroughs:', err);
    res.status(500).json({ error: 'Failed to get walkthroughs' });
  }
});

// Get walkthrough by ID
router.get('/:id', async (req, res) => {
  try {
    const db = (req.app.get('db') as DatabaseSchema).getDatabase();
    const repository = new WalkthroughRepository(db);
    const walkthrough = await repository.findById(req.params.id);
    
    if (!walkthrough) {
      return res.status(404).json({ error: 'Walkthrough not found' });
    }
    
    res.json(walkthrough);
  } catch (err: any) {
    logger.error('Error getting walkthrough:', err);
    res.status(500).json({ error: 'Failed to get walkthrough' });
  }
});

// Create new walkthrough
router.post('/', async (req, res) => {
  try {
    const db = (req.app.get('db') as DatabaseSchema).getDatabase();
    const repository = new WalkthroughRepository(db);
    const walkthrough = await repository.create(req.body);
    res.status(201).json(walkthrough);
  } catch (err: any) {
    logger.error('Error creating walkthrough:', err);
    res.status(500).json({ error: 'Failed to create walkthrough' });
  }
});

// Update walkthrough
router.put('/:id', async (req, res) => {
  try {
    const db = (req.app.get('db') as DatabaseSchema).getDatabase();
    const repository = new WalkthroughRepository(db);
    const walkthrough = await repository.update(req.params.id, req.body);
    
    if (!walkthrough) {
      return res.status(404).json({ error: 'Walkthrough not found' });
    }
    
    res.json(walkthrough);
  } catch (err: any) {
    logger.error('Error updating walkthrough:', err);
    res.status(500).json({ error: 'Failed to update walkthrough' });
  }
});

// Delete walkthrough
router.delete('/:id', async (req, res) => {
  try {
    const db = (req.app.get('db') as DatabaseSchema).getDatabase();
    const repository = new WalkthroughRepository(db);
    const success = await repository.delete(req.params.id);
    
    if (!success) {
      return res.status(404).json({ error: 'Walkthrough not found' });
    }
    
    res.status(204).send();
  } catch (err: any) {
    logger.error('Error deleting walkthrough:', err);
    res.status(500).json({ error: 'Failed to delete walkthrough' });
  }
});

export default router; 