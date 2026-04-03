const express = require("express");
const router = express.Router();
const UploadedFile = require("../models/UploadedFile");
const Faculty = require("../models/Faculty");
const { verifyToken, requireRole } = require("../middleware/auth.middleware");
const { upload } = require("../middleware/upload.middleware");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const fsPromises = fs.promises;

const REVIEW_STATUSES = new Set([
  "pending",
  "submitted",
  "in_review",
  "approved",
  "rejected",
]);

function normalizeReviewStatus(value) {
  const normalized = String(value || "pending")
    .trim()
    .toLowerCase();

  if (!normalized) return "pending";
  if (normalized === "in review") return "in_review";
  return REVIEW_STATUSES.has(normalized) ? normalized : "pending";
}

function normalizeTrimmedString(value, fallback = "") {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseDateOrNull(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function buildApiFile(raw) {
  const file = typeof raw.toObject === "function" ? raw.toObject() : raw;
  const review = file.review || {};
  const facultyDoc =
    file.faculty && typeof file.faculty === "object" ? file.faculty : null;
  const facultyFromUser =
    file.facultyId && typeof file.facultyId === "object"
      ? file.facultyId
      : null;
  const facultyName =
    normalizeTrimmedString(
      facultyDoc?.name || facultyFromUser?.name || file.facultyName,
    ) || "";
  const department =
    normalizeTrimmedString(
      facultyDoc?.department || facultyFromUser?.department || file.department,
    ) || "";

  return {
    ...file,
    id: file._id ? file._id.toString() : file.id,
    size: toNumber(file.fileSize ?? file.size, 0),
    facultyName,
    department,
    status: normalizeReviewStatus(review.status || file.status),
    remarks: normalizeTrimmedString(review.remarks || file.remarks),
    adminRemarks: normalizeTrimmedString(review.remarks || file.adminRemarks),
    reviewedBy: review.reviewedBy || file.reviewedBy || null,
    reviewedDate: review.reviewedAt || file.reviewedDate || null,
    facultyResponse: normalizeTrimmedString(
      review.facultyResponse || file.facultyResponse,
    ),
    responseDate: review.responseDate || file.responseDate || null,
    review: {
      status: normalizeReviewStatus(review.status || file.status),
      remarks: normalizeTrimmedString(review.remarks || file.remarks),
      reviewedBy: review.reviewedBy || file.reviewedBy || null,
      reviewedAt: review.reviewedAt || file.reviewedDate || null,
      facultyResponse: normalizeTrimmedString(
        review.facultyResponse || file.facultyResponse,
      ),
      responseDate: review.responseDate || file.responseDate || null,
      auditScore:
        review.auditScore !== undefined
          ? toNumber(review.auditScore, 0)
          : file.auditScore,
    },
  };
}

function sendValidationError(res, message) {
  return res.status(400).json({ error: message });
}

function isOwnerOrModerator(doc, user) {
  const isOwner = doc.facultyId.toString() === user._id.toString();
  const isModerator = user.role === "admin" || user.role === "auditor";
  return isOwner || isModerator;
}

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

      const courseCode = normalizeTrimmedString(
        req.body.courseCode,
      ).toUpperCase();
      const courseName = normalizeTrimmedString(req.body.courseName);
      const fileType = normalizeTrimmedString(req.body.fileType).toLowerCase();
      const semester = normalizeTrimmedString(req.body.semester).toLowerCase();
      const academicYear = normalizeTrimmedString(req.body.academicYear);

      // Validate required fields
      if (!courseCode)
        return sendValidationError(res, "courseCode is required");
      if (!courseName)
        return sendValidationError(res, "courseName is required");
      if (!fileType) return sendValidationError(res, "fileType is required");
      if (!semester) return sendValidationError(res, "semester is required");
      if (!academicYear)
        return sendValidationError(res, "academicYear is required");

      const normalizedFacultyName = normalizeTrimmedString(req.user.name);
      const normalizedDepartment = normalizeTrimmedString(req.user.department);
      const normalizedFacultyNameKey = normalizedFacultyName
        .replace(/\s+/g, " ")
        .toLowerCase();
      const normalizedDepartmentKey = normalizedDepartment
        .replace(/\s+/g, " ")
        .toLowerCase();

      const faculty = await Faculty.findOneAndUpdate(
        {
          nameKey: normalizedFacultyNameKey,
          departmentKey: normalizedDepartmentKey,
        },
        {
          $setOnInsert: {
            name: normalizedFacultyName,
            department: normalizedDepartment,
            nameKey: normalizedFacultyNameKey,
            departmentKey: normalizedDepartmentKey,
          },
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        },
      );

      // Create uploaded file record in MongoDB
      const uploadedFile = await UploadedFile.create({
        fileName: req.file.filename,
        originalFileName: req.file.originalname,
        documentUrl: `/uploads/${req.file.filename}`,
        filePath: `/uploads/${req.file.filename}`,
        size: req.file.size,
        fileSize: req.file.size,
        fileType,
        mimeType: req.file.mimetype,
        faculty: faculty._id,
        facultyId: req.user._id,
        courseCode,
        courseName,
        semester,
        academicYear,
        status: "pending",
        uploadDate: new Date(),
        review: {
          status: "pending",
          remarks: "",
          adminRemarks: "",
          auditorRemarks: "",
        },
        uploadedAt: new Date(),
      });

      // Populate faculty details
      await uploadedFile.populate("faculty", "name department");
      await uploadedFile.populate("facultyId", "name email department");

      res.status(201).json({
        message: "File uploaded successfully",
        file: buildApiFile(uploadedFile),
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
        try {
          await fsPromises.access(filePath);
          await fsPromises.unlink(filePath);
        } catch {
          // Best effort cleanup: ignore missing/locked file errors.
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
      if (!mongoose.isValidObjectId(facultyId)) {
        return sendValidationError(res, "Invalid facultyId");
      }
      filters.facultyId = facultyId;
    }
    if (status) {
      const normalizedStatus = normalizeReviewStatus(status);
      const legacyStatusVariants = [
        normalizedStatus,
        normalizedStatus.replace(/_/g, " "),
      ];
      filters.$or = [
        { "review.status": normalizedStatus },
        { status: { $in: legacyStatusVariants } },
      ];
    }
    if (courseCode) {
      filters.courseCode = normalizeTrimmedString(courseCode).toUpperCase();
    }
    if (academicYear) {
      filters.academicYear = normalizeTrimmedString(academicYear);
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const uploadedFiles = await UploadedFile.find(filters)
      .populate("faculty", "name department")
      .populate("facultyId", "name email department")
      .sort({ uploadedAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const normalizedFiles = uploadedFiles.map(buildApiFile);

    const total = await UploadedFile.countDocuments(filters);

    res.json({
      data: normalizedFiles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
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

    if (!mongoose.isValidObjectId(id)) {
      return sendValidationError(res, "Invalid file id");
    }

    const uploadedFile = await UploadedFile.findById(id)
      .populate("faculty", "name department")
      .populate("facultyId", "name email department");

    if (!uploadedFile) {
      return res.status(404).json({ error: "File not found" });
    }

    res.json(buildApiFile(uploadedFile));
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

      if (!mongoose.isValidObjectId(id)) {
        return sendValidationError(res, "Invalid file id");
      }

      const {
        status,
        remarks,
        adminRemarks,
        reviewedBy,
        reviewedDate,
        facultyResponse,
        responseDate,
        auditScore,
      } = req.body;

      const uploadedFile = await UploadedFile.findById(id);

      if (!uploadedFile) {
        return res.status(404).json({ error: "File not found" });
      }

      if (!isOwnerOrModerator(uploadedFile, req.user)) {
        return res.status(403).json({ error: "Access denied" });
      }

      uploadedFile.review = uploadedFile.review || {};

      if (status !== undefined) {
        uploadedFile.review.status = normalizeReviewStatus(status);
      }

      if (remarks !== undefined || adminRemarks !== undefined) {
        const nextRemarks = remarks !== undefined ? remarks : adminRemarks;
        uploadedFile.review.remarks = normalizeTrimmedString(nextRemarks);
      }

      if (facultyResponse !== undefined) {
        uploadedFile.review.facultyResponse =
          normalizeTrimmedString(facultyResponse);
      }

      if (auditScore !== undefined) {
        const parsedScore = toNumber(auditScore, NaN);
        if (
          !Number.isFinite(parsedScore) ||
          parsedScore < 0 ||
          parsedScore > 100
        ) {
          return sendValidationError(
            res,
            "auditScore must be between 0 and 100",
          );
        }
        uploadedFile.review.auditScore = parsedScore;
      }

      if (reviewedBy !== undefined) {
        if (reviewedBy && !mongoose.isValidObjectId(reviewedBy)) {
          return sendValidationError(
            res,
            "reviewedBy must be a valid ObjectId",
          );
        }
        uploadedFile.review.reviewedBy = reviewedBy || undefined;
      }

      if (reviewedDate !== undefined) {
        const parsedReviewedDate = parseDateOrNull(reviewedDate);
        if (reviewedDate && !parsedReviewedDate) {
          return sendValidationError(res, "reviewedDate must be a valid date");
        }
        uploadedFile.review.reviewedAt = parsedReviewedDate || undefined;
      }

      if (responseDate !== undefined) {
        const parsedResponseDate = parseDateOrNull(responseDate);
        if (responseDate && !parsedResponseDate) {
          return sendValidationError(res, "responseDate must be a valid date");
        }
        uploadedFile.review.responseDate = parsedResponseDate || undefined;
      }

      await uploadedFile.save({ validateBeforeSave: true });

      res.json({
        message: "File updated successfully",
        file: buildApiFile(uploadedFile),
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

      if (!mongoose.isValidObjectId(id)) {
        return sendValidationError(res, "Invalid file id");
      }

      const uploadedFile = await UploadedFile.findById(id);

      if (!uploadedFile) {
        return res.status(404).json({ error: "File not found" });
      }

      if (!isOwnerOrModerator(uploadedFile, req.user)) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Delete file from disk
      const relativeFilePath = String(uploadedFile.filePath || "").replace(
        /^\/+/,
        "",
      );
      const filePath = path.resolve(__dirname, "..", relativeFilePath);
      try {
        await fsPromises.access(filePath);
        await fsPromises.unlink(filePath);
      } catch {
        // Best effort cleanup: ignore missing/locked file errors.
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
