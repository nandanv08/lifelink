/**
 * LifeLink - Message Model
 * Stores contact messages and communication between users
 */

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderName: {
    type: String,
    required: [true, 'Sender name is required'],
    trim: true
  },
  senderEmail: {
    type: String,
    required: [true, 'Sender email is required'],
    trim: true,
    lowercase: true
  },
  senderPhone: {
    type: String,
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  type: {
    type: String,
    enum: ['contact', 'support', 'feedback', 'report'],
    default: 'contact'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  response: {
    type: String,
    trim: true,
    default: ''
  },
  respondedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);
