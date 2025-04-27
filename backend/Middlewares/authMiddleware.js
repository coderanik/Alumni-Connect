// authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../Models/users'); // Or whatever model you're using

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Assuming token is passed as Bearer token

  if (!token) return res.status(403).json({ message: 'Token required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with your secret
    req.user = decoded; // Assuming decoded token has user details like { id, email, etc. }
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = { verifyToken };
