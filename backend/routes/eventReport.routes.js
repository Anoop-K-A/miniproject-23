const express = require("express");
const router = express.Router();
const { db, bucket } = require("../config/firebase.config");
const { verifyToken, requireRole } = require("../middleware/auth.middleware");
const { upload } = require("../middleware/upload.middleware");
const path = require("path");

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

    let query = db.collection("eventReports");

    if (facultyId) {
      query = query.where("facultyId", "==", facultyId);
    }
    if (status) {
      query = query.where("status", "==", status);
    }
    if (eventType) {
      query = query.where("eventType", "==", eventType);
    }

    // Get total count
    const countSnapshot = await query.get();
    const total = countSnapshot.size;

    // Get paginated data
    const snapshot = await query
      .orderBy("createdAt", "desc")
      .limit(limit)
      .offset(offset)
      .get();

    const eventReports = [];
    snapshot.forEach((doc) => {
      eventReports.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.json({
      data: eventReports,
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

      const facultyId = req.user.uid;
      const facultyDoc = await db.collection("users").doc(facultyId).get();
      const facultyData = facultyDoc.data();

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
        facultyName: facultyData.name,
        department: facultyData.department,
        title,
        eventType,
        date,
        venue: venue || "",
        description: description || "",
        participants: participants || "",
        outcomes: outcomes || "",
        images: imageUrls,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await db.collection("eventReports").add(eventReportData);

      res.status(201).json({
        id: docRef.id,
        ...eventReportData,
      });
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
    const doc = await db.collection("eventReports").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Event report not found" });
    }

    res.json({
      id: doc.id,
      ...doc.data(),
    });
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

    const doc = await db.collection("eventReports").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Event report not found" });
    }

    const reportData = doc.data();
    const userRoles = req.user.roles || [req.user.role];

    // Check permissions
    if (
      reportData.facultyId !== req.user.uid &&
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

    updates.updatedAt = new Date().toISOString();

    await db.collection("eventReports").doc(id).update(updates);

    const updatedDoc = await db.collection("eventReports").doc(id).get();

    res.json({
      id: updatedDoc.id,
      ...updatedDoc.data(),
    });
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

      const doc = await db.collection("eventReports").doc(id).get();

      if (!doc.exists) {
        return res.status(404).json({ error: "Event report not found" });
      }

      const reportData = doc.data();
      const userRoles = req.user.roles || [req.user.role];

      // Check if user owns the report or is admin
      if (
        reportData.facultyId !== req.user.uid &&
        !userRoles.includes("admin")
      ) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Delete images from Firebase Storage
      if (reportData.images && reportData.images.length > 0) {
        for (const image of reportData.images) {
          try {
            const file = bucket.file(image.storagePath);
            await file.delete();
          } catch (storageError) {
            console.error("Error deleting image from storage:", storageError);
          }
        }
      }

      // Delete from Firestore
      await db.collection("eventReports").doc(id).delete();

      res.json({ message: "Event report deleted successfully" });
    } catch (error) {
      console.error("Error deleting event report:", error);
      res.status(500).json({ error: "Failed to delete event report" });
    }
  },
);

module.exports = router;
