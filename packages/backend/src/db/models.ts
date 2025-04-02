export interface WalkthroughStep {
  targetId: string;
  content: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
}

export interface Walkthrough {
  id: string;
  name: string;
  description: string;
  steps: WalkthroughStep[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProgress {
  id: string;
  userId: string;
  walkthroughId: string;
  currentStep: number;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Analytics {
  id: string;
  walkthroughId: string;
  userId: string;
  stepId: string;
  action: 'start' | 'complete' | 'skip' | 'next' | 'previous';
  timestamp: Date;
  metadata?: Record<string, any>;
} 