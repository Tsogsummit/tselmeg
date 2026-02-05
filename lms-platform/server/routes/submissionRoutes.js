const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/submit', protect, submissionController.submitLab);
router.get('/my', protect, submissionController.getMySubmissions);

module.exports = router;
