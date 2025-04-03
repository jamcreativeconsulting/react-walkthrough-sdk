export interface WalkthroughStep {
  id: string;
  title: string;
  content: string;
  target: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  order: number;
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
  action: 'view' | 'complete' | 'skip';
  timestamp: Date;
  metadata?: Record<string, unknown>;
} 