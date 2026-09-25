const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const connectDB = require('../config/db');
const { errorResponse } = require('../utils/apiResponse');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json(errorResponse('Access denied. No token provided.'));
  }

  const token = authHeader.split(' ')[1];

  try {
    await connectDB();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin) {
      return res.status(401).json(errorResponse('Invalid token. Admin not found.'));
    }
    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json(errorResponse('Token expired or invalid. Please login again.'));
  }
};

module.exports = authMiddleware;
