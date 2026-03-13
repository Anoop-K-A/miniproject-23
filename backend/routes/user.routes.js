const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { verifyToken, requireRole } = require("../middleware/auth.middleware");

/**
 * GET /api/users
 * Get all users (admin, auditor, staff-advisor only)
 */
router.get(
  "/",
  verifyToken,
  requireRole(["admin", "auditor", "staff-advisor"]),
  async (req, res) => {
    try {
      const users = await User.find({}).select("-password");
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  },
);

/**
 * GET /api/users/:id
 * Get user by ID
 */
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Users can only view their own profile unless they're admin
    if (req.user._id.toString() !== id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

/**
 * GET /api/users/faculty/all
 * Get all faculty users
 */
router.get("/faculty/all", verifyToken, async (req, res) => {
  try {
    const faculty = await User.find({ role: "faculty" }).select("-password");
    res.json(faculty);
  } catch (error) {
    console.error("Error fetching faculty:", error);
    res.status(500).json({ error: "Failed to fetch faculty" });
  }
});

/**
 * PATCH /api/users/:id
 * Update user profile
 */
router.patch("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Users can only update their own profile unless they're admin
    if (req.user._id.toString() !== id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const allowedUpdates = ["name", "department"];
    const updates = {};

    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

/**
 * GET /api/users/pending
 * Get pendingusers (admin only)
 */
router.get(
  "/admin/pending",
  verifyToken,
  requireRole(["admin"]),
  async (req, res) => {
    try {
      const pendingUsers = await User.find({ status: "pending" }).select(
        "-password",
      );
      res.json(pendingUsers);
    } catch (error) {
      console.error("Error fetching pending users:", error);
      res.status(500).json({ error: "Failed to fetch pending users" });
    }
  },
);

/**
 * PATCH /api/users/:id/verify
 * Verify and activate user (admin only)
 */
router.patch(
  "/:id/verify",
  verifyToken,
  requireRole(["admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findByIdAndUpdate(
        id,
        { status: "active", verified: true },
        { new: true },
      ).select("-password");

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ message: "User verified successfully", user });
    } catch (error) {
      console.error("Error verifying user:", error);
      res.status(500).json({ error: "Failed to verify user" });
    }
  },
);

/**
 * PATCH /api/users/:id/roles
 * Update user roles (admin only)
 */
router.patch(
  "/:id/roles",
  verifyToken,
  requireRole(["admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { role, roles } = req.body;

      const updates = {};
      if (role) updates.role = role;
      if (roles && Array.isArray(roles)) updates.roles = roles;

      const user = await User.findByIdAndUpdate(id, updates, {
        new: true,
      }).select("-password");

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ message: "User roles updated", user });
    } catch (error) {
      console.error("Error updating roles:", error);
      res.status(500).json({ error: "Failed to update roles" });
    }
  },
);

module.exports = router;
