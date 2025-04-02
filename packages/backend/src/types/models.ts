import { Walkthrough, UserProgress, User, Analytics } from './index';

export interface DatabaseModels {
  walkthroughs: Walkthrough[];
  userProgress: UserProgress[];
  users: User[];
  analytics: Analytics[];
} 