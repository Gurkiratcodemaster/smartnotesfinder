import mongoose, { Schema, Document } from 'mongoose';

export interface IFile extends Document {
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  cloudflareUrl: string;
  uploaderId: string;
  uploaderType: 'student' | 'teacher' | 'college';
  labels: {
    class?: string;
    subject: string;
    topic: string;
    section?: string;
    semester?: string;
    tags?: string[];
  };
  metadata: {
    pageCount?: number;
    language?: string;
    extractedAt: Date;
  };
  ocrText: string;
  embeddings: number[];
  ratings: {
    averageRating: number;
    totalRatings: number;
    ratingsBreakdown: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
  };
  viewsCount: number;
  downloadsCount: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FileSchema: Schema = new Schema({
  fileName: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  cloudflareUrl: {
    type: String,
    required: true,
  },
  uploaderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  uploaderType: {
    type: String,
    enum: ['student', 'teacher', 'college'],
    required: true,
  },
  labels: {
    class: String,
    subject: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    section: String,
    semester: String,
    tags: [String],
  },
  metadata: {
    pageCount: Number,
    language: String,
    extractedAt: {
      type: Date,
      default: Date.now,
    },
  },
  ocrText: {
    type: String,
    required: true,
  },
  embeddings: {
    type: [Number],
    required: true,
  },
  ratings: {
    averageRating: {
      type: Number,
      default: 0,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    ratingsBreakdown: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 },
    },
  },
  viewsCount: {
    type: Number,
    default: 0,
  },
  downloadsCount: {
    type: Number,
    default: 0,
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for text search
FileSchema.index({
  'labels.subject': 'text',
  'labels.topic': 'text',
  'labels.tags': 'text',
  ocrText: 'text',
});

// Index for embeddings (for vector search)
FileSchema.index({ embeddings: 1 });

export default mongoose.models.File || mongoose.model<IFile>('File', FileSchema);