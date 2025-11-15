# SmartNotes Finder - Educational Resource Platform

A comprehensive educational platform built with Next.js that allows students, teachers, and colleges to upload, search, and discover educational content using AI-powered semantic search.

## Features

### 🎨 Modern Design
- **Poppins font** for clean, modern typography
- **Educational color scheme** (#ECE7E2 and #4A7766)
- **Smooth animations** and hover effects
- **Responsive design** for all devices

### 📚 Core Functionality

#### 1. **Smart File Upload System**
- PDF file upload with metadata extraction
- **Cloudflare R2** storage integration
- **OCR text extraction** using Tesseract.js
- **Label system**: class, subject, topic, section, semester
- **Automatic embedding generation** for semantic search

#### 2. **AI-Powered Search**
- **Semantic search** using sentence transformers
- **Multi-criteria matching**: content, labels, ratings
- **Advanced filtering** by subject, class, semester, uploader type
- **Relevance scoring** with combined metrics

#### 3. **User Profile System**
- **Three user types**: Student, Teacher, College
- **Profile-based recommendations**
- **Authentication system** with JWT
- **Upload permissions** based on user type

#### 4. **Rating & Review System**
- **5-star rating system**
- **Review comments**
- **Rating-based search ranking**
- **Community feedback integration**

#### 5. **Personalized Suggestions**
- **Profile-based recommendations**
- **Interest matching algorithm**
- **Popular content discovery**
- **Guest user support**

### 🛠️ Technology Stack

#### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Hooks** for state management

#### Backend
- **Next.js API Routes**
- **MongoDB** with Mongoose ODM
- **JWT** authentication
- **bcryptjs** for password hashing

#### AI & Processing
- **Tesseract.js** for OCR
- **PDF.js** for PDF processing
- **Simple embeddings** (ready for sentence-transformers)
- **Cosine similarity** for semantic matching

#### Storage
- **Cloudflare R2** for file storage
- **MongoDB** for metadata and search indices

## Installation & Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- Cloudflare R2 account

### 1. Clone the repository
```bash
git clone <repository-url>
cd smartnotesfinder
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/smartnotes

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# Cloudflare R2
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=your-bucket-name
```

### 4. Database Setup
Ensure MongoDB is running and accessible via your MONGODB_URI.

### 5. Cloudflare R2 Setup
1. Create a Cloudflare R2 bucket
2. Generate API tokens with read/write permissions
3. Configure CORS for your domain

### 6. Run the application
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Usage Guide

### For Students
1. **Sign up** with student account
2. **Upload** study materials with proper labels
3. **Search** for content using keywords or filters
4. **Rate and review** helpful materials
5. **Get suggestions** based on your profile and interests

### For Teachers
1. **Create teacher account**
2. **Upload** course materials and resources
3. **Organize content** with detailed metadata
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

### Search & Discovery
- `POST /api/search` - Semantic search with filters
- `GET /api/suggestions` - Personalized content recommendations

### Ratings
- `POST /api/rate` - Add/update file rating
- `GET /api/rate?fileId=<id>` - Get file ratings and reviews

## Database Schema

### Users Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  userType: 'student' | 'teacher' | 'college',
  profile: {
    class: String,
    semester: String,
    subject: String,
    institution: String,
    bio: String
  }
}
```

### Files Collection
```javascript
{
  fileName: String,
  originalName: String,
  cloudflareUrl: String,
  uploaderId: ObjectId,
  uploaderType: String,
  labels: {
    class: String,
    subject: String,
    topic: String,
    section: String,
    semester: String,
    tags: [String]
  },
  ocrText: String,
  embeddings: [Number],
  ratings: {
    averageRating: Number,
    totalRatings: Number,
    ratingsBreakdown: Object
  }
}
```

## Development

### Adding New Features
1. Create API route in `/app/api/`
2. Add corresponding UI components
3. Update database models if needed
4. Test thoroughly with different user types

### Improving Search
- Replace simple embeddings with sentence-transformers
- Add more sophisticated ranking algorithms
- Implement query expansion and relevance feedback

### Performance Optimization
- Implement caching for search results
- Add database indices for better query performance
- Optimize image processing and OCR

## Deployment

### Environment Setup
- Configure production MongoDB instance
- Set up Cloudflare R2 bucket with proper CORS
- Generate secure JWT secrets

### Recommended Platforms
- **Vercel** (recommended for Next.js)
- **Netlify** 
- **AWS** with custom configuration

### Production Considerations
- Enable HTTPS for all communications
- Set up proper error monitoring
- Configure automatic backups for database
- Implement rate limiting for API endpoints

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with proper testing
4. Submit pull request with detailed description

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Open GitHub issues for bugs
- Check documentation for common problems
- Contact developers for feature requests
