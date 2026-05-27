const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load backend/.env explicitly so running `node backend/server.js` from
// the repository root picks up the correct variables.
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    /\.vercel\.app$/,
    /\.netlify\.app$/,
    /\.onrender\.com$/,
    /\.loca\.lt$/,
  ],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Route
app.get("/", (req, res) => {
  res.json({
    name: "Kevalon Technology — Internship Portal API",
    version: "1.0.0",
    status: "✅ Running",
    db: mongoose.connection.readyState === 1 ? "✅ MongoDB Atlas Connected" : "⚠️ Disconnected",
    endpoints: {
      health:       "GET  /api/health",
      submit:       "POST /api/applications/submit",
      checkStatus:  "GET  /api/applications/status/:uniqueId",
      adminLogin:   "POST /api/admin/login",
      getAllApps:    "GET  /api/admin/applications  (Bearer token required)",
      updateStatus: "PUT  /api/admin/applications/:id/status  (Bearer token required)",
      updateApp:    "PUT  /api/admin/applications/:id  (Bearer token required)",
      deleteApp:    "DELETE /api/admin/applications/:id  (Bearer token required)",
    },
  });
});

// Routes
app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Health Check
app.get("/api/health", (req, res) => {
  const dbState = mongoose.connection.readyState;

  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting"
  };

  res.json({
    status: "OK",
    message: "Internship Portal API Running",
    db: states[dbState] || "unknown"
  });
});

// MongoDB Atlas Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB Atlas Connected");
  })
  .catch(err => {
    console.error("❌ MongoDB Error:", err.message);
    console.log("⚠️ Falling back to JSON file storage");
  });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(
    `📋 Admin: ${process.env.ADMIN_USERNAME || "admin"} / ${process.env.ADMIN_PASSWORD || "admin123"}`
  );
});

module.exports = app;