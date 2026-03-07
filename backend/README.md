# Backend Setup Guide

## Faculty Portal Backend - Express.js + Firebase

This guide will help you set up and run the backend for the Faculty Portal application.

---

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account with a project created
- Firebase Admin SDK credentials

---

## 🔧 Setup Instructions

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable the following services:
   - **Authentication** (Email/Password provider)
   - **Firestore Database**
   - **Storage**

### 2. Get Firebase Credentials

#### Option A: Service Account Key (Recommended for Production)

1. Go to **Project Settings** > **Service Accounts**
2. Click **Generate New Private Key**
3. Save the JSON file as `firebase-service-account.json` in the backend folder
4. In `.env.local`, add:
   ```
   FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
   ```

#### Option B: Environment Variables (Development)

1. Go to **Project Settings** > **Service Accounts**
2. Copy the configuration values
3. Add to `.env.local`:
   ```
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----\n"
   ```

### 3. Environment Variables

Create a `.env.local` file in the **root directory** with the following:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase Admin SDK (Choose Option A or B)
# Option A: Service Account Path
FIREBASE_SERVICE_ACCOUNT_PATH=./backend/firebase-service-account.json

# Option B: Environment Variables
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY="your-private-key"

# Backend Configuration
PORT=5000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Install Dependencies

```bash
cd backend
npm install
```

### 5. Set Up Admin Account

Run the admin seed script to create the admin account:

```bash
npm run seed-admin
```

This will create an admin account with:

- Email: `anoopka.6.7.2004@gmail.com`
- Password: `123`

### 6. Migrate Existing Data (Optional)

If you have existing JSON data to migrate:

```bash
npm run migrate
```

This will migrate data from:

- `src/data/users.json`
- `src/data/courseFiles.json`
- `src/data/eventReports.json`
- `src/data/responsibilities.json`

---

## 🚀 Running the Backend

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The backend will start on `http://localhost:5000`

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint                 | Description           | Auth Required |
| ------ | ------------------------ | --------------------- | ------------- |
| POST   | `/api/auth/register`     | Register new user     | No            |
| POST   | `/api/auth/login`        | Login user            | No            |
| POST   | `/api/auth/verify-token` | Verify Firebase token | No            |

### Users

| Method | Endpoint                 | Description         | Auth Required                     |
| ------ | ------------------------ | ------------------- | --------------------------------- |
| GET    | `/api/users`             | Get all users       | Yes (Admin/Auditor/Staff-Advisor) |
| GET    | `/api/users/:id`         | Get user by ID      | Yes                               |
| GET    | `/api/users/faculty/all` | Get all faculty     | Yes                               |
| PATCH  | `/api/users/:id`         | Update user profile | Yes                               |

### Admin

| Method | Endpoint                      | Description         | Auth Required |
| ------ | ----------------------------- | ------------------- | ------------- |
| GET    | `/api/admin/users/pending`    | Get pending users   | Yes (Admin)   |
| PATCH  | `/api/admin/users/:id/verify` | Verify/approve user | Yes (Admin)   |
| PATCH  | `/api/admin/users/:id/roles`  | Update user roles   | Yes (Admin)   |
| DELETE | `/api/admin/users/:id`        | Delete user         | Yes (Admin)   |
| GET    | `/api/admin/stats`            | Get dashboard stats | Yes (Admin)   |

### Course Files

| Method | Endpoint                   | Description          | Auth Required       |
| ------ | -------------------------- | -------------------- | ------------------- |
| POST   | `/api/course-files/upload` | Upload course file   | Yes (Faculty/Admin) |
| GET    | `/api/course-files`        | Get all course files | Yes                 |
| GET    | `/api/course-files/:id`    | Get specific file    | Yes                 |
| PATCH  | `/api/course-files/:id`    | Update file metadata | Yes                 |
| DELETE | `/api/course-files/:id`    | Delete course file   | Yes (Owner/Admin)   |

### Responsibilities

| Method | Endpoint                    | Description           | Auth Required             |
| ------ | --------------------------- | --------------------- | ------------------------- |
| GET    | `/api/responsibilities`     | Get responsibilities  | Yes                       |
| POST   | `/api/responsibilities`     | Create responsibility | Yes (Admin/Staff-Advisor) |
| PATCH  | `/api/responsibilities/:id` | Update responsibility | Yes (Admin/Staff-Advisor) |
| DELETE | `/api/responsibilities/:id` | Delete responsibility | Yes (Admin/Staff-Advisor) |

### Event Reports

| Method | Endpoint                 | Description         | Auth Required       |
| ------ | ------------------------ | ------------------- | ------------------- |
| GET    | `/api/event-reports`     | Get event reports   | Yes                 |
| POST   | `/api/event-reports`     | Create event report | Yes (Faculty/Admin) |
| GET    | `/api/event-reports/:id` | Get specific report | Yes                 |
| PATCH  | `/api/event-reports/:id` | Update event report | Yes                 |
| DELETE | `/api/event-reports/:id` | Delete event report | Yes (Owner/Admin)   |

---

## 🔐 Authentication Flow

1. **Registration**: User registers via `/api/auth/register`
   - Creates Firebase Auth account
   - Stores additional data in Firestore
   - Faculty users start with "pending" status

2. **Admin Verification**: Admin approves user via `/api/admin/users/:id/verify`
   - Changes status to "active"
   - Updates custom claims

3. **Login**: User logs in (Frontend uses Firebase Client SDK)
   - Frontend gets Firebase ID token
   - Token is sent in `Authorization: Bearer <token>` header for API calls

4. **API Requests**: All protected routes verify the token
   - Token is validated using Firebase Admin SDK
   - User data is fetched from Firestore
   - Role-based access control is enforced

---

## 📁 Backend Folder Structure

```
backend/
├── config/
│   └── firebase.config.js      # Firebase Admin initialization
├── middleware/
│   ├── auth.middleware.js      # Authentication & authorization
│   └── upload.middleware.js    # File upload configuration
├── routes/
│   ├── auth.routes.js          # Authentication endpoints
│   ├── user.routes.js          # User management endpoints
│   ├── admin.routes.js         # Admin endpoints
│   ├── courseFile.routes.js    # Course file endpoints
│   ├── responsibility.routes.js # Responsibility endpoints
│   └── eventReport.routes.js   # Event report endpoints
├── scripts/
│   ├── migrate-to-firebase.js  # Migration script
│   └── seed-admin.js           # Admin account setup
├── package.json
└── server.js                    # Main server file
```

---

## 🧪 Testing the API

### Using cURL

```bash
# Health check
curl http://localhost:5000/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User",
    "role": "faculty",
    "department": "Computer Science"
  }'
```

### Using Postman

1. Import the endpoints from the API documentation
2. Set up an environment with `BASE_URL=http://localhost:5000`
3. For authenticated requests, add `Authorization: Bearer <firebase-token>` header

---

## 🐛 Troubleshooting

### Firebase initialization error

- Check that your `.env.local` file has the correct Firebase credentials
- Ensure the service account JSON file is in the correct location
- Verify that Firebase Admin SDK is initialized before starting the server

### CORS errors

- Make sure `FRONTEND_URL` in `.env.local` matches your frontend URL
- Check that CORS is properly configured in `server.js`

### File upload fails

- Verify Firebase Storage is enabled
- Check storage bucket name in configuration
- Ensure storage rules allow authenticated users to upload

### Auth token verification fails

- Make sure you're sending the Firebase ID token (not custom token)
- Verify token is in `Authorization: Bearer <token>` format
- Check token hasn't expired

---

## 📝 Notes

- Default password for testing users is visible in the migration script
- Change admin password immediately after first login
- Keep Firebase service account credentials secure and never commit to version control
- Use environment variables for all sensitive configuration
- Monitor Firebase quotas and usage in the Firebase Console

---

## 🔗 Related Documentation

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Express.js Documentation](https://expressjs.com/)
- [Multer (File Upload)](https://github.com/expressjs/multer)

---

## 📞 Support

For issues or questions:

1. Check the troubleshooting section
2. Review Firebase Console for errors
3. Check server logs in the terminal
4. Verify all environment variables are set correctly
