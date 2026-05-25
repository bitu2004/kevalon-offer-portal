const Application = require('../models/Application');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Admin login
const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (username !== adminUsername || password !== adminPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { username, role: 'admin' },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '8h' }
    );

    res.json({ success: true, token, message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all applications with filters
const getAllApplications = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { uniqueId: { $regex: search, $options: 'i' } },
        { enrollmentNumber: { $regex: search, $options: 'i' } },
        { college: { $regex: search, $options: 'i' } },
        { emailId: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Application.countDocuments(query);
    const applications = await Application.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Stats
    const stats = {
      total: await Application.countDocuments(),
      pending: await Application.countDocuments({ status: 'pending' }),
      approved: await Application.countDocuments({ status: 'approved' }),
      rejected: await Application.countDocuments({ status: 'rejected' })
    };

    res.json({
      success: true,
      data: applications,
      stats,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get single application
const getApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update submitted application details from the admin panel
const updateApplication = async (req, res) => {
  try {
    const editableFields = [
      'name',
      'number',
      'emailId',
      'enrollmentNumber',
      'college',
      'branch',
      'semester',
      'gender',
      'technology',
      'startDate',
      'endDate'
    ];
    const updates = editableFields.reduce((values, field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        values[field] = req.body[field];
      }
      return values;
    }, {});

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No editable application details provided' });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (updates.enrollmentNumber && updates.enrollmentNumber !== application.enrollmentNumber) {
      const duplicate = await Application.findOne({
        enrollmentNumber: updates.enrollmentNumber,
        _id: { $ne: application._id }
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: 'An application with this enrollment number already exists.'
        });
      }
    }

    Object.assign(application, updates);

    if (application.startDate >= application.endDate) {
      return res.status(400).json({ success: false, message: 'End date must be after start date' });
    }

    await application.save();

    res.json({
      success: true,
      message: 'Application details updated',
      data: application
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }

    if (error.code === 11000 && error.keyPattern?.enrollmentNumber) {
      return res.status(400).json({
        success: false,
        message: 'An application with this enrollment number already exists.'
      });
    }

    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update application status (approve/reject)
const updateStatus = async (req, res) => {
  try {
    const { status, adminNote, offerLetterDate } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    application.status = status;
    application.adminNote = status === 'rejected' ? adminNote || '' : '';

    if (status === 'approved') {
      if (Object.prototype.hasOwnProperty.call(req.body, 'offerLetterDate')) {
        if (!offerLetterDate) {
          return res.status(400).json({ success: false, message: 'Offer letter date is required for approval' });
        }
        application.offerLetterDate = offerLetterDate;
      } else if (!application.offerLetterDate) {
        application.offerLetterDate = new Date();
      }
    }

    await application.save();

    res.json({
      success: true,
      message: `Application ${status} successfully`,
      data: application
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete application
const deleteApplication = async (req, res) => {
  try {
    await Application.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Application deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { adminLogin, getAllApplications, getApplication, updateApplication, updateStatus, deleteApplication };
