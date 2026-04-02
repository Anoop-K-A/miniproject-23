import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendDir = path.join(__dirname, "..", "backend");

// Import MongoDB config
const mongoUri =
  process.env.MONGODB_URI || "mongodb://localhost:27017/faculty-portal";

async function clearMongoDBData() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✓ Connected to MongoDB\n");

    const db = mongoose.connection.db;

    // Collections to clear
    const collections = [
      "coursefiles",
      "eventreports",
      "students",
      "careeractivities",
      "audits",
      "remarks",
      "auditorMessages",
      "engagements",
      "assignments",
      "responsibilities",
    ];

    console.log("🗑️  Clearing collections...");
    for (const collectionName of collections) {
      try {
        const result = await db.collection(collectionName).deleteMany({});
        console.log(
          `✓ Cleared ${collectionName}: ${result.deletedCount} documents`,
        );
      } catch (error) {
        if (error.message.includes("ns not found")) {
          console.log(`ℹ Collection doesn't exist: ${collectionName}`);
        } else {
          console.error(`✗ Error clearing ${collectionName}:`, error.message);
        }
      }
    }

    // Clear non-admin users
    console.log("\n👤 Removing non-admin users...");
    try {
      const result = await db.collection("users").deleteMany({
        role: { $ne: "admin" },
      });
      console.log(`✓ Removed ${result.deletedCount} non-admin users`);
    } catch (error) {
      console.error("✗ Error removing users:", error.message);
    }

    console.log("\n✨ MongoDB cleanup complete!\n");
    console.log("📋 Summary:");
    console.log("  ✓ All faculty course files cleared");
    console.log("  ✓ All event reports cleared");
    console.log("  ✓ All students removed");
    console.log("  ✓ All non-admin users removed");
    console.log("  ℹ Admin user(s) preserved\n");

    await mongoose.disconnect();
  } catch (error) {
    console.error("✗ Fatal error:", error.message);
    process.exit(1);
  }
}

console.log("🧹 MongoDB Deployment Cleanup\n");
clearMongoDBData().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
