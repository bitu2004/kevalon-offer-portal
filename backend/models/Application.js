const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const applicationSchema = new mongoose.Schema({
  uniqueId: {
    type: String,
    default: () => uuidv4().split('-')[0].toUpperCase() + uuidv4().split('-')[1].toUpperCase(),
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  number: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  emailId: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true
  },
  enrollmentNumber: {
    type: String,
    required: [true, 'Enrollment number is required'],
    trim: true,
    unique: true
  },
  college: {
    type: String,
    required: [true, 'College is required'],
    trim: true
  },
  branch: {
    type: String,
    required: [true, 'Branch is required'],
    trim: true
  },
  semester: {
    type: String,
    required: [true, 'Semester is required'],
    trim: true
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['Male', 'Female', 'Other']
  },
  technology: {
    type: String,
    required: [true, 'Technology is required'],
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  offerLetterDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminNote: {
    type: String,
    default: ''
  },
  downloadCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Application', applicationSchema);
