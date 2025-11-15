import mongoose, { Schema, Document } from 'mongoose';

export interface IRating extends Document {
  fileId: string;
  userId: string;
  rating: number;
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RatingSchema: Schema = new Schema({
  fileId: {
    type: Schema.Types.ObjectId,
    ref: 'File',
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  review: {
    type: String,
    maxlength: 500,
  },
}, {
  timestamps: true,
});

// Ensure one rating per user per file
RatingSchema.index({ fileId: 1, userId: 1 }, { unique: true });

export default mongoose.models.Rating || mongoose.model<IRating>('Rating', RatingSchema);