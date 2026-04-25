/**
 * LifeLink - Request Routes
 * RESTful API endpoints for blood request management
 */

const express = require('express');
const router = express.Router();
const {
  createRequest,
  getRequests,
  getRequestById,
  acceptRequest,
  completeRequest,
  cancelRequest,
  deleteRequest,
  getUserRequests
} = require('../controllers/requestController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getRequests);
router.get('/:id', getRequestById);
router.post('/', createRequest);
router.patch('/:id/accept', acceptRequest);
router.patch('/:id/complete', completeRequest);
router.patch('/:id/cancel', cancelRequest);

// Protected routes
router.get('/user/:userId', protect, getUserRequests);
router.delete('/:id', protect, deleteRequest);

module.exports = router;
