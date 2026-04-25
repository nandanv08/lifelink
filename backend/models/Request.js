/**
 * LifeLink - Blood Request Model
 * Tracks blood requests through their lifecycle:
 * pending → accepted → completed (or cancelled)
 */

const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  // Patient Information
  patientName: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true
  },
  patientAge: {
    type: Number,
    min: [0, 'Age cannot be negative']
  },
  hospital: {
    type: String,
    required: [true, 'Hospital name is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },

  // Blood Requirements
  bloodGroup: {
    type: String,
    required: [true, 'Blood group is required'],
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  unitsNeeded: {
    type: Number,
    required: [true, 'Units needed is required'],
    min: [1, 'At least 1 unit is required'],
    max: [10, 'Maximum 10 units per request']
  },
  urgencyLevel: {
    type: String,
    enum: ['normal', 'urgent', 'critical'],
    default: 'normal'
  },

  // Request Lifecycle
  status: {
    type: String,
    enum: ['pending', 'accepted', 'completed', 'cancelled'],
    default: 'pending'
  },

  // Requester Contact
  requesterName: {
    type: String,
    required: [true, 'Requester name is required'],
    trim: true
  },
  requesterPhone: {
    type: String,
    required: [true, 'Requester phone is required'],
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  requesterEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // Donor Assignment
  assignedDonor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donor',
    default: null
  },
  matchedDonors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donor'
  }],

  // Lifecycle Timestamps
  acceptedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  cancelReason: {
    type: String,
    trim: true,
    default: ''
  },

  // Additional Info
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  isEmergency: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
requestSchema.index({ status: 1, bloodGroup: 1, city: 1 });
requestSchema.index({ urgencyLevel: 1, createdAt: -1 });

module.exports = mongoose.model('Request', requestSchema);
