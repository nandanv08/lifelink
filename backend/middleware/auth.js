/**
 * LifeLink - Auth Middleware
 * JWT verification and role-based access control
 * Supports: donor, hospital, admin roles
 */

const jwt = require('jsonwebtoken');

// Verify JWT token
exports.protect = (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Not authorized. Invalid token.'
    });
  }
};

// Restrict to admin role
exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
};

// Restrict to hospital role (verified hospitals only)
exports.hospitalOnly = (req, res, next) => {
  if (req.user && req.user.role === 'hospital') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Hospital account required.'
    });
  }
};

// Allow both admin and hospital roles
exports.adminOrHospital = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'hospital')) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin or Hospital privileges required.'
    });
  }
};

// Allow specific roles (flexible)
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }
    next();
  };
};
