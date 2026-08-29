const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { validateSignupPayload, validateLoginPayload } = require('../utils/validators');

function generateToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
}

function toPublicUser(user) {
  return {
    id: user._id,
    role: user.role,
    name: user.name,
    email: user.email,
    address: user.address,
  };
}

// Sub Task 1.4 — application logic for signup.
const registerUser = async (req, res) => {
  const errors = validateSignupPayload(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  const { role, name, email, address, dob, password } = req.body;

  try {
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({ role, name, email, address, dob, password });
    return res.status(201).json({ ...toPublicUser(user), token: generateToken(user) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Sub Task 2.4 — application logic for login.
const loginUser = async (req, res) => {
  const errors = validateLoginPayload(req.body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.status(200).json({ ...toPublicUser(user), token: generateToken(user) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, generateToken, toPublicUser };
