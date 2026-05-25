const express = require('express');
const router = express.Router();
const { adminLogin, getAllApplications, getApplication, updateApplication, updateStatus, deleteApplication } = require('../controllers/adminController');
const { generateAdminOfferLetter } = require('../controllers/offerController');
const authMiddleware = require('../middleware/auth');

router.post('/login', adminLogin);
router.get('/applications', authMiddleware, getAllApplications);
router.get('/applications/:id', authMiddleware, getApplication);
router.get('/applications/:uniqueId/offer-letter', authMiddleware, generateAdminOfferLetter);
router.put('/applications/:id', authMiddleware, updateApplication);
router.put('/applications/:id/status', authMiddleware, updateStatus);
router.delete('/applications/:id', authMiddleware, deleteApplication);

module.exports = router;
