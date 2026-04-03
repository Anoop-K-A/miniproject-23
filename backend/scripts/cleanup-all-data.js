/**
 * @file Database Cleanup Script - DESTRUCTIVE
 * Removes all user data, remarks, documents, event reports, students, and related data
 *
 * Usage: node backend/scripts/cleanup-all-data.js
 *
 * WARNING: This will DELETE ALL DATA from MongoDB collections!
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config({ path: ".env.local" });

const User = require("../models/User");
const Student = require("../models/Student");
const EventReport = require("../models/EventReport");
const UploadedFile = require("../models/UploadedFile");
const Responsibility = require("../models/Responsibility");

// EmailVerification uses ES6 export, so we'll skip it in this script
// and handle it in the JSON collections cleanup

let colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function cleanup() {
  try {
    log("\n" + "=".repeat(70), "cyan");
    log("🗑️  DATABASE CLEANUP - DELETING ALL DATA", "red");
    log("=".repeat(70), "cyan");

    // Connect to MongoDB
    log("\n📍 Connecting to MongoDB...", "yellow");
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGODB_URI || "mongodb://localhost:27017/facultyportal",
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        },
      );
    }
    log("✅ Connected to MongoDB", "green");

    // Step 1: Delete all users
    log("\n🔄 Deleting all users...", "yellow");
    const userResult = await User.deleteMany({});
    log(`   ✅ Deleted ${userResult.deletedCount} users`, "green");

    // Step 2: Delete all students
    log("\n🔄 Deleting all students...", "yellow");
    const studentResult = await Student.deleteMany({});
    log(`   ✅ Deleted ${studentResult.deletedCount} students`, "green");

    // Step 3: Delete all event reports
    log("\n🔄 Deleting all event reports...", "yellow");
    const eventResult = await EventReport.deleteMany({});
    log(`   ✅ Deleted ${eventResult.deletedCount} event reports`, "green");

    // Step 4: Delete all course files and uploads
    log("\n🔄 Deleting all course files and uploads...", "yellow");
    const fileResult = await UploadedFile.deleteMany({});
    log(`   ✅ Deleted ${fileResult.deletedCount} course files`, "green");

    // Step 5: Delete all responsibilities
    log("\n🔄 Deleting all responsibilities...", "yellow");
    const respResult = await Responsibility.deleteMany({});
    log(`   ✅ Deleted ${respResult.deletedCount} responsibilities`, "green");

    // Step 6: Clear JSON-backed collections
    log("\n🔄 Clearing JSON-backed collections...", "yellow");
    const db = mongoose.connection.db;

    const jsonCollections = [
      "emailverifications",
      "coursefiles",
      "eventreports",
      "students",
      "audits",
      "remarks",
      "auditormessages",
      "engagements",
    ];

    for (const collectionName of jsonCollections) {
      try {
        const collection = db.collection(collectionName);
        const result = await collection.deleteMany({});
        log(
          `   ✅ Cleared ${collectionName} (${result.deletedCount} documents)`,
          "green",
        );
      } catch (error) {
        if (error.message.includes("ns does not exist")) {
          log(
            `   ⚠️  Collection ${collectionName} doesn't exist (skipped)`,
            "yellow",
          );
        } else {
          throw error;
        }
      }
    }

    // Summary
    log("\n" + "=".repeat(70), "cyan");
    log("✅ DATABASE CLEANUP COMPLETE", "green");
    log("=".repeat(70), "cyan");

    const totalDeleted =
      userResult.deletedCount +
      studentResult.deletedCount +
      eventResult.deletedCount +
      fileResult.deletedCount +
      respResult.deletedCount;

    log(`\n📊 Summary:`, "cyan");
    log(`   • Users deleted: ${userResult.deletedCount}`, "green");
    log(`   • Students deleted: ${studentResult.deletedCount}`, "green");
    log(`   • Event reports deleted: ${eventResult.deletedCount}`, "green");
    log(`   • Course files deleted: ${fileResult.deletedCount}`, "green");
    log(`   • Responsibilities deleted: ${respResult.deletedCount}`, "green");
    log(
      `   • JSON collections cleared (remarks, messages, engagements, etc.)`,
      "green",
    );
    log(`\n   Total records deleted: ${totalDeleted}`, "magenta");

    log("\n✨ All user data has been successfully deleted!", "green");
    log("⚠️  WARNING: This action cannot be undone!", "red");

    await mongoose.connection.close();
    log("\n✅ Database connection closed\n", "green");

    process.exit(0);
  } catch (error) {
    log(`\n❌ ERROR: ${error.message}`, "red");
    console.error(error);
    process.exit(1);
  }
}

// Confirmation check
const args = process.argv.slice(2);
if (!args.includes("--force") && !args.includes("-f")) {
  log("\n⚠️  WARNING: This will DELETE ALL DATA from the database!", "red");
  log("\nTo proceed, run with the --force flag:", "yellow");
  log("\n   node backend/scripts/cleanup-all-data.js --force\n", "cyan");
  process.exit(0);
}

log("\n🔴 PROCEEDING WITH DATA DELETION...", "red");
cleanup();
