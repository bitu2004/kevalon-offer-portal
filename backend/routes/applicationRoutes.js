const express = require('express');
const router = express.Router();
const { submitApplication, checkStatus } = require('../controllers/applicationController');

router.post('/submit', submitApplication);
router.get('/status/:uniqueId', checkStatus);

module.exports = router;
