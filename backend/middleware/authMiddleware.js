const { verifyToken } = require('../services/authService');

/**
 * JWT validation middleware
 * Extracts token from Authorization header, verifies it, and attaches userId to request
 */
function validateJWT(req, res, next) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        error: 'Authorization header missing',
        message: 'Please provide a valid JWT token'
      });
    }

    // Check for Bearer token format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        error: 'Invalid authorization format',
        message: 'Format should be: Bearer <token>'
      });
    }

    const token = parts[1];

    // Verify token signature and expiration
    const decoded = verifyToken(token);

    // Attach userId and user info to request object
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    req.userRole = decoded.role;

    // Continue to next middleware/route handler
    next();
  } catch (error) {
    // Return 401 for invalid or expired tokens
    return res.status(401).json({
      error: 'Authentication failed',
      message: error.message
    });
  }
}

/**
 * Role-based authorization middleware
 * Checks if user has required role
 */
function requireRole(role) {
  return (req, res, next) => {
    if (req.userRole !== role) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `This endpoint requires ${role} role`
      });
    }
    next();
  };
}

module.exports = {
  validateJWT,
  requireRole
};
