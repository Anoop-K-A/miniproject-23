# 🔥 Firebase Project Setup Guide (Phase 1)

## Step-by-Step Visual Instructions

This guide walks you through creating your Firebase project with screenshots descriptions.

---

## 📍 STEP 1: Create Firebase Project

### 1.1 Open Firebase Console

1. Go to: **https://console.firebase.google.com/**
2. Sign in with your Google account (create one if needed)

**You should see:**

```
┌─────────────────────────────────────────┐
│  Firebase Console                       │
│                                         │
│  [Add project] [or Create a project]    │
│                                         │
│  Existing projects (if any):            │
│  - project-name                         │
└─────────────────────────────────────────┘
```

### 1.2 Click "Add project"

**Next screen shows:**

```
┌─────────────────────────────────────────┐
│  Create a Firebase project              │
│                                         │
│  Project name: [________________]       │
│                                         │
│  ☐ Enable Google Analytics              │
│                                         │
│  [Create project]                       │
└─────────────────────────────────────────┘
```

### 1.3 Enter Project Details

- **Project name:** Type `miniproject-23`
- **Google Analytics:** Uncheck (optional, speeds up creation)
- Click **[Create project]**

⏳ **Wait 1-2 minutes** for Firebase to set up your project

**Success screen:**

```
┌─────────────────────────────────────────┐
│  ✓ Your Firebase project is ready!      │
│                                         │
│  [Continue]                             │
└─────────────────────────────────────────┘
```

Click **[Continue]** → You're now in Firebase Console!

---

## 📱 STEP 2: Register Web App

### 2.1 Find the Web App Registration Button

**In Firebase Console, you should see:**

```
┌──────────────────────────────────────────────┐
│  miniproject-23                              │
│  Project Overview                            │
│                                              │
│  Get started by adding Firebase to your app: │
│  [iOS]  [Android]  [Web] ← Click here       │
│                                              │
│  Or use the + Add app button                 │
└──────────────────────────────────────────────┘
```

Click the **Web icon `</>`**

### 2.2 Register Your Web App

**You'll see a form:**

```
┌──────────────────────────────────────────────┐
│  Register app to get started                 │
│                                              │
│  App nickname:  [________________]           │
│                 miniproject-web              │
│                                              │
│  ☐ Also set up Firebase Hosting              │
│                                              │
│  [Register app]                              │
└──────────────────────────────────────────────┘
```

- **App nickname:** Type `miniproject-web`
- **Firebase Hosting:** Leave unchecked
- Click **[Register app]**

### 2.3 Copy Firebase Config

**Next, you'll see:**

```
┌──────────────────────────────────────────────┐
│  Your Firebase config                        │
│                                              │
│  const firebaseConfig = {                    │
│    apiKey: "AIzaSyD...",                     │
│    authDomain: "miniproject-23.firebaseapp.com",
│    projectId: "miniproject-23",              │
│    storageBucket: "miniproject-23.appspot...",
│    messagingSenderId: "123456789012",        │
│    appId: "1:123456789012:web:abcd1234...",  │
│    measurementId: "G-XXXXXXXXXX"             │
│  };                                          │
│                                              │
│  [Copy]                                      │
└──────────────────────────────────────────────┘
```

✅ **Copy this entire config** (you'll need these values for `.env.local`)

Keep these values ready:

- `apiKey`
- `authDomain`
- `projectId`
- `storageBucket`
- `messagingSenderId`
- `appId`
- `measurementId`

Click **[Continue to console]**

---

## 🔐 STEP 3: Enable Authentication

### 3.1 Navigate to Authentication

**In Firebase Console:**

1. Look for left sidebar menu
2. Click **"Build"** section (expand it)
3. Click **"Authentication"**

```
Left Sidebar:
├── Project Overview
├── Build ↓
│   ├── Authentication ← Click here
│   ├── Firestore Database
│   ├── Storage
│   └── ...
└── ...
```

### 3.2 Get Started with Authentication

**You'll see:**

```
┌──────────────────────────────────────────────┐
│  Authentication                              │
│                                              │
│  Get started with authentication             │
│                                              │
│  [Get started]                               │
└──────────────────────────────────────────────┘
```

Click **[Get started]**

### 3.3 Enable Email/Password

**You'll see sign-in methods:**

```
┌──────────────────────────────────────────────┐
│  Sign-in method                              │
│                                              │
│  Available providers:                        │
│                                              │
│  Provider          Status                    │
│  ─────────────────────────────────────       │
│  Email/Password    [Disabled] ← Click here  │
│  Google            [Disabled]                │
│  Facebook          [Disabled]                │
│  ...                                         │
└──────────────────────────────────────────────┘
```

Click **"Email/Password"** row

### 3.4 Enable It

**Popup appears:**

```
┌──────────────────────────────────────────────┐
│  Email/Password sign-up and sign-in          │
│                                              │
│  Enable Email/Password authentication?       │
│                                              │
│  [Toggle OFF] ← Click to enable              │
│                                              │
│  Email enumeration protection:               │
│  ☐ Enable email enumeration protection       │
│                                              │
│  [Save]                                      │
└──────────────────────────────────────────────┘
```

- Click the **toggle** to turn it ON (turns blue)
- Click **[Save]**

✅ **Email/Password authentication is now enabled!**

---

## 🗄️ STEP 4: Enable Firestore Database

### 4.1 Navigate to Firestore

**In left sidebar:**

```
Build ↓
├── Authentication ✓ Done
├── Firestore Database ← Click here
├── Storage
└── ...
```

Click **"Firestore Database"**

### 4.2 Create Database

**You'll see:**

```
┌──────────────────────────────────────────────┐
│  Firestore Database                          │
│                                              │
│  Cloud Firestore is a cloud-hosted           │
│  NoSQL database...                           │
│                                              │
│  [Create database]                           │
└──────────────────────────────────────────────┘
```

Click **[Create database]**

### 4.3 Choose Production Mode

**Dialog appears:**

```
┌──────────────────────────────────────────────┐
│  Create database                             │
│                                              │
│  Secure rules with Firebase Security Rules   │
│                                              │
│  ○ Production mode ← Select this             │
│  ○ Test mode (opens data to all users)       │
│                                              │
│  Location: [Dropdown ▼]                      │
│            us-central1 (recommended)         │
│                                              │
│  [Create]                                    │
└──────────────────────────────────────────────┘
```

- Select **"Production mode"** ✓
- Location: **us-central1** (or closest to you)
- Click **[Create]**

⏳ **Wait 1-2 minutes** for database to initialize

### 4.4 Configure Security Rules

**Once created, you'll see tabs:**

```
┌──────────────────────────────────────────────┐
│  Firestore Database                          │
│                                              │
│  [Data] [Rules] [Indexes] [Usage]            │
│         ↑ Click here                         │
└──────────────────────────────────────────────┘
```

Click the **[Rules]** tab

### 4.5 Update Rules

**You'll see:**

```
┌──────────────────────────────────────────────┐
│  Default rules (very restrictive)            │
│                                              │
│  rules_version = '2';                        │
│  service cloud.firestore {                   │
│    match /databases/{database}/documents {   │
│      match /{document=**} {                  │
│        allow read, write:                    │
│          if false;                           │
│      }                                       │
│    }                                         │
│  }                                           │
│                                              │
│  [Publish]                                   │
└──────────────────────────────────────────────┘
```

1. **Select all the text** (Ctrl+A)
2. **Delete it**
3. **Paste these rules** (from FIREBASE_COMPLETE_SETUP.md):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
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

    match /users/{userId} {
      allow read: if isSignedIn();
      allow create: if true;
      allow update, delete: if isOwner(userId) || hasRole('admin');
    }

    match /courseFiles/{fileId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update, delete: if hasRole('admin') || hasRole('faculty');
    }

    match /audits/{auditId} {
      allow read: if isSignedIn();
      allow create: if hasRole('auditor') || hasRole('admin');
      allow update, delete: if hasRole('admin');
    }

    match /remarks/{remarkId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update, delete: if hasRole('admin') ||
        resource.data.createdBy == request.auth.uid;
    }

    match /eventReports/{reportId} {
      allow read: if isSignedIn();
      allow create, update: if isSignedIn();
      allow delete: if hasRole('admin');
    }

    match /{document=**} {
      allow read: if isSignedIn();
      allow write: if hasRole('admin');
    }
  }
}
```

4. Click **[Publish]** button

✅ **Firestore database is ready!**

---

## 💾 STEP 5: Enable Cloud Storage

### 5.1 Navigate to Storage

**In left sidebar:**

```
Build ↓
├── Authentication ✓ Done
├── Firestore Database ✓ Done
├── Storage ← Click here
└── ...
```

Click **"Storage"**

### 5.2 Get Started

**You'll see:**

```
┌──────────────────────────────────────────────┐
│  Cloud Storage                               │
│                                              │
│  Start uploading files to your app           │
│                                              │
│  [Get started]                               │
└──────────────────────────────────────────────┘
```

Click **[Get started]**

### 5.3 Choose Production Mode

**Dialog:**

```
┌──────────────────────────────────────────────┐
│  Set up Cloud Storage                        │
│                                              │
│  ○ Production mode ← Select this             │
│  ○ Test mode                                 │
│                                              │
│  Location: [Dropdown ▼]                      │
│            us-central1 (same as Firestore)   │
│                                              │
│  [Done]                                      │
└──────────────────────────────────────────────┘
```

- Select **"Production mode"** ✓
- Location: **us-central1** (match Firestore)
- Click **[Done]**

⏳ **Wait for bucket creation** (~30 seconds)

### 5.4 Update Storage Rules

**Once created, find the [Rules] tab:**

```
┌──────────────────────────────────────────────┐
│  Cloud Storage                               │
│                                              │
│  [Files] [Rules] [Permissions]               │
│           ↑ Click here                       │
└──────────────────────────────────────────────┘
```

Click **[Rules]**

### 5.5 Paste Storage Rules

**Select all, delete, and paste:**

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /uploads/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
                   && request.resource.size < 10 * 1024 * 1024;
    }

    match /course-files/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
                   && request.resource.size < 50 * 1024 * 1024;
    }
  }
}
```

Click **[Publish]**

✅ **Cloud Storage is ready!**

---

## 🔑 STEP 6: Generate Service Account Key

### 6.1 Go to Project Settings

**In Firebase Console:**

Click the **gear icon ⚙️** (top right) → Click **"Project settings"**

### 6.2 Navigate to Service Accounts

**You'll see tabs:**

```
┌──────────────────────────────────────────────┐
│  Project Settings                            │
│                                              │
│  [General] [Integrations] [Service accounts] │
│                             ↑ Click here     │
└──────────────────────────────────────────────┘
```

Click **[Service accounts]** tab

### 6.3 Generate Private Key

**You'll see:**

```
┌──────────────────────────────────────────────┐
│  Service accounts                            │
│                                              │
│  Firebase Admin SDK:                         │
│                                              │
│  [Python] [Node.js] [Java] [Go] [Other]      │
│           ↑ Should be selected               │
│                                              │
│  [Generate new private key]                  │
│         ↑ Click here                         │
└──────────────────────────────────────────────┘
```

Click **[Generate new private key]**

### 6.4 Confirm & Download

**Dialog appears:**

```
┌──────────────────────────────────────────────┐
│  Download private key?                       │
│                                              │
│  ⚠ This key will be downloaded to your       │
│    computer. Keep it secret!                 │
│                                              │
│  [Cancel]  [Generate key]                    │
└──────────────────────────────────────────────┘
```

Click **[Generate key]**

⬇️ **JSON file downloads** → Save it somewhere safe!

---

## ✅ Step 6.5: Extract Key Values

Open the downloaded JSON file and find:

```json
{
  "type": "service_account",
  "project_id": "miniproject-23",        ← COPY THIS
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",  ← COPY THIS
  "client_email": "firebase-adminsdk-xxxxx@miniproject-23.iam.gserviceaccount.com",  ← COPY THIS
  "client_id": "...",
  ...
}
```

**You need these 3 values:**

1. `project_id` = Your Firebase project ID
2. `client_email` = Service account email
3. `private_key` = Full private key with the `\n` characters

---

## 📝 SUMMARY: What You Got

You now have all these values:

### From Firebase Config (Step 2.3):

- ✅ `NEXT_PUBLIC_FIREBASE_API_KEY`
- ✅ `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- ✅ `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- ✅ `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- ✅ `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- ✅ `NEXT_PUBLIC_FIREBASE_APP_ID`
- ✅ `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

### From Service Account Key (Step 6.5):

- ✅ `FIREBASE_PROJECT_ID`
- ✅ `FIREBASE_CLIENT_EMAIL`
- ✅ `FIREBASE_PRIVATE_KEY`

---

## 🎉 Phase 1 COMPLETE!

✅ Firebase Project Created  
✅ Web App Registered  
✅ Authentication Enabled  
✅ Firestore Database Created  
✅ Cloud Storage Configured  
✅ Service Account Created

---

## ➡️ Next: Phase 2 - Configure Environment Variables

1. Go back to your project folder
2. Create `.env.local` file
3. Fill in the values from above
4. Use the guide: **[ACTION_PLAN.md](ACTION_PLAN.md) → Phase 2**

---

**🎊 You did it! Your Firebase project is ready!**
