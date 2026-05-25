const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const jwtSecret = process.env.JWT_SECRET || 'change-this-secret';

const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, jwtSecret);
    
    // Verify session token matches database
    const user = await userModel.findById(payload.userId);
    if (!user || user.session_token !== payload.sessionToken) {
      return res.status(401).json({ error: 'Session expired or logged in from another device' });
    }

    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = {
  requireAuth,
};
