# Email Verification Implementation Summary

## Overview

Email verification system for faculty registration to gate admin visibility. Faculty must verify their email before admins can see their profile for approval.

## Implementation Completed

### 1. **Shared Token Store** ✅

- **File**: `src/lib/verificationTokenStore.ts`
- **Features**:
  - Stores verification tokens in-memory (24-hour expiry)
  - Functions: `storeVerificationToken()`, `getVerificationToken()`, `deleteVerificationToken()`, `isTokenExpired()`
  - **Note**: For production, migrate to Redis or database storage

### 2. **Email Service** ✅

- **File**: `src/lib/emailService.ts`
- **Functions**:
  - `sendVerificationEmail()` - Sends verification email with HTML template
  - `sendApprovalEmail()` - Sends approval/rejection notifications
  - Uses Nodemailer with Gmail SMTP (configured via `GMAIL_USER` and `GMAIL_PASSWORD`)
  - HTML email templates with professional styling

### 3. **User Store Updates** ✅

- **File**: `src/lib/userStore.ts`
- **Changes**:
  - Added `emailVerified?: boolean` field to `UserRecord` interface
  - New function: `updateUserVerification(firebaseUid, isVerified)` - Updates user's email verification status

### 4. **Registration Endpoint** ✅

- **File**: `src/app/api/auth/register/route.ts`
- **Changes**:
  - Faculty registrations (role="faculty") trigger verification email sending
  - Calls `/api/auth/send-verification` endpoint
  - Returns message: "Account created! Please check your email to verify your account. Admin can only see your profile after email verification."

### 5. **Send Verification Endpoint** ✅

- **File**: `src/app/api/auth/send-verification/route.ts`
- **Features**:
  - POST: Generates token, stores it, sends verification email
  - Accepts: `email`, `fullName`, `firebaseUid`
  - Generates 32-byte hex token using crypto.randomBytes()
  - Returns success/error response

### 6. **Email Verification Endpoint** ✅

- **File**: `src/app/api/auth/verify-email/route.ts`
- **Features**:
  - GET: Returns HTML page with verification spinner
  - POST: Validates token, checks expiry, updates user's `emailVerified` to true
  - Auto-verifies on page load using embedded JavaScript
  - Shows success page (with login link) or error page

### 7. **Verification Page (UI)** ✅

- **File**: `src/app/verify-email/page.tsx`
- **Features**:
  - Manual token entry form (fallback if email not received)
  - Displays verification status
  - Shows success/error messages
  - Links to login after verification

### 8. **Admin Pending Users Filter** ✅

- **File**: `src/app/api/admin/pending-users/route.ts`
- **Changes**:
  - Migrated from Firestore to MongoDB queries
  - GET endpoint now filters for `status="pending" AND emailVerified=true`
  - Returns only email-verified pending users to admin
  - POST handle approve/reject actions with MongoDB updates
  - Updates status to "active" (approve) or "rejected" (reject)

### 9. **Environment Configuration** ✅

- **File**: `.env.local`
- **Variables Added**:
  - `GMAIL_USER`: Gmail address for sending emails
  - `GMAIL_PASSWORD`: Gmail App Password (or regular password)

### 10. **Dependencies** ✅

- **File**: `package.json`
- **Added**: `nodemailer@^6.9.7`

## Registration Flow (Verified)

1. **Faculty Registration**
   - User submits registration form with email, password, name, department
   - System creates Firebase user and MongoDB user with `status="pending"` and `emailVerified=false`
   - Calls `/api/auth/send-verification` with email, fullName, firebaseUid

2. **Verification Email Sent**
   - Endpoint generates 32-byte hex token
   - Stores token in-memory Map with firebaseUid and email
   - Sends HTML email with verification link: `/verify-email?token={token}`

3. **Email Verification**
   - User clicks link (or manually enters token at `/verify-email` page)
   - GET endpoint returns HTML page with spinner
   - Embedded JavaScript calls POST endpoint with token
   - Token validated (checks existence and 24-hour expiry)
   - If valid: `updateUserVerification(firebaseUid, true)` sets `emailVerified=true` in MongoDB
   - Shows success page with login link

4. **Admin Visibility**
   - Admin views pending users via `/api/admin/pending-users`
   - GET endpoint filters for `status="pending" AND emailVerified=true`
   - Only verified users appear in admin's pending list
   - Admin can approve (→ `status="active"`) or reject (→ `status="rejected"`)

5. **Approval Notification** (Ready to implement)
   - Implement API endpoint to call `sendApprovalEmail()` when admin approves/rejects
   - Send notification to user about approval status

## Still TODO

### 1. **Admin Dashboard Updates** (Needed for full integration)

- Component that calls `/api/admin/pending-users` and displays verified users
- Update/create component buttons for approve/reject
- Call POST `/api/admin/pending-users` with action="approve"|"reject"

### 2. **Send Approval Emails** (Partially ready)

- Create endpoint to send approval/rejection emails
- Call `sendApprovalEmail(email, fullName, status)` when admin approves/rejects
- Could be in admin approval button handler or separate endpoint

### 3. **Gmail Configuration** (Manual setup required)

- User must provide actual Gmail credentials
- If 2FA enabled, use Gmail App Password (not regular password)
- Instructions for creating Gmail App Password

### 4. **Production Migration** (For scalability)

- Replace in-memory token store with Redis or MongoDB
- Consider token rate limiting
- Email sending rate limiting

### 5. **Error Handling Enhancements**

- More specific error messages
- Email delivery failure handling
- Resend verification token option

## Testing Checklist

- [ ] Faculty can register
- [ ] Verification email sent with correct token link
- [ ] Email link auto-verifies and shows success page
- [ ] Manual token entry form works
- [ ] User appears in admin pending list after email verification
- [ ] Admin can approve/reject users
- [ ] Approval/rejection emails send (when implemented)
- [ ] Expired tokens are rejected
- [ ] Invalid tokens are rejected

## Configuration

### Environment Variables Required

```
GMAIL_USER=your-gmail@gmail.com
GMAIL_PASSWORD=your-app-password  # Use App Password if 2FA enabled
NEXT_PUBLIC_APP_URL=http://localhost:3000  # For email links
```

### Nodemailer Gmail Notes

- Requires "Less secure apps" enabled OR App Password if 2FA is enabled
- If using 2FA: Generate App Password at https://myaccount.google.com/apppasswords
- Test connection before going to production

## Database Schema Notes

### User Model (MongoDB)

```javascript
{
  _id: ObjectId,
  firebaseUid: string,
  email: string,
  name: string,
  role: string,
  roles: [string],
  status: "pending" | "active" | "rejected",
  emailVerified: boolean,  // NEW
  department: string,
  createdAt: ISO8601,
  updatedAt: ISO8601,
  approvedAt: ISO8601,  // When admin approved
  rejectedAt: ISO8601   // When admin rejected
}
```

### Verification Token Store (In-Memory)

```javascript
Map<token, {
  email: string,
  firebaseUid: string,
  createdAt: timestamp
}>
```

## File Modified/Created Summary

| File                                          | Type     | Status                                                     |
| --------------------------------------------- | -------- | ---------------------------------------------------------- |
| `src/lib/userStore.ts`                        | Modified | Added `emailVerified` field and `updateUserVerification()` |
| `src/lib/emailService.ts`                     | Existing | Already configured                                         |
| `src/lib/verificationTokenStore.ts`           | Created  | Shared token store                                         |
| `src/app/api/auth/register/route.ts`          | Modified | Calls send-verification                                    |
| `src/app/api/auth/send-verification/route.ts` | Modified | Uses shared token store                                    |
| `src/app/api/auth/verify-email/route.ts`      | Modified | Uses shared token store                                    |
| `src/app/verify-email/page.tsx`               | Created  | Manual token entry UI                                      |
| `src/app/api/admin/pending-users/route.ts`    | Modified | Filters by emailVerified                                   |
| `.env.local`                                  | Modified | Added Gmail config                                         |
| `package.json`                                | Modified | Added nodemailer                                           |
