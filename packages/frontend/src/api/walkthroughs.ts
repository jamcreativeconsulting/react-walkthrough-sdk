import { Walkthrough } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

export const createWalkthrough = async (walkthrough: Walkthrough): Promise<Walkthrough> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/walkthroughs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(walkthrough),
    });

    if (!response.ok) {
      throw new Error('Failed to create walkthrough');
    }

    return response.json();
  } catch (error) {
    console.error('Error creating walkthrough:', error);
    throw error;
  }
};
