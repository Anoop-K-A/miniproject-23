const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDB } = require("./config/mongodb.config");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const courseFileRoutes = require("./routes/courseFile.routes");
const responsibilityRoutes = require("./routes/responsibility.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

// Load environment variables
dotenv.config({ path: "../.env.local" });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads folder as static files
app.use("/uploads", express.static("uploads"));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Faculty Portal Backend is running" });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/course-files", courseFileRoutes);
app.use("/api/responsibilities", responsibilityRoutes);
app.use("/api/dashboard", dashboardRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

// Connect to MongoDB and start server
async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Backend server running on port ${PORT}`);
      console.log(`📍 API available at http://localhost:${PORT}`);
      console.log(
        `💚 Firebase project: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`,
      );
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
