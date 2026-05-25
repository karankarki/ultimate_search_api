const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userModel = require('../models/userModel');

const jwtSecret = process.env.JWT_SECRET || 'change-this-secret';
const jwtExpiresIn = '24h'; // Changed to 1 day as requested

const signup = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const existingUser = await userModel.findByEmail(email.toLowerCase().trim());
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const newUser = await userModel.createUser(email.toLowerCase().trim(), passwordHash, sessionToken);

    return res.status(201).json({ user: { id: newUser.id, email: newUser.email } });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await userModel.findByEmail(email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const sessionToken = crypto.randomBytes(32).toString('hex');
    await userModel.updateSessionToken(user.id, sessionToken);

    const token = jwt.sign({ userId: user.id, email: user.email, sessionToken }, jwtSecret, {
      expiresIn: jwtExpiresIn,
    });

    return res.json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    // Requires auth middleware to set req.user first
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    await userModel.updateSessionToken(req.user.userId, null);
    return res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  logout,
};
