import { mkdir, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

/**
 * Creates a folder for the course code if it doesn't exist
 * and saves the file to that folder
 */
export async function saveCoursefile(
  courseCode: string,
  file: File,
): Promise<string> {
  try {
    // Sanitize course code to ensure valid folder name
    const sanitizedCourseCode = courseCode.replace(/[^a-zA-Z0-9-_]/g, "_");

    if (!sanitizedCourseCode) {
      throw new Error("Invalid course code");
    }

    // Define the base upload directory
    const baseUploadDir = join(
      process.cwd(),
      "public",
      "uploads",
      "course-files",
    );

    // Create the course code folder path
    const courseFolder = join(baseUploadDir, sanitizedCourseCode);

    // Create the base directory if it doesn't exist
    if (!existsSync(baseUploadDir)) {
      await mkdir(baseUploadDir, { recursive: true });
    }

    // Create the course code folder if it doesn't exist
    if (!existsSync(courseFolder)) {
      await mkdir(courseFolder, { recursive: true });
    }

    // Generate a unique filename with timestamp
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${timestamp}_${sanitizedFileName}`;
    const filePath = join(courseFolder, fileName);

    // Convert file to buffer and save
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(filePath, buffer);

    // Return the public URL path
    return `/uploads/course-files/${sanitizedCourseCode}/${fileName}`;
  } catch (error) {
    console.error("Error saving course file:", error);
    throw new Error("Failed to save course file");
  }
}

/**
 * Converts a data URL to a file path by extracting the base64 data
 * and saving it to the appropriate folder
 */
export async function saveDataUrlAsFile(
  courseCode: string,
  fileName: string,
  dataUrl: string,
): Promise<string> {
  try {
    // Sanitize course code to ensure valid folder name
    const sanitizedCourseCode = courseCode.replace(/[^a-zA-Z0-9-_]/g, "_");

    console.log(`Original course code: "${courseCode}"`);
    console.log(`Sanitized course code: "${sanitizedCourseCode}"`);

    if (!sanitizedCourseCode) {
      throw new Error("Invalid course code");
    }

    // Define the base upload directory
    const baseUploadDir = join(
      process.cwd(),
      "public",
      "uploads",
      "course-files",
    );

    // Create the course code folder path
    const courseFolder = join(baseUploadDir, sanitizedCourseCode);

    console.log(`Creating folder: ${courseFolder}`);

    // Create the base directory if it doesn't exist
    if (!existsSync(baseUploadDir)) {
      console.log(`Creating base upload directory: ${baseUploadDir}`);
      await mkdir(baseUploadDir, { recursive: true });
    }

    // Create the course code folder if it doesn't exist
    if (!existsSync(courseFolder)) {
      console.log(`Creating course folder: ${courseFolder}`);
      await mkdir(courseFolder, { recursive: true });
    } else {
      console.log(`Course folder already exists: ${courseFolder}`);
    }

    // Extract base64 data from data URL
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error("Invalid data URL");
    }

    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    // Generate a unique filename with timestamp
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const newFileName = `${timestamp}_${sanitizedFileName}`;
    const filePath = join(courseFolder, newFileName);

    console.log(`Saving file to: ${filePath}`);

    // Save the file
    await writeFile(filePath, buffer);

    console.log(`File saved successfully, size: ${buffer.length} bytes`);

    // Return the public URL path
    const publicUrl = `/uploads/course-files/${sanitizedCourseCode}/${newFileName}`;
    console.log(`Public URL: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error("Error saving data URL as file:", error);
    throw new Error("Failed to save file from data URL");
  }
}
