// controllers/portfolioController.js
const Portfolio = require('../models/Portfolio');
const ragService = require('../services/ragService');

exports.updateReadme = async (req, res) => {
  const { content } = req.body;
  const userId = req.user.id;

  const portfolio = await Portfolio.findOneAndUpdate(
    { userId },
    { content, updatedAt: Date.now() },
    { upsert: true, new: true }
  );
  
  await ragService.syncToPinecone(userId, content);
  res.json(portfolio);
};

exports.getPortfolio = async (req, res) => {
  const userId = req.user.id;
  try {
    const portfolio = await Portfolio.findOne({ userId });
    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }
    res.json(portfolio);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPublicPortfolio = async (req, res) => {
  const { userId } = req.params;
  try {
    const portfolio = await Portfolio.findOne({ userId });
    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }
    res.json(portfolio);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};