const express = require("express");
const router = express.Router();
const UploadedFile = require("../models/UploadedFile");
const User = require("../models/User");
const { verifyToken, requireRole } = require("../middleware/auth.middleware");
const { upload } = require("../middleware/upload.middleware");
const path = require("path");
const fs = require("fs");

/**
 * POST /api/course-files/upload
 * Upload a course file
 */
router.post(
  "/upload",
  verifyToken,
  requireRole(["faculty", "admin"]),
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { courseCode, courseName, fileType, semester, academicYear } =
        req.body;

      // Validate required fields
      if (
        !courseCode ||
        !courseName ||
        !fileType ||
        !semester ||
        !academicYear
      ) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Create uploaded file record in MongoDB
      const uploadedFile = await UploadedFile.create({
        fileName: req.file.filename,
        originalFileName: req.file.originalname,
        filePath: `/uploads/${req.file.filename}`,
        fileSize: req.file.size,
        fileType,
        mimeType: req.file.mimetype,
        facultyId: req.user._id,
        courseCode,
        courseName,
        semester,
        academicYear,
        status: "pending",
        uploadedAt: new Date(),
      });

      // Populate faculty details
      await uploadedFile.populate("facultyId", "name email department");

      res.status(201).json({
        message: "File uploaded successfully",
        file: uploadedFile,
      });
    } catch (error) {
      console.error("Error uploading file:", error);

      // Delete uploaded file if there was an error
      if (req.file) {
        const filePath = path.join(
          __dirname,
          "..",
          "uploads",
          req.file.filename,
        );
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      res.status(500).json({
        error: "Failed to upload file",
        message: error.message,
      });
    }
  },
);

/**
 * GET /api/course-files
 * Get all course files (with optional filters)
 */
router.get("/", verifyToken, async (req, res) => {
  try {
    const { facultyId, status, courseCode, academicYear } = req.query;

    const filters = {};

    if (facultyId) {
      filters.facultyId = facultyId;
    }
    if (status) {
      filters.status = status;
    }
    if (courseCode) {
      filters.courseCode = courseCode;
    }
    if (academicYear) {
      filters.academicYear = academicYear;
    }

    const uploadedFiles = await UploadedFile.find(filters)
      .populate("facultyId", "name email department")
      .sort({ uploadedAt: -1 });

    res.json(uploadedFiles);
  } catch (error) {
    console.error("Error fetching course files:", error);
    res.status(500).json({ error: "Failed to fetch course files" });
  }
});

/**
 * GET /api/course-files/:id
 * Get a specific course file
 */
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const uploadedFile = await UploadedFile.findById(id).populate("facultyId");

    if (!uploadedFile) {
      return res.status(404).json({ error: "File not found" });
    }

    res.json(uploadedFile);
  } catch (error) {
    console.error("Error fetching file:", error);
    res.status(500).json({ error: "Failed to fetch file" });
  }
});

/**
 * PATCH /api/course-files/:id
 * Update file status or metadata
 */
router.patch(
  "/:id",
  verifyToken,
  requireRole(["admin", "auditor", "faculty"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status, remarks } = req.body;

      const uploadedFile = await UploadedFile.findById(id);

      if (!uploadedFile) {
        return res.status(404).json({ error: "File not found" });
      }

      // Allow faculty to only update their own files, admins can update any
      if (
        uploadedFile.facultyId.toString() !== req.user._id.toString() &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({ error: "Access denied" });
      }

      if (status) uploadedFile.status = status;
      if (remarks) uploadedFile.remarks = remarks;
      uploadedFile.updatedAt = new Date();

      await uploadedFile.save();

      res.json({
        message: "File updated successfully",
        file: uploadedFile,
      });
    } catch (error) {
      console.error("Error updating file:", error);
      res.status(500).json({ error: "Failed to update file" });
    }
  },
);

/**
 * DELETE /api/course-files/:id
 * Delete a course file
 */
router.delete(
  "/:id",
  verifyToken,
  requireRole(["faculty", "admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;

      const uploadedFile = await UploadedFile.findById(id);

      if (!uploadedFile) {
        return res.status(404).json({ error: "File not found" });
      }

      // Check if user owns the file or is admin
      if (
        uploadedFile.facultyId.toString() !== req.user._id.toString() &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Delete file from disk
      const filePath = path.join(__dirname, "..", uploadedFile.filePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Delete from MongoDB
      await UploadedFile.findByIdAndDelete(id);

      res.json({ message: "File deleted successfully" });
    } catch (error) {
      console.error("Error deleting file:", error);
      res.status(500).json({ error: "Failed to delete file" });
    }
  },
);

module.exports = router;
