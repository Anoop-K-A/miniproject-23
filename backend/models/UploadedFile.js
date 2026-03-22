const mongoose = require("mongoose");

const uploadedFileSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseCode: {
      type: String,
      default: "",
    },
    courseName: {
      type: String,
      default: "",
    },
    semester: {
      type: String,
      default: "",
    },
    academicYear: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
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

uploadedFileSchema.index({ facultyId: 1, uploadedAt: -1 });
uploadedFileSchema.index({ status: 1, uploadedAt: -1 });
uploadedFileSchema.index({ courseCode: 1, academicYear: 1, uploadedAt: -1 });

const UploadedFile = mongoose.model("UploadedFile", uploadedFileSchema);

module.exports = UploadedFile;
