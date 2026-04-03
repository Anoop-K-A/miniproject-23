const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env.local") });

const User = require("../models/User");

const FACULTY_DATA = [
  {
    firebaseUid: "faculty-user-001",
    email: "dr.smith@university.edu",
    username: "dr_smith",
    name: "Dr. John Smith",
    role: "faculty",
    status: "active",
    department: "Computer Science",
    verified: true,
  },
  {
    firebaseUid: "faculty-user-002",
    email: "dr.johnson@university.edu",
    username: "dr_johnson",
    name: "Dr. Sarah Johnson",
    role: "faculty",
    status: "active",
    department: "Mathematics",
    verified: true,
  },
  {
    firebaseUid: "faculty-user-003",
    email: "prof.williams@university.edu",
    username: "prof_williams",
    name: "Prof. Michael Williams",
    role: "faculty",
    status: "active",
    department: "Physics",
    verified: true,
  },
  {
    firebaseUid: "faculty-user-004",
    email: "dr.brown@university.edu",
    username: "dr_brown",
    name: "Dr. Emily Brown",
    role: "faculty",
    status: "active",
    department: "Chemistry",
    verified: true,
  },
];

async function seedFaculty() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB,
    });
    console.log("✅ Connected to MongoDB");

    // Clear existing faculty users
    const deleteResult = await User.deleteMany({ role: "faculty" });
    console.log(
      `🗑️  Deleted ${deleteResult.deletedCount} existing faculty users`,
    );

    // Insert new faculty users
    const createdUsers = await User.insertMany(FACULTY_DATA);
    console.log(`✅ Created ${createdUsers.length} faculty users:`);
    createdUsers.forEach((user) => {
      console.log(`  - ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    console.log("\n✅ Faculty seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding faculty:", error.message);
    process.exit(1);
  }
}

seedFaculty();
