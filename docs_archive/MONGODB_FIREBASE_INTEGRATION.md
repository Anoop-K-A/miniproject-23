# MongoDB & Firebase Integration Guide

## Overview

This document explains how the application integrates Firebase for authentication and MongoDB for data storage through a Node.js/Express-based Next.js API layer.

---

## Architecture Components

### 1. Frontend (Next.js React App)

- **Location:** `src/` directory
- **Responsibilities:**
  - User registration and login UI
  - Role-based dashboard views
  - Data display and management
  - LocalStorage for session persistence

### 2. Backend API Routes (Next.js API Routes)

- **Location:** `src/app/api/`
- **Technology:** Node.js running within Next.js
- **Responsibilities:**
  - Authentication (register, login, logout)
  - User role management
  - Data CRUD operations
  - Business logic

### 3. Database (MongoDB)

- **Provider:** MongoDB Atlas (Cloud)
- **Connection:** Environment variable `DATABASE_URL`
- **ORM:** Prisma (provides type-safe queries)
- **Collections:** Users, CourseFiles, Audits, Remarks, etc.

### 4. Firebase (Optional/Future)

- **Current Status:** Configured for future OAuth integration
- **Planned Usage:**
  - Social authentication (Google, Microsoft)
  - Email verification
  - 2FA/MFA
  - File storage (Firebase Storage)

---

## Current Authentication Flow

### Registration Flow

```
User Form Submission
       ↓
POST /api/auth/register
  ├─ Validate: email, password, fullName, department
  ├─ Hash password with bcrypt
  ├─ Check email uniqueness
  └─ Create User in MongoDB:
     {
       email: string
       password: string (hashed)
       name: string
       department: string
       role: "faculty" (default)
       roles: ["faculty"]
       approved: false (awaiting admin)
       createdAt: timestamp
       updatedAt: timestamp
     }
       ↓
Response:
  {
    message: "User registered successfully",
    user: {id, email, name, department}
  }
       ↓
Redirect to /login
```

### Login Flow

```
User Form Submission
       ↓
POST /api/auth/login
  ├─ Find user by email in MongoDB
  ├─ Compare password with bcrypt.compare()
  ├─ Check approved status
  ├─ Check banned status
  └─ Return user with all roles array:
     {
       id: string
       email: string
       name: string
       role: "faculty" (current role)
       roles: ["faculty", "auditor"] (all assigned roles)
       department: string
       approved: boolean
     }
       ↓
AuthContext.login(user)
  ├─ Store in localStorage
  ├─ Set isAuthenticated = true
  ├─ Set userRole = role
  └─ Set assignedRoles = roles []
       ↓
Redirect to Dashboard
```

---

## Admin Role Management

### Admin Endpoints

#### 1. List All Users

```
GET /api/admin/users?approved=false&role=faculty

Query Parameters:
- approved (optional): "true" | "false"
- role (optional): "faculty" | "auditor" | "staff-advisor" | "admin"

Response:
{
  success: true,
  data: [
    {
      id: string
      email: string
      name: string
      department: string
      role: string
      roles: string[]
      approved: boolean
      banned: boolean
      createdAt: DateTime
      updatedAt: DateTime
    }
  ],
  count: number
}
```

#### 2. Approve User

```
PATCH /api/admin/users/{userId}

Response:
{
  success: true,
  message: "User approved successfully",
  data: {
    id: string
    email: string
    name: string
    role: "faculty"
    roles: ["faculty"]
    approved: true
  }
}
```

#### 3. Assign/Update Roles

```
PUT /api/admin/users/{userId}/roles

Request Body:
{
  roles: ["faculty", "auditor", "staff-advisor"],
  currentRole: "auditor"  // Set as active role
}

Response:
{
  success: true,
  message: "User roles updated successfully",
  data: {
    id: string
    email: string
    name: string
    role: "auditor" (current role)
    roles: ["faculty", "auditor", "staff-advisor"]
    approved: true
  }
}

Validation Rules:
- "faculty" role must always be present
- Array must not be empty
- Only admin can modify roles
```

#### 4. Get Single User

```
GET /api/admin/users/{userId}

Response:
{
  success: true,
  data: {
    id: string
    email: string
    name: string
    department: string
    role: string
    roles: string[]
    approved: boolean
    banned: boolean
    createdAt: DateTime
    updatedAt: DateTime
  }
}
```

---

## Database Schema (Prisma/MongoDB)

### User Model

```prisma
model User {
  id               String      @id @default(cuid()) @map("_id")
  name             String
  email            String      @unique
  emailVerified    Boolean     @default(false)
  phone            String?     @unique
  department       String?
  image            String?

  // Authentication
  password         String?
  firebaseUid      String?     @unique

  // Roles & Status
  role             String      @default("faculty")           // Current role
  roles            String[]    @default(["faculty"])         // All assigned roles
  approved         Boolean     @default(false)               // Admin approval
  banned           Boolean?    @default(false)
  banReason        String?
  banExpires       DateTime?

  // Relations
  sessions         Session[]
  accounts         Account[]
  twoFactor        TwoFactor[]

  // Timestamps
  createdAt        DateTime    @default(now())
  updatedAt        DateTime    @updatedAt
}
```

---

## Environment Variables Required

```env
# MongoDB Connection
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/miniproject?retryWrites=true&w=majority"

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

---

## Setting Up Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env.local`:

```bash
cp .env.local.example .env.local
# Update DATABASE_URL with your MongoDB connection string
```

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. Run Development Server

```bash
npm run dev
```

Server runs on `http://localhost:3000`

---

## Testing the Integration

### Test Registration

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456",
    "fullName": "Test User",
    "department": "Computer Science"
  }'
```

### Test Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456"
  }'
```

### Test Admin - List Users

```bash
curl -X GET http://localhost:3000/api/admin/users?approved=false
```

### Test Admin - Approve User

```bash
curl -X PATCH http://localhost:3000/api/admin/users/{userId} \
  -H "Content-Type: application/json"
```

### Test Admin - Assign Roles

```bash
curl -X PUT http://localhost:3000/api/admin/users/{userId}/roles \
  -H "Content-Type: application/json" \
  -d '{
    "roles": ["faculty", "auditor"],
    "currentRole": "auditor"
  }'
```

---

## Data Flow Summary

```
REGISTRATION
┌─────────────────────────────────────┐
│ 1. User fills registration form     │
│ 2. Frontend validates inputs        │
│ 3. POST to /api/auth/register       │
│ 4. Backend hashes password          │
│ 5. MongoDB stores user              │
│ 6. Response: success message        │
│ 7. User redirected to login         │
└─────────────────────────────────────┘

LOGIN
┌─────────────────────────────────────┐
│ 1. User enters credentials          │
│ 2. POST to /api/auth/login          │
│ 3. Backend fetches from MongoDB     │
│ 4. Password validation (bcrypt)     │
│ 5. Check approval status            │
│ 6. Response: user + roles array     │
│ 7. Frontend stores in AuthContext   │
│ 8. User redirected to dashboard     │
└─────────────────────────────────────┘

ROLE MANAGEMENT (ADMIN)
┌─────────────────────────────────────┐
│ 1. Admin views users list           │
│ 2. Click approve/assign roles       │
│ 3. API call to /api/admin/users/... │
│ 4. Backend updates MongoDB          │
│ 5. User status updated              │
│ 6. Confirmation response            │
└─────────────────────────────────────┘
```

---

## Future Firebase Integration

### When Firebase Authentication is Needed

1. **OAuth Providers**
   - Google Sign-In
   - Microsoft Account
   - GitHub integration

2. **Security Features**
   - Email verification
   - 2FA/MFA
   - Custom claims (roles)

3. **File Storage**
   - Firebase Storage for document uploads
   - CDN delivery

### Implementation Steps

```typescript
// Future: Replace MongoDB password auth with Firebase
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

// Firebase handles auth, MongoDB stores user profile + roles
const handleLogin = async (email, password) => {
  const { user } = await signInWithEmailAndPassword(auth, email, password);

  // Fetch user profile + roles from MongoDB
  const response = await fetch("/api/auth/user-profile", {
    headers: { Authorization: `Bearer ${await user.getIdToken()}` },
  });

  const userData = await response.json();
  return { firebaseUser: user, dbUser: userData };
};
```

---

## Troubleshooting

### "All fields are required" Error

- **Cause:** Missing required fields in registration
- **Fix:** Ensure email, password, fullName, department are all provided

### "Account pending approval" Error

- **Cause:** Admin hasn't approved the user yet
- **Fix:** Wait for admin approval or contact administrator

### "Invalid credentials" Error

- **Cause:** Wrong email or password
- **Fix:** Check email and password, then retry

### MongoDB Connection Error

- **Cause:** DATABASE_URL is incorrect or MongoDB is down
- **Fix:** Verify DATABASE_URL in .env.local, check MongoDB Atlas status

---

## Security Considerations

1. **Password Hashing:** All passwords hashed with bcrypt (10 rounds)
2. **Input Validation:** All endpoints validate required fields
3. **Email Uniqueness:** Email field has unique constraint in MongoDB
4. **Admin Check:** Admin endpoints should have role verification (TODO)
5. **JWT/Sessions:** Consider adding JWT tokens for stateless auth

---

## Next Steps

1. Add admin role verification middleware to admin endpoints
2. Implement JWT or session-based authentication
3. Add email verification flow
4. Integrate Firebase OAuth providers
5. Add rate limiting to auth endpoints
6. Implement password reset flow
7. Add audit logging for admin actions
