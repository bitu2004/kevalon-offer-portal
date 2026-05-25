const mongoose = require("mongoose");
const jsonDb = require("../db/jsonStore");
const jwt = require("jsonwebtoken");

const usesMongo = () => mongoose.connection.readyState === 1;
let Application;
const getModel = () => { if (!Application) Application = require("../models/Application"); return Application; };

// Admin login
const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (username !== (process.env.ADMIN_USERNAME || "admin") || password !== (process.env.ADMIN_PASSWORD || "admin123")) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    const token = jwt.sign({ username, role: "admin" }, process.env.JWT_SECRET || "kevalon_secret", { expiresIn: "8h" });
    res.json({ success: true, token, message: "Login successful" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all applications
const getAllApplications = async (req, res) => {
  try {
    const { status, search } = req.query;

    if (usesMongo()) {
      const App = getModel();
      const query = {};
      if (status && status !== "all") query.status = status;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { uniqueId: { $regex: search, $options: "i" } },
          { enrollmentNumber: { $regex: search, $options: "i" } },
          { college: { $regex: search, $options: "i" } },
          { emailId: { $regex: search, $options: "i" } },
        ];
      }
      const apps = await App.find(query).sort({ createdAt: -1 }).limit(500);
      const stats = {
        total:    await App.countDocuments(),
        pending:  await App.countDocuments({ status: "pending" }),
        approved: await App.countDocuments({ status: "approved" }),
        rejected: await App.countDocuments({ status: "rejected" }),
      };
      return res.json({ success: true, data: apps, stats });
    }

    // JSON fallback
    let apps = jsonDb.getAll();
    if (status && status !== "all") apps = apps.filter(a => a.status === status);
    if (search) {
      const s = search.toLowerCase();
      apps = apps.filter(a => a.name?.toLowerCase().includes(s) || a.uniqueId?.toLowerCase().includes(s) || a.enrollmentNumber?.toLowerCase().includes(s));
    }
    const all = jsonDb.getAll();
    const stats = { total: all.length, pending: all.filter(a => a.status === "pending").length, approved: all.filter(a => a.status === "approved").length, rejected: all.filter(a => a.status === "rejected").length };
    res.json({ success: true, data: apps.reverse(), stats });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get single
const getApplication = async (req, res) => {
  try {
    if (usesMongo()) {
      const App = getModel();
      const app = await App.findById(req.params.id);
      if (!app) return res.status(404).json({ success: false, message: "Not found" });
      return res.json({ success: true, data: app });
    }
    const app = jsonDb.getById(req.params.id);
    if (!app) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: app });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update details
const updateApplication = async (req, res) => {
  try {
    const fields = ["name","number","emailId","enrollmentNumber","college","branch","semester","gender","technology","startDate","endDate"];
    const updates = {};
    fields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    if (usesMongo()) {
      const App = getModel();
      const app = await App.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
      if (!app) return res.status(404).json({ success: false, message: "Not found" });
      return res.json({ success: true, message: "Updated", data: app });
    }
    const app = jsonDb.update(req.params.id, updates);
    if (!app) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, message: "Updated", data: app });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update status
const updateStatus = async (req, res) => {
  try {
    const { status, adminNote, offerLetterDate } = req.body;
    if (!["approved","rejected","pending"].includes(status)) return res.status(400).json({ success: false, message: "Invalid status" });
    if (status === "approved" && !offerLetterDate) return res.status(400).json({ success: false, message: "Offer letter date required" });

    const updates = {
      status,
      adminNote: status === "rejected" ? adminNote || "" : "",
      ...(status === "approved" && { offerLetterDate, approvedAt: new Date() }),
      ...(status === "rejected" && { rejectedAt: new Date() }),
    };

    if (usesMongo()) {
      const App = getModel();
      const app = await App.findByIdAndUpdate(req.params.id, updates, { new: true });
      if (!app) return res.status(404).json({ success: false, message: "Not found" });
      return res.json({ success: true, message: `Application ${status}`, data: app });
    }
    const app = jsonDb.update(req.params.id, updates);
    if (!app) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, message: `Application ${status}`, data: app });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete
const deleteApplication = async (req, res) => {
  try {
    if (usesMongo()) {
      const App = getModel();
      await App.findByIdAndDelete(req.params.id);
      return res.json({ success: true, message: "Deleted" });
    }
    jsonDb.delete(req.params.id);
    res.json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { adminLogin, getAllApplications, getApplication, updateApplication, updateStatus, deleteApplication };
