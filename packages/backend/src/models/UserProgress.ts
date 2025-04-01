import mongoose, { Schema, Document } from 'mongoose';

export interface IUserProgress extends Document {
  userId: string;
  flowId: string;
  currentStep: number;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserProgressSchema = new Schema({
  userId: { type: String, required: true },
  flowId: { type: String, required: true },
  currentStep: { type: Number, required: true, default: 0 },
  completed: { type: Boolean, required: true, default: false },
}, {
  timestamps: true,
});

// Create a unique compound index for userId and flowId
UserProgressSchema.index({ userId: 1, flowId: 1 }, { unique: true });

export const UserProgress = mongoose.model<IUserProgress>('UserProgress', UserProgressSchema); 