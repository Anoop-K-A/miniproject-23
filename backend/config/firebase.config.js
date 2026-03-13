const admin = require("firebase-admin");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables from parent directory
dotenv.config({ path: "../.env.local" });

// Initialize Firebase Admin SDK
let firebaseApp;

try {
  // Two ways to initialize:
  // 1. Using service account key file (recommended for production)
  // 2. Using environment variables (for development)

  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const serviceAccountPath = path.resolve(
      __dirname,
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
    );
    const serviceAccount = require(serviceAccountPath);
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } else if (process.env.FIREBASE_PRIVATE_KEY) {
    // Initialize with environment variables
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } else {
    throw new Error(
      "Firebase credentials not found. Please set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_PRIVATE_KEY in .env.local",
    );
  }

  console.log("✅ Firebase Admin initialized successfully");
} catch (error) {
  console.error("❌ Error initializing Firebase Admin:", error.message);
  process.exit(1);
}

// Export Firebase services
const db = admin.firestore();
const auth = admin.auth();
const bucket = admin.storage().bucket();

module.exports = {
  admin,
  db,
  auth,
  bucket,
  firebaseApp,
};
