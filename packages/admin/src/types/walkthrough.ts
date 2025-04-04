export interface Step {
  id: string;
  title: string;
  content: string;
  target: string;
  order: number;
}

export interface Walkthrough {
  id: string;
  name: string;
  description: string;
  steps: Step[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WalkthroughState {
  currentWalkthrough: Walkthrough | null;
  walkthroughs: Walkthrough[];
  isLoading: boolean;
  error: string | null;
}

export type WalkthroughAction =
  | { type: 'SET_CURRENT_WALKTHROUGH'; payload: Walkthrough }
  | { type: 'SET_WALKTHROUGHS'; payload: Walkthrough[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_STEP'; payload: Step }
  | { type: 'REMOVE_STEP'; payload: string }
  | { type: 'UPDATE_STEP'; payload: Step };
