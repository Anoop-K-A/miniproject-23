# Firebase + MongoDB Setup Guide

## Overview

This project uses **Firebase** for authentication and **MongoDB** for data storage, with **Prisma** as the ORM.

---

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (free tier available)
- Firebase project created

---

## Step 1: MongoDB Atlas Setup

### 1.1 Create MongoDB Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Create a new project
4. Create a cluster (free M0 tier is fine for development)
5. Create a database user with username and password
6. Add your IP address to the network access whitelist

### 1.2 Get Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Select "Node.js" driver
4. Copy the connection string
5. Replace `<password>` and `<username>` with your database credentials

### 1.3 Update .env

```bash
# Copy the connection string and update .env
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/miniproject?retryWrites=true&w=majority"
```

---

## Step 2: Firebase Setup

### 2.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Name it (e.g., "miniproject")
4. Enable Google Analytics if desired
5. Create the project

### 2.2 Enable Authentication

1. Go to "Build" → "Authentication"
2. Click "Get Started"
3. Enable "Email/Password" provider
4. (Optional) Enable Google Sign-in

### 2.3 Create Web App

1. Go to "Project Settings" (gear icon)
2. Click "Add App" → "Web"
3. Register your app
4. Copy the Firebase config object
5. Update `.env.local` with these values:

```
NEXT_PUBLIC_FIREBASE_API_KEY=xxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxxxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxxxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxxxx
```

### 2.4 (Optional) Setup Cloud Storage

1. Go to "Build" → "Storage"
2. Click "Get Started"
3. Use default rules for now
4. This allows file uploads alongside MongoDB storage

---

## Step 3: Database Migration

### 3.1 Generate Prisma Client

```bash
npx prisma generate
```

### 3.2 Migrate Existing JSON Data to MongoDB

```bash
# This script reads from your JSON files and inserts into MongoDB
npx ts-node src/lib/migrateJsonToMongo.ts
```

**What gets migrated:**

- ✅ Course Files
- ✅ Audits
- ✅ Remarks
- ✅ Faculty
- ✅ Students
- ✅ Other data models

---

## Step 4: Run the Project

```bash
npm run dev
```

Visit `http://localhost:3000`

---

## API Endpoints Reference

### Course Files

```bash
# Get all files
GET /api/course-files

# Get files by faculty
GET /api/course-files?facultyId=123

# Get files by course code
GET /api/course-files?courseCode=CS2003

# Create new file
POST /api/course-files
Body: { fileName, courseCode, courseName, ... }

# Update file
PATCH /api/course-files/[id]
Body: { status, facultyResponse, ... }

# Delete file
DELETE /api/course-files/[id]
```

### Audits

```bash
# Get audits for a course file
GET /api/audits?courseFileId=123

# Create audit entry
POST /api/audits
Body: { entityType, entityId, action, ... }
```

### Remarks

```bash
# Get remarks for a course file
GET /api/remarks?courseFileId=123

# Create remark
POST /api/remarks
Body: { courseFileId, content, ... }
```

---

## Firebase Authentication in Components

### Using Firebase Auth Hook

```typescript
import { useFirebaseAuth } from "@/lib/firebaseAuth";

export function MyComponent() {
  const { user, loading, signIn, signUp, logout } = useFirebaseAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <button onClick={() => signIn("email@example.com", "password")}>Sign In</button>;

  return <div>Welcome {user.email}</div>;
}
```

### Using in Next.js Pages

```typescript
"use client";

import { FirebaseAuthProvider } from "@/lib/firebaseAuth";

export default function RootLayout({ children }) {
  return (
    <FirebaseAuthProvider>
      {children}
    </FirebaseAuthProvider>
  );
}
```

---

## Database Model Reference

### CourseFile

```typescript
{
  id: string,
  facultyId: string,
  fileName: string,
  documentUrl: string,
  courseCode: string,
  courseName: string,
  fileType: string,
  uploadDate: string,
  semester: string,
  academicYear: string,
  size?: string,
  status: "Pending" | "Approved" | "Rejected",
  facultyName?: string,
  department?: string,
  createdAt: DateTime,
  updatedAt: DateTime,
  audits: Audit[],
  remarks: Remark[]
}
```

### Audit

```typescript
{
  id: string,
  entityType: string,
  entityId: string,
  courseFileId?: string,
  action?: string,
  performedBy?: string,
  performedAt: DateTime,
  details?: string
}
```

### Remark

```typescript
{
  id: string,
  entityType: string,
  entityId: string,
  courseFileId?: string,
  content: string,
  createdBy?: string,
  createdAt: DateTime,
  updatedAt: DateTime
}
```

---

## Environment Variables Checklist

- [ ] `DATABASE_URL` - MongoDB connection string
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY` - Firebase API key
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Firebase project ID
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID` - Firebase app ID

---

## Troubleshooting

### "MongoDB connection failed"

- Check internet connection
- Verify IP address is whitelisted in MongoDB Atlas
- Test connection string in MongoDB Compass

### "Firebase config is not loaded"

- Ensure `.env.local` has correct `NEXT_PUBLIC_*` variables
- Restart dev server after changing `.env.local`
- Check that variables don't have extra spaces

### "Prisma errors"

- Run `npx prisma generate` to regenerate client
- Check MongoDB connection string in `.env` file
- Ensure database URL has the correct database name

### "File upload not working"

- Check Firebase Storage rules in Firebase Console
- Verify file size is under limit (typically 25MB)
- Ensure course code folder exists in uploads directory

---

## Deployment to Production

### MongoDB Atlas

1. Create a production cluster
2. Create separate database user for production
3. Update DATABASE_URL in production environment

### Firebase

1. Create separate Firebase project for production
2. Create production web app
3. Update Firebase config variables

### Vercel/Railway

```bash
# Add environment variables in dashboard
DATABASE_URL=... (production MongoDB URI)
NEXT_PUBLIC_FIREBASE_API_KEY=...
# ... other Firebase vars
```

---

## Data Retention & Backup

### MongoDB Backup

- MongoDB Atlas includes automatic daily backups
- Configure backup frequency in project settings
- Test restore procedure regularly

### Local Development

- Never commit `.env` files
- Use `.env.local` for local overrides
- Keep JSON files as fallback reference

---

## Support & Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)

---

**Last Updated:** February 25, 2026
