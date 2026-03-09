import fs from "fs/promises";
import path from "path";
import { getMongoDb } from "@/lib/mongoDb";

interface JsonStoreDocument {
  _id: string;
  data: unknown;
  createdAt: string;
  updatedAt: string;
}

const dataRoot = path.join(process.cwd(), "src", "data");

// Simple lock mechanism to prevent concurrent writes
const locks = new Map<string, Promise<void>>();

const mongoBackedFiles = new Set<string>([
  "courseFiles.json",
  "eventReports.json",
  "audits.json",
  "remarks.json",
  "auditorMessages.json",
  "students.json",
  "courses.json",
  "engagements.json",
  "assignments.json",
  "responsibilities.json",
  "careerActivities.json",
]);

const seededFiles = new Set<string>();

function normalizeFileName(fileName: string) {
  return fileName.replace(/\\/g, "/").replace(/^\.\//, "");
}

function isMongoBackedFile(fileName: string) {
  return mongoBackedFiles.has(normalizeFileName(fileName));
}

async function getJsonStoreCollection() {
  const db = await getMongoDb();
  return db.collection<JsonStoreDocument>("jsonStore");
}

async function readFileFromDisk<T>(fileName: string): Promise<T> {
  const filePath = getDataFilePath(fileName);
  const fileContents = await fs.readFile(filePath, "utf-8");
  return JSON.parse(fileContents) as T;
}

async function seedMongoFileFromDisk(fileName: string) {
  const normalizedFileName = normalizeFileName(fileName);

  if (seededFiles.has(normalizedFileName)) {
    return;
  }

  seededFiles.add(normalizedFileName);

  const collection = await getJsonStoreCollection();
  const existing = await collection.findOne({ _id: normalizedFileName });
  if (existing) {
    return;
  }

  try {
    const data = await readFileFromDisk<unknown>(normalizedFileName);
    const timestamp = new Date().toISOString();

    await collection.updateOne(
      { _id: normalizedFileName },
      {
        $set: {
          data,
          updatedAt: timestamp,
        },
        $setOnInsert: {
          createdAt: timestamp,
        },
      },
      { upsert: true },
    );
  } catch (error) {
    // If seed file is missing we keep default behavior and let the read fail later.
    console.warn(`Skipping Mongo seed for ${normalizedFileName}:`, error);
  }
}

function validateSerializableJson(data: unknown) {
  const jsonString = JSON.stringify(data, null, 2);
  JSON.parse(jsonString);
}

async function writeMongoBackedData(fileName: string, data: unknown) {
  const normalizedFileName = normalizeFileName(fileName);

  while (locks.has(normalizedFileName)) {
    await locks.get(normalizedFileName);
  }

  const writeLock = (async () => {
    try {
      validateSerializableJson(data);
      const timestamp = new Date().toISOString();
      const collection = await getJsonStoreCollection();

      await collection.updateOne(
        { _id: normalizedFileName },
        {
          $set: {
            data,
            updatedAt: timestamp,
          },
          $setOnInsert: {
            createdAt: timestamp,
          },
        },
        { upsert: true },
      );
    } finally {
      locks.delete(normalizedFileName);
    }
  })();

  locks.set(normalizedFileName, writeLock);
  await writeLock;
}

export function getDataFilePath(fileName: string) {
  return path.join(dataRoot, normalizeFileName(fileName));
}

export async function readJsonFile<T>(fileName: string): Promise<T> {
  const normalizedFileName = normalizeFileName(fileName);

  if (!isMongoBackedFile(normalizedFileName)) {
    return readFileFromDisk<T>(normalizedFileName);
  }

  await seedMongoFileFromDisk(normalizedFileName);
  const collection = await getJsonStoreCollection();
  const document = await collection.findOne({ _id: normalizedFileName });

  if (!document) {
    return readFileFromDisk<T>(normalizedFileName);
  }

  return document.data as T;
}

export async function writeJsonFile<T>(fileName: string, data: T) {
  const normalizedFileName = normalizeFileName(fileName);

  if (isMongoBackedFile(normalizedFileName)) {
    await writeMongoBackedData(normalizedFileName, data);
    return;
  }

  const filePath = getDataFilePath(normalizedFileName);

  // Wait for any existing write operation to complete
  while (locks.has(normalizedFileName)) {
    await locks.get(normalizedFileName);
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
      locks.delete(normalizedFileName);
    }
  })();

  locks.set(normalizedFileName, writeLock);
  await writeLock;
}
