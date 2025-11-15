import Database from "@/lib/database";
import { v4 as uuidv4 } from 'uuid';

export interface IFile {
  id: string;
  file_name: string;
  original_name: string;
  file_size?: number;
  mime_type?: string;
  file_path: string;
  upload_date?: Date;
  content?: string;
  labels?: any;
  metadata?: any;
  created_at?: Date;
  updated_at?: Date;
}

export class File {
  static async create(fileData: Omit<IFile, 'id' | 'upload_date' | 'created_at' | 'updated_at'>): Promise<IFile> {
    const id = uuidv4();
    const file: IFile = {
      ...fileData,
      id,
      upload_date: new Date(),
      created_at: new Date(),
      updated_at: new Date()
    };
    
    await Database.createFile(file);
    return file;
  }

  static async findById(id: string): Promise<IFile | null> {
    const file = await Database.getFileById(id);
    if (!file) return null;
    
    return {
      ...file,
      upload_date: new Date(file.upload_date),
      created_at: new Date(file.created_at),
      updated_at: new Date(file.updated_at)
    };
  }

  static async findAll(): Promise<IFile[]> {
    const files = await Database.getAllFiles();
    return files.map(file => ({
      ...file,
      upload_date: new Date(file.upload_date),
      created_at: new Date(file.created_at),
      updated_at: new Date(file.updated_at)
    }));
  }

  static async search(query: string): Promise<IFile[]> {
    const files = await Database.searchFiles(query);
    return files.map(file => ({
      ...file,
      upload_date: new Date(file.upload_date),
      created_at: new Date(file.created_at),
      updated_at: new Date(file.updated_at)
    }));
  }

  static async updateById(id: string, updates: { content?: string; labels?: any; metadata?: any }): Promise<boolean> {
    try {
      await Database.updateFile(id, updates);
      return true;
    } catch (error) {
      console.error('Failed to update file:', error);
      return false;
    }
  }

  static async deleteById(id: string): Promise<boolean> {
    try {
      await Database.deleteFile(id);
      return true;
    } catch (error) {
      console.error('Failed to delete file:', error);
      return false;
    }
  }

  // Helper method to generate file URL
  static getFileUrl(fileName: string): string {
    return `/api/files/${encodeURIComponent(fileName)}`;
  }
}

export default File;