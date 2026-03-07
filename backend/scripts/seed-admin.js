const { connectDB } = require("../config/mongodb.config");
const { admin } = require("../config/firebase.config");
const User = require("../models/User");

/**
 * Script to seed admin account in MongoDB
 * Email: anoopka.6.7.2004@gmail.com
 * Password: 123456
 */

async function seedAdmin() {
  console.log("🔐 Setting up admin account...\n");

  const adminEmail = "anoopka.6.7.2004@gmail.com";
  const adminPassword = "123456";
  const adminName = "Admin User";

  try {
    await connectDB();

    // Check if admin already exists in MongoDB
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("✅ Admin user already exists in MongoDB");
      console.log(`  MongoDB ID: ${existingAdmin._id}`);
      console.log(`  Firebase UID: ${existingAdmin.firebaseUid}`);
      process.exit(0);
    }

    // Create/get Firebase Auth user
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(adminEmail);
      console.log("✅ Admin already exists in Firebase Auth");
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        userRecord = await admin.auth().createUser({
          email: adminEmail,
          password: adminPassword,
          displayName: adminName,
        });
        console.log("✅ Created new admin in Firebase Auth");
      } else {
        throw error;
      }
    }

    // Create admin user in MongoDB
    const newAdmin = await User.create({
      firebaseUid: userRecord.uid,
      email: adminEmail,
      name: adminName,
      role: "admin",
      roles: ["admin"],
      password: adminPassword,
      status: "active",
      verified: true,
    });

    console.log("✅ Created admin user in MongoDB");

    console.log("\n" + "=".repeat(50));
    console.log("✅ ✅ ✅ Admin Account Setup Complete! ✅ ✅ ✅");
    console.log("=".repeat(50));
    console.log("\n📋 Account Details:");
    console.log(`  Email: ${adminEmail}`);
    console.log(`  Password: ${adminPassword}`);
    console.log(`  Role: admin`);
    console.log(`  Status: active`);
    console.log(`  Verified: true`);
    console.log(`\n📝 IDs:`);
    console.log(`  Firebase UID: ${userRecord.uid}`);
    console.log(`  MongoDB ID: ${newAdmin._id}`);
    console.log("\n⚠️  Remember to change the password after first login!\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error setting up admin account:", error.message);
    process.exit(1);
  }
}

// Run seed
seedAdmin();
