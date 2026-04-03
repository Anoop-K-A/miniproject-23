const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { USER_ROLES, USER_STATUS } = require("../constants");

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: [true, "Firebase UID is required"],
      unique: true,
      index: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    username: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    role: {
      type: String,
      enum: {
        values: Object.values(USER_ROLES),
        message: `Role must be one of: ${Object.values(USER_ROLES).join(", ")}`,
      },
      default: USER_ROLES.FACULTY,
    },
    roles: [
      {
        type: String,
        enum: {
          values: Object.values(USER_ROLES),
          message: `Role must be one of: ${Object.values(USER_ROLES).join(", ")}`,
        },
      },
    ],
    verified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: {
        values: Object.values(USER_STATUS),
        message: `Status must be one of: ${Object.values(USER_STATUS).join(", ")}`,
      },
      default: USER_STATUS.PENDING,
      index: true,
    },
    department: {
      type: String,
      trim: true,
      default: "",
    },
    password: {
      type: String,
      default: null,
      select: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
    metadata: {
      loginCount: { type: Number, default: 0 },
      loginFailureCount: { type: Number, default: 0 },
      lastFailedLogin: Date,
      ipAddress: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: true },
    toObject: { virtuals: true, transform: true },
  },
);

// Indexes for optimal query performance
userSchema.index({ role: 1, status: 1 });
userSchema.index({ status: 1, createdAt: -1 });
userSchema.index({ department: 1, status: 1 });
userSchema.index({ email: 1 });
userSchema.index({ firebaseUid: 1 });
userSchema.index({ deletedAt: 1, status: 1 });

// Pre-save middleware
userSchema.pre("save", async function (next) {
  // Hash password if modified and present
  if (this.isModified("password") && this.password) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }

  // Auto-populate roles array if role is set but roles is empty
  if (this.role && (!this.roles || this.roles.length === 0)) {
    this.roles = [this.role];
  }

  next();
});

// Methods
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isActive = function () {
  return this.status === USER_STATUS.ACTIVE && !this.deletedAt;
};

userSchema.methods.hasRole = function (role) {
  return this.role === role || this.roles?.includes(role);
};

userSchema.methods.recordLogin = function (ipAddress) {
  this.lastLogin = new Date();
  this.metadata = this.metadata || {};
  this.metadata.loginCount = (this.metadata.loginCount || 0) + 1;
  this.metadata.loginFailureCount = 0;
  this.metadata.ipAddress = ipAddress;
};

userSchema.methods.recordFailedLogin = function (ipAddress) {
  this.metadata = this.metadata || {};
  this.metadata.loginFailureCount = (this.metadata.loginFailureCount || 0) + 1;
  this.metadata.lastFailedLogin = new Date();
  this.metadata.ipAddress = ipAddress;
};

// Virtuals
userSchema.virtual("id").get(function getId() {
  return this._id ? this._id.toString() : "";
});

userSchema.virtual("isDeleted").get(function isDeleted() {
  return !!this.deletedAt;
});

const User = mongoose.model("User", userSchema);

module.exports = User;
