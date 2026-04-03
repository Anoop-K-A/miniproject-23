const mongoose = require("mongoose");
const { PLACEMENT_STATUS } = require("../constants");

const studentSchema = new mongoose.Schema(
  {
    advisorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Advisor ID is required"],
      index: true,
    },
    rollNumber: {
      type: String,
      required: [true, "Roll number is required"],
      trim: true,
      index: true,
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
      index: true,
      match: [/^[^\s@]*@[^\s@]*\.[^\s@]*$|^$/, "Please provide a valid email"],
      sparse: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
      match: [/^[0-9]{0,15}$|^$/, "Please provide a valid phone number"],
    },
    department: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    semester: {
      type: Number,
      default: 0,
      min: 0,
      max: 8,
    },
    batchYear: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    cgpa: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    attendance: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    careerInterest: {
      type: String,
      default: "",
      trim: true,
    },
    skillsAcquired: {
      type: [String],
      default: [],
    },
    placementStatus: {
      type: String,
      enum: {
        values: Object.values(PLACEMENT_STATUS),
        message: `Placement status must be one of: ${Object.values(PLACEMENT_STATUS).join(", ")}`,
      },
      default: PLACEMENT_STATUS.NOT_STARTED,
      index: true,
    },
    companyName: {
      type: String,
      default: "",
      trim: true,
    },
    activityPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    activities: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    strict: false,
    toJSON: { virtuals: true, transform: true },
    toObject: { virtuals: true, transform: true },
  },
);

// Compound indexes for optimal query performance
studentSchema.index({ advisorId: 1, batchYear: 1, rollNumber: 1 });
studentSchema.index({ batchYear: 1, department: 1 });
studentSchema.index({ advisorId: 1, createdAt: -1 });
studentSchema.index({ placementStatus: 1, batchYear: 1 });
studentSchema.index({ deletedAt: 1, advisorId: 1 });

// Pre-save middleware for data validation
studentSchema.pre("save", function (next) {
  // Convert semester to number if it's a string
  if (typeof this.semester === "string") {
    this.semester = parseInt(this.semester) || 0;
  }
  next();
});

// Methods
studentSchema.methods.isPlaced = function () {
  return this.placementStatus === PLACEMENT_STATUS.PLACED;
};

studentSchema.methods.getPerformanceCategory = function () {
  if (this.cgpa >= 8.5) return "Excellent";
  if (this.cgpa >= 7.5) return "Very Good";
  if (this.cgpa >= 6.5) return "Good";
  if (this.cgpa >= 5.5) return "Average";
  return "Below Average";
};

// Virtuals
studentSchema.virtual("id").get(function getId() {
  return this._id ? this._id.toString() : "";
});

studentSchema.virtual("isDeleted").get(function isDeleted() {
  return !!this.deletedAt;
});

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;

module.exports = Student;
