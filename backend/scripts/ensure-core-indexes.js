const { connectDB, disconnectDB } = require("../config/mongodb.config");
const Faculty = require("../models/Faculty");
const CourseFile = require("../models/CourseFile");

async function main() {
  try {
    await connectDB();

    await Promise.all([
      Faculty.createCollection().catch(() => null),
      CourseFile.createCollection().catch(() => null),
    ]);
    await Promise.all([Faculty.createIndexes(), CourseFile.createIndexes()]);

    console.log("Core indexes ensured for faculty and coursefiles.");
  } catch (error) {
    console.error("Failed to ensure core indexes:", error.message);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
}

main();
