import { readJsonFile, writeJsonFile } from "@/lib/jsonDb";
import { saveDataUrlAsFile } from "@/lib/fileUpload";
import type { CourseFile } from "@/components/CourseFileManager/types";

/**
 * Migrates course files to organize them by course code folders
 * - Processes files with data URLs and saves them to disk
 * - Ensures all files are in their course code folders
 */
export async function migrateCourseFilesToFolders() {
  console.log("Starting course file migration...");

  const files = await readJsonFile<CourseFile[]>("courseFiles.json");
  let migratedCount = 0;
  let errorCount = 0;
  const updatedFiles: CourseFile[] = [];

  for (const file of files) {
    let updatedFile = { ...file };

    // Check if file has a data URL that needs to be saved to disk
    if (file.documentUrl && file.documentUrl.startsWith("data:")) {
      try {
        console.log(`Migrating file: ${file.fileName} (${file.courseCode})`);

        const newUrl = await saveDataUrlAsFile(
          file.courseCode,
          file.fileName,
          file.documentUrl,
        );

        updatedFile.documentUrl = newUrl;
        migratedCount++;
        console.log(`✓ Migrated to: ${newUrl}`);
      } catch (error) {
        console.error(`✗ Failed to migrate file ${file.id}:`, error);
        errorCount++;
      }
    }
    // Check if file doesn't have a documentUrl at all
    else if (!file.documentUrl) {
      console.warn(
        `⚠ File ${file.id} (${file.fileName}) has no documentUrl - skipping`,
      );
      errorCount++;
    }

    updatedFiles.push(updatedFile);
  }

  // Save updated files back to database
  if (migratedCount > 0) {
    await writeJsonFile("courseFiles.json", updatedFiles);
    console.log(`\n✓ Migration complete!`);
    console.log(`  - Migrated: ${migratedCount} files`);
    console.log(`  - Errors: ${errorCount} files`);
    console.log(`  - Total: ${files.length} files`);
  } else {
    console.log(
      "\nNo files needed migration. All files are already organized!",
    );
  }

  return {
    total: files.length,
    migrated: migratedCount,
    errors: errorCount,
  };
}
