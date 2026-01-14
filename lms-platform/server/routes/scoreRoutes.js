const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const scoreController = require('../controllers/scoreController');

router.post('/', protect, scoreController.submitScore);
router.get('/my', protect, scoreController.getMyScores);
router.get('/all', protect, admin, scoreController.getAllGrades);

module.exports = router;
