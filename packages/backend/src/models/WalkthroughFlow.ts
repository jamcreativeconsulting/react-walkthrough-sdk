import mongoose, { Schema, Document } from 'mongoose';

export interface IWalkthroughStep {
  id: string;
  title: string;
  content: string;
  target: string;
}

export interface IWalkthroughFlow extends Document {
  name: string;
  description: string;
  steps: IWalkthroughStep[];
  createdAt: Date;
  updatedAt: Date;
}

const WalkthroughStepSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  target: { type: String, required: true },
});

const WalkthroughFlowSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  steps: [WalkthroughStepSchema],
}, {
  timestamps: true,
});

export const WalkthroughFlow = mongoose.model<IWalkthroughFlow>('WalkthroughFlow', WalkthroughFlowSchema); 