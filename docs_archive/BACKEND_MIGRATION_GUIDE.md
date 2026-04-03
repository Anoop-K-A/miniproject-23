# Faculty Portal - Backend Migration Complete Guide

## 🎯 Overview

This document provides a comprehensive guide for migrating your Faculty Portal from JSON-based storage to a full-stack application with Express.js backend and Firebase services.

---

## 📊 Architecture Comparison

### Before (JSON-based)

```
Frontend (Next.js)
    ↓
JSON Files (src/data/)
    ↓
Local File System
```

### After (Backend-based)

```
Frontend (Next.js)
    ↓
Express API (Port 5000)
    ↓
    ├→ Firebase Authentication
    ├→ Firebase Firestore
    └→ Firebase Storage
```

---

## 🗂️ Complete Folder Structure

```
faculty-portal/
├── backend/                          # NEW - Express.js backend
│   ├── config/
│   │   └── firebase.config.js       # Firebase Admin SDK setup
│   ├── middleware/
│   │   ├── auth.middleware.js       # JWT/Firebase token verification
│   │   └── upload.middleware.js     # Multer file upload config
│   ├── routes/
│   │   ├── auth.routes.js           # POST /api/auth/register, /login
│   │   ├── user.routes.js           # GET /api/users, PATCH /api/users/:id
│   │   ├── admin.routes.js          # PATCH /api/admin/users/:id/verify
│   │   ├── courseFile.routes.js     # POST /api/course-files/upload
│   │   ├── responsibility.routes.js # Responsibilities management
│   │   └── eventReport.routes.js    # Event reports management
│   ├── scripts/
│   │   ├── migrate-to-firebase.js   # Migrate JSON → Firebase
│   │   └── seed-admin.js            # Create admin account
│   ├── .gitignore
│   ├── package.json
│   ├── server.js                    # Main Express server
│   ├── README.md                    # Full documentation
│   ├── QUICKSTART.md                # Quick setup guide
│   ├── firestore.rules              # Firestore security rules
│   └── firebase-storage.rules       # Storage security rules
│
├── src/                              # Existing Next.js frontend
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── data/                         # OLD - JSON files (can be kept as backup)
│
├── .env.local                        # Environment variables (UPDATE THIS)
└── package.json
```

---

## 🔧 Technology Stack

| Component      | Technology            | Purpose                 |
| -------------- | --------------------- | ----------------------- |
| Frontend       | Next.js 14            | React framework         |
| Backend        | Express.js            | REST API server         |
| Authentication | Firebase Auth         | User authentication     |
| Database       | Firestore             | NoSQL document database |
| File Storage   | Firebase Storage      | Cloud file storage      |
| Language       | JavaScript/TypeScript | Development language    |

---

## 🚀 Setup Process

### Phase 1: Firebase Setup

1. **Create Firebase Project**
   - Go to https://console.firebase.google.com/
   - Create new project: "faculty-portal"
   - Enable Google Analytics (optional)

2. **Enable Authentication**
   - Go to **Authentication** → **Get Started**
   - Enable **Email/Password** provider
   - Save changes

3. **Create Firestore Database**
   - Go to **Firestore Database** → **Create Database**
   - Start in **test mode** (we'll add security rules later)
   - Choose location closest to your users

4. **Enable Storage**
   - Go to **Storage** → **Get Started**
   - Start in **test mode**
   - Same location as Firestore

5. **Get Credentials**
   - **Web App Config**: Project Settings → General → Your apps
   - **Service Account**: Project Settings → Service Accounts → Generate New Private Key

### Phase 2: Backend Installation

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# This installs:
# - express: Web server framework
# - firebase-admin: Firebase Admin SDK
# - multer: File upload handling
# - bcryptjs: Password hashing
# - cors: Cross-origin requests
# - dotenv: Environment variables
```

### Phase 3: Environment Configuration

Update your `.env.local` in the **root folder**:

```env
# Firebase Web Config (from Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=faculty-portal-xxxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=faculty-portal-xxxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=faculty-portal-xxxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:xxxxx

# Firebase Admin SDK
FIREBASE_SERVICE_ACCOUNT_PATH=./backend/firebase-service-account.json

# Backend Server
PORT=5000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### Phase 4: Initialize Admin & Migrate Data

```bash
# Create admin account
npm run seed-admin

# Migrate existing JSON data to Firebase
npm run migrate

# Start backend server
npm run dev
```

### Phase 5: Deploy Security Rules

Copy the rules from `firestore.rules` and `firebase-storage.rules` to Firebase Console:

1. **Firestore Rules**: Firestore Database → Rules → Paste and Publish
2. **Storage Rules**: Storage → Rules → Paste and Publish

---

## 🔐 Admin Account

The system includes a pre-configured admin account:

- **Email**: anoopka.6.7.2004@gmail.com
- **Password**: 123

**⚠️ Important**: Change this password immediately after first login!

---

## 📡 API Endpoints Reference

### Authentication Endpoints

```
POST   /api/auth/register          Register new user
POST   /api/auth/login             Login user (returns token)
POST   /api/auth/verify-token      Verify Firebase ID token
```

### User Management

```
GET    /api/users                  Get all users (admin/auditor/staff-advisor)
GET    /api/users/:id              Get specific user
GET    /api/users/faculty/all      Get all faculty members
PATCH  /api/users/:id              Update user profile
```

### Admin Operations

```
GET    /api/admin/users/pending    Get users awaiting approval
PATCH  /api/admin/users/:id/verify Approve/reject user
PATCH  /api/admin/users/:id/roles  Update user roles
DELETE /api/admin/users/:id        Delete user
GET    /api/admin/stats            Get system statistics
```

### Course Files

```
POST   /api/course-files/upload    Upload new course file
GET    /api/course-files           Get all course files (with filters)
GET    /api/course-files/:id       Get specific file
PATCH  /api/course-files/:id       Update file metadata/status
DELETE /api/course-files/:id       Delete file
```

### Responsibilities

```
GET    /api/responsibilities       Get responsibilities
POST   /api/responsibilities       Create new responsibility
PATCH  /api/responsibilities/:id   Update responsibility
DELETE /api/responsibilities/:id   Delete responsibility
```

### Event Reports

```
GET    /api/event-reports          Get all event reports
POST   /api/event-reports          Create new report (with images)
GET    /api/event-reports/:id      Get specific report
PATCH  /api/event-reports/:id      Update report
DELETE /api/event-reports/:id      Delete report
```

---

## 🔄 Data Flow Examples

### Example 1: User Registration

1. **Frontend** → User fills registration form
2. **API Call** → `POST /api/auth/register`
3. **Backend** → Creates Firebase Auth account
4. **Backend** → Stores user data in Firestore (status: "pending")
5. **Backend** → Returns success message
6. **Admin** → Logs in and approves user
7. **Admin Action** → `PATCH /api/admin/users/:id/verify`
8. **Backend** → Updates status to "active"
9. **User** → Can now log in

### Example 2: File Upload

1. **Frontend** → Faculty selects file and fills metadata
2. **API Call** → `POST /api/course-files/upload` (multipart/form-data)
3. **Backend** → Validates authentication
4. **Backend** → Uploads file to Firebase Storage
5. **Backend** → Saves metadata to Firestore
6. **Backend** → Returns file URL and metadata
7. **Frontend** → Displays success message

### Example 3: Admin Verification

1. **Frontend** → Admin views pending users
2. **API Call** → `GET /api/admin/users/pending`
3. **Backend** → Queries Firestore for status="pending"
4. **Backend** → Returns list of pending users
5. **Frontend** → Admin clicks "Approve" on a user
6. **API Call** → `PATCH /api/admin/users/:id/verify { status: "active" }`
7. **Backend** → Updates Firestore document
8. **Backend** → Updates Firebase Auth custom claims
9. **Frontend** → Shows success notification

---

## 🔒 Security Features

### Authentication Flow

1. User registers/logs in via Firebase Client SDK (frontend)
2. Firebase returns ID token (JWT)
3. Frontend stores token (localStorage/session)
4. All API requests include: `Authorization: Bearer <token>`
5. Backend verifies token with Firebase Admin SDK
6. Backend fetches user data from Firestore
7. Backend checks user status and roles
8. Request proceeds if authorized

### Role-Based Access Control (RBAC)

| Role              | Permissions                            |
| ----------------- | -------------------------------------- |
| **Admin**         | Full access to all resources           |
| **Faculty**       | Manage own files, create event reports |
| **Auditor**       | View all files, add audit remarks      |
| **Staff Advisor** | Assign responsibilities, view reports  |

### Security Rules

- **Firestore**: Document-level security rules
- **Storage**: Path-based security rules
- **API**: Middleware-based authentication & authorization

---

## 🧪 Testing Guide

### 1. Test Backend Health

```bash
curl http://localhost:5000/health
```

Expected: `{"status":"ok","message":"Faculty Portal Backend is running"}`

### 2. Test Registration

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456",
    "fullName": "Test User",
    "role": "faculty",
    "department": "Computer Science"
  }'
```

### 3. Test Admin Login (Frontend)

1. Go to http://localhost:3000/login
2. Login with admin credentials
3. Verify dashboard loads

### 4. Test User Approval

1. Login as admin
2. Navigate to user management
3. Approve the test user created earlier
4. Logout and login as test user

### 5. Test File Upload

1. Login as faculty
2. Navigate to course files
3. Upload a test PDF
4. Verify file appears in Firebase Storage
5. Verify metadata in Firestore

---

## 🔄 Migration Checklist

- [ ] Firebase project created and configured
- [ ] Authentication provider enabled
- [ ] Firestore database created
- [ ] Storage bucket created
- [ ] Service account key downloaded
- [ ] `.env.local` updated with credentials
- [ ] Backend dependencies installed
- [ ] Admin account created (`npm run seed-admin`)
- [ ] Existing data migrated (`npm run migrate`)
- [ ] Security rules deployed
- [ ] Backend server running successfully
- [ ] Frontend can communicate with backend
- [ ] User registration works
- [ ] Admin approval works
- [ ] File upload works
- [ ] All existing features functional

---

## 🐛 Common Issues & Solutions

### Issue: "Firebase Admin not initialized"

**Solution**: Check that `firebase-service-account.json` exists and path in `.env.local` is correct

### Issue: "CORS error"

**Solution**: Verify `FRONTEND_URL` in `.env.local` matches your frontend URL

### Issue: "Token verification failed"

**Solution**:

- Ensure you're using Firebase ID token (not custom token)
- Token must be in `Authorization: Bearer <token>` format
- Check token hasn't expired (1 hour default)

### Issue: "File upload fails"

**Solution**:

- Enable Firebase Storage in console
- Update storage rules
- Check bucket name in configuration
- Verify file size is under limit (50MB)

### Issue: "User remains pending after registration"

**Solution**: Admin must approve via `/api/admin/users/:id/verify`

### Issue: "Cannot read from Firestore"

**Solution**: Deploy security rules from `firestore.rules` file

---

## 📊 Monitoring & Logs

### Backend Logs

```bash
# Development mode (with detailed logs)
npm run dev

# Production mode
npm start
```

### Firebase Console Monitoring

1. **Authentication**: View registered users
2. **Firestore**: Browse database collections
3. **Storage**: View uploaded files
4. **Usage**: Monitor quotas and costs

---

## 🌐 Deployment (Production)

### Backend Deployment Options

1. **Heroku**

   ```bash
   heroku create faculty-portal-api
   heroku config:set FIREBASE_PRIVATE_KEY="..."
   git push heroku main
   ```

2. **Railway**
   - Connect GitHub repo
   - Set environment variables
   - Deploy automatically

3. **Google Cloud Run**
   - Containerize backend
   - Deploy to Cloud Run
   - Auto-scaling enabled

### Update Frontend

After deploying backend, update frontend API URL:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

---

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Firestore Data Modeling](https://firebase.google.com/docs/firestore/data-model)
- [Firebase Storage Best Practices](https://firebase.google.com/docs/storage/best-practices)

---

## ✅ Success Criteria

Your migration is complete when:

1. ✅ Backend server starts without errors
2. ✅ Admin can log in successfully
3. ✅ New users can register
4. ✅ Admin can approve users
5. ✅ Faculty can upload files
6. ✅ Files are stored in Firebase Storage
7. ✅ All data is saved in Firestore
8. ✅ Authentication works end-to-end
9. ✅ Role-based access control functions
10. ✅ No JSON files are being used for new operations

---

## 🎉 What's Next?

After successful migration:

1. **Remove JSON file dependencies** from frontend code
2. **Update all API calls** to point to backend
3. **Test all features** thoroughly
4. **Deploy to production**
5. **Monitor usage** in Firebase Console
6. **Set up backups** for Firestore
7. **Implement rate limiting** if needed
8. **Add logging/monitoring** (e.g., Sentry)

---

## 💡 Tips

- Keep JSON files as backup until migration is verified
- Start with development environment before production
- Test each feature after migration
- Monitor Firebase quotas to avoid unexpected costs
- Set up Firebase alerts for quota limits
- Use Firebase Emulator Suite for local development
- Implement proper error handling and logging
- Consider adding Redis for caching frequently accessed data

---

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section
2. Review Firebase Console for errors
3. Check backend server logs
4. Verify all environment variables
5. Ensure security rules are deployed
6. Check Firebase service status

---

**Last Updated**: March 2026
**Version**: 1.0.0
**Maintained by**: Faculty Portal Team
