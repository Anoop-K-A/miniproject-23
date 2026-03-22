const express = require("express");
const router = express.Router();
const { admin } = require("../config/firebase.config");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const { isPrimaryAdminUsername } = require("../config/admin.config");

function escapeRegex(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  "/register",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("name").trim().notEmpty(),
    body("role").optional().isIn(["faculty", "auditor", "staff-advisor"]),
    body("department").trim().optional(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        email,
        password,
        name,
        role = "faculty",
        department = "",
      } = req.body;

      const requestedRole = String(role).trim().toLowerCase();
      if (requestedRole === "admin") {
        return res.status(403).json({
          error: "Creating admin users is disabled",
        });
      }

      const normalizedRole =
        requestedRole === "auditor"
          ? "auditor"
          : requestedRole === "staff advisor" ||
              requestedRole === "staff-advisor"
            ? "staff-advisor"
            : "faculty";
      const normalizedUsername = String(name).trim().toLowerCase();

      if (isPrimaryAdminUsername(normalizedUsername)) {
        return res.status(403).json({
          error: "This username is reserved",
        });
      }

      // Check if user already exists in MongoDB
      const existingUser = await User.findOne({
        $or: [{ email }, { username: normalizedUsername }],
      });
      if (existingUser) {
        return res
          .status(400)
          .json({ error: "Username or email already registered" });
      }

      // Create Firebase Auth user
      const userRecord = await admin.auth().createUser({
        email,
        password,
      });

      // Hash password for MongoDB backup
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user in MongoDB
      const newUser = await User.create({
        firebaseUid: userRecord.uid,
        email,
        username: normalizedUsername,
        name,
        role: normalizedRole,
        roles: [normalizedRole],
        department,
        password: hashedPassword,
        status: normalizedRole === "faculty" ? "pending" : "active",
        verified: normalizedRole === "faculty" ? false : true,
      });

      res.status(201).json({
        message: "User registered successfully",
        user: {
          _id: newUser._id,
          firebaseUid: userRecord.uid,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          status: newUser.status,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);

      if (error.code === "auth/email-already-exists") {
        return res
          .status(400)
          .json({ error: "Username or email already registered" });
      }

      res.status(500).json({
        error: "Registration failed",
        message: error.message,
      });
    }
  },
);

/**
 * POST /api/auth/create-custom-token
 * Create a custom token for login (frontend will exchange for ID token)
 */
router.post(
  "/create-custom-token",
  [body("username").trim().notEmpty(), body("password").notEmpty()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, password } = req.body;
      const normalizedUsername = String(username).trim().toLowerCase();

      // Find user in MongoDB
      const user = await User.findOne({
        $or: [
          { username: normalizedUsername },
          { email: normalizedUsername },
          {
            name: {
              $regex: new RegExp(`^${escapeRegex(username)}$`, "i"),
            },
          },
        ],
      });

      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      // Verify password
      const passwordMatch = await user.comparePassword(password);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      // Check status
      if (user.status === "inactive") {
        return res.status(403).json({ error: "Account is inactive" });
      }

      if (user.status === "pending") {
        return res.status(403).json({
          error: "Account pending approval",
          status: user.status,
        });
      }

      if (user.status === "rejected") {
        return res.status(403).json({ error: "Account has been rejected" });
      }

      // Create custom token
      const customToken = await admin
        .auth()
        .createCustomToken(user.firebaseUid);

      res.json({
        token: customToken,
        user: {
          _id: user._id,
          firebaseUid: user.firebaseUid,
          email: user.email,
          name: user.name,
          role: user.role,
          roles: user.roles,
          department: user.department,
          status: user.status,
        },
      });
    } catch (error) {
      console.error("Token creation error:", error);
      res.status(500).json({
        error: "Token creation failed",
        message: error.message,
      });
    }
  },
);

/**
 * POST /api/auth/verify-token
 * Verify Firebase ID token and return user data
 */
router.post("/verify-token", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token required" });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    const user = await User.findOne({ firebaseUid: decodedToken.uid });

    if (!user) {
      return res.status(404).json({ error: "User not found in database" });
    }

    res.json({
      valid: true,
      user: {
        _id: user._id,
        firebaseUid: user.firebaseUid,
        email: user.email,
        name: user.name,
        role: user.role,
        roles: user.roles,
        department: user.department,
        status: user.status,
        verified: user.verified,
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({
      valid: false,
      error: "Invalid or expired token",
    });
  }
});

module.exports = router;
