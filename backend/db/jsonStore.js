/**
 * Simple JSON file-based database — used when MongoDB is not available.
 * Stores data in backend/db/data.json
 */
const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "data.json");

function load() {
  try {
    if (!fs.existsSync(DATA_FILE)) return { applications: [] };
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch { return { applications: [] }; }
}

function save(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

const db = {
  // Applications
  getAll() { return load().applications; },

  getById(id) {
    return load().applications.find(a => a._id === id || a.uniqueId === id) || null;
  },

  create(doc) {
    const data = load();
    const app = { ...doc, _id: Date.now().toString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    data.applications.push(app);
    save(data);
    return app;
  },

  update(id, updates) {
    const data = load();
    const idx = data.applications.findIndex(a => a._id === id || a.uniqueId === id);
    if (idx === -1) return null;
    data.applications[idx] = { ...data.applications[idx], ...updates, updatedAt: new Date().toISOString() };
    save(data);
    return data.applications[idx];
  },

  delete(id) {
    const data = load();
    data.applications = data.applications.filter(a => a._id !== id && a.uniqueId !== id);
    save(data);
  },

  count(filter = {}) {
    const apps = load().applications;
    if (!filter.status) return apps.length;
    return apps.filter(a => a.status === filter.status).length;
  },
};

module.exports = db;
