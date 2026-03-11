const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load env from project root reliably regardless of process cwd.
dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/faculty-portal";

/**
 * Connect to MongoDB
 */
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
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
