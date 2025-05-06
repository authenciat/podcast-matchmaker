/**
 * Global error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const errorHandler = (err, req, res, next) => {
  // Log the error for debugging
  console.error('API Error:', err);

  // Determine appropriate status code
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  // Prepare error response
  const response = {
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  };
  
  // Add more useful context for frontend if available
  if (err.code === 'ECONNREFUSED') {
    response.message = 'External API service is unavailable';
  } else if (err.response && err.response.data) {
    response.details = err.response.data;
  }

  res.status(statusCode).json(response);
};

/**
 * Middleware to handle 404 routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const notFound = (req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.originalUrl}`
  });
};

module.exports = {
  errorHandler,
  notFound
}; 