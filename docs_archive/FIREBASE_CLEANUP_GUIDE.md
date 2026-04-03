# MongoDB/Prisma Cleanup Guide

After migrating to Firebase, you can optionally remove MongoDB and Prisma dependencies to reduce bundle size.

## ⚠️ Important: Only do this AFTER successful migration and testing!

---

## Step 1: Verify Migration Success

Before removing any dependencies, make sure:

1. ✅ All data has been migrated to Firestore
2. ✅ All API routes have been updated
3. ✅ Application works correctly with Firestore
4. ✅ You have backups of your data

---

## Step 2: Remove Prisma/MongoDB Dependencies

```bash
# Remove Prisma packages
npm uninstall @prisma/client prisma @prisma/adapter-pg

# Remove MongoDB driver
npm uninstall mongodb

# Remove PostgreSQL driver (if not used elsewhere)
npm uninstall pg
```

---

## Step 3: Remove Prisma Files

```bash
# Delete Prisma directory
rm -rf prisma/

# Delete Prisma config
rm prisma.config.ts

# Delete old MongoDB library
rm src/lib/mongoDb.ts
rm src/lib/prisma.ts
```

On Windows PowerShell:

```powershell
Remove-Item -Recurse -Force prisma
Remove-Item prisma.config.ts
Remove-Item src\lib\mongoDb.ts
Remove-Item src\lib\prisma.ts
```

---

## Step 4: Remove DATABASE_URL from Environment

Edit `.env.local` and remove:

```env
DATABASE_URL=mongodb+srv://...
```

---

## Step 5: Update Remaining API Routes

Search for any remaining references:

```bash
# Search for Prisma imports
grep -r "@prisma/client" src/

# Search for mongoDb imports
grep -r "from.*mongoDb" src/

# Search for prisma imports
grep -r "from.*prisma" src/
```

On Windows PowerShell:

```powershell
Get-ChildItem -Recurse src -Include *.ts,*.tsx | Select-String "@prisma/client"
Get-ChildItem -Recurse src -Include *.ts,*.tsx | Select-String "from.*mongoDb"
```

Replace all occurrences:

```typescript
// OLD
import { courseFileDb } from "@/lib/mongoDb";
import { prisma } from "@/lib/prisma";

// NEW
import { courseFileDb } from "@/lib/firestoreDb";
```

---

## Step 6: Update Documentation

Remove references to MongoDB/Prisma in:

- ✅ `FIREBASE_MONGODB_SETUP.md` (can be deleted)
- ✅ `MONGODB_FIREBASE_INTEGRATION.md` (can be deleted)
- ✅ README.md (update to mention Firebase only)

---

## Step 7: Clean Build Cache

```bash
# Remove node_modules and reinstall
rm -rf node_modules
npm install

# Remove Next.js cache
rm -rf .next

# Rebuild
npm run build
```

On Windows PowerShell:

```powershell
Remove-Item -Recurse -Force node_modules
npm install
Remove-Item -Recurse -Force .next
npm run build
```

---

## Step 8: Test Everything

Run comprehensive tests:

1. **Authentication:**
   - Sign up new user
   - Log in existing user
   - Log out

2. **Course Files:**
   - Upload file
   - View files
   - Edit file metadata
   - Delete file

3. **Users:**
   - Create user
   - View user list
   - Update user
   - Delete user

4. **Event Reports:**
   - Create report
   - View reports
   - Update report
   - Delete report

5. **Audits & Remarks:**
   - Create audit
   - Create remark
   - View audit history
   - View remarks

---

## Step 9: (Optional) Remove Migration Scripts

After successful cleanup, you can also remove:

```bash
rm src/lib/migrateJsonToMongo.ts
rm src/lib/migrateFiles.ts
```

Keep `migrateToFirestore.ts` if you might need to re-import data.

---

## Rollback Plan (If Issues Arise)

If you encounter problems:

1. **Restore Dependencies:**

   ```bash
   npm install @prisma/client prisma mongodb
   ```

2. **Restore Files:**
   - Restore from Git: `git checkout HEAD -- src/lib/mongoDb.ts`
   - Or re-download from backup

3. **Restore Database:**
   - If you kept MongoDB running, data should still be there
   - Otherwise, restore from backup

---

## Before/After Comparison

### Before (Hybrid: Firebase Auth + MongoDB):

```
node_modules/ ~500MB
Dependencies:
- firebase
- firebase-admin
- @prisma/client
- prisma
- mongodb
- pg
```

### After (Firebase Only):

```
node_modules/ ~350MB (150MB savings!)
Dependencies:
- firebase
- firebase-admin
```

**Size savings: ~30% reduction in dependencies!**

---

## Final Checklist

- [ ] All API routes updated to use Firestore
- [ ] All data successfully migrated
- [ ] Application tested thoroughly
- [ ] Prisma dependencies removed
- [ ] MongoDB dependencies removed
- [ ] Prisma files deleted
- [ ] Environment variables cleaned
- [ ] Build succeeds without errors
- [ ] All features work correctly
- [ ] Documentation updated

---

## Congratulations! 🎉

Your application now runs 100% on Firebase with a cleaner, more maintainable codebase!

**Benefits:**

- ✅ Single platform (Firebase) for everything
- ✅ Simpler deployment
- ✅ Smaller bundle size
- ✅ No database server management
- ✅ Real-time capabilities built-in
- ✅ Generous free tier
