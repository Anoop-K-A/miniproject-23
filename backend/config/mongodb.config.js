const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load env from project root reliably regardless of process cwd.
dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/faculty-portal";
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "";
const EXPECTED_DB_NAME = process.env.EXPECTED_DB_NAME || "miniproject_v2";

/**
 * Connect to MongoDB
 */
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      ...(MONGODB_DB_NAME ? { dbName: MONGODB_DB_NAME } : {}),
    });

    // Ensure critical indexes exist even on clean databases.
    const Faculty = require("../models/Faculty");
    const CourseFile = require("../models/CourseFile");
    await Promise.all([Faculty.createIndexes(), CourseFile.createIndexes()]);

    const activeDbName = mongoose.connection.name;
    if (EXPECTED_DB_NAME && activeDbName !== EXPECTED_DB_NAME) {
      console.warn(
        `⚠ Connected to '${activeDbName}' (expected '${EXPECTED_DB_NAME}'). Set MONGODB_DB_NAME or update MONGODB_URI if needed.`,
      );
    }

    console.log("✅ MongoDB connected successfully");
    return mongoose.connection;
  } catch (error) {
    if (String(error.message).includes("querySrv ECONNREFUSED")) {
      console.error(
        "❌ SRV DNS lookup failed. Use a direct mongodb:// URI (non-SRV) for MONGODB_URI.",
      );
    }
    console.error("❌ Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
}

/**
 * Disconnect from MongoDB
 */
async function disconnectDB() {
  try {
    await mongoose.disconnect();
    console.log("✅ MongoDB disconnected");
  } catch (error) {
    console.error("❌ Error disconnecting from MongoDB:", error.message);
  }
}

module.exports = {
  connectDB,
  disconnectDB,
  mongoose,
};
