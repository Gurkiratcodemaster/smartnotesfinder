import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

// File system operations with promises
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);
const stat = promisify(fs.stat);

// Storage configuration
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const THUMBNAILS_DIR = path.join(UPLOADS_DIR, 'thumbnails');

// Ensure upload directories exist
async function ensureDirectories() {
  try {
    await mkdir(UPLOADS_DIR, { recursive: true });
    await mkdir(THUMBNAILS_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create upload directories:', error);
  }
}

export class LocalFileStorage {
  static async initialize() {
    await ensureDirectories();
    console.log('Local file storage initialized');
  }

  // Save uploaded file
  static async saveFile(fileBuffer: Buffer, fileName: string, originalName: string): Promise<string> {
    await ensureDirectories();
    
    const filePath = path.join(UPLOADS_DIR, fileName);
    await writeFile(filePath, fileBuffer);
    
    return filePath;
  }

  // Get file
  static async getFile(fileName: string): Promise<Buffer> {
    const filePath = path.join(UPLOADS_DIR, fileName);
    
    try {
      return await readFile(filePath);
    } catch (error) {
      throw new Error(`File not found: ${fileName}`);
    }
  }

  // Get file path
  static getFilePath(fileName: string): string {
    return path.join(UPLOADS_DIR, fileName);
  }

  // Check if file exists
  static async fileExists(fileName: string): Promise<boolean> {
    const filePath = path.join(UPLOADS_DIR, fileName);
    
    try {
      await stat(filePath);
      return true;
    } catch {
      return false;
    }
  }

  // Get file size
  static async getFileSize(fileName: string): Promise<number> {
    const filePath = path.join(UPLOADS_DIR, fileName);
    
    try {
      const stats = await stat(filePath);
      return stats.size;
    } catch {
      return 0;
    }
  }

  // Delete file
  static async deleteFile(fileName: string): Promise<boolean> {
    const filePath = path.join(UPLOADS_DIR, fileName);
    
    try {
      await unlink(filePath);
      return true;
    } catch (error) {
      console.error(`Failed to delete file ${fileName}:`, error);
      return false;
    }
  }

  // Get file URL for serving
  static getFileUrl(fileName: string): string {
    return `/api/files/${encodeURIComponent(fileName)}`;
  }

  // Validate file type
  static isValidFileType(mimeType: string): boolean {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'text/markdown',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    return allowedTypes.includes(mimeType);
  }

  // Get file extension from mime type
  static getFileExtension(mimeType: string): string {
    const mimeToExt: { [key: string]: string } = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'application/pdf': '.pdf',
      'text/plain': '.txt',
      'text/markdown': '.md',
      'application/msword': '.doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx'
    };
    
    return mimeToExt[mimeType] || '';
  }

  // Generate unique filename
  static generateFileName(originalName: string, mimeType: string): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const ext = this.getFileExtension(mimeType) || path.extname(originalName);
    const baseName = path.basename(originalName, path.extname(originalName));
    
    return `${timestamp}_${randomId}_${baseName}${ext}`;
  }

  // Clean up old files (optional maintenance function)
  static async cleanupOldFiles(daysOld: number = 30): Promise<number> {
    const uploadsPath = UPLOADS_DIR;
    let deletedCount = 0;
    
    try {
      const files = fs.readdirSync(uploadsPath);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      for (const file of files) {
        const filePath = path.join(uploadsPath, file);
        const stats = await stat(filePath);
        
        if (stats.mtime < cutoffDate) {
          await unlink(filePath);
          deletedCount++;
        }
      }
    } catch (error) {
      console.error('Failed to cleanup old files:', error);
    }
    
    return deletedCount;
  }

  // Get storage statistics
  static async getStorageStats(): Promise<{
    totalFiles: number;
    totalSizeBytes: number;
    averageSizeBytes: number;
  }> {
    try {
      const files = fs.readdirSync(UPLOADS_DIR);
      let totalSize = 0;
      let fileCount = 0;
      
      for (const file of files) {
        const filePath = path.join(UPLOADS_DIR, file);
        const stats = await stat(filePath);
        
        if (stats.isFile()) {
          totalSize += stats.size;
          fileCount++;
        }
      }
      
      return {
        totalFiles: fileCount,
        totalSizeBytes: totalSize,
        averageSizeBytes: fileCount > 0 ? Math.round(totalSize / fileCount) : 0
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      return { totalFiles: 0, totalSizeBytes: 0, averageSizeBytes: 0 };
    }
  }
}

// Initialize on module load
LocalFileStorage.initialize().catch(console.error);

export default LocalFileStorage;