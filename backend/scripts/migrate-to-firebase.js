const { auth, db } = require("../config/firebase.config");
const bcrypt = require("bcryptjs");
const fs = require("fs").promises;
const path = require("path");

const DATA_DIR = path.join(__dirname, "../../src/data");

/**
 * Migration script to move data from JSON files to Firebase
 * Run this once after setting up Firebase
 */

async function migrateUsers() {
  console.log("\n📤 Migrating users...");

  try {
    const usersData = await fs.readFile(
      path.join(DATA_DIR, "users.json"),
      "utf-8",
    );
    const users = JSON.parse(usersData);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      try {
        // Check if user already exists
        let userRecord;
        try {
          userRecord = await auth.getUserByEmail(user.username || user.email);
          console.log(`⏭️  User ${user.username} already exists, skipping...`);
          skippedCount++;
          continue;
        } catch (error) {
          if (error.code !== "auth/user-not-found") {
            throw error;
          }
        }

        // Create Firebase Auth user
        let uid;

        // For existing users without Firebase auth, create them
        if (!userRecord) {
          const password = user.password || "DefaultPassword123!";

          userRecord = await auth.createUser({
            email: user.username || user.email,
            password: password,
            displayName: user.name,
            uid: user.id, // Try to preserve the old ID
          });

          uid = userRecord.uid;
        } else {
          uid = userRecord.uid;
        }

        // Set custom claims
        await auth.setCustomUserClaims(uid, {
          role: user.role,
          roles: user.roles || [user.role],
        });

        // Hash password
        const hashedPassword = await bcrypt.hash(
          user.password || "DefaultPassword123!",
          10,
        );

        // Migrate to Firestore
        await db
          .collection("users")
          .doc(uid)
          .set({
            email: user.username || user.email,
            name: user.name,
            role: user.role,
            roles: user.roles || [user.role],
            department: user.department || "",
            phone: user.phone || "",
            facultyRole: user.facultyRole || "",
            specialization: user.specialization || "",
            experience: user.experience || "",
            status: user.status || "active",
            hashedPassword,
            createdAt: user.createdAt || new Date().toISOString(),
            updatedAt: user.updatedAt || new Date().toISOString(),
            lastActiveAt: user.lastActiveAt || null,
          });

        console.log(`✅ Migrated user: ${user.name} (${user.username})`);
        migratedCount++;
      } catch (error) {
        console.error(
          `❌ Failed to migrate user ${user.username}:`,
          error.message,
        );
      }
    }

    console.log(
      `\n✅ Users migration complete: ${migratedCount} migrated, ${skippedCount} skipped`,
    );
  } catch (error) {
    console.error("❌ Error migrating users:", error);
  }
}

async function migrateCourseFiles() {
  console.log("\n📤 Migrating course files...");

  try {
    const courseFilesData = await fs.readFile(
      path.join(DATA_DIR, "courseFiles.json"),
      "utf-8",
    );
    const courseFiles = JSON.parse(courseFilesData);

    let migratedCount = 0;

    for (const file of courseFiles) {
      try {
        // Check if faculty exists in Firebase
        let facultyId = file.facultyId;

        try {
          await db.collection("users").doc(facultyId).get();
        } catch (error) {
          console.log(
            `⚠️  Faculty ${facultyId} not found, skipping file ${file.fileName}`,
          );
          continue;
        }

        // Add to Firestore
        await db.collection("courseFiles").add({
          facultyId: file.facultyId,
          fileName: file.fileName,
          documentUrl: file.documentUrl,
          storagePath: file.documentUrl, // Use local path for now
          courseCode: file.courseCode,
          courseName: file.courseName,
          fileType: file.fileType,
          uploadDate: file.uploadDate,
          semester: file.semester,
          academicYear: file.academicYear,
          size: file.size,
          status: file.status || "Pending",
          facultyName: file.facultyName,
          department: file.department,
          remarks: file.remarks || "",
          auditScore: file.auditScore || null,
          createdAt: file.createdAt || new Date().toISOString(),
          updatedAt: file.updatedAt || new Date().toISOString(),
        });

        console.log(`✅ Migrated course file: ${file.fileName}`);
        migratedCount++;
      } catch (error) {
        console.error(
          `❌ Failed to migrate course file ${file.fileName}:`,
          error.message,
        );
      }
    }

    console.log(
      `\n✅ Course files migration complete: ${migratedCount} migrated`,
    );
  } catch (error) {
    console.error("❌ Error migrating course files:", error);
  }
}

async function migrateEventReports() {
  console.log("\n📤 Migrating event reports...");

  try {
    const eventReportsData = await fs.readFile(
      path.join(DATA_DIR, "eventReports.json"),
      "utf-8",
    );
    const eventReports = JSON.parse(eventReportsData);

    let migratedCount = 0;

    for (const report of eventReports) {
      try {
        // Check if faculty exists
        if (report.facultyId) {
          try {
            await db.collection("users").doc(report.facultyId).get();
          } catch (error) {
            console.log(
              `⚠️  Faculty ${report.facultyId} not found, skipping report ${report.title}`,
            );
            continue;
          }
        }

        await db.collection("eventReports").add({
          facultyId: report.facultyId || "",
          facultyName: report.facultyName || "",
          department: report.department || "",
          title: report.title,
          eventType: report.eventType || "other",
          date: report.date,
          venue: report.venue || "",
          description: report.description || "",
          participants: report.participants || "",
          outcomes: report.outcomes || "",
          images: report.images || [],
          status: report.status || "pending",
          createdAt: report.createdAt || new Date().toISOString(),
          updatedAt: report.updatedAt || new Date().toISOString(),
        });

        console.log(`✅ Migrated event report: ${report.title}`);
        migratedCount++;
      } catch (error) {
        console.error(
          `❌ Failed to migrate event report ${report.title}:`,
          error.message,
        );
      }
    }

    console.log(
      `\n✅ Event reports migration complete: ${migratedCount} migrated`,
    );
  } catch (error) {
    console.error("❌ Error migrating event reports:", error);
  }
}

async function migrateResponsibilities() {
  console.log("\n📤 Migrating responsibilities...");

  try {
    const responsibilitiesData = await fs.readFile(
      path.join(DATA_DIR, "responsibilities.json"),
      "utf-8",
    );
    const responsibilities = JSON.parse(responsibilitiesData);

    if (!Array.isArray(responsibilities) || responsibilities.length === 0) {
      console.log("⏭️  No responsibilities to migrate");
      return;
    }

    let migratedCount = 0;

    for (const responsibility of responsibilities) {
      try {
        await db.collection("responsibilities").add({
          facultyId: responsibility.facultyId,
          facultyName: responsibility.facultyName || "",
          department: responsibility.department || "",
          type: responsibility.type,
          title: responsibility.title,
          description: responsibility.description || "",
          startDate: responsibility.startDate,
          endDate: responsibility.endDate || null,
          status: responsibility.status || "active",
          assignedBy: responsibility.assignedBy || "",
          assignedByName: responsibility.assignedByName || "",
          createdAt: responsibility.createdAt || new Date().toISOString(),
          updatedAt: responsibility.updatedAt || new Date().toISOString(),
        });

        console.log(`✅ Migrated responsibility: ${responsibility.title}`);
        migratedCount++;
      } catch (error) {
        console.error(
          `❌ Failed to migrate responsibility ${responsibility.title}:`,
          error.message,
        );
      }
    }

    console.log(
      `\n✅ Responsibilities migration complete: ${migratedCount} migrated`,
    );
  } catch (error) {
    console.error("❌ Error migrating responsibilities:", error);
  }
}

async function main() {
  console.log("🚀 Starting data migration from JSON to Firebase...\n");
  console.log(
    "⚠️  Make sure Firebase is properly configured before running this script\n",
  );

  try {
    await migrateUsers();
    await migrateCourseFiles();
    await migrateEventReports();
    await migrateResponsibilities();

    console.log("\n✅ ✅ ✅ All migrations completed! ✅ ✅ ✅\n");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }

  process.exit(0);
}

// Run migration
main();
