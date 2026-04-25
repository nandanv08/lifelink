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
  deleteRequest
} = require('../controllers/requestController');

// Public routes
router.get('/', getRequests);
router.get('/:id', getRequestById);
router.post('/', createRequest);
router.patch('/:id/accept', acceptRequest);
router.patch('/:id/complete', completeRequest);
router.patch('/:id/cancel', cancelRequest);
router.delete('/:id', deleteRequest);

module.exports = router;
