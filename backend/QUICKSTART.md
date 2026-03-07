# Faculty Portal Backend - Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Firebase Setup (2 minutes)

1. Go to https://console.firebase.google.com/
2. Create a new project or select existing
3. Enable these services:
   - **Authentication** → Email/Password
   - **Firestore Database** → Start in test mode
   - **Storage** → Start in test mode

4. Get credentials:
   - Go to **Project Settings** → **Service Accounts**
   - Click **Generate New Private Key**
   - Download and save as `firebase-service-account.json` in backend folder

### Step 2: Environment Setup (1 minute)

1. Copy your Firebase web config from **Project Settings** → **General**
2. Update `.env.local` in the **root project folder**:

```env
# Add these to your existing .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Backend config
FIREBASE_SERVICE_ACCOUNT_PATH=./backend/firebase-service-account.json
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### Step 3: Install & Run (2 minutes)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create admin account
npm run seed-admin

# (Optional) Migrate existing JSON data
npm run migrate

# Start backend server
npm run dev
```

✅ Backend is now running on http://localhost:5000

---

## 🧪 Test It Works

```bash
# Test health endpoint
curl http://localhost:5000/health

# You should see: {"status":"ok","message":"Faculty Portal Backend is running"}
```

---

## 👤 Admin Login Credentials

- **Email:** anoopka.6.7.2004@gmail.com
- **Password:** 123

⚠️ Change this password after first login!

---

## 🔄 Next Steps

1. **Update Frontend** to use the new backend APIs
2. **Test Registration**: Create a new user through the frontend
3. **Test Login**: Login as admin to approve users
4. **Upload Files**: Test file upload functionality

---

## 📝 Common Commands

```bash
# Start development server (with auto-reload)
npm run dev

# Start production server
npm start

# Reset admin password
npm run seed-admin

# Migrate data from JSON files
npm run migrate
```

---

## 🐛 Quick Troubleshooting

**Server won't start?**

- Check if `firebase-service-account.json` exists in backend folder
- Verify `.env.local` has all required fields
- Check if port 5000 is already in use

**Authentication fails?**

- Verify Firebase Authentication is enabled
- Check that Email/Password provider is enabled in Firebase Console
- Ensure the token is being sent in `Authorization: Bearer <token>` header

**File upload fails?**

- Enable Firebase Storage in Firebase Console
- Update storage rules to allow authenticated uploads
- Check storage bucket name in `.env.local`

---

## 📖 Full Documentation

See [README.md](./README.md) for complete API documentation and detailed setup guide.

---

## 🎯 Architecture Flow

```
Frontend (Next.js)
    ↓
    ↓ HTTP Requests (with Firebase token)
    ↓
Express API (Backend)
    ↓
    ├→ Firebase Authentication (verify token)
    ├→ Firebase Firestore (data storage)
    └→ Firebase Storage (file storage)
```

---

## 📂 Key Files

- `server.js` - Main server entry point
- `config/firebase.config.js` - Firebase initialization
- `routes/*.routes.js` - API endpoint definitions
- `middleware/auth.middleware.js` - Authentication logic
- `scripts/seed-admin.js` - Admin account creation
- `scripts/migrate-to-firebase.js` - Data migration

---

Happy Coding! 🎉
