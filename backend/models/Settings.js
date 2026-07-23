const mongoose = require('mongoose');

// This is a SINGLE document (a singleton), unlike the other models which
// hold many documents. It stores every configurable list the app uses:
// item categories, expense categories, order/invoice statuses, task
// priorities/statuses, and roles (with their permission flags).
// strict:false so the frontend's default shape doesn't need to be
// duplicated here field-by-field.
const SettingsSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, default: 'app-settings' },
  },
  { strict: false, timestamps: true }
);

module.exports = mongoose.model('Settings', SettingsSchema);
