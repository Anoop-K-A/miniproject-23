const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDB } = require("./config/mongodb.config");
const {
  requestLogger,
  errorHandler,
  notFoundHandler,
} = require("./middleware");

// Routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const courseFileRoutes = require("./routes/courseFile.routes");
const responsibilityRoutes = require("./routes/responsibility.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const adminRoutes = require("./routes/admin.routes");
const eventReportRoutes = require("./routes/eventReport.routes");

// Load environment variables
dotenv.config({ path: "../.env.local" });

const app = express();
const PORT = process.env.PORT || 5000;

// ==================== MIDDLEWARE ====================

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging
app.use(requestLogger);

// Static files
app.use("/uploads", express.static("uploads"));

// ==================== ROUTES ====================

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Faculty Portal Backend is running",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/course-files", courseFileRoutes);
app.use("/api/event-reports", eventReportRoutes);
app.use("/api/responsibilities", responsibilityRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);

// ==================== ERROR HANDLING ====================

// 404 Not Found handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// ==================== SERVER START ====================

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log("\n" + "=".repeat(60));
      console.log("🚀 Faculty Portal Backend Server Started");
      console.log("=".repeat(60));
      console.log(`📍 Server running on http://localhost:${PORT}`);
      console.log(`🔌 API Base URL: http://localhost:${PORT}/api`);
      console.log(
        `💚 Firebase Project: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`,
      );
      console.log(
        `🗄️  MongoDB: ${process.env.MONGODB_URI?.split("@")[1] || "local"}`,
      );
      console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log("=".repeat(60) + "\n");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n📍 Server shutting down gracefully...");
  process.exit(0);
});

startServer();

module.exports = app;
