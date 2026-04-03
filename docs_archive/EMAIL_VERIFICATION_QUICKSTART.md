# Email Verification Quick Start

## What's Been Implemented ✅

### Complete Email Verification System for Faculty Registration

- Faculty register → verification email sent automatically
- User clicks link or manually enters token to verify
- Only verified users appear in admin's pending list
- Admin can approve/reject verified users

## Setup Required (3 Steps)

### Step 1: Configure Gmail Credentials

Edit `.env.local` and add your Gmail credentials:

```
GMAIL_USER=your-email@gmail.com
GMAIL_PASSWORD=your-app-password
```

**How to get Gmail App Password:**

1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification if not already enabled
3. Go to App passwords (bottom of Security page)
4. Select "Mail" and "Windows Computer"
5. Copy the 16-character password and paste into `.env.local`

### Step 2: Set Public App URL (Optional)

If deploying, set in `.env.local`:

```
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Step 3: Test the Flow

1. **Create Faculty Account**
   - Go to `/register`
   - Select "Faculty" role
   - Provide email, password, full name, department
   - Submit

2. **Verify Email**
   - Check email inbox for verification message
   - Click verification link
   - Should redirect to success page

3. **Check Admin View**
   - Login as admin
   - Go to admin dashboard
   - View "Pending Approvals"
   - Your verified account should appear

## File Changes Summary

| Area              | Changes                                               |
| ----------------- | ----------------------------------------------------- |
| **User Model**    | Added `emailVerified?: boolean` field                 |
| **API Endpoints** | Updated pending-users filter to require verified=true |
| **Email Service** | Uses Nodemailer + Gmail SMTP                          |
| **Frontend**      | Created verify-email page with UI                     |
| **Token Storage** | In-memory (24-hour expiry)                            |

## Registration Flow

```
User registers (faculty)
    ↓
Create Firebase + MongoDB user (emailVerified=false)
    ↓
Send verification email with token link
    ↓
User clicks link or enters token manually
    ↓
Verify token (check expiry, validate)
    ↓
Update user: emailVerified=true
    ↓
User appears in admin's pending list
    ↓
Admin approves/rejects
    ↓
Approval/rejection email sent (needs implementation)
```

## API Endpoints

### Registration

```
POST /api/auth/register
Body: { email, password, fullName, role, department }
Response: "Account created! Please check email..."
```

### Send Verification Email

```
POST /api/auth/send-verification
Body: { email, fullName, firebaseUid }
Response: { message: "Email sent", success: true }
```

### Verify Email

```
GET /api/auth/verify-email?token=...
  → Returns HTML page that auto-verifies

POST /api/auth/verify-email
Body: { token: "..." }
Response: { message: "Email verified!", success: true }
```

### Get Pending Users (Admin)

```
GET /api/admin/pending-users
Response: { pendingUsers: [...], count: N }
```

### Approve/Reject User (Admin)

```
POST /api/admin/pending-users
Body: { userId: "...", action: "approve" | "reject" }
```

## Next Steps (Optional Enhancements)

1. **Send Approval Emails** - Have admin system call `sendApprovalEmail()` when approving/rejecting
2. **Migrate Token Storage** - Replace in-memory with Redis for production
3. **Token Resend** - Let users request new verification token if expired
4. **Rate Limiting** - Limit email sending per address to prevent abuse

## Environment Variables Checklist

- [ ] `GMAIL_USER` - Your Gmail address
- [ ] `GMAIL_PASSWORD` - Gmail App Password (NOT regular password if 2FA enabled)
- [ ] `NEXT_PUBLIC_APP_URL` - Your domain (for email links)
- [ ] `MONGODB_URI` - Already configured
- [ ] `FIREBASE_*` - Already configured

## Testing Command

Test Gmail SMTP connection:

```bash
# In project root, create test file:
node -e "
const nodemailer = require('nodemailer');
const t = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASSWORD }
});
t.verify((err, ok) => {
  console.log(err ? 'Error: ' + err : 'Gmail connected!');
  process.exit(err ? 1 : 0);
});
"
```

## Common Issues

### "Cannot find module 'nodemailer'"

- Solution: `npm install nodemailer @types/nodemailer`

### Email not sending

- Check Gmail credentials are correct
- If 2FA enabled, use App Password not regular password
- Check spam folder

### Token expired immediately

- Token expires after 24 hours
- User must verify within 24 hours of registration

### User not appearing in admin list after verification

- Verify `emailVerified=true` in MongoDB
- Check user `status="pending"`
- Reload admin page to refresh
