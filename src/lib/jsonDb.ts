import fs from "fs/promises";
import path from "path";

const dataRoot = path.join(process.cwd(), "src", "data");

// Simple lock mechanism to prevent concurrent writes
const locks = new Map<string, Promise<void>>();

export function getDataFilePath(fileName: string) {
  return path.join(dataRoot, fileName);
}

export async function readJsonFile<T>(fileName: string): Promise<T> {
  const filePath = getDataFilePath(fileName);
  const fileContents = await fs.readFile(filePath, "utf-8");
  return JSON.parse(fileContents) as T;
}

export async function writeJsonFile<T>(fileName: string, data: T) {
  const filePath = getDataFilePath(fileName);

  // Wait for any existing write operation to complete
  while (locks.has(fileName)) {
    await locks.get(fileName);
  }

  // Create a new lock for this write operation
  const writeLock = (async () => {
    try {
      const jsonString = JSON.stringify(data, null, 2);

      // Validate JSON before writing
      try {
        JSON.parse(jsonString);
      } catch (error) {
        console.error("Invalid JSON data, aborting write:", error);
        throw new Error("Failed to write JSON: Invalid data structure");
      }

      // Write to temporary file first, then rename (atomic operation)
      const tempFilePath = `${filePath}.tmp`;
      await fs.writeFile(tempFilePath, jsonString, "utf-8");
      await fs.rename(tempFilePath, filePath);
    } finally {
      locks.delete(fileName);
    }
  })();

  locks.set(fileName, writeLock);
  await writeLock;
}
