const Application = require('../models/Application');

// Submit new application
const submitApplication = async (req, res) => {
  try {
    const {
      name, number, emailId, enrollmentNumber,
      college, branch, semester, gender,
      technology, startDate, endDate
    } = req.body;

    // Check for duplicate enrollment number
    const existing = await Application.findOne({ enrollmentNumber });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An application with this enrollment number already exists.',
        uniqueId: existing.uniqueId,
        status: existing.status
      });
    }

    const application = new Application({
      name, number, emailId, enrollmentNumber,
      college, branch, semester, gender,
      technology, startDate, endDate
    });

    await application.save();

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      uniqueId: application.uniqueId,
      data: {
        name: application.name,
        uniqueId: application.uniqueId,
        status: application.status
      }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// Check application status by unique ID
const checkStatus = async (req, res) => {
  try {
    const { uniqueId } = req.params;
    const application = await Application.findOne({ uniqueId: uniqueId.toUpperCase() });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'No application found with this ID. Please check and try again.'
      });
    }

    res.json({
      success: true,
      data: {
        uniqueId: application.uniqueId,
        name: application.name,
        status: application.status,
        adminNote: application.status === 'rejected' ? application.adminNote : '',
        technology: application.technology,
        startDate: application.startDate,
        endDate: application.endDate,
        offerLetterDate: application.offerLetterDate,
        createdAt: application.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

module.exports = { submitApplication, checkStatus };
