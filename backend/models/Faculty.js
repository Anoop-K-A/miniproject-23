const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Faculty name is required"],
      trim: true,
    },
    department: {
      type: String,
      required: [true, "Faculty department is required"],
      trim: true,
    },
    nameKey: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      select: false,
    },
    departmentKey: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      select: false,
    },
  },
  {
    timestamps: true,
    collection: "faculty",
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

function normalizeKey(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

facultySchema.pre("validate", function setNormalizedKeys(next) {
  this.name = String(this.name || "")
    .trim()
    .replace(/\s+/g, " ");
  this.department = String(this.department || "")
    .trim()
    .replace(/\s+/g, " ");
  this.nameKey = normalizeKey(this.name);
  this.departmentKey = normalizeKey(this.department);
  next();
});

// Prevent duplicate faculty entries even with case/spacing differences.
facultySchema.index({ nameKey: 1, departmentKey: 1 }, { unique: true });

facultySchema.virtual("id").get(function getId() {
  return this._id ? this._id.toString() : "";
});

const Faculty = mongoose.model("Faculty", facultySchema);

module.exports = Faculty;
