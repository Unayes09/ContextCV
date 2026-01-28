const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const ragService = require('../services/ragService');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTER
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = await User.create({ email, password: hashedPassword });
    res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LOGIN + AUTO-README
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // --- AUTO-CREATE README LOGIC ---
    let portfolio = await Portfolio.findOne({ userId: user._id });
    if (!portfolio) {
      const defaultText = `Portfolio of ${email}. This is an automatically generated profile. Update your projects and CV here!`;
      portfolio = await Portfolio.create({ userId: user._id, content: defaultText });
      
      // Sync this initial text to Pinecone immediately
      await ragService.syncToPinecone(user._id, defaultText);
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, userId: user._id, email: user.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};