// authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../Models/users');
const Alumni = require('../Models/alumni');

const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
      return res.status(403).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Try to find user first
    let user = await User.findById(decoded.userId);
    let isAlumni = false;

    // If user not found, try to find alumni
    if (!user) {
      user = await Alumni.findById(decoded.userId);
      if (user) {
        isAlumni = true;
      }
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Attach user and user type to request object
    req.user = user;
    req.isAlumni = isAlumni;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

module.exports = { verifyToken };
