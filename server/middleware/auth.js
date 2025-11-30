const jwt = require('jsonwebtoken');
const TokenBlacklist = require('../models/TokenBlacklist');

module.exports = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        message: 'No token, authorization denied',
        code: 'NO_TOKEN'
      });
    }

    console.log('🔍 Checking token:', token.substring(0, 20) + '...'); // DEBUG

    // Check if token is blacklisted
    const blacklistedToken = await TokenBlacklist.findOne({ token });
    
    console.log('🔍 Blacklist check result:', blacklistedToken ? 'FOUND (blocked)' : 'NOT FOUND (allowed)'); // DEBUG
    
    if (blacklistedToken) {
      console.log('❌ Token is blacklisted!', {
        userId: blacklistedToken.userId,
        reason: blacklistedToken.reason,
        blacklistedAt: blacklistedToken.blacklistedAt
      }); // DEBUG
      
      return res.status(401).json({ 
        message: 'Token has been revoked. Please login again.',
        code: 'TOKEN_REVOKED'
      });
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      console.log('✅ Token verified for user:', decoded.userId); // DEBUG
      
      req.userId = decoded.id;
      req.userDbId = decoded.userId;
      req.userEmail = decoded.email;
      req.token = token;
      
      next();
    } catch (error) {
      console.log('❌ Token verification failed:', error.message); // DEBUG
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: 'Token has expired. Please login again.',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          message: 'Token is not valid',
          code: 'TOKEN_INVALID'
        });
      }
      
      return res.status(401).json({ 
        message: 'Token verification failed',
        code: 'TOKEN_ERROR'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      message: 'Authentication error',
      code: 'AUTH_ERROR'
    });
  }
};