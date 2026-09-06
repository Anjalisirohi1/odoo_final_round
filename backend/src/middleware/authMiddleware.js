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

      req.user = {
        id: decoded.id,
        role: decoded.role
      };

      return next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        console.warn(`Token expired for a request to ${req.originalUrl}`);
      } else {
        console.error('JWT Verification Error:', error);
      }
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const optionalProtect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_for_development_only';
      const decoded = jwt.verify(token, jwtSecret);
      req.user = {
        id: decoded.id,
        role: decoded.role
      };
    } catch (error) {
      /* fallback */
    }
  }

  if (!req.user) {
    req.user = {
      id: '00000000-0000-0000-0000-000000000000',
      role: 'CUSTOMER'
    };
  }

  next();
};

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

module.exports = { protect, optionalProtect, authorize };
