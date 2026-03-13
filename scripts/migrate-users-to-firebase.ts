/**
 * Migration Script: Create Firebase Auth users from users.json
 *
 * This script reads users from src/data/users.json and creates them
 * in Firebase Authentication so they can sign in.
 *
 * Run this script once to migrate your existing users to Firebase.
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import * as fs from "fs";
import * as path from "path";

// Initialize Firebase Admin
if (!getApps().length) {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(
      fs.readFileSync(serviceAccountPath, "utf-8"),
    );
    initializeApp({
      credential: cert(serviceAccount),
    });
  } else {
    // Use default credentials (if running in Firebase environment)
    initializeApp();
  }
}

const auth = getAuth();

interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  department?: string;
  status?: string;
}

async function migrateUsers() {
  try {
    // Read users.json
    const usersPath = path.join(__dirname, "..", "src", "data", "users.json");
    const usersData = JSON.parse(fs.readFileSync(usersPath, "utf-8")) as User[];

    console.log(`Found ${usersData.length} users to migrate...`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const user of usersData) {
      try {
        // Check if user already exists
        let existingUser;
        try {
          existingUser = await auth.getUserByEmail(user.email);
          console.log(`⏭️  Skipping ${user.email} - already exists`);
          skipCount++;
          continue;
        } catch (error: any) {
          // User doesn't exist, proceed to create
          if (error.code !== "auth/user-not-found") {
            throw error;
          }
        }

        // Create user in Firebase Auth
        const newUser = await auth.createUser({
          uid: user.id,
          email: user.email,
          password: user.password,
          displayName: user.name,
          disabled: user.status === "inactive",
        });

        // Set custom claims for role
        await auth.setCustomUserClaims(newUser.uid, {
          role: user.role,
          department: user.department,
        });

        console.log(`✅ Created user: ${user.email} (${user.role})`);
        successCount++;
      } catch (error: any) {
        console.error(`❌ Error creating ${user.email}:`, error.message);
        errorCount++;
      }
    }

    console.log("\n=== Migration Complete ===");
    console.log(`✅ Successfully created: ${successCount}`);
    console.log(`⏭️  Skipped (already exist): ${skipCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📊 Total processed: ${usersData.length}`);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

// Run migration
migrateUsers()
  .then(() => {
    console.log("\n🎉 Migration script completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
