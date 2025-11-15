import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  userType: 'student' | 'teacher' | 'college';
  profile: {
    class?: string;
    semester?: string;
    subject?: string;
    institution?: string;
    bio?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    enum: ['student', 'teacher', 'college'],
    required: true,
  },
  profile: {
    class: String,
    semester: String,
    subject: String,
    institution: String,
    bio: String,
  },
}, {
  timestamps: true,
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);