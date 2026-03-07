# User Migration Scripts

## migrate-users-to-firebase.ts

This script migrates users from `src/data/users.json` to Firebase Authentication.

### Prerequisites

1. You need a Firebase Admin SDK service account key:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file securely (e.g., `firebase-service-account.json`)

2. Set the environment variable:

   ```bash
   # Windows PowerShell
   $env:FIREBASE_SERVICE_ACCOUNT_PATH="C:\path\to\firebase-service-account.json"

   # Or add to .env.local
   FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
   ```

### Running the Script

```bash
# Install ts-node if not already installed
npm install -g ts-node

# Run the migration script
ts-node scripts/migrate-users-to-firebase.ts
```

### What it does

- Reads all users from `src/data/users.json`
- Creates each user in Firebase Authentication
- Sets their password from the JSON file
- Assigns custom claims for role and department
- Skips users that already exist
- Provides a detailed migration report

### After Migration

Once migrated, users can sign in with their email and password from users.json:

- Admin: `admin@college.edu` / `Admin@123`
- Faculty: `faculty@test.com` / `password123`

### Security Note

**IMPORTANT:** After migration, delete or secure your service account key file. Never commit it to version control!
