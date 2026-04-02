import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");
const dataDir = path.join(projectRoot, "src", "data");

// Data files to clear
const filesToClear = [
  "courseFiles.json",
  "eventReports.json",
  "students.json",
  "careerActivities.json",
  "audits.json",
  "remarks.json",
  "auditorMessages.json",
  "engagements.json",
  "assignments.json",
  "responsibilities.json",
];

// Subdirectory files to clear
const subdirectoryFiles = [
  { dir: "files", files: ["course-files.json", "faculty-files.json"] },
  { dir: "reports", files: ["event-reports.json"] },
  {
    dir: "dashboards",
    files: ["faculty.json", "auditor.json", "staff-advisor.json"],
  },
];

async function clearJsonFile(fileName) {
  const filePath = path.join(dataDir, fileName);

  try {
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      console.log(`✓ File doesn't exist (skipped): ${fileName}`);
      return;
    }

    // Write empty array
    await fs.writeFile(filePath, JSON.stringify([], null, 2));
    console.log(`✓ Cleared: ${fileName}`);
  } catch (error) {
    console.error(`✗ Error clearing ${fileName}:`, error.message);
  }
}

async function clearSubdirectoryFiles() {
  for (const { dir, files } of subdirectoryFiles) {
    const dirPath = path.join(dataDir, dir);

    for (const file of files) {
      const filePath = path.join(dirPath, file);

      try {
        // Check if file exists
        try {
          await fs.access(filePath);
        } catch {
          console.log(`✓ File doesn't exist (skipped): ${dir}/${file}`);
          continue;
        }

        // Write empty array
        await fs.writeFile(filePath, JSON.stringify([], null, 2));
        console.log(`✓ Cleared: ${dir}/${file}`);
      } catch (error) {
        console.error(`✗ Error clearing ${dir}/${file}:`, error.message);
      }
    }
  }
}

async function clearMongoDBData() {
  console.log("\n📦 MongoDB cleanup:");
  console.log("  Run: npm run cleanup:mongodb:deployment");
}

async function main() {
  console.log("🧹 Starting deployment cleanup...\n");

  // Ensure data directory exists
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error) {
    console.error("Error creating data directory:", error.message);
    process.exit(1);
  }

  // Clear root data files
  console.log("📄 Clearing JSON data files...");
  for (const file of filesToClear) {
    await clearJsonFile(file);
  }

  // Clear subdirectory files
  console.log("\n📁 Clearing subdirectory files...");
  await clearSubdirectoryFiles();

  // Handle MongoDB
  await clearMongoDBData();

  console.log("\n✨ Cleanup complete!\n");
  console.log("📋 Summary:");
  console.log("  ✓ All faculty course files cleared");
  console.log("  ✓ All event reports cleared");
  console.log("  ✓ All students data cleared");
  console.log("  ✓ All career activities cleared");
  console.log("\n💡 Next steps:");
  console.log("  1. Clear MongoDB data: npm run cleanup:mongodb:deployment");
  console.log("  2. Verify: npm run dev");
  console.log("  3. Deploy the application\n");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
