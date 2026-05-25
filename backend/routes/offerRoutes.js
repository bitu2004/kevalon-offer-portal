const express = require('express');
const router = express.Router();
const { generateOfferLetter } = require('../controllers/offerController');

router.get('/download/:uniqueId', generateOfferLetter);

module.exports = router;
