import fs from "fs/promises";
import path from "path";

const dataRoot = path.join(process.cwd(), "src", "data");

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
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}
