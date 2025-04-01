import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, required: true, enum: ['admin', 'editor', 'user'], default: 'user' },
}, {
  timestamps: true,
});

export const User = mongoose.model<IUser>('User', UserSchema); 