export interface WalkthroughStep {
  id: string;
  target: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  order: number;
  pageUrl: string;
  conditions?: {
    userRole?: string[];
    features?: string[];
    previousSteps?: string[];
  };
}

export interface WalkthroughFlow {
  id: string;
  name: string;
  productId: string;
  steps: WalkthroughStep[];
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface UserProgress {
  userId: string;
  walkthroughId: string;
  completedSteps: string[];
  lastCompletedAt: Date;
  status: 'in_progress' | 'completed' | 'skipped';
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  createdAt: Date;
  updatedAt: Date;
} 