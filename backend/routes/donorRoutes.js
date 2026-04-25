/**
 * LifeLink - Donor Routes
 * RESTful API endpoints for donor management
 */

const express = require('express');
const router = express.Router();
const {
  registerDonor,
  getDonors,
  getDonorById,
  updateDonor,
  toggleAvailability,
  deleteDonor,
  getEmergencyDonors,
  checkEligibility,
  addHealthRecord,
  getDonorProfile
} = require('../controllers/donorController');

// Public routes
router.post('/check-eligibility', checkEligibility);
router.get('/emergency/:bloodGroup', getEmergencyDonors);
router.get('/', getDonors);
router.get('/:id', getDonorById);
router.get('/:id/profile', getDonorProfile);
router.post('/', registerDonor);
router.put('/:id', updateDonor);
router.patch('/:id/availability', toggleAvailability);
router.post('/:id/health-record', addHealthRecord);
router.delete('/:id', deleteDonor);

module.exports = router;
