const mongoose = require('mongoose');
const customerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  address: { type: String, default: '' }, city: { type: String, default: '' },
  state: { type: String, default: '' }, pincode: { type: String, default: '' }
}, { timestamps: true });
module.exports = mongoose.model('Customer', customerSchema);
