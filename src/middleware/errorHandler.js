const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${err.message}`);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, error: messages.join(', '), message: 'Validation failed' });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ success: false, error: `${field} already exists`, message: 'Duplicate value' });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, error: 'Invalid token', message: 'Authentication failed' });
  }

  // Default
  return res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    message: 'Something went wrong',
  });
};

module.exports = errorHandler;
