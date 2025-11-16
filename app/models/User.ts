import Database from "@/lib/database";
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export interface IUser {
  id: string;
  username: string;
  email: string;
  password: string;
  user_type?: 'student' | 'teacher' | 'college';
  profile?: any;
  created_at?: Date;
  updated_at?: Date;
}

export class User {
  static async create(userData: {
    name: string;
    email: string;
    password: string;
    userType?: 'student' | 'teacher' | 'college';
  }): Promise<IUser> {
    const id = uuidv4();
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const now = new Date();

    const userRecord = {
      id,
      username: userData.name,
      email: userData.email,
      password: hashedPassword,
      user_type: userData.userType || 'student',
      profile: null,
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    };

    await Database.createUser(userRecord);

    return {
      id,
      username: userData.name,
      email: userData.email,
      password: hashedPassword,
      user_type: userData.userType || 'student',
      created_at: now,
      updated_at: now
    };
  }

  static async findByEmail(email: string): Promise<IUser | null> {
    const user = await Database.getUserByEmail(email) as any;

    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      password: user.password,
      user_type: user.user_type,
      profile: user.profile ? JSON.parse(user.profile) : null,
      created_at: new Date(user.created_at),
      updated_at: new Date(user.updated_at)
    };
  }

  static async findById(id: string): Promise<IUser | null> {
    const user = await Database.getUserById(id) as any;

    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      password: user.password,
      user_type: user.user_type,
      profile: user.profile ? JSON.parse(user.profile) : null,
      created_at: new Date(user.created_at),
      updated_at: new Date(user.updated_at)
    };
  }

  static async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updateById(id: string, updateData: Partial<IUser>): Promise<boolean> {
    try {
      await Database.updateUser(id, updateData);
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  }

  static async deleteById(id: string): Promise<boolean> {
    try {
      await Database.deleteUser(id);
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  static async list(limit: number = 50, offset: number = 0): Promise<IUser[]> {
    const users = await Database.getUsers(limit, offset) as any[];

    return users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      password: '', // Don't expose password
      user_type: user.user_type,
      profile: user.profile ? JSON.parse(user.profile) : null,
      created_at: new Date(user.created_at),
      updated_at: new Date(user.updated_at)
    }));
  }
}

export default User;