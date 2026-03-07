const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "../.env.local" });

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/faculty-portal";

/**
 * Connect to MongoDB
 */
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected successfully");
    return mongoose.connection;
  } catch (error) {
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
