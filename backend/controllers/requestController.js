/**
 * LifeLink - Request Controller
 * Handles blood request lifecycle management:
 * Create → Accept → Complete (or Cancel)
 */

const Request = require('../models/Request');
const Donor = require('../models/Donor');

// @desc    Create a new blood request
// @route   POST /api/requests
// @access  Public
exports.createRequest = async (req, res) => {
  try {
    const {
      patientName, patientAge, hospital, city,
      bloodGroup, unitsNeeded, urgencyLevel,
      requesterName, requesterPhone, requesterEmail,
      notes, isEmergency, userId
    } = req.body;

    const request = await Request.create({
      patientName, patientAge, hospital, city,
      bloodGroup, unitsNeeded, urgencyLevel,
      requesterName, requesterPhone, requesterEmail,
      notes, isEmergency, userId
    });

    // Auto-match donors based on blood group and city
    const compatibleDonors = await Donor.find({
      bloodGroup,
      city: new RegExp(city, 'i'),
      isAvailable: true,
      isActive: true
    }).select('_id').limit(10);

    if (compatibleDonors.length > 0) {
      request.matchedDonors = compatibleDonors.map(d => d._id);
      await request.save();
    }

    res.status(201).json({
      success: true,
      message: 'Blood request created successfully!',
      data: request,
      matchedDonorsCount: compatibleDonors.length
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while creating request',
      error: error.message
    });
  }
};

// @desc    Get all requests with filtering
// @route   GET /api/requests
// @access  Public
exports.getRequests = async (req, res) => {
  try {
    const {
      status, bloodGroup, city, urgencyLevel,
      page = 1, limit = 10
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (city) filter.city = new RegExp(city, 'i');
    if (urgencyLevel) filter.urgencyLevel = urgencyLevel;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Request.countDocuments(filter);

    const requests = await Request.find(filter)
      .populate('assignedDonor', 'name bloodGroup city')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Mask contact details in public listing
    const maskedRequests = requests.map(req => {
      const r = req.toObject();
      r.requesterPhone = r.requesterPhone.substring(0, 3) + '****' + r.requesterPhone.substring(7);
      return r;
    });

    res.json({
      success: true,
      data: maskedRequests,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching requests',
      error: error.message
    });
  }
};

// @desc    Get a single request by ID
// @route   GET /api/requests/:id
// @access  Public
exports.getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('assignedDonor', 'name bloodGroup city phone')
      .populate('matchedDonors', 'name bloodGroup city isAvailable');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user's personal blood requests
// @route   GET /api/requests/user/:userId
// @access  Private
exports.getUserRequests = async (req, res) => {
  try {
    const requests = await Request.find({ userId: req.params.userId })
      .populate('assignedDonor', 'name phone bloodGroup')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user requests',
      error: error.message
    });
  }
};

// @desc    Assign donor to request (Accept)assign a donor)
// @route   PATCH /api/requests/:id/accept
// @access  Public
exports.acceptRequest = async (req, res) => {
  try {
    const { donorId } = req.body;
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Request is already ${request.status}`
      });
    }

    request.status = 'accepted';
    request.acceptedAt = new Date();

    if (donorId) {
      request.assignedDonor = donorId;
      // Update donor availability
      await Donor.findByIdAndUpdate(donorId, {
        isAvailable: false,
        lastActive: new Date()
      });
    }

    await request.save();

    res.json({
      success: true,
      message: 'Request accepted successfully!',
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Complete a blood request
// @route   PATCH /api/requests/:id/complete
// @access  Admin
exports.completeRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Request must be accepted before completing'
      });
    }

    request.status = 'completed';
    request.completedAt = new Date();
    await request.save();

    // Update donor stats if assigned
    if (request.assignedDonor) {
      await Donor.findByIdAndUpdate(request.assignedDonor, {
        $inc: { totalDonations: 1 },
        lastDonationDate: new Date(),
        isAvailable: true,
        lastActive: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Request completed successfully! Life saved! 🎉',
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Cancel a blood request
// @route   PATCH /api/requests/:id/cancel
// @access  Public
exports.cancelRequest = async (req, res) => {
  try {
    const { cancelReason } = req.body;
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed request'
      });
    }

    request.status = 'cancelled';
    request.cancelledAt = new Date();
    request.cancelReason = cancelReason || 'No reason provided';
    await request.save();

    // Re-enable donor availability if was assigned
    if (request.assignedDonor) {
      await Donor.findByIdAndUpdate(request.assignedDonor, {
        isAvailable: true
      });
    }

    res.json({
      success: true,
      message: 'Request cancelled',
      data: request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete a request
// @route   DELETE /api/requests/:id
// @access  Admin
exports.deleteRequest = async (req, res) => {
  try {
    const request = await Request.findByIdAndDelete(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    res.json({
      success: true,
      message: 'Request deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
