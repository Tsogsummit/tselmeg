const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const courseController = require('../controllers/courseController');

router.get('/', protect, courseController.getCourses);
router.get('/:id', protect, courseController.getCourse);
router.post('/lectures', protect, admin, courseController.createLecture);
router.post('/labs', protect, admin, courseController.createLab);
router.post('/exams', protect, admin, courseController.createExam);
router.post('/questions', protect, admin, courseController.addQuestion);

module.exports = router;
