# SmartNotes Finder - Educational Resource Platform

A comprehensive educational platform built with Next.js that allows students, teachers, and colleges to upload, search, and discover educational content using local file storage and SQLite database.

## 🏗️ **New Local Architecture**

This project uses a **simplified local architecture**:
- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Database**: SQLite for local data storage
- **File Storage**: Local file system storage
- **Authentication**: Local JWT-based authentication
- **Benefits**: No cloud dependencies, simple setup, offline capability

## Quick Start

1. **Install dependencies**: `npm install`
2. **Start the application**: `npm run dev` (runs on http://localhost:3000)
3. **Upload and search files** - everything is stored locally!

## Features

### 🎨 Modern Design
- **Poppins font** for clean, modern typography
- **Educational color scheme** (#ECE7E2 and #4A7766)
- **Smooth animations** and hover effects
- **Responsive design** for all devices

### 📚 Core Functionality

#### 1. **Simple File Upload System**
- Multi-format file upload (images, PDFs, documents)
- **Local file storage** in uploads directory
- **Label system**: subject, topic, tags
- **Metadata storage** in SQLite database

#### 2. **Text-Based Search**
- **Full-text search** across file names and content
- **Label-based filtering** by subject, topic, tags
- **File type filtering**
- **Relevance scoring** based on text similarity

#### 3. **Local User System**
- **User registration and login**
- **JWT authentication** stored locally
- **User sessions** managed in SQLite
- **Secure password hashing**

#### 4. **Rating & Review System**
- **5-star rating system**
- **Review comments**
- **Rating statistics** per file
- **Community feedback integration**

#### 5. **Simple Suggestions**
- **Recent file recommendations**
- **Random content discovery**
- **File popularity based suggestions**

### 🛠️ Technology Stack

#### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Hooks** for state management

#### Backend
- **Next.js API Routes**
- **SQLite** for local database storage
- **JWT** authentication with local sessions
- **bcryptjs** for password hashing

#### File Processing
- **Multer** for file upload handling
- **Local file system** for storage
- **Text similarity** for basic search

#### Storage
- **Local file system** (uploads directory)
- **SQLite database** for metadata and user data

## Installation & Setup

### Prerequisites
- Node.js 18+

### 1. Clone the repository
```bash
git clone <repository-url>
cd smartnotesfinder
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration (Optional)
Create `.env.local` if you want to customize settings:

```env
# JWT Secret (optional, has default)
JWT_SECRET=your-super-secret-jwt-key
```

### 4. Run the application
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

The application will automatically:
- Create the SQLite database (`data/smartnotes.db`)
- Create the uploads directory (`uploads/`)
- Initialize all necessary tables

## Usage Guide

### For Students
1. **Sign up** with a username and email
2. **Upload** study materials with labels (subject, topic, tags)
3. **Search** for content using keywords
4. **Rate and review** helpful materials
5. **Browse suggestions** on the suggestions page

### For Teachers
1. **Create account** (same registration process)
2. **Upload** course materials and resources
3. **Organize content** with detailed labels
4. **View analytics** on content popularity
5. **Discover** relevant teaching materials

### For Colleges/Institutions
1. **Register institutional account**
2. **Bulk upload** course content
3. **Manage** departmental resources
4. **Track** content engagement
5. **Collaborate** with other institutions

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - User login

### File Management
- `POST /api/upload` - Generate upload URL and create file record
- `POST /api/extract-ocr` - Process uploaded file and extract text
## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### File Management
- `POST /api/upload` - Upload files with metadata
- `GET /api/files/[filename]` - Serve uploaded files

### Search & Discovery
- `GET /api/search?q=<query>` - Text-based search with filters
- `GET /api/suggestions` - Simple content recommendations

### Ratings
- `POST /api/rate` - Add/update file rating
- `GET /api/rate?fileId=<id>` - Get file ratings and reviews

## Database Schema (SQLite)

### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Files Table
```sql
CREATE TABLE files (
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
);
```

### Ratings Table
```sql
CREATE TABLE ratings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  file_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (file_id) REFERENCES files (id),
  UNIQUE(user_id, file_id)
);
```

### Sessions Table
```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```
## Development

### Adding New Features
1. Create API route in `/app/api/`
2. Add corresponding UI components
3. Update database utilities if needed (in `lib/database.ts`)
4. Test thoroughly with local storage

### Improving Search
- Add more sophisticated text similarity algorithms
- Implement full-text search indexing in SQLite
- Add file content extraction for better search

### Performance Optimization
- Implement file caching
- Add database indices for better query performance
- Optimize file upload and storage

## Deployment

### Local Production Setup
- Set secure JWT secrets in production
- Configure proper file permissions for uploads directory
- Set up backup scripts for SQLite database

### Recommended Deployment Options
- **Vercel** (for frontend + API routes)
- **VPS with Node.js** (for full local control)
- **Docker container** (for easy deployment)

### Production Considerations
- Enable HTTPS for all communications
- Set up proper error monitoring
- Configure automatic backups for SQLite database and uploads
- Implement rate limiting for API endpoints
- Set proper file size limits

## File Storage Structure

```
smartnotesfinder/
├── data/
│   └── smartnotes.db       # SQLite database
├── uploads/
│   ├── [timestamp]_[id]_[filename]  # Uploaded files
│   └── thumbnails/         # Future: file thumbnails
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with proper testing
4. Submit pull request with detailed description

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please create an issue on GitHub.
For issues and questions:
- Open GitHub issues for bugs
- Check documentation for common problems
- Contact developers for feature requests
