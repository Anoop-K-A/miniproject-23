const { connectDB } = require("../config/mongodb.config");
const { admin } = require("../config/firebase.config");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const {
  PRIMARY_ADMIN_EMAIL,
  PRIMARY_ADMIN_USERNAME,
  PRIMARY_ADMIN_PASSWORD,
  PRIMARY_ADMIN_NAME,
} = require("../config/admin.config");

const LEGACY_ADMIN_EMAIL = "admin@college.com";

function normalizeRole(role) {
  const value = String(role || "")
    .trim()
    .toLowerCase();

  if (value === "staff advisor" || value === "staffadvisor") {
    return "staff-advisor";
  }

  return value;
}

function toNonAdminRoles(roles, fallbackRole = "faculty") {
  const normalized = Array.from(
    new Set(
      (Array.isArray(roles) ? roles : [])
        .map((item) => normalizeRole(item))
        .filter((item) => item && item !== "admin"),
    ),
  );

  if (normalized.length === 0) {
    normalized.push(fallbackRole);
  }

  return normalized;
}

async function getOrCreatePrimaryAdminUser() {
  try {
    const user = await admin.auth().getUserByEmail(PRIMARY_ADMIN_EMAIL);
    const updated = await admin.auth().updateUser(user.uid, {
      email: PRIMARY_ADMIN_EMAIL,
      password: PRIMARY_ADMIN_PASSWORD,
      displayName: PRIMARY_ADMIN_NAME,
      disabled: false,
      emailVerified: true,
    });

    return { userRecord: updated, migratedFromLegacy: false };
  } catch (error) {
    if (error.code !== "auth/user-not-found") {
      throw error;
    }
  }

  try {
    const legacyUser = await admin.auth().getUserByEmail(LEGACY_ADMIN_EMAIL);
    const migrated = await admin.auth().updateUser(legacyUser.uid, {
      email: PRIMARY_ADMIN_EMAIL,
      password: PRIMARY_ADMIN_PASSWORD,
      displayName: PRIMARY_ADMIN_NAME,
      disabled: false,
      emailVerified: true,
    });

    return { userRecord: migrated, migratedFromLegacy: true };
  } catch (error) {
    if (error.code !== "auth/user-not-found") {
      throw error;
    }
  }

  const created = await admin.auth().createUser({
    email: PRIMARY_ADMIN_EMAIL,
    password: PRIMARY_ADMIN_PASSWORD,
    displayName: PRIMARY_ADMIN_NAME,
    disabled: false,
    emailVerified: true,
  });

  return { userRecord: created, migratedFromLegacy: false };
}

async function demoteOtherFirebaseAdmins(primaryUid) {
  let demotedCount = 0;
  let pageToken;

  do {
    const listResult = await admin.auth().listUsers(1000, pageToken);
    pageToken = listResult.pageToken;

    for (const user of listResult.users) {
      if (user.uid === primaryUid) {
        continue;
      }

      const claims = user.customClaims || {};
      const roleFromClaims = normalizeRole(claims.role);
      const rolesFromClaims = Array.isArray(claims.roles)
        ? claims.roles.map((item) => normalizeRole(item))
        : [];
      const hasAdminClaim =
        roleFromClaims === "admin" || rolesFromClaims.includes("admin");

      if (!hasAdminClaim) {
        continue;
      }

      const nextClaims = { ...claims };
      const cleanedRoles = rolesFromClaims.filter((item) => item !== "admin");

      if (normalizeRole(nextClaims.role) === "admin") {
        delete nextClaims.role;
      }

      if (cleanedRoles.length > 0) {
        nextClaims.roles = cleanedRoles;
      } else {
        delete nextClaims.roles;
      }

      await admin
        .auth()
        .setCustomUserClaims(
          user.uid,
          Object.keys(nextClaims).length > 0 ? nextClaims : null,
        );
      demotedCount += 1;
    }
  } while (pageToken);

  return demotedCount;
}

/**
 * Script to enforce one primary admin account
 * Username: Admin
 * Email: admin@collage.com
 * Password: Admin@123
 */

async function seedAdmin() {
  console.log("🔐 Enforcing single admin account...\n");

  try {
    await connectDB();

    const { userRecord, migratedFromLegacy } =
      await getOrCreatePrimaryAdminUser();
    if (migratedFromLegacy) {
      console.log("✅ Migrated legacy admin email to admin@collage.com");
    } else {
      console.log("✅ Primary admin credentials synced in Firebase Auth");
    }

    // Keep primary admin claims aligned in Firebase Auth.
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: "admin",
      roles: ["admin"],
      verified: true,
    });

    const demotedFirebaseAdmins = await demoteOtherFirebaseAdmins(
      userRecord.uid,
    );

    // Create or update primary admin user in MongoDB using native collection operations.
    // This avoids schema casting issues when legacy docs use string _id values.
    const usersCollection = User.collection;
    const now = new Date();
    const hashedPassword = await bcrypt.hash(PRIMARY_ADMIN_PASSWORD, 10);

    let existingMongoAdmin = await usersCollection.findOne({
      email: PRIMARY_ADMIN_EMAIL,
    });
    if (!existingMongoAdmin) {
      existingMongoAdmin = await usersCollection.findOne({
        firebaseUid: userRecord.uid,
      });
    }
    if (!existingMongoAdmin) {
      existingMongoAdmin = await usersCollection.findOne({
        email: LEGACY_ADMIN_EMAIL,
      });
    }
    if (!existingMongoAdmin) {
      existingMongoAdmin = await usersCollection.findOne({ role: "admin" });
    }
    if (!existingMongoAdmin) {
      existingMongoAdmin = await usersCollection.findOne({ roles: "admin" });
    }

    const adminPayload = {
      firebaseUid: userRecord.uid,
      username: PRIMARY_ADMIN_USERNAME.toLowerCase(),
      email: PRIMARY_ADMIN_EMAIL,
      name: PRIMARY_ADMIN_NAME,
      role: "admin",
      roles: ["admin"],
      password: hashedPassword,
      status: "active",
      verified: true,
      updatedAt: now,
    };

    let mongoAdminId = null;
    if (existingMongoAdmin) {
      await usersCollection.updateOne(
        { _id: existingMongoAdmin._id },
        { $set: adminPayload },
      );
      mongoAdminId = existingMongoAdmin._id;
      console.log("✅ Updated primary admin user in MongoDB");
    } else {
      const insertResult = await usersCollection.insertOne({
        ...adminPayload,
        createdAt: now,
      });
      mongoAdminId = insertResult.insertedId;
      console.log("✅ Created primary admin user in MongoDB");
    }

    const otherMongoAdmins = await usersCollection
      .find({
        _id: { $ne: mongoAdminId },
        $or: [{ role: "admin" }, { roles: "admin" }],
      })
      .toArray();

    for (const user of otherMongoAdmins) {
      const fallbackRole =
        normalizeRole(user.role) === "admin"
          ? "faculty"
          : normalizeRole(user.role || "faculty");
      const nextRoles = toNonAdminRoles(
        user.roles || [user.role],
        fallbackRole || "faculty",
      );

      await usersCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            role: nextRoles[0],
            roles: nextRoles,
            status:
              user.status === "pending" ? "active" : user.status || "active",
            updatedAt: now,
          },
        },
      );
    }

    const demotedMongoAdmins = otherMongoAdmins.length;

    console.log("\n" + "=".repeat(50));
    console.log("✅ ✅ ✅ Single Admin Enforcement Complete ✅ ✅ ✅");
    console.log("=".repeat(50));
    console.log("\n📋 Account Details:");
    console.log(`  Username: ${PRIMARY_ADMIN_USERNAME}`);
    console.log(`  Email: ${PRIMARY_ADMIN_EMAIL}`);
    console.log(`  Password: ${PRIMARY_ADMIN_PASSWORD}`);
    console.log(`  Role: admin`);
    console.log(`  Status: active`);
    console.log(`  Verified: true`);
    console.log(`\n🧹 Cleanup Summary:`);
    console.log(`  Firebase admins demoted: ${demotedFirebaseAdmins}`);
    console.log(`  MongoDB admins demoted: ${demotedMongoAdmins}`);
    console.log(`\n📝 IDs:`);
    console.log(`  Firebase UID: ${userRecord.uid}`);
    console.log(`  MongoDB ID: ${mongoAdminId}`);
    console.log("");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error setting up admin account:", error.message);
    process.exit(1);
  }
}

// Run seed
seedAdmin();
