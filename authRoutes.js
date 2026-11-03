const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const router = express.Router();
const makeToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'development_secret_change_me', { expiresIn: '7d' });
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required.' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    const normalized = email.toLowerCase().trim();
    if (await User.findOne({ email: normalized })) return res.status(409).json({ message: 'Email is already registered.' });
    const user = await User.create({ name, email: normalized, password: await bcrypt.hash(password, 12) });
    res.status(201).json({ token: makeToken(user._id), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) { res.status(500).json({ message: error.message }); }
});
router.post('/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').toLowerCase().trim();
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(req.body.password || '', user.password))) return res.status(401).json({ message: 'Email or password is incorrect.' });
    res.json({ token: makeToken(user._id), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) { res.status(500).json({ message: error.message }); }
});
router.get('/me', protect, (req, res) => res.json({ user: req.user }));
module.exports = router;
