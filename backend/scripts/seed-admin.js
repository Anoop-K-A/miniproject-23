const { connectDB } = require("../config/mongodb.config");
const { admin } = require("../config/firebase.config");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

/**
 * Script to seed admin account in MongoDB
 * Email: admin@college.com
 * Password: Admin@123
 */

async function seedAdmin() {
  console.log("🔐 Setting up admin account...\n");

  const adminEmail = "admin@college.com";
  const adminPassword = "Admin@123";
  const adminName = "Admin User";

  try {
    await connectDB();

    // Create/get Firebase Auth user
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(adminEmail);
      await admin.auth().updateUser(userRecord.uid, {
        email: adminEmail,
        password: adminPassword,
        displayName: adminName,
      });
      console.log(
        "✅ Admin already exists in Firebase Auth (credentials synced)",
      );
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

    // Keep admin claims aligned in Firebase Auth.
    await admin.auth().setCustomUserClaims(userRecord.uid, { role: "admin" });

    // Create or update admin user in MongoDB using native collection operations.
    // This avoids schema casting issues when legacy docs use string _id values.
    const usersCollection = User.collection;
    const now = new Date();
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    let existingMongoAdmin = await usersCollection.findOne({
      email: adminEmail,
    });
    if (!existingMongoAdmin) {
      existingMongoAdmin = await usersCollection.findOne({
        firebaseUid: userRecord.uid,
      });
    }
    if (!existingMongoAdmin) {
      existingMongoAdmin = await usersCollection.findOne({ role: "admin" });
    }

    const adminPayload = {
      firebaseUid: userRecord.uid,
      email: adminEmail,
      name: adminName,
      role: "admin",
      roles: ["admin"],
      password: hashedPassword,
      status: "active",
      verified: true,
      updatedAt: now,
    };

    let mongoAdminId;
    if (existingMongoAdmin) {
      await usersCollection.updateOne(
        { _id: existingMongoAdmin._id },
        { $set: adminPayload },
      );
      mongoAdminId = existingMongoAdmin._id;
      console.log("✅ Updated admin user in MongoDB");
    } else {
      const insertResult = await usersCollection.insertOne({
        ...adminPayload,
        createdAt: now,
      });
      mongoAdminId = insertResult.insertedId;
      console.log("✅ Created admin user in MongoDB");
    }

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
    console.log(`  MongoDB ID: ${mongoAdminId}`);
    console.log("\n⚠️  Remember to change the password after first login!\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error setting up admin account:", error.message);
    process.exit(1);
  }
}

// Run seed
seedAdmin();
