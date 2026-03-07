# 📍 How to Get Your Firebase Configuration Values

This guide shows you **exactly where to find** each value in Firebase Console.

---

## 🎯 All 7 Values Come From ONE Place

**Go to:** Firebase Console → ⚙️ **Project Settings** → **General** tab → **Your apps** section

---

## Step-by-Step Instructions

### Step 1: Open Firebase Console

1. Go to: **https://console.firebase.google.com/**
2. Sign in with your Google account
3. Click your project name

### Step 2: Go to Project Settings

**Look for the gear icon ⚙️ in the top-left corner**

```
Firebase Console
│
├── 📊 Project Overview (current location)
├── ⚙️ Project Settings ← CLICK HERE
│   ├── General
│   ├── Integrations
│   ├── Service Accounts
│   └── ...
```

**Click the gear icon ⚙️** and select **"Project Settings"**

### Step 3: Find "Your apps" Section

**In Project Settings, go to the "General" tab** (should be default)

**Scroll down until you see:**

```
┌─────────────────────────────────────────┐
│  Your apps                              │
│                                         │
│  📱 iOS                                 │
│  🤖 Android                             │
│  💻 Web ← YOUR APP IS HERE              │
│     miniproject-web                     │
│     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                         │
│  Click the app name or SDK config icon  │
└─────────────────────────────────────────┘
```

### Step 4: Click on Your Web App

Click on the **Web app** (should say `miniproject-web` or similar)

### Step 5: See Firebase Config

**You'll see a box like this:**

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD7xxxxxxxxxxxxxx",
  authDomain: "miniproject-23.firebaseapp.com",
  projectId: "miniproject-23",
  storageBucket: "miniproject-23.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
  measurementId: "G-XXXXXXXXXX",
};
```

---

## 📋 Mapping: Firebase Config → Your .env.local

Here's exactly what goes where:

| From Firebase Config | Goes to .env.local                         | Example                          |
| -------------------- | ------------------------------------------ | -------------------------------- |
| `apiKey`             | `NEXT_PUBLIC_FIREBASE_API_KEY`             | `AIzaSyD7...`                    |
| `authDomain`         | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`         | `miniproject-23.firebaseapp.com` |
| `projectId`          | `NEXT_PUBLIC_FIREBASE_PROJECT_ID`          | `miniproject-23`                 |
| `storageBucket`      | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`      | `miniproject-23.appspot.com`     |
| `messagingSenderId`  | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `123456789012`                   |
| `appId`              | `NEXT_PUBLIC_FIREBASE_APP_ID`              | `1:123456789012:web:abc...`      |
| `measurementId`      | `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`      | `G-XXXXXXXXXX`                   |

---

## 📝 Example .env.local File

Here's what it will look like after you fill it in:

```
# Public Firebase Config (copy from Project Settings → General → Your apps → Web)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD7xxxxxxxxxxxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=miniproject-23.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=miniproject-23
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=miniproject-23.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Private Firebase Admin Config (copy from Project Settings → Service Accounts)
FIREBASE_PROJECT_ID=miniproject-23
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@miniproject-23.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQI...\n-----END PRIVATE KEY-----\n"
```

---

## ✅ Visual Walkthrough

### Screen 1: Firebase Console Home

```
┌──────────────────────────────────────┐
│ Firebase Console                     │
│                                      │
│ Your projects:                       │
│ ✓ miniproject-23 ← Click it          │
│   my-other-project                   │
└──────────────────────────────────────┘
```

**Click your project name**

### Screen 2: Project Overview

```
┌──────────────────────────────────────┐
│ miniproject-23                       │
│ Project Overview                     │
│                                      │
│ Left menu:                           │
│ 📊 Project Overview                  │
│ ⚙️ Project Settings ← CLICK HERE     │
│ 🔐 ...                               │
└──────────────────────────────────────┘
```

**Click the gear ⚙️ icon → "Project settings"**

### Screen 3: Project Settings

```
┌──────────────────────────────────────┐
│ Project Settings                     │
│                                      │
│ [General] [Integrations] [Accts]     │
│  ↑ Should be selected                │
│                                      │
│ Content:                             │
│ ├─ Project name: miniproject-23      │
│ ├─ Project ID: miniproject-23        │
│ ├─ ...                               │
│ ├─ Your apps:                        │
│ │  ├─ iOS                            │
│ │  ├─ Android                        │
│ │  └─ Web: miniproject-web ← CLICK   │
│ └─ ...                               │
└──────────────────────────────────────┘
```

**Look for "Your apps" → Click on the Web app**

### Screen 4: Firebase Config Shown

```
┌──────────────────────────────────────┐
│ Firebase SDK Config                  │
│                                      │
│ const firebaseConfig = {             │
│   apiKey: "AIzaSyD...",              │
│   authDomain: "miniproject-23...",   │
│   projectId: "miniproject-23",       │
│   ...                                │
│ };                                   │
│                                      │
│ [Copy icon] ← Click to copy all      │
└──────────────────────────────────────┘
```

**Copy these values and fill in your .env.local**

---

## 🔑 What Each Value Means

**NEXT_PUBLIC_FIREBASE_API_KEY**

- Your Firebase project's API key
- Used for client-side authentication
- Safe to expose in browser

**NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN**

- Your Firebase project's authentication domain
- Format: `your-project.firebaseapp.com`
- Used for sign-in redirects

**NEXT_PUBLIC_FIREBASE_PROJECT_ID**

- Your Firebase project's unique ID
- Example: `miniproject-23`
- Used to identify your project

**NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET**

- Your Cloud Storage bucket
- Format: `your-project.appspot.com`
- Where files get uploaded

**NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID**

- Google Cloud Messaging ID
- Used for push notifications (optional)
- Can be empty if not using notifications

**NEXT_PUBLIC_FIREBASE_APP_ID**

- Unique app identifier
- Format: `1:numbers:web:letters`
- Identifies this specific web app

**NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID**

- Google Analytics measurement ID
- Format: `G-XXXXXXXXXX`
- Optional, for analytics tracking

---

## 🎯 Quick Copy-Paste

Once you see the `firebaseConfig` object, just copy:

```
apiKey                  → NEXT_PUBLIC_FIREBASE_API_KEY
authDomain             → NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
projectId              → NEXT_PUBLIC_FIREBASE_PROJECT_ID
storageBucket          → NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
messagingSenderId      → NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
appId                  → NEXT_PUBLIC_FIREBASE_APP_ID
measurementId          → NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
```

---

## ❓ Can't Find Your Apps Section?

If you don't see "Your apps":

1. Make sure you're in **"Project Settings"** (click gear ⚙️)
2. Make sure you're on the **"General"** tab
3. Scroll down - it should be below the project info
4. If you registered multiple apps, you might see multiple entries

---

## ✅ Troubleshooting

**Problem: "Your apps" section is empty**

- Go back to Project Overview
- Click "Add app" and register your web app again

**Problem: Only see iOS/Android, no Web app**

- Click the Web icon `</>`
- Enter app nickname: `miniproject-web`
- Click "Register app"

**Problem: Can't find the gear icon**

- It should be in TOP-LEFT corner of Firebase Console
- Near the project name
- Or look for "Project settings" link in left sidebar

---

## 📺 Visual Map of Firebase Console

```
Firebase Console
│
├─ 🔝 TOP BAR
│  ├─ Firebase Logo (left)
│  ├─ Project name (middle) - "miniproject-23"
│  └─ ⚙️ Settings gear (right) ← CLICK HERE
│
├─ 📋 LEFT SIDEBAR
│  ├─ Project Overview
│  ├─ Build ↓
│  │  ├─ Authentication
│  │  ├─ Firestore Database
│  │  ├─ Storage
│  │  └─ ...
│  └─ ...
│
└─ 📄 MAIN CONTENT AREA
   ├─ If you clicked gear → Shows Project Settings
   └─ Your apps section is here (scroll down)
```

---

## ⏭️ Next Steps

1. ✅ Find and copy your 7 Firebase config values
2. ✅ Find and copy your 3 Service Account values
3. ✅ Create `.env.local` file in your project
4. ✅ Paste all 10 values
5. ✅ Come back and let me know!

---

**Need help? Come back with the name of your Firebase project and I can give you specific instructions!** 🚀
