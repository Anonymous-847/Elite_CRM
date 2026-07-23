const mongoose = require('mongoose');

// strict:false lets each document keep whatever fields the frontend sends
// (name, sku, price, stock, category, etc.) without us having to duplicate
// the exact shape here. "id" is the frontend-generated id (from uid()) and
// is what the UI uses to find/update/delete records.
const ItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
  },
  { strict: false, timestamps: true }
);

module.exports = mongoose.model('Item', ItemSchema);
