/**
 * LifeLink - User Routes
 * Authentication, user management, and admin endpoints
 */

const express = require('express');
const router = express.Router();
const {
  register, login, getMe, updateProfile,
  linkDonorProfile, getAllUsers,
  verifyHospital, revokeHospital, deactivateUser
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (logged-in users)
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.post('/link-donor', protect, linkDonorProfile);

// Admin-only routes
router.get('/', protect, adminOnly, getAllUsers);
router.patch('/:id/verify', protect, adminOnly, verifyHospital);
router.patch('/:id/revoke', protect, adminOnly, revokeHospital);
router.patch('/:id/deactivate', protect, adminOnly, deactivateUser);

module.exports = router;
