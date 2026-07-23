const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
  },
  { strict: false, timestamps: true }
);

module.exports = mongoose.model('Invoice', InvoiceSchema);
