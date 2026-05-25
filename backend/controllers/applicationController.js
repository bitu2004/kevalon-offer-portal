const mongoose = require("mongoose");
const jsonDb = require("../db/jsonStore");

// Use MongoDB if connected, else JSON file
const usesMongo = () => mongoose.connection.readyState === 1;

// Lazy-load model to avoid errors when MongoDB is not connected
let Application;
const getModel = () => {
  if (!Application) Application = require("../models/Application");
  return Application;
};

function generateToken() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let t = "KVL-";
  for (let i = 0; i < 8; i++) t += chars[Math.floor(Math.random() * chars.length)];
  return t;
}

function generateLetterId(index) {
  return `KVLN-${new Date().getFullYear()}-${String(index).padStart(5, "0")}`;
}

// Submit new application
const submitApplication = async (req, res) => {
  try {
    const { name, number, emailId, enrollmentNumber, college, branch, semester, gender, technology, startDate, endDate } = req.body;

    if (!name || !number || !emailId || !enrollmentNumber || !college || !branch || !semester || !gender || !technology || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    if (usesMongo()) {
      // MongoDB path
      const App = getModel();
      const existing = await App.findOne({ enrollmentNumber });
      if (existing) {
        return res.status(400).json({ success: false, message: "An application with this enrollment number already exists.", uniqueId: existing.uniqueId, status: existing.status });
      }
      const app = new App({ name, number, emailId, enrollmentNumber, college, branch, semester, gender, technology, startDate, endDate });
      await app.save();
      return res.status(201).json({ success: true, message: "Application submitted successfully!", uniqueId: app.uniqueId, data: { name: app.name, uniqueId: app.uniqueId, status: app.status } });
    }

    // JSON fallback
    const existing = jsonDb.getAll().find(a => a.enrollmentNumber === enrollmentNumber);
    if (existing) {
      return res.status(400).json({ success: false, message: "An application with this enrollment number already exists.", uniqueId: existing.uniqueId, status: existing.status });
    }
    const uniqueId = generateToken();
    const letterId = generateLetterId(jsonDb.getAll().length + 1);
    const app = jsonDb.create({ uniqueId, letterId, name, number, emailId, enrollmentNumber, college, branch, semester, gender, technology, startDate, endDate, status: "pending", adminNote: "", downloadCount: 0, certStatus: "not_requested" });
    res.status(201).json({ success: true, message: "Application submitted successfully!", uniqueId: app.uniqueId, data: { name: app.name, uniqueId: app.uniqueId, letterId: app.letterId, status: app.status } });

  } catch (error) {
    console.error(error);
    if (error.code === 11000) return res.status(400).json({ success: false, message: "Duplicate enrollment number." });
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// Check status
const checkStatus = async (req, res) => {
  try {
    const { uniqueId } = req.params;
    const id = uniqueId.toUpperCase();

    if (usesMongo()) {
      const App = getModel();
      const app = await App.findOne({ uniqueId: id });
      if (!app) return res.status(404).json({ success: false, message: "No application found with this ID." });
      return res.json({ success: true, data: app });
    }

    const app = jsonDb.getById(id);
    if (!app) return res.status(404).json({ success: false, message: "No application found with this ID." });
    res.json({ success: true, data: app });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { submitApplication, checkStatus };
