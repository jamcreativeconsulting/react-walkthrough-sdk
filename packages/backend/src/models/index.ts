import mongoose from 'mongoose';
import { WalkthroughFlow, UserProgress, User } from '../types';

const walkthroughStepSchema = new mongoose.Schema({
  target: { type: String, required: true },
  content: { type: String, required: true },
  position: { 
    type: String, 
    enum: ['top', 'bottom', 'left', 'right'],
    required: true 
  },
  order: { type: Number, required: true },
  pageUrl: { type: String, required: true },
  conditions: {
    userRole: [String],
    features: [String],
    previousSteps: [String]
  }
});

const walkthroughFlowSchema = new mongoose.Schema({
  name: { type: String, required: true },
  productId: { type: String, required: true },
  steps: [walkthroughStepSchema],
  status: { 
    type: String, 
    enum: ['draft', 'published'],
    default: 'draft'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: String, required: true }
});

const userProgressSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  walkthroughId: { type: String, required: true },
  completedSteps: [String],
  lastCompletedAt: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['in_progress', 'completed', 'skipped'],
    default: 'in_progress'
  }
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  role: { 
    type: String, 
    enum: ['admin', 'editor', 'viewer'],
    default: 'viewer'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for better query performance
walkthroughFlowSchema.index({ productId: 1, status: 1 });
userProgressSchema.index({ userId: 1, walkthroughId: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });

export const WalkthroughFlowModel = mongoose.model<WalkthroughFlow>('WalkthroughFlow', walkthroughFlowSchema);
export const UserProgressModel = mongoose.model<UserProgress>('UserProgress', userProgressSchema);
export const UserModel = mongoose.model<User>('User', userSchema); 