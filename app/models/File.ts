import mongoose, { Schema, Document } from "mongoose";

export interface IFile extends Document {
  fileName: string;
  fileSize: number;
  mimeType?: string;
  cloudflareUrl?: string;
  labels?: Record<string, any>;
  uploadDate: Date;
  ocrText?: string;
  embeddings?: number[];
  metadata?: Record<string, any>;
}

const FileSchema = new Schema<IFile>({
  fileName: { type: String, required: true },
  fileSize: { type: Number, required: false },
  mimeType: { type: String, required: false },
  cloudflareUrl: { type: String, required: false },
  labels: { type: Schema.Types.Mixed, required: false },
  uploadDate: { type: Date, default: Date.now },
  ocrText: { type: String, default: "" },
  embeddings: { type: [Number], default: [] },
  metadata: { type: Schema.Types.Mixed, default: {} },
});

// Avoid model overwrite in dev/hot-reload
export default (mongoose.models.File as mongoose.Model<IFile>) || mongoose.model<IFile>("File", FileSchema);