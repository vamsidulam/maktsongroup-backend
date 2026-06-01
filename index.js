require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { connectDb } = require("./db");
const { ensureUploadsDir } = require("./helpers/upload");
const authRouter = require("./routes/auth");
const businessManagementRouter = require("./routes/businessmanagement");
const seedRouter = require("./routes/seed");
const requireAdmin = require("./middleware/requireAdmin");

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:8080",
      process.env.FRONTEND_URL,
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

console.log("DB URL:", process.env.DATABASE_URL);

ensureUploadsDir();
app.use("/uploads", express.static("uploads"));

// Health check
app.get("/health", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

// Seed endpoint (public)
app.use("/seed", seedRouter);

// Auth endpoint (public)
app.use("/auth", authRouter);

// Public routes
app.use("/businesses", businessManagementRouter);

// Admin routes
app.use("/admin/businesses", requireAdmin, businessManagementRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Not Found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 3001;

async function start() {
  await connectDb();
  app.listen(PORT, () => {
    console.log(`✓ Server listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("✗ Failed to start server:", err);
  process.exit(1);
});
