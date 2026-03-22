const express = require("express");
const router = express.Router();
const { auth, db } = require("../config/firebase.config");
const { verifyToken, requireAdmin } = require("../middleware/auth.middleware");
const { isPrimaryAdminEmail } = require("../config/admin.config");

function normalizeRole(role) {
  const value = String(role || "")
    .trim()
    .toLowerCase();

  if (value === "staff advisor" || value === "staffadvisor") {
    return "staff-advisor";
  }

  return value;
}

/**
 * GET /api/admin/users/pending
 * Get all pending users
 */
router.get("/users/pending", verifyToken, requireAdmin, async (req, res) => {
  try {
    const pendingUsersSnapshot = await db
      .collection("users")
      .where("status", "==", "pending")
      .get();

    const pendingUsers = [];
    pendingUsersSnapshot.forEach((doc) => {
      const data = doc.data();
      pendingUsers.push({
        id: doc.id,
        ...data,
        hashedPassword: undefined,
      });
    });

    res.json(pendingUsers);
  } catch (error) {
    console.error("Error fetching pending users:", error);
    res.status(500).json({ error: "Failed to fetch pending users" });
  }
});

/**
 * PATCH /api/admin/users/:id/verify
 * Verify/approve a user
 */
router.patch(
  "/users/:id/verify",
  verifyToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !["active", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const userDoc = await db.collection("users").doc(id).get();

      if (!userDoc.exists) {
        return res.status(404).json({ error: "User not found" });
      }

      await db
        .collection("users")
        .doc(id)
        .update({
          status: status === "approved" ? "active" : status,
          updatedAt: new Date().toISOString(),
          verifiedBy: req.user.uid,
          verifiedAt: new Date().toISOString(),
        });

      // If approved, update custom claims
      if (status === "active" || status === "approved") {
        const userData = userDoc.data();
        await auth.setCustomUserClaims(id, {
          role: userData.role,
          roles: userData.roles || [userData.role],
          verified: true,
        });
      }

      const updatedDoc = await db.collection("users").doc(id).get();
      const userData = updatedDoc.data();
      delete userData.hashedPassword;

      res.json({
        id: updatedDoc.id,
        ...userData,
      });
    } catch (error) {
      console.error("Error verifying user:", error);
      res.status(500).json({ error: "Failed to verify user" });
    }
  },
);

/**
 * PATCH /api/admin/users/:id/roles
 * Update user roles
 */
router.patch(
  "/users/:id/roles",
  verifyToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { roles } = req.body;

      if (!Array.isArray(roles) || roles.length === 0) {
        return res.status(400).json({ error: "Invalid roles array" });
      }

      const normalizedRoles = Array.from(
        new Set(roles.map((role) => normalizeRole(role)).filter(Boolean)),
      );

      if (normalizedRoles.includes("admin")) {
        return res.status(403).json({
          error: "Assigning admin role is disabled",
        });
      }

      const targetDoc = await db.collection("users").doc(id).get();
      if (!targetDoc.exists) {
        return res.status(404).json({ error: "User not found" });
      }

      const targetUser = targetDoc.data() || {};
      if (isPrimaryAdminEmail(targetUser.email)) {
        return res.status(403).json({
          error: "Primary admin role cannot be modified",
        });
      }

      const validRoles = ["faculty", "auditor", "staff-advisor"];
      const invalidRoles = normalizedRoles.filter(
        (role) => !validRoles.includes(role),
      );

      if (invalidRoles.length > 0) {
        return res.status(400).json({
          error: "Invalid roles",
          invalidRoles,
        });
      }

      await db.collection("users").doc(id).update({
        roles: normalizedRoles,
        role: normalizedRoles[0], // Primary role
        updatedAt: new Date().toISOString(),
      });

      // Update custom claims
      await auth.setCustomUserClaims(id, {
        role: normalizedRoles[0],
        roles: normalizedRoles,
      });

      const updatedDoc = await db.collection("users").doc(id).get();
      const userData = updatedDoc.data();
      delete userData.hashedPassword;

      res.json({
        id: updatedDoc.id,
        ...userData,
      });
    } catch (error) {
      console.error("Error updating roles:", error);
      res.status(500).json({ error: "Failed to update roles" });
    }
  },
);

/**
 * DELETE /api/admin/users/:id
 * Delete a user
 */
router.delete("/users/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Don't allow deleting yourself
    if (id === req.user.uid) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    // Delete from Firebase Auth
    await auth.deleteUser(id);

    // Delete from Firestore
    await db.collection("users").doc(id).delete();

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

/**
 * GET /api/admin/stats
 * Get dashboard statistics
 */
router.get("/stats", verifyToken, requireAdmin, async (req, res) => {
  try {
    const usersSnapshot = await db.collection("users").get();
    const courseFilesSnapshot = await db.collection("courseFiles").get();
    const eventReportsSnapshot = await db.collection("eventReports").get();

    const stats = {
      totalUsers: usersSnapshot.size,
      pendingUsers: 0,
      activeUsers: 0,
      totalCourseFiles: courseFilesSnapshot.size,
      pendingCourseFiles: 0,
      totalEventReports: eventReportsSnapshot.size,
      usersByRole: {},
    };

    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.status === "pending") stats.pendingUsers++;
      if (data.status === "active") stats.activeUsers++;

      const role = data.role || "unknown";
      stats.usersByRole[role] = (stats.usersByRole[role] || 0) + 1;
    });

    courseFilesSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.status === "Pending") stats.pendingCourseFiles++;
    });

    res.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

module.exports = router;
