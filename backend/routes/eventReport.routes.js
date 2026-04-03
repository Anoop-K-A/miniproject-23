const express = require("express");
const router = express.Router();
const { bucket } = require("../config/firebase.config");
const { verifyToken, requireRole } = require("../middleware/auth.middleware");
const { upload } = require("../middleware/upload.middleware");
const mongoose = require("mongoose");
const EventReport = require("../models/EventReport");

function normalizeStatus(value) {
  return String(value || "pending")
    .trim()
    .toLowerCase();
}

function buildStatusQuery(status) {
  const normalized = normalizeStatus(status);
  if (!normalized) return {};

  return {
    $or: [
      { status: normalized },
      { status: normalized.toUpperCase() },
      { status: normalized.charAt(0).toUpperCase() + normalized.slice(1) },
    ],
  };
}

function buildFacultyQuery(facultyId) {
  if (!facultyId) return {};

  if (mongoose.isValidObjectId(facultyId)) {
    return { $or: [{ facultyId }, { facultyId: String(facultyId) }] };
  }

  return { facultyId: String(facultyId) };
}

function normalizeEventReport(doc) {
  const report = typeof doc.toObject === "function" ? doc.toObject() : doc;
  return {
    ...report,
    id: report._id ? report._id.toString() : report.id,
    date: report.eventDate
      ? new Date(report.eventDate).toISOString().slice(0, 10)
      : report.date,
    status: normalizeStatus(report.status),
  };
}

function toPositiveNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

/**
 * GET /api/event-reports
 * Get all event reports (with optional filters)
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const { facultyId, status, eventType } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const filters = {
      ...buildFacultyQuery(facultyId),
      ...(status ? buildStatusQuery(status) : {}),
      ...(eventType ? { eventType } : {}),
    };

    const total = await EventReport.countDocuments(filters);
    const eventReports = await EventReport.find(filters)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .lean();

    res.json({
      data: eventReports.map(normalizeEventReport),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching event reports:", error);
    res.status(500).json({ error: "Failed to fetch event reports" });
  }
});

/**
 * POST /api/event-reports
 * Create a new event report
 */
router.post(
  "/",
  verifyToken,
  requireRole(["faculty", "admin"]),
  upload.array("images", 10),
  async (req, res) => {
    try {
      const {
        title,
        eventType,
        date,
        venue,
        description,
        participants,
        outcomes,
      } = req.body;

      if (!title || !eventType || !date) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const facultyId = req.user._id;
      const facultyData = req.user;

      // Upload images if provided
      const imageUrls = [];
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const timestamp = Date.now();
          const fileName = `${timestamp}_${file.originalname}`;
          const filePath = `event-reports/${facultyId}/${fileName}`;

          const storageFile = bucket.file(filePath);
          await storageFile.save(file.buffer, {
            metadata: {
              contentType: file.mimetype,
            },
          });

          await storageFile.makePublic();
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
          imageUrls.push({
            url: publicUrl,
            storagePath: filePath,
          });
        }
      }

      const eventReportData = {
        facultyId,
        facultyName: facultyData.name || "",
        department: facultyData.department || "",
        title,
        eventType,
        eventDate: new Date(date),
        venue: venue || "",
        description: description || "",
        participants: toPositiveNumber(participants, 0),
        outcomes: outcomes || "",
        images: imageUrls,
        status: "pending",
      };

      const created = await EventReport.create(eventReportData);

      res.status(201).json(normalizeEventReport(created));
    } catch (error) {
      console.error("Error creating event report:", error);
      res.status(500).json({
        error: "Failed to create event report",
        message: error.message,
      });
    }
  },
);

/**
 * GET /api/event-reports/:id
 * Get a specific event report
 */
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid event report id" });
    }

    const doc = await EventReport.findById(id).lean();

    if (!doc) {
      return res.status(404).json({ error: "Event report not found" });
    }

    res.json(normalizeEventReport(doc));
  } catch (error) {
    console.error("Error fetching event report:", error);
    res.status(500).json({ error: "Failed to fetch event report" });
  }
});

/**
 * PATCH /api/event-reports/:id
 * Update an event report
 */
router.patch("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid event report id" });
    }

    const doc = await EventReport.findById(id);

    if (!doc) {
      return res.status(404).json({ error: "Event report not found" });
    }
    const userRoles = req.user.roles || [req.user.role];

    // Check permissions
    if (
      doc.facultyId.toString() !== req.user._id.toString() &&
      !userRoles.includes("admin") &&
      !userRoles.includes("staff-advisor")
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    const updates = {};
    const allowedFields = [
      "title",
      "eventType",
      "date",
      "venue",
      "description",
      "participants",
      "outcomes",
      "status",
    ];

    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    if (updates.date) {
      updates.eventDate = new Date(updates.date);
      delete updates.date;
    }

    if (updates.participants !== undefined) {
      updates.participants = toPositiveNumber(updates.participants, 0);
    }

    if (updates.status) {
      updates.status = normalizeStatus(updates.status);
    }

    await doc.updateOne(updates);

    const updatedDoc = await EventReport.findById(id).lean();

    res.json(normalizeEventReport(updatedDoc));
  } catch (error) {
    console.error("Error updating event report:", error);
    res.status(500).json({ error: "Failed to update event report" });
  }
});

/**
 * DELETE /api/event-reports/:id
 * Delete an event report
 */
router.delete(
  "/:id",
  verifyToken,
  requireRole(["faculty", "admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ error: "Invalid event report id" });
      }

      const doc = await EventReport.findById(id);

      if (!doc) {
        return res.status(404).json({ error: "Event report not found" });
      }

      const userRoles = req.user.roles || [req.user.role];

      // Check if user owns the report or is admin
      if (
        doc.facultyId.toString() !== req.user._id.toString() &&
        !userRoles.includes("admin")
      ) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Delete images from Firebase Storage
      if (doc.images && doc.images.length > 0) {
        for (const image of doc.images) {
          try {
            const file = bucket.file(image.storagePath);
            await file.delete();
          } catch (storageError) {
            console.error("Error deleting image from storage:", storageError);
          }
        }
      }

      // Delete from MongoDB
      await EventReport.findByIdAndDelete(id);

      res.json({ message: "Event report deleted successfully" });
    } catch (error) {
      console.error("Error deleting event report:", error);
      res.status(500).json({ error: "Failed to delete event report" });
    }
  },
);

module.exports = router;
