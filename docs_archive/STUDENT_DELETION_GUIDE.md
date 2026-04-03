# Student Deletion Guide

## Quick Start

### When Database is Running:

```bash
# Run the deletion script
node scripts/delete-students.mjs
```

This will:

1. ✓ Delete all student activities (student_activities table)
2. ✓ Delete all student documents (student_document table)
3. ✓ Delete all internships (internships table)
4. ✓ Delete all students (student table)

## What Gets Deleted

| Table                | Records Deleted        |
| -------------------- | ---------------------- |
| `student`            | All student records    |
| `student_document`   | All student documents  |
| `student_activities` | All activity records   |
| `internships`        | All internship records |

## Database Connection

Before running the script, ensure:

```bash
# Start PostgreSQL server
# Database should be accessible at localhost:51214
```

## Alternative: Manual SQL

If you prefer direct database access:

```sql
BEGIN TRANSACTION;

DELETE FROM student_activities;
DELETE FROM student_document;
DELETE FROM internships;
DELETE FROM student;

COMMIT;
```

## Verify Deletion

After running the script, verify with:

```bash
npx prisma studio
# Or query directly:
# SELECT COUNT(*) FROM student;
```

## Undo (If Needed)

If you made a backup before deletion, you can restore from backup. Otherwise, deleted data cannot be recovered.

## Notes

- This only deletes PostgreSQL data (Prisma models)
- No API routes or code are deleted
- Student-related UI components remain intact
- You can delete them later if needed
