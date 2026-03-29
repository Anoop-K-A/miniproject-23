# Faculty Portal Architecture - MongoDB + Firebase Auth

## Overview

This document describes the architecture of the Faculty Portal application which uses:

- **Firebase Authentication** for user login/signup
- **MongoDB** for all data storage
- **Express.js** backend API
- **Local file storage** for uploads

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
│  - React Components                                         │
│  - Firebase Client SDK for Auth                            │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST API
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend (Express.js)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │             API Routes (Port 5000)                    │  │
│  │  - /api/auth      (register, verify-token)           │  │
│  │  - /api/users     (get, update profile)              │  │
│  │  - /api/course-files (upload, list, delete)          │  │
│  │  - /api/responsibilities (CRUD operations)           │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                    │
│         ┌───────────────┼───────────────┐                   │
│         │               │               │                   │
│         ▼               ▼               ▼                   │
│  ┌────────────┐ ┌────────────┐ ┌─────────────┐            │
│  │  Firebase  │ │  MongoDB   │ │   Local     │            │
│  │   Admin    │ │  Database  │ │   Storage   │            │
│  │     SDK    │ │            │ │  (/uploads) │            │
│  └────────────┘ └────────────┘ └─────────────┘            │
└─────────────────────────────────────────────────────────────┘
         │                   │               │
         ▼                   ▼               ▼
    ┌─────────┐        ┌──────────┐    ┌────────┐
    │Firebase │        │ MongoDB  │    │ File   │
    │ Auth    │        │ Server   │    │ System │
    │(Cloud)  │        │(Local)   │    │(Local) │
    └─────────┘        └──────────┘    └────────┘
```

---

## Technology Stack

### Frontend

- **Framework**: Next.js 14 with React
- **Auth Library**: Firebase SDK (firebaseapp)
- **Styling**: Tailwind CSS, Radix UI, Material UI

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js 4.18.2
- **Database**: MongoDB 7.0+ (via Mongoose 7.5.0)
- **Authentication**: Firebase Admin SDK 12.0.0
- **File Upload**: Multer 1.4.5
- **Validation**: Express-validator 7.0.1
- **CORS**: CORS 2.8.5
- **Password Hashing**: bcryptjs 2.4.3
- **Loading**: dotenv 16.3.1

### DevTools

- **Development Server**: Nodemon 3.0.3
- **Database Management**: MongoDB Compass (optional)

---

## Data Flow

### 1. User Registration

```
Frontend                                Backend                  External
  │                                        │                         │
  ├─POST /api/auth/register────────────────>                         │
  │  {email, password, name, role}         │                         │
  │                                        ├─Create Auth User───────>Firebase
  │                                        │<─User UID────────────────┤
  │                                        │                         │
  │                                        ├─Create MongoDB User────>MongoDB
  │                                        │<─Confirm────────────────┤
  │                                        │                         │
  │<────────── 201 + registration response─┤                         │
```

### 2. User Login

```
Frontend                                Backend                  External
  │                                        │                         │
  ├─User enters email/password             │                         │
  │                                        │                         │
  ├─POST /api/auth/create-custom-token─────>                         │
  │  {email, password}                     │                         │
  │                                        ├─Find user in MongoDB───>MongoDB
  │                                        │<─User doc──────────────<┤
  │                                        │                         │
  │                                        ├─Verify password (bcrypt)│
  │                                        │                         │
  │                                        ├─Create custom token────>Firebase
  │                                        │<─Custom token──────────<┤
  │                                        │                         │
  │<────── 200 + custom token──────────────┤                         │
  │                                        │                         │
  ├─Exchange token for ID token (Firebase Client SDK)                │
  │────────────────────────────────────────────────────────────────>Firebase
  │<─────────────────────── ID Token ──────────────────────────────<┤
  │                                        │                         │
  └─Now send ID Token in requests with Authorization header          │
```

### 3. Token Verification (Protected Routes)

```
Frontend                                Backend                  External
  │                                        │                         │
  ├─GET /api/course-files──────────────────>                         │
  │  Headers: {Authorization: "Bearer <ID_TOKEN>"}                  │
  │                                        │                         │
  │                                        ├─Verify ID Token────────>Firebase
  │                                        │<─User UID──────────────<┤
  │                                        │                         │
  │                                        ├─Find user in MongoDB───>MongoDB
  │                                        │<─User + roles─────────<┤
  │                                        │                         │
  │                                        ├─Check permissions       │
  │                                        │                         │
  │<─────────── 200 + files list───────────┤                         │
```

### 4. File Upload

```
Frontend                                Backend                  External
  │                                        │                         │
  ├─POST /api/course-files/upload──────────>                         │
  │  Headers: {Authorization: "Bearer <ID_TOKEN>"}                  │
  │  Body: {file, courseCode, courseName, etc}                     │
  │                                        │                         │
  │                                        ├─Verify token & user     │
  │                                        │                         │
  │                                        ├─Save file to /uploads───>File System
  │                                        │<─File path─────────────<┤
  │                                        │                         │
  │                                        ├─Store metadata────────────>MongoDB
  │                                        │<─File doc ID───────────<┤
  │                                        │                         │
  │<─────── 201 + file metadata────────────┤                         │
  │                                        │                         │
  ├─Later: GET /uploads/{filename}─────────>                         │
  │<──────── Download file from server────────────────────────────┤
```

---

## MongoDB Collections

### Users Collection

```javascript
{
  _id: ObjectId,
  firebaseUid: String,           // Firebase Authentication UID
  email: String,                 // Unique email
  name: String,
  role: String,                  // "admin" | "faculty" | "auditor" | "staff-advisor"
  roles: [String],               // Array of roles
  verified: Boolean,             // Email verified
  status: String,                // "pending" | "active" | "inactive" | "rejected"
  department: String,
  password: String,              // Hashed password (bcrypt)
  createdAt: Date,
  updatedAt: Date
}
```

### UploadedFiles Collection

```javascript
{
  _id: ObjectId,
  fileName: String,              // Unique filename on disk
  originalFileName: String,      // Original filename from upload
  filePath: String,              // Path relative to backend (/uploads/...)
  fileSize: Number,              // In bytes
  fileType: String,              // "pdf", "doc", "image", etc
  mimeType: String,              // "application/pdf", "image/jpeg", etc
  facultyId: ObjectId,           // Reference to User
  courseCode: String,
  courseName: String,
  semester: String,
  academicYear: String,
  status: String,                // "pending" | "approved" | "rejected"
  remarks: String,               // Admin remarks
  uploadedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Responsibilities Collection

```javascript
{
  _id: ObjectId,
  facultyId: ObjectId,           // Reference to User
  type: String,                  // "committee", "duty", "project", etc
  title: String,
  description: String,
  startDate: Date,
  endDate: Date,
  status: String,                // "active" | "inactive" | "completed"
  assignedBy: ObjectId,          // Reference to User (admin/staff-advisor)
  remarks: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Authentication Flow

### 1. Firebase Authentication

- Handles user login/signup
- Issues Firebase ID tokens
- Validates passwords
- Manages user sessions

### 2. Backend Verification

- Receives Firebase ID token from frontend
- Verifies token with Firebase Admin SDK
- Extracts user UID from token
- Looks up user record in MongoDB
- Checks user status and roles
- Returns MongoDB user object for authorization

### 3. Role-Based Access Control (RBAC)

- **Admin**: Full access to all resources
- **Faculty**: Can upload files, view own records
- **Auditor**: Can view and audit files
- **Staff-Advisor**: Can manage responsibilities

---

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/create-custom-token` - Get token for login
- `POST /api/auth/verify-token` - Verify Firebase ID token

### Users

- `GET /api/users` - List all users (admin/auditor/staff-advisor)
- `GET /api/users/:id` - Get user details
- `GET /api/users/faculty/all` - List faculty
- `PATCH /api/users/:id` - Update user profile
- `GET /api/users/admin/pending` - Get pending users (admin)
- `PATCH /api/users/:id/verify` - Verify user (admin)
- `PATCH /api/users/:id/roles` - Update roles (admin)

### Course Files

- `POST /api/course-files/upload` - Upload file
- `GET /api/course-files` - List files
- `GET /api/course-files/:id` - Get file details
- `PATCH /api/course-files/:id` - Update file status
- `DELETE /api/course-files/:id` - Delete file

### Responsibilities

- `GET /api/responsibilities` - List responsibilities
- `POST /api/responsibilities` - Create responsibility
- `PATCH /api/responsibilities/:id` - Update responsibility
- `DELETE /api/responsibilities/:id` - Delete responsibility

---

## File Storage

### Directory Structure

```
backend/
├── uploads/                    # Local file storage
│   ├── filename-1234567.pdf
│   ├── filename-1234568.docx
│   └── filename-1234569.jpg
```

### Access Files

Files are served via Express static middleware:

```
GET /uploads/{filename} → Raw file download
```

### File Metadata

While files are stored on disk, their metadata is in MongoDB:

- Original filename
- Upload timestamp
- Faculty ID
- Course information
- Status (pending/approved/rejected)

---

## Security Considerations

### Authentication

- Firebase handles password security
- Passwords hashed with bcryptjs (cost factor: 10)
- Firebase ID tokens are JWT-based, time-limited

### Authorization

- Middleware verifies user status before allowing access
- Role-based access control on all critical routes
- Users can only access their own resources unless admin

### File Security

- File upload validation (type, size)
- Files stored with unique names (timestamp + hash)
- Static file serving limits access
- Delete operations verify ownership

### Database Security

- MongoDB field validation at schema level
- Indexed fields for performance
- Timestamps for audit trails

---

## Environment Variables

```env
# Firebase Authentication
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
FIREBASE_PROJECT_ID=miniproject-32b81
FIREBASE_CLIENT_EMAIL=...

# MongoDB
MONGODB_URI=mongodb://localhost:27017/faculty-portal
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://admin:password@cluster.mongodb.net/faculty-portal

# Backend
PORT=5000
FRONTEND_URL=http://localhost:3000
```

---

## deployment Considerations

### Development

- Local MongoDB or MongoDB Atlas
- File storage: `/uploads` directory
- Firebase project: Development

### Production

- MongoDB Atlas or managed MongoDB
- File storage: Cloud storage (AWS S3, Azure Blob, GCS) or CDN
- Firebase project: Production
- HTTPS required
- Environment variables in secure vault
- Database backups enabled
- File upload size limits enforced
- CORS configured for production domain

---

## Troubleshooting

### MongoDB Connection Error

- Verify `MONGODB_URI` in `.env.local`
- Check MongoDB server is running
- Verify network access (if using Atlas, check IP whitelist)

### File Upload Fails

- Check `/uploads` directory exists and is writable
- Verify file size is under 50MB
- Check disk space is available

### Authentication Fails

- Verify Firebase credentials in `.env.local`
- Check Firebase project exists
- Verify ID token isn't expired (15 min lifetime)

### Permission Denied

- Verify user status is "active"
- Check user role in MongoDB
- Verify role-based middleware is applied correctly
