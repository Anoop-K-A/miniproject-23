const mongoose = require("mongoose");
const { RESPONSIBILITY_STATUS } = require("../constants");

const responsibilitySchema = new mongoose.Schema(
  {
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Faculty ID is required"],
      index: true,
    },
    type: {
      type: String,
      required: [true, "Responsibility type is required"],
      trim: true,
      minlength: [2, "Type must be at least 2 characters"],
      maxlength: [100, "Type cannot exceed 100 characters"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [5, "Title must be at least 5 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
      validate: {
        validator: function (value) {
          return value > this.startDate;
        },
        message: "End date must be after start date",
      },
    },
    status: {
      type: String,
      enum: {
        values: Object.values(RESPONSIBILITY_STATUS),
        message: `Status must be one of: ${Object.values(RESPONSIBILITY_STATUS).join(", ")}`,
      },
      default: RESPONSIBILITY_STATUS.ACTIVE,
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    remarks: {
      type: String,
      default: "",
      trim: true,
      maxlength: [500, "Remarks cannot exceed 500 characters"],
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
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

// Optimized indexes for queries
responsibilitySchema.index({ facultyId: 1, createdAt: -1 });
responsibilitySchema.index({ facultyId: 1, type: 1, createdAt: -1 });
responsibilitySchema.index({ type: 1, createdAt: -1 });
responsibilitySchema.index({ status: 1, createdAt: -1 });
responsibilitySchema.index({ assignedBy: 1, createdAt: -1 });
responsibilitySchema.index({ facultyId: 1, status: 1, endDate: 1 });
responsibilitySchema.index({ deletedAt: 1, facultyId: 1 });

// Pre-save middleware
responsibilitySchema.pre("save", function (next) {
  // Validate end date is after start date
  if (this.endDate <= this.startDate) {
    const err = new Error("End date must be after start date");
    return next(err);
  }
  next();
});

// Methods
responsibilitySchema.methods.isActive = function () {
  return this.status === RESPONSIBILITY_STATUS.ACTIVE;
};

responsibilitySchema.methods.isCompleted = function () {
  return this.status === RESPONSIBILITY_STATUS.COMPLETED;
};

responsibilitySchema.methods.isExpired = function () {
  return new Date() > this.endDate;
};

responsibilitySchema.methods.getDurationInDays = function () {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round((this.endDate - this.startDate) / oneDay);
};

responsibilitySchema.methods.getRemainingDaysCount = function () {
  if (this.isExpired()) return 0;
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round((this.endDate - new Date()) / oneDay);
};

// Virtuals
responsibilitySchema.virtual("id").get(function getId() {
  return this._id ? this._id.toString() : "";
});

responsibilitySchema.virtual("isDeleted").get(function isDeleted() {
  return !!this.deletedAt;
});

responsibilitySchema.virtual("daysRemaining").get(function getDaysRemaining() {
  if (this.isExpired()) return 0;
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round((this.endDate - new Date()) / oneDay);
});

const Responsibility = mongoose.model("Responsibility", responsibilitySchema);

module.exports = Responsibility;
