const express = require("express");
const router = express.Router();
const Responsibility = require("../models/Responsibility");
const User = require("../models/User");
const { verifyToken, requireRole } = require("../middleware/auth.middleware");

/**
 * GET /api/responsibilities
 * Get all responsibilities or filter by faculty
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const { facultyId, type } = req.query;

    const filters = {};

    if (facultyId) {
      filters.facultyId = facultyId;
    }
    if (type) {
      filters.type = type;
    }

    const responsibilities = await Responsibility.find(filters)
      .populate("facultyId", "name email department")
      .populate("assignedBy", "name email");

    res.json(responsibilities);
  } catch (error) {
    console.error("Error fetching responsibilities:", error);
    res.status(500).json({ error: "Failed to fetch responsibilities" });
  }
});

/**
 * POST /api/responsibilities
 * Create a new responsibility assignment (admin/staff-advisor only)
 */
router.post(
  "/",
  verifyToken,
  requireRole(["admin", "staff-advisor"]),
  async (req, res) => {
    try {
      const { facultyId, type, title, description, startDate, endDate } =
        req.body;

      if (!facultyId || !type || !title) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Verify faculty exists
      const faculty = await User.findById(facultyId);
      if (!faculty) {
        return res.status(404).json({ error: "Faculty not found" });
      }

      const responsibility = await Responsibility.create({
        facultyId,
        type,
        title,
        description: description || "",
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : new Date(),
        status: "active",
        assignedBy: req.user._id,
      });

      // Populate related data
      await responsibility.populate("facultyId", "name email department");
      await responsibility.populate("assignedBy", "name email");

      res.status(201).json({
        message: "Responsibility created successfully",
        responsibility,
      });
    } catch (error) {
      console.error("Error creating responsibility:", error);
      res.status(500).json({
        error: "Failed to create responsibility",
        message: error.message,
      });
    }
  },
);

/**
 * PATCH /api/responsibilities/:id
 * Update a responsibility
 */
router.patch(
  "/:id",
  verifyToken,
  requireRole(["admin", "staff-advisor"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, startDate, endDate, status, type } = req.body;

      const updates = {};

      if (title) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (startDate) updates.startDate = new Date(startDate);
      if (endDate) updates.endDate = new Date(endDate);
      if (status) updates.status = status;
      if (type) updates.type = type;

      const responsibility = await Responsibility.findByIdAndUpdate(
        id,
        updates,
        { new: true },
      )
        .populate("facultyId", "name email department")
        .populate("assignedBy", "name email");

      if (!responsibility) {
        return res.status(404).json({ error: "Responsibility not found" });
      }

      res.json({
        message: "Responsibility updated successfully",
        responsibility,
      });
    } catch (error) {
      console.error("Error updating responsibility:", error);
      res.status(500).json({ error: "Failed to update responsibility" });
    }
  },
);

/**
 * DELETE /api/responsibilities/:id
 * Delete a responsibility
 */
router.delete(
  "/:id",
  verifyToken,
  requireRole(["admin", "staff-advisor"]),
  async (req, res) => {
    try {
      const { id } = req.params;

      const responsibility = await Responsibility.findByIdAndDelete(id);

      if (!responsibility) {
        return res.status(404).json({ error: "Responsibility not found" });
      }

      res.json({ message: "Responsibility deleted successfully" });
    } catch (error) {
      console.error("Error deleting responsibility:", error);
      res.status(500).json({ error: "Failed to delete responsibility" });
    }
  },
);

module.exports = router;
