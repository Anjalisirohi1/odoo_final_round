const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_for_development_only';
      const decoded = jwt.verify(token, jwtSecret);

      // We attach the user ID and role to the request
      req.user = {
        id: decoded.id,
        role: decoded.role
      };

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        console.warn(`Token expired for a request to ${req.originalUrl}`);
      } else {
        console.error('JWT Verification Error:', error);
      }
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Role-based access control middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role '${req.user ? req.user.role : 'unknown'}' is not authorized to access this route.` 
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
