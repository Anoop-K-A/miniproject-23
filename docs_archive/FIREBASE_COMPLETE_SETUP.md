# Firebase Complete Setup Guide

## 🔥 Firebase-Only Architecture

This project now uses **Firebase** exclusively for:

- ✅ **Authentication** (Firebase Auth)
- ✅ **Database** (Firestore)
- ✅ **File Storage** (Cloud Storage)

MongoDB and Prisma have been replaced with Firestore.

---

## Prerequisites

- Node.js 18+ installed
- Firebase account (free tier available)
- Google account

---

## Step 1: Create Firebase Project

### 1.1 Go to Firebase Console

1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name (e.g., "miniproject-23")
4. (Optional) Enable Google Analytics
5. Click "Create project" and wait for setup

### 1.2 Register Web App

1. In Firebase Console, click the gear icon ⚙️ → "Project settings"
2. Scroll down to "Your apps"
3. Click the Web icon `</>`
4. Register app with a nickname (e.g., "miniproject-web")
5. **Do NOT check** "Also set up Firebase Hosting" (optional)
6. Click "Register app"
7. Copy the `firebaseConfig` object shown

---

## Step 2: Enable Firebase Authentication

### 2.1 Enable Auth Providers

1. Go to "Build" → "Authentication" in left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable **Email/Password**:
   - Click "Email/Password"
   - Toggle "Enable"
   - Click "Save"
5. (Optional) Enable **Google Sign-in**:
   - Click "Google"
   - Toggle "Enable"
   - Select support email
   - Click "Save"

---

## Step 3: Enable Firestore Database

### 3.1 Create Firestore Database

1. Go to "Build" → "Firestore Database"
2. Click "Create database"
3. Choose **Production mode** (we'll update rules later)
4. Select a location (choose closest to your users)
   - `us-central1` (Iowa) - Good for US
   - `europe-west1` (Belgium) - Good for Europe
   - `asia-south1` (Mumbai) - Good for Asia
5. Click "Enable"

### 3.2 Set Up Security Rules

Once created, go to "Rules" tab and paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    function hasRole(role) {
      return isSignedIn() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roles.hasAny([role]);
    }

    // Users collection
    match /users/{userId} {
      allow read: if isSignedIn();
      allow create: if true; // Allow registration
      allow update, delete: if isOwner(userId) || hasRole('admin');
    }

    // Course files
    match /courseFiles/{fileId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update, delete: if hasRole('admin') || hasRole('faculty');
    }

    // Audits
    match /audits/{auditId} {
      allow read: if isSignedIn();
      allow create: if hasRole('auditor') || hasRole('admin');
      allow update, delete: if hasRole('admin');
    }

    // Remarks
    match /remarks/{remarkId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update, delete: if hasRole('admin') ||
        resource.data.createdBy == request.auth.uid;
    }

    // Event reports
    match /eventReports/{reportId} {
      allow read: if isSignedIn();
      allow create, update: if isSignedIn();
      allow delete: if hasRole('admin');
    }

    // Other collections - adjust as needed
    match /{document=**} {
      allow read: if isSignedIn();
      allow write: if hasRole('admin');
    }
  }
}
```

Click "Publish" to save the rules.

---

## Step 4: Enable Cloud Storage

### 4.1 Create Storage Bucket

1. Go to "Build" → "Storage"
2. Click "Get started"
3. Start in **Production mode**
4. Use default location (same as Firestore)
5. Click "Done"

### 4.2 Set Up Storage Rules

Go to "Rules" tab and paste:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /uploads/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
                   && request.resource.size < 10 * 1024 * 1024; // 10MB limit
    }

    match /course-files/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
                   && request.resource.size < 50 * 1024 * 1024; // 50MB limit
    }
  }
}
```

Click "Publish".

---

## Step 5: Create Service Account (for Admin SDK)

### 5.1 Generate Private Key

1. Go to Project Settings (gear icon ⚙️)
2. Go to "Service accounts" tab
3. Click "Generate new private key"
4. Click "Generate key" - a JSON file will download
5. **Keep this file secure!** Never commit it to Git

### 5.2 Extract Credentials

Open the downloaded JSON file and extract:

- `project_id`
- `client_email`
- `private_key`

---

## Step 6: Configure Environment Variables

Create or update `.env.local` in your project root:

```env
# Firebase Client Config (Public - for browser)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Firebase Admin SDK (Private - for server APIs)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nPrivate\nKey\nHere\n-----END PRIVATE KEY-----\n"
```

**Important Notes:**

- The private key must be wrapped in quotes
- Keep the `\n` characters in the private key
- Never commit `.env.local` to Git (add to `.gitignore`)

---

## Step 7: Install Dependencies

```bash
npm install firebase firebase-admin bcryptjs
npm install -D @types/bcryptjs
```

---

## Step 8: Migrate Existing Data

If you have existing data in JSON files or MongoDB:

```bash
# Install tsx if not already installed
npm install -D tsx

# Run the migration script
npx tsx src/lib/migrateToFirestore.ts
```

This will:

- Read data from `src/data/*.json` files
- Convert and upload to Firestore collections
- Handle date conversions automatically

---

## Step 9: Update Remaining API Routes

The following files have been updated to use Firestore:

- ✅ `src/lib/firestoreDb.ts` - Main database wrapper
- ✅ `src/lib/firebaseAdmin.ts` - Admin SDK config
- ✅ `src/lib/firebase.ts` - Client SDK config
- ✅ `src/app/api/users/route.ts` - Users API
- ✅ `src/app/api/users/[id]/route.ts` - User details API
- ✅ `src/app/api/course-files/route.ts` - Course files API

You need to update other API routes following the same pattern:

**Example pattern:**

```typescript
// OLD (MongoDB/Prisma)
import { courseFileDb } from "@/lib/mongoDb";

// NEW (Firestore)
import { courseFileDb } from "@/lib/firestoreDb";

// The API stays the same!
const files = await courseFileDb.getAll();
```

---

## Step 10: Test Your Setup

### 10.1 Start Development Server

```bash
npm run dev
```

### 10.2 Test Authentication

1. Go to http://localhost:3000
2. Try to sign up with a new account
3. Check Firebase Console → Authentication to see new user

### 10.3 Test Database

1. Create a course file or user
2. Check Firebase Console → Firestore Database
3. You should see new documents

### 10.4 Test Storage

1. Upload a file
2. Check Firebase Console → Storage
3. File should appear in the uploads folder

---

## Step 11: Deploy to Production

### Option A: Vercel (Recommended for Next.js)

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add all environment variables from `.env.local`
5. Deploy!

### Option B: Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

---

## Firestore Collections Structure

Your Firestore database will have these collections:

```
firestore/
├── users/
│   └── {userId}/
│       ├── name
│       ├── email
│       ├── roles[]
│       └── ...
├── courseFiles/
│   └── {fileId}/
│       ├── facultyId
│       ├── courseCode
│       ├── fileName
│       └── ...
├── audits/
├── remarks/
├── eventReports/
├── courses/
├── faculty/
├── students/
└── ... (other collections)
```

---

## Cost Estimation (Firebase Free Tier)

**Firestore:**

- 50K reads/day
- 20K writes/day
- 20K deletes/day
- 1GB storage

**Authentication:**

- Unlimited email/password auth

**Storage:**

- 5GB free storage
- 1GB/day download

**This should be more than enough for development and small production apps!**

---

## Troubleshooting

### Error: "Firebase app named '[DEFAULT]' already exists"

This means Firebase is being initialized twice. Check that you're only importing firebase once per page.

### Error: "Missing or insufficient permissions"

Your Firestore security rules are too restrictive. Review rules in Firebase Console.

### Error: "Service account key is invalid"

Check that:

1. Your private key is properly formatted in `.env.local`
2. The key includes `\n` characters
3. The entire key is wrapped in quotes

### Migration script fails

Make sure:

1. JSON files exist in `src/data/` directory
2. Firebase credentials are correct
3. Firestore is enabled in Firebase Console

---

## Next Steps

1. ✅ Remove MongoDB/Prisma dependencies (optional)
2. ✅ Update all remaining API routes
3. ✅ Test all features thoroughly
4. ✅ Set up Firebase Analytics (optional)
5. ✅ Configure Firebase Functions for advanced features (optional)

---

## Need Help?

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

---

**Congratulations! 🎉 Your app now runs entirely on Firebase!**
