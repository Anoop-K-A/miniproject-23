/**
 * Migration Script: JSON/MongoDB to Firebase Firestore
 *
 * This script migrates data from JSON files or MongoDB to Firebase Firestore
 * Run with: npx tsx src/lib/migrateToFirestore.ts
 */

import { adminDb } from "./firebaseAdmin";
import { readFileSync } from "fs";
import { join } from "path";

// Helper to read JSON files
function readJsonFile<T>(fileName: string): T {
  try {
    const filePath = join(process.cwd(), "src", "data", fileName);
    const data = readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.warn(`Warning: Could not read ${fileName}:`, error);
    return [] as T;
  }
}

// Convert dates and clean data
function cleanData(obj: any): any {
  const cleaned = { ...obj };

  // Remove undefined values
  Object.keys(cleaned).forEach((key) => {
    if (cleaned[key] === undefined) {
      delete cleaned[key];
    }
    // Convert date strings to Date objects
    if (
      typeof cleaned[key] === "string" &&
      (key.includes("Date") ||
        key.includes("At") ||
        key === "createdAt" ||
        key === "updatedAt")
    ) {
      try {
        cleaned[key] = new Date(cleaned[key]);
      } catch (e) {
        // Keep as string if conversion fails
      }
    }
  });

  return cleaned;
}

async function migrateCollection<T extends { id?: string }>(
  collectionName: string,
  jsonFileName: string,
  options: {
    idField?: string; // Which field to use as document ID
    transform?: (item: T) => any; // Transform function before upload
  } = {},
) {
  console.log(`\n🔄 Migrating ${collectionName}...`);

  try {
    const data = readJsonFile<T[]>(jsonFileName);

    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log(`⚠️  No data found in ${jsonFileName}`);
      return;
    }

    const batch = adminDb.batch();
    let count = 0;

    for (const item of data) {
      // Get or generate document ID
      const idField = options.idField || "id";
      const docId =
        (item as any)[idField] || adminDb.collection(collectionName).doc().id;

      // Transform data if needed
      let docData = options.transform ? options.transform(item) : { ...item };

      // Remove the ID from data (it's used as document key)
      delete (docData as any)[idField];

      // Clean the data
      docData = cleanData(docData);

      const docRef = adminDb.collection(collectionName).doc(docId);
      batch.set(docRef, docData);
      count++;

      // Firestore batch limit is 500 operations
      if (count % 500 === 0) {
        await batch.commit();
        console.log(`   ✓ Committed ${count} documents...`);
      }
    }

    // Commit remaining documents
    if (count % 500 !== 0) {
      await batch.commit();
    }

    console.log(`✅ Successfully migrated ${count} ${collectionName}`);
  } catch (error) {
    console.error(`❌ Error migrating ${collectionName}:`, error);
  }
}

async function main() {
  console.log("🚀 Starting Firebase Firestore migration...\n");
  console.log("=".repeat(50));

  try {
    // Migrate Users
    await migrateCollection("users", "users.json", {
      transform: (user: any) => ({
        name: user.name || user.username || "Unknown",
        email: user.email || user.username || `${user.id}@example.com`,
        emailVerified: user.emailVerified || false,
        phone: user.phone,
        department: user.department,
        image: user.image,
        role: user.role || "faculty",
        roles: user.roles || [user.role || "faculty"],
        approved: user.approved !== false,
        banned: user.banned || false,
        banReason: user.banReason,
        banExpires: user.banExpires ? new Date(user.banExpires) : null,
        password: user.password,
        firebaseUid: user.firebaseUid,
        createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
        updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(),
      }),
    });

    // Migrate Course Files
    await migrateCollection("courseFiles", "courseFiles.json", {
      transform: (file: any) => ({
        facultyId: file.facultyId,
        courseCode: file.courseCode,
        courseName: file.courseName,
        fileName: file.fileName,
        fileUrl: file.documentUrl || file.fileUrl,
        fileSize: file.size || file.fileSize || 0,
        fileType: file.fileType || "application/pdf",
        uploadDate: file.uploadDate ? new Date(file.uploadDate) : new Date(),
        status: file.status || "Pending",
        semester: file.semester,
        academicYear: file.academicYear,
        description: file.description,
        category: file.category,
        createdAt: file.createdAt ? new Date(file.createdAt) : new Date(),
        updatedAt: file.updatedAt ? new Date(file.updatedAt) : new Date(),
      }),
    });

    // Migrate Audits
    await migrateCollection("audits", "audits.json", {
      transform: (audit: any) => ({
        courseFileId: audit.courseFileId,
        entityType: audit.entityType || "course-file",
        entityId: audit.entityId,
        action: audit.action,
        performedBy: audit.performedBy || audit.auditorId,
        performedAt: audit.performedAt
          ? new Date(audit.performedAt)
          : new Date(),
        changes: audit.changes,
        metadata: audit.metadata,
      }),
    });

    // Migrate Remarks
    await migrateCollection("remarks", "remarks.json", {
      transform: (remark: any) => ({
        courseFileId: remark.courseFileId,
        entityType: remark.entityType || "course-file",
        entityId: remark.entityId,
        content: remark.content || remark.text || "",
        createdBy: remark.createdBy || remark.authorId,
        createdAt: remark.createdAt ? new Date(remark.createdAt) : new Date(),
        updatedAt: remark.updatedAt ? new Date(remark.updatedAt) : new Date(),
        type: remark.type,
        resolved: remark.resolved || false,
      }),
    });

    // Migrate Event Reports
    await migrateCollection("eventReports", "eventReports.json", {
      transform: (report: any) => ({
        facultyId: report.facultyId,
        title: report.title,
        description: report.description || report.content || "",
        eventDate: report.eventDate ? new Date(report.eventDate) : new Date(),
        category: report.category || "General",
        images: report.images || [],
        attachments: report.attachments || [],
        status: report.status || "Pending",
        createdAt: report.createdAt ? new Date(report.createdAt) : new Date(),
        updatedAt: report.updatedAt ? new Date(report.updatedAt) : new Date(),
      }),
    });

    // Migrate Courses
    await migrateCollection("courses", "courses.json");

    // Migrate Faculty
    await migrateCollection("faculty", "faculty.json");

    // Migrate Students
    await migrateCollection("students", "students.json");

    // Migrate Staff Advisors
    await migrateCollection("staffAdvisors", "staffAdvisors.json");

    // Migrate Auditors
    await migrateCollection("auditors", "auditors.json");

    // Migrate Engagements
    await migrateCollection("engagements", "engagements.json");

    console.log("\n" + "=".repeat(50));
    console.log("🎉 Migration completed successfully!");
    console.log("\n⚠️  Important: Remember to:");
    console.log("   1. Update all remaining API routes to use Firestore");
    console.log("   2. Update frontend components to use new API responses");
    console.log("   3. Test thoroughly before removing old data");
    console.log("   4. Set up Firestore security rules in Firebase Console");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run migration
main().catch(console.error);
