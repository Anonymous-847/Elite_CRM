const express = require('express');
const Settings = require('../models/Settings');

// Same defaults as DEFAULT_SETTINGS in frontend/script.js — kept in sync
// so a brand-new database (or one where the settings doc was deleted)
// still boots with sensible categories/statuses/roles instead of blank
// dropdowns everywhere.
const DEFAULT_SETTINGS = {
  id: 'app-settings',
  itemCategories: ['Web Development', 'Graphic Design', 'Digital Marketing', 'Video Editing', 'Consulting', 'Sublimation', 'Other'],
  expenseCategories: ['Salaries', 'Software / Tools', 'Marketing', 'Rent / Utilities', 'Equipment', 'Other'],
  orderStatuses: ['Received', 'Pending', 'Delivered'],
  taskPriorities: ['Low', 'Medium', 'High'],
  taskStatuses: ['To Do', 'In Progress', 'Done'],
  roles: [
    { name: 'Founder and CEO', fullAccess: true, isOwner: true },
    { name: 'Director', fullAccess: true, isOwner: false },
    { name: 'General Manager', fullAccess: false, isOwner: false },
  ],
};

const router = express.Router();

const clean = (doc) => {
  const obj = doc.toObject ? doc.toObject() : doc;
  delete obj._id;
  delete obj.__v;
  delete obj.createdAt;
  delete obj.updatedAt;
  return obj;
};

// GET the settings document, creating it with defaults on first run.
router.get('/', async (req, res) => {
  try {
    let doc = await Settings.findOne({ id: 'app-settings' });
    if (!doc) {
      doc = await Settings.create(DEFAULT_SETTINGS);
    }
    res.json(clean(doc));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings', detail: err.message });
  }
});

// REPLACE/UPDATE the settings document.
router.put('/', async (req, res) => {
  try {
    const body = { ...req.body, id: 'app-settings' };
    const doc = await Settings.findOneAndUpdate({ id: 'app-settings' }, body, {
      new: true,
      upsert: true,
    });
    res.json(clean(doc));
  } catch (err) {
    res.status(500).json({ error: 'Failed to save settings', detail: err.message });
  }
});

module.exports = router;
