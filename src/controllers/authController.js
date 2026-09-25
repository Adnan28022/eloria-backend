const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const connectDB = require('../config/db');
const generateToken = require('../utils/generateToken');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @route POST /api/auth/login
const loginAdmin = async (req, res, next) => {
  try {
    await connectDB();
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email: email ? email.toLowerCase() : '' });
    if (!admin) {
      return res.status(401).json(errorResponse('Invalid credentials'));
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json(errorResponse('Invalid credentials'));
    }

    const token = generateToken(admin._id);

    res.json(successResponse({
      token,
      admin: { id: admin._id, email: admin.email },
    }, 'Login successful'));
  } catch (error) {
    next(error);
  }
};

module.exports = { loginAdmin };
