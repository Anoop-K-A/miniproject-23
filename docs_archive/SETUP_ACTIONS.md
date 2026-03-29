# ✅ Your Action Plan - Do These Steps

Follow these steps in order. Check each box as you complete it.

---

## Step 1: Create Firebase Project (10 minutes)

### 1.1 Go to Firebase Console

- [ ] Open https://console.firebase.google.com/
- [ ] Click "Add project" or "Create a project"
- [ ] Name it: `faculty-portal` (or your choice)
- [ ] Click Continue through the setup wizard
- [ ] Finish setup

### 1.2 Enable Authentication

- [ ] In your Firebase project, click "Authentication" in left sidebar
- [ ] Click "Get started"
- [ ] Click "Sign-in method" tab
- [ ] Click "Email/Password"
- [ ] Toggle "Enable" to ON
- [ ] Click "Save"

### 1.3 Create Firestore Database

- [ ] Click "Firestore Database" in left sidebar
- [ ] Click "Create database"
- [ ] Choose "Start in test mode"
- [ ] Select your location (closest to you)
- [ ] Click "Enable"

### 1.4 Enable Storage

- [ ] Click "Storage" in left sidebar
- [ ] Click "Get started"
- [ ] Choose "Start in test mode"
- [ ] Click "Done"

### 1.5 Get Web App Credentials

- [ ] Click the gear icon (⚙️) → "Project settings"
- [ ] Scroll down to "Your apps"
- [ ] Click the "</>" icon (Web)
- [ ] Give it a nickname: "Faculty Portal Web"
- [ ] Click "Register app"
- [ ] **COPY the config object** - you'll need these values!

```javascript
// It looks like this:
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "faculty-portal-xxx.firebaseapp.com",
  projectId: "faculty-portal-xxx",
  storageBucket: "faculty-portal-xxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:xxx",
};
```

### 1.6 Get Admin SDK Credentials

- [ ] Still in "Project settings", click "Service accounts" tab
- [ ] Click "Generate new private key"
- [ ] Click "Generate key" (downloads a JSON file)
- [ ] Save this file as `firebase-service-account.json`
- [ ] Move it to: `C:\Users\anoop\miniproject-23\backend\firebase-service-account.json`

---

## Step 2: Configure Environment Variables (5 minutes)

### 2.1 Open .env.local file

- [ ] Open file: `C:\Users\anoop\miniproject-23\.env.local`
- [ ] If it doesn't exist, create it

### 2.2 Add Firebase Config

Copy your Firebase config values and paste them:

```env
# Firebase Web Config (from Step 1.5)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase Admin SDK
FIREBASE_SERVICE_ACCOUNT_PATH=./backend/firebase-service-account.json

# Backend Server
PORT=5000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

- [ ] Replace all "your-xxx-here" with actual values
- [ ] Save the file

---

## Step 3: Install Backend Dependencies (2 minutes)

### 3.1 Open Terminal (PowerShell)

- [ ] Press `Ctrl + `` (backtick) in VS Code to open terminal
- [ ] Or use Windows Terminal

### 3.2 Navigate to Backend Folder

```powershell
cd C:\Users\anoop\miniproject-23\backend
```

### 3.3 Install Dependencies

```powershell
npm install
```

- [ ] Wait for installation to complete (might take 1-2 minutes)
- [ ] Check for any errors (if errors, share them with me)

---

## Step 4: Create Admin Account (1 minute)

### 4.1 Run Admin Seed Script

Still in the backend folder, run:

```powershell
npm run seed-admin
```

- [ ] You should see: "✅ Admin account is ready!"
- [ ] Admin email: `anoopka.6.7.2004@gmail.com`
- [ ] Admin password: `123`
- [ ] **Remember to change this password later!**

---

## Step 5: Start Backend Server (1 minute)

### 5.1 Start Development Server

```powershell
npm run dev
```

- [ ] You should see: "🚀 Backend server running on port 5000"
- [ ] No errors should appear
- [ ] Keep this terminal window open

---

## Step 6: Test Your Backend (2 minutes)

### 6.1 Test Health Check

**Option A: Using Browser**

- [ ] Open browser
- [ ] Go to: http://localhost:5000/health
- [ ] You should see: `{"status":"ok","message":"Faculty Portal Backend is running"}`

**Option B: Using PowerShell (open a NEW terminal)**

```powershell
curl http://localhost:5000/health
```

### 6.2 Check Firebase Connection

- [ ] Look at your backend terminal
- [ ] You should see: "✅ Firebase Admin initialized successfully"
- [ ] No Firebase errors

---

## Step 7: Deploy Security Rules (5 minutes)

### 7.1 Deploy Firestore Rules

- [ ] Go to Firebase Console → Firestore Database
- [ ] Click "Rules" tab
- [ ] Replace everything with content from: `backend/firestore.rules`
- [ ] Click "Publish"

### 7.2 Deploy Storage Rules

- [ ] Go to Firebase Console → Storage
- [ ] Click "Rules" tab
- [ ] Replace everything with content from: `backend/firebase-storage.rules`
- [ ] Click "Publish"

---

## Step 8: (Optional) Migrate Existing Data (5 minutes)

**Only if you have existing JSON data to migrate**

### 8.1 Run Migration Script

In backend folder:

```powershell
npm run migrate
```

- [ ] Script will migrate:
  - users.json → Firebase
  - courseFiles.json → Firebase
  - eventReports.json → Firebase
  - responsibilities.json → Firebase

---

## ✅ You're Done! What's Next?

### Your Backend is Now Running! 🎉

**Test these endpoints:**

1. **Health Check** ✅

   ```
   GET http://localhost:5000/health
   ```

2. **Register a Test User**
   - Use your frontend, OR
   - Use Postman collection: `backend/Faculty_Portal_API.postman_collection.json`

3. **Login as Admin**
   - Email: `anoopka.6.7.2004@gmail.com`
   - Password: `123`

---

## 🔄 Next: Update Frontend

Now that your backend is running, follow:
**[FRONTEND_INTEGRATION_GUIDE.md](FRONTEND_INTEGRATION_GUIDE.md)**

This will show you how to:

1. Create API client (`src/lib/api.ts`)
2. Update authentication components
3. Update file upload components
4. Connect all features to backend

---

## 🐛 Having Issues?

### Backend won't start?

- Check if port 5000 is in use: `netstat -ano | findstr :5000`
- Verify Firebase credentials in `.env.local`
- Check if `firebase-service-account.json` exists

### Firebase errors?

- Verify all services are enabled in Firebase Console
- Check if credentials are correct
- Ensure service account JSON file is valid

### Cannot connect?

- Make sure backend is running (`npm run dev`)
- Check firewall isn't blocking port 5000
- Try `http://localhost:5000/health` in browser

---

## 📞 Need Help?

### Quick references:

- **[backend/README.md](backend/README.md)** - Complete API documentation
- **[BACKEND_MIGRATION_GUIDE.md](BACKEND_MIGRATION_GUIDE.md)** - Detailed guide
- **Troubleshooting** - Check the docs above

### Common commands:

```powershell
# Start backend
cd backend
npm run dev

# Create admin again (if needed)
npm run seed-admin

# Migrate data
npm run migrate

# Stop server
Ctrl + C
```

---

## 🎯 Progress Tracker

**Setup Complete When:**

- [ ] Firebase project created and configured
- [ ] Environment variables set in `.env.local`
- [ ] Dependencies installed (`npm install` done)
- [ ] Admin account created
- [ ] Backend server running without errors
- [ ] Health check returns success
- [ ] Security rules deployed

**Then move to frontend integration!**

---

<div align="center">

**You got this! 🚀**

If you get stuck at any step, let me know which step number and I'll help you.

</div>
