import sqlite3 from "sqlite3";
import { promisify } from "util";
import path from "path";
import fs from "fs";

// Enable verbose mode
sqlite3.verbose();

// Database path
const DB_PATH = path.join(process.cwd(), "data", "smartnotes.db");

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create database instance
const db = new sqlite3.Database(DB_PATH);

// Promisify sqlite functions
const runAsync = (sql: string, params: any[] = []): Promise<any> =>
  new Promise<any>((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });

const getAsync = <T = any>(sql: string, params: any[] = []): Promise<T | undefined> =>
  new Promise<T | undefined>((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row as T | undefined);
    });
  });

const allAsync = <T = any>(sql: string, params: any[] = []): Promise<T[]> =>
  new Promise<T[]>((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });

// =============================
// INIT DATABASE
// =============================
export async function initializeDatabase() {
  try {
    await runAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await runAsync(`
      CREATE TABLE IF NOT EXISTS files (
        id TEXT PRIMARY KEY,
        file_name TEXT NOT NULL,
        original_name TEXT NOT NULL,
        file_size INTEGER,
        mime_type TEXT,
        file_path TEXT NOT NULL,
        upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        content TEXT DEFAULT '',
        labels TEXT DEFAULT '{}',
        metadata TEXT DEFAULT '{}',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await runAsync(`
      CREATE TABLE IF NOT EXISTS ratings (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        file_id TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (file_id) REFERENCES files (id),
        UNIQUE(user_id, file_id)
      )
    `);

    await runAsync(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        token TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Indexes
    await runAsync(`CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)`);
    await runAsync(`CREATE INDEX IF NOT EXISTS idx_users_username ON users (username)`);
    await runAsync(`CREATE INDEX IF NOT EXISTS idx_files_upload_date ON files (upload_date)`);
    await runAsync(`CREATE INDEX IF NOT EXISTS idx_ratings_file_id ON ratings (file_id)`);
    await runAsync(`CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions (token)`);
    await runAsync(`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions (user_id)`);

    console.log("Database initialized successfully");
  } catch (err) {
    console.error("Failed to initialize database:", err);
    throw err;
  }
}

// =====================================
// DATABASE CLASS OPERATIONS
// =====================================
export class Database {
  // -------- USERS --------
  static async createUser(user: {
    id: string;
    username: string;
    email: string;
    password: string;
  }) {
    await runAsync(
      `INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)`,
      [user.id, user.username, user.email, user.password]
    );
    return user;
  }

  static async getUserById(id: string) {
    return getAsync(`SELECT * FROM users WHERE id = ?`, [id]);
  }

  static async getUserByEmail(email: string) {
    return getAsync(`SELECT * FROM users WHERE email = ?`, [email]);
  }

  static async getUserByUsername(username: string) {
    return getAsync(`SELECT * FROM users WHERE username = ?`, [username]);
  }

  // -------- FILES --------
  static async createFile(file: {
    id: string;
    file_name: string;
    original_name: string;
    file_size?: number;
    mime_type?: string;
    file_path: string;
    content?: string;
    labels?: object;
    metadata?: object;
  }) {
    await runAsync(
      `
      INSERT INTO files 
      (id, file_name, original_name, file_size, mime_type, file_path, content, labels, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        file.id,
        file.file_name,
        file.original_name,
        file.file_size || 0,
        file.mime_type || "",
        file.file_path,
        file.content || "",
        JSON.stringify(file.labels || {}),
        JSON.stringify(file.metadata || {}),
      ]
    );
    return file;
  }

  static async getFileById(id: string) {
    const file: any = await getAsync(`SELECT * FROM files WHERE id = ?`, [id]);
    if (file) {
      file.labels = JSON.parse(file.labels || "{}");
      file.metadata = JSON.parse(file.metadata || "{}");
    }
    return file;
  }

  static async getAllFiles() {
    const rows: any[] = await allAsync(
      `SELECT * FROM files ORDER BY upload_date DESC`
    );
    return rows.map((f) => ({
      ...f,
      labels: JSON.parse(f.labels || "{}"),
      metadata: JSON.parse(f.metadata || "{}"),
    }));
  }

  static async searchFiles(query: string) {
    const q = `%${query}%`;
    const rows: any[] = await allAsync(
      `SELECT * FROM files
       WHERE file_name LIKE ? OR original_name LIKE ? OR content LIKE ?
       ORDER BY upload_date DESC`,
      [q, q, q]
    );

    return rows.map((f) => ({
      ...f,
      labels: JSON.parse(f.labels || "{}"),
      metadata: JSON.parse(f.metadata || "{}"),
    }));
  }

  static async updateFile(id: string, updates: any) {
    const setParts = [];
    const values = [];

    if (updates.content !== undefined) {
      setParts.push(`content=?`);
      values.push(updates.content);
    }
    if (updates.labels !== undefined) {
      setParts.push(`labels=?`);
      values.push(JSON.stringify(updates.labels));
    }
    if (updates.metadata !== undefined) {
      setParts.push(`metadata=?`);
      values.push(JSON.stringify(updates.metadata));
    }

    if (setParts.length === 0) return;

    setParts.push(`updated_at=CURRENT_TIMESTAMP`);
    values.push(id);

    await runAsync(
      `UPDATE files SET ${setParts.join(", ")} WHERE id=?`,
      values
    );
  }

  static async deleteFile(id: string) {
    return runAsync(`DELETE FROM files WHERE id = ?`, [id]);
  }

  // -------- RATINGS --------
  static async createRating(rating: {
    id: string;
    user_id: string;
    file_id: string;
    rating: number;
    review?: string;
  }) {
    await runAsync(
      `INSERT OR REPLACE INTO ratings (id, user_id, file_id, rating, review)
       VALUES (?, ?, ?, ?, ?)`,
      [
        rating.id,
        rating.user_id,
        rating.file_id,
        rating.rating,
        rating.review || "",
      ]
    );
    return rating;
  }

  static async getRatingsByFileId(fileId: string) {
    return allAsync(`SELECT * FROM ratings WHERE file_id = ?`, [fileId]);
  }

  static async getAverageRating(fileId: string) {
    return getAsync(
      `SELECT AVG(rating) as average, COUNT(*) as count FROM ratings WHERE file_id = ?`,
      [fileId]
    );
  }

  // -------- SESSIONS --------
  static async createSession(session: {
    id: string;
    user_id: string;
    token: string;
    expires_at: Date;
  }) {
    await runAsync(
      `INSERT INTO sessions (id, user_id, token, expires_at)
       VALUES (?, ?, ?, ?)`,
      [
        session.id,
        session.user_id,
        session.token,
        session.expires_at.toISOString(),
      ]
    );
    return session;
  }

  static async getSessionByToken(token: string) {
    return getAsync(
      `
      SELECT s.*, u.username, u.email 
      FROM sessions s 
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ? AND s.expires_at > CURRENT_TIMESTAMP
    `,
      [token]
    );
  }

  static async deleteSession(token: string) {
    return runAsync(`DELETE FROM sessions WHERE token=?`, [token]);
  }

  static async cleanExpiredSessions() {
    return runAsync(`DELETE FROM sessions WHERE expires_at <= CURRENT_TIMESTAMP`);
  }
}

// Initialize immediately
initializeDatabase().catch(console.error);

export default Database;
