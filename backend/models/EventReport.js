const mongoose = require("mongoose");
const { EVENT_REPORT_STATUS, EVENT_TYPES } = require("../constants");

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    storagePath: {
      type: String,
      required: [true, "Storage path is required"],
      trim: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const eventReportSchema = new mongoose.Schema(
  {
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Faculty ID is required"],
      index: true,
    },
    facultyName: {
      type: String,
      default: "",
      trim: true,
    },
    department: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    eventType: {
      type: String,
      required: [true, "Event type is required"],
      enum: {
        values: Object.values(EVENT_TYPES),
        message: `Event type must be one of: ${Object.values(EVENT_TYPES).join(", ")}`,
      },
      trim: true,
      index: true,
    },
    eventDate: {
      type: Date,
      required: [true, "Event date is required"],
      index: true,
    },
    venue: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    participants: {
      type: Number,
      default: 0,
      min: [0, "Participants count cannot be negative"],
      max: [10000, "Participants count cannot exceed 10000"],
    },
    outcomes: {
      type: String,
      default: "",
      trim: true,
      maxlength: [2000, "Outcomes cannot exceed 2000 characters"],
    },
    images: {
      type: [imageSchema],
      default: [],
    },
    status: {
      type: String,
      enum: {
        values: Object.values(EVENT_REPORT_STATUS),
        message: `Status must be one of: ${Object.values(EVENT_REPORT_STATUS).join(", ")}`,
      },
      default: EVENT_REPORT_STATUS.PENDING,
      lowercase: true,
      trim: true,
      index: true,
    },
    approvalNotes: {
      type: String,
      default: "",
      trim: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: true },
    toObject: { virtuals: true, transform: true },
  },
);

// Compound indexes for optimal query performance
eventReportSchema.index({ facultyId: 1, eventDate: -1 });
eventReportSchema.index({ status: 1, eventDate: -1 });
eventReportSchema.index({ eventType: 1, eventDate: -1 });
eventReportSchema.index({ department: 1, eventDate: -1 });
eventReportSchema.index({ facultyId: 1, status: 1, createdAt: -1 });
eventReportSchema.index({ deletedAt: 1, facultyId: 1 });

// Pre-save middleware
eventReportSchema.pre("save", function (next) {
  // Normalize status to lowercase
  if (this.status) {
    this.status = this.status.toLowerCase();
  }
  next();
});

// Methods
eventReportSchema.methods.isApproved = function () {
  return this.status === EVENT_REPORT_STATUS.APPROVED;
};

eventReportSchema.methods.isPending = function () {
  return this.status === EVENT_REPORT_STATUS.PENDING;
};

eventReportSchema.methods.isRejected = function () {
  return this.status === EVENT_REPORT_STATUS.REJECTED;
};

eventReportSchema.methods.canBeEdited = function () {
  return this.isPending() || this.isRejected();
};

// Virtuals
eventReportSchema.virtual("id").get(function getId() {
  return this._id ? this._id.toString() : "";
});

eventReportSchema.virtual("date").get(function getDate() {
  return this.eventDate ? this.eventDate.toISOString() : "";
});

eventReportSchema.virtual("isDeleted").get(function isDeleted() {
  return !!this.deletedAt;
});

eventReportSchema.virtual("imageCount").get(function getImageCount() {
  return this.images ? this.images.length : 0;
});

const EventReport = mongoose.model("EventReport", eventReportSchema);

module.exports = EventReport;
