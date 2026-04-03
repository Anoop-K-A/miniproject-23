const mongoose = require("mongoose");

const COURSE_FILE_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "submitted",
  "in_review",
];

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeStatus(value) {
  const normalized = String(value || "pending")
    .trim()
    .toLowerCase();
  if (!normalized) return "pending";
  if (normalized === "in review") return "in_review";
  return COURSE_FILE_STATUSES.includes(normalized) ? normalized : "pending";
}

const courseFileSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    documentUrl: {
      type: String,
      required: true,
      trim: true,
    },
    courseCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    fileType: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    semester: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    academicYear: {
      type: String,
      default: "",
      trim: true,
    },
    size: {
      type: Number,
      required: true,
      min: 0,
      set: toNumber,
    },
    status: {
      type: String,
      enum: COURSE_FILE_STATUSES,
      default: "pending",
      set: normalizeStatus,
      index: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
      index: true,
    },
    review: {
      adminRemarks: {
        type: String,
        default: "",
        trim: true,
      },
      auditorRemarks: {
        type: String,
        default: "",
        trim: true,
      },
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      reviewedDate: {
        type: Date,
      },
      responseDate: {
        type: Date,
      },
      // Backward-compatible aliases currently used by existing route logic.
      remarks: {
        type: String,
        default: "",
        trim: true,
      },
      status: {
        type: String,
        enum: COURSE_FILE_STATUSES,
        default: "pending",
        set: normalizeStatus,
      },
      reviewedAt: {
        type: Date,
      },
      facultyResponse: {
        type: String,
        default: "",
        trim: true,
      },
      auditScore: {
        type: Number,
        min: 0,
        max: 100,
      },
    },

    // Compatibility fields for existing API and route behavior.
    originalFileName: {
      type: String,
      default: "",
      trim: true,
    },
    mimeType: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    courseName: {
      type: String,
      default: "",
      trim: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    legacyId: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "coursefiles",
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

courseFileSchema.index({ courseCode: 1, uploadDate: -1 });
courseFileSchema.index({ faculty: 1, uploadDate: -1 });
courseFileSchema.index({ status: 1, uploadDate: -1 });
courseFileSchema.index({ academicYear: 1, uploadDate: -1 });
courseFileSchema.index({ legacyId: 1 }, { sparse: true, unique: true });

courseFileSchema.pre("save", function syncStatusAndReview(next) {
  this.status = normalizeStatus(
    this.status || this.review?.status || "pending",
  );
  this.review = this.review || {};
  this.review.status = this.status;

  if (this.review.reviewedDate && !this.review.reviewedAt) {
    this.review.reviewedAt = this.review.reviewedDate;
  }
  if (this.review.reviewedAt && !this.review.reviewedDate) {
    this.review.reviewedDate = this.review.reviewedAt;
  }
  if (this.review.adminRemarks && !this.review.remarks) {
    this.review.remarks = this.review.adminRemarks;
  }
  if (this.review.remarks && !this.review.adminRemarks) {
    this.review.adminRemarks = this.review.remarks;
  }

  this.uploadDate = this.uploadDate || this.uploadedAt || new Date();
  this.uploadedAt = this.uploadedAt || this.uploadDate;

  next();
});

courseFileSchema.virtual("id").get(function getId() {
  return this._id ? this._id.toString() : "";
});

courseFileSchema
  .virtual("documentPath")
  .get(function getDocumentPath() {
    return this.documentUrl;
  })
  .set(function setDocumentPath(value) {
    this.documentUrl = value;
  });

courseFileSchema
  .virtual("filePath")
  .get(function getFilePath() {
    return this.documentUrl;
  })
  .set(function setFilePath(value) {
    this.documentUrl = value;
  });

courseFileSchema
  .virtual("fileSize")
  .get(function getFileSize() {
    return this.size;
  })
  .set(function setFileSize(value) {
    this.size = toNumber(value);
  });

const CourseFile = mongoose.model("CourseFile", courseFileSchema);

module.exports = CourseFile;
