const mongoose = require('mongoose');

const tokenBlacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true  // Index for faster lookups
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  username: {
    type: String
  },
  reason: {
    type: String,
    enum: ['logout', 'manual_revoke', 'security'],
    default: 'logout'
  },
  blacklistedAt: {
    type: Date,
    default: Date.now,
    expires: 604800 // Auto-delete after 7 days (matches token expiry)
  }
});

// Compound index for efficient queries
tokenBlacklistSchema.index({ token: 1, userId: 1 });

// TTL index to auto-delete old blacklisted tokens
tokenBlacklistSchema.index({ blacklistedAt: 1 }, { expireAfterSeconds: 604800 });

module.exports = mongoose.model('TokenBlacklist', tokenBlacklistSchema);