const express = require("express");
const router = express.Router();
const UploadedFile = require("../models/UploadedFile");
const User = require("../models/User");
const { verifyToken } = require("../middleware/auth.middleware");

/**
 * GET /api/dashboard/faculty-list
 * Get all faculty users for dashboard
 */
router.get("/faculty-list", verifyToken, async (req, res) => {
  try {
    const faculty = await User.find({ role: "faculty" })
      .select("-password")
      .lean();

    const courseFiles = await UploadedFile.find({})
      .select("facultyId courseCode courseName semester academicYear")
      .lean();

    // Build courses by faculty
    const coursesByFaculty = new Map();
    for (const file of courseFiles) {
      const fId = file.facultyId?.toString();
      if (!fId) continue;

      if (!coursesByFaculty.has(fId)) {
        coursesByFaculty.set(fId, new Set());
      }

      const courseLabel = [file.courseCode, file.courseName]
        .filter(Boolean)
        .join(" - ");

      if (courseLabel) {
        coursesByFaculty.get(fId).add(courseLabel);
      }
    }

    // Format faculty members
    const facultyMembers = faculty.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      department: user.department || "",
      role: user.role,
      email: user.email || user.username,
      phone: user.phone || "",
      courses: Array.from(
        coursesByFaculty.get(user._id.toString()) || [],
      ).sort(),
      specialization: user.specialization || "",
      experience: user.experience || "",
      profileImageUrl: user.profileImageUrl || "",
      resumeUrl: user.resumeUrl || "",
      resumeFileName: user.resumeFileName || "",
    }));

    res.json({
      facultyMembers,
      total: facultyMembers.length,
    });
  } catch (error) {
    console.error("Error fetching faculty list:", error);
    res.status(500).json({ error: "Failed to fetch faculty list" });
  }
});

/**
 * GET /api/dashboard/faculty-stats/:facultyId
 * Get faculty dashboard stats
 */
router.get("/faculty-stats/:facultyId", verifyToken, async (req, res) => {
  try {
    const { facultyId } = req.params;

    const files = await UploadedFile.find({ facultyId }).lean();
    const pendingFiles = files.filter(
      (f) => f.status === "pending" || f.status === "submitted",
    ).length;

    const totalParticipants = files.reduce(
      (sum, f) => sum + (f.participants || 0),
      0,
    );

    const recentActivity = files
      .sort(
        (a, b) =>
          (b.uploadedAt?.getTime() || 0) - (a.uploadedAt?.getTime() || 0),
      )
      .slice(0, 5)
      .map((file) => ({
        action: "Uploaded",
        item: file.originalFileName,
        time: formatTimeAgo(file.uploadedAt),
      }));

    res.json({
      stats: {
        totalFiles: files.length,
        totalReports: 0,
        pendingReports: pendingFiles,
        totalParticipants,
        recentActivity,
      },
    });
  } catch (error) {
    console.error("Error fetching faculty stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

/**
 * GET /api/dashboard/all-files
 * Get all course files for dashboard
 */
router.get("/all-files", verifyToken, async (req, res) => {
  try {
    const files = await UploadedFile.find({})
      .populate("facultyId", "name email department")
      .select(
        "fileName originalFileName courseCode courseName semester academicYear status uploadedAt facultyId",
      )
      .lean();

    // Group by faculty
    const grouped = {};
    for (const file of files) {
      const fId = file.facultyId?._id?.toString() || "unknown";
      if (!grouped[fId]) {
        grouped[fId] = [];
      }
      grouped[fId].push(file);
    }

    res.json({ files: grouped, total: files.length });
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ error: "Failed to fetch files" });
  }
});

/**
 * GET /api/dashboard/engagements
 * Get engagement data across all users
 */
router.get("/engagements", verifyToken, async (req, res) => {
  try {
    const files = await UploadedFile.find({})
      .select("facultyId status uploadedAt")
      .lean();

    const faculty = await User.find({ role: "faculty" })
      .select("_id name")
      .lean();

    // Build engagement stats
    const engagements = faculty.map((user) => {
      const userFiles = files.filter(
        (f) => f.facultyId?.toString() === user._id.toString(),
      );
      const uploadedCount = userFiles.length;
      const approvedCount = userFiles.filter(
        (f) => f.status === "approved",
      ).length;

      return {
        facultyId: user._id.toString(),
        facultyName: user.name,
        uploadsCount: uploadedCount,
        score:
          uploadedCount > 0
            ? Math.round((approvedCount / uploadedCount) * 100)
            : 0,
      };
    });

    res.json({ engagements });
  } catch (error) {
    console.error("Error fetching engagements:", error);
    res.status(500).json({ error: "Failed to fetch engagements" });
  }
});

/**
 * GET /api/dashboard/students
 * Get student data
 */
router.get("/students", verifyToken, async (req, res) => {
  try {
    const advisorId = String(req.query.advisorId || "").trim();
    const query = advisorId ? { advisorId } : {};

    const students = await User.db
      .collection("students")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    const normalizedStudents = students.map((student) => ({
      ...student,
      id: String(student.id || student._id),
    }));

    res.json({ students: normalizedStudents });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

/**
 * Helper: Format time ago
 */
function formatTimeAgo(date) {
  if (!date) return "Just now";
  const diffMs = Date.now() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(date).toLocaleDateString();
}

module.exports = router;
