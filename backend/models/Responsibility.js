const mongoose = require("mongoose");

const responsibilitySchema = new mongoose.Schema(
  {
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "completed"],
      default: "active",
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    remarks: {
      type: String,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

responsibilitySchema.index({ facultyId: 1, createdAt: -1 });
responsibilitySchema.index({ facultyId: 1, type: 1, createdAt: -1 });
responsibilitySchema.index({ type: 1, createdAt: -1 });
responsibilitySchema.index({ status: 1, createdAt: -1 });
responsibilitySchema.index({ assignedBy: 1, createdAt: -1 });

const Responsibility = mongoose.model("Responsibility", responsibilitySchema);

module.exports = Responsibility;
