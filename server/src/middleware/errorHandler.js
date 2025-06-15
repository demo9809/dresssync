function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }

  // Multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
    return res.status(400).json({ error: err.message });
  }

  // Database errors
  if (err.code === 'ER_DUP_ENTRY' || err.code === '23505') {
    return res.status(409).json({ error: 'Duplicate entry' });
  }

  // Default error
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ?
    'Internal server error' :
    err.message
  });
}

module.exports = { errorHandler };