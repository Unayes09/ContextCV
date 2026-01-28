// models/Portfolio.js
const mongoose = require('mongoose');

const PortfolioSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Portfolio', PortfolioSchema);