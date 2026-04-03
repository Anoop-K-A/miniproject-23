# Deployment Cleanup Scripts

These scripts help prepare your application for deployment by clearing test data and preserving only essential data.

## Available Scripts

### 1. **cleanup:deployment** - JSON Files Cleanup

```bash
npm run cleanup:deployment
```

**What it does:**

- Clears all JSON data files (courseFiles.json, eventReports.json, students.json, etc.)
- Clears subdirectory data in `src/data/files/`, `src/data/reports/`, and `src/data/dashboards/`
- Preserves admin user and settings

**Safe to run:** ✅ Yes - Only clears JSON files, doesn't touch MongoDB

### 2. **cleanup:mongodb:deployment** - MongoDB Collections Cleanup

```bash
npm run cleanup:mongodb:deployment
```

**What it does:**

- Connects to MongoDB using `MONGODB_URI` env variable
- Clears all faculty course files, event reports, and students
- Removes all non-admin users
- Preserves admin users

**Requirements:**

- MongoDB must be running locally or `MONGODB_URI` must be set
- Run from project root directory

**Safe to run:** ✅ Yes - Preserves admin user roles

### 3. **cleanup:firebase:delete** - Firebase Cleanup

```bash
npm run cleanup:firebase:delete
```

**What it does:**

- Finds and deletes orphaned Firebase accounts (accounts without corresponding local users)

See [cleanup-orphaned-firebase-accounts.mjs](./cleanup-orphaned-firebase-accounts.mjs) for details.

---

## Pre-Deployment Checklist

Before deploying to production, run these in order:

```bash
# 1. Clear JSON test data
npm run cleanup:deployment

# 2. Clear MongoDB student/faculty data (keep admin)
npm run cleanup:mongodb:deployment

# 3. Clear orphaned Firebase accounts (if using Firebase)
npm run cleanup:firebase:delete

# 4. Build for production
npm run build

# 5. Test locally
npm run start

# 6. Deploy
# Your deployment command here
```

---

## Data Cleared

### JSON Files

- `courseFiles.json` - Faculty course files
- `eventReports.json` - Event reports
- `students.json` - Student records
- `careerActivities.json` - Career activities
- `audits.json` - Audit records
- `remarks.json` - Remark records
- `auditorMessages.json` - Auditor messages
- `engagements.json` - Engagement records
- `assignments.json` - Assignments
- `responsibilities.json` - Responsibilities
- `files/course-files.json` - Backup course files
- `reports/event-reports.json` - Backup event reports
- `dashboards/*.json` - Dashboard caches

### MongoDB Collections

- All documents from `coursefiles`, `eventreports`, `students`
- All documents from `careeractivities`, `audits`, `remarks`
- All non-admin users from `users` collection

### Preserved

- ✅ Admin users in MongoDB
- ✅ Admin accounts in Firebase (if used)
- ✅ Application configuration files
- ✅ Environment variables

---

## After Cleanup

Once deployed with clean data:

1. **Create new admin user:**

   ```bash
   npm run seed:admin  # Or your admin creation script
   ```

2. **Add test data (optional):**

   ```bash
   # Create a few test users and faculty members
   # via the UI or API endpoints
   ```

3. **Verify deployment:**
   - Check admin login works
   - Verify dashboard loads without errors
   - Check API endpoints respond correctly

---

## Troubleshooting

### MongoDB connection error

```
Error: Cannot connect to MongoDB
```

**Solution:**

- Ensure MongoDB is running: `mongod`
- Or set `MONGODB_URI` environment variable pointing to your MongoDB instance

### Files not found error

```
Error: ENOENT: no such file or directory
```

**Solution:** This is normal - script skips files that don't exist. Verify with:

```bash
ls -la src/data/
```

### Permission denied error

```
Error: EACCES: permission denied
```

**Solution:**

- Ensure you have write permissions to `src/data/`
- Try: `chmod 755 src/data/`

---

## Rollback

If you need to restore data:

1. Git restore from previous commit: `git checkout HEAD~1 -- src/data/`
2. Restore MongoDB backup if available
3. Restore Firebase using admin console if needed

---

## Need help?

Check the individual script files for more detailed comments and error handling.
