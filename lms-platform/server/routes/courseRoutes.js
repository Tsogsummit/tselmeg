const express = require('express');
const router = express.Router();
const { protect, admin, teacherOrAdmin } = require('../middleware/authMiddleware');
const courseController = require('../controllers/courseController');

const upload = require('../middleware/uploadMiddleware');

router.post('/', protect, teacherOrAdmin, courseController.createCourse);
router.get('/', protect, courseController.getCourses);
router.get('/:id', protect, courseController.getCourse);
router.post('/lectures', protect, admin, upload.single('file'), courseController.createLecture);
router.post('/labs', protect, admin, courseController.createLab);
router.post('/exams', protect, admin, courseController.createExam);
router.post('/questions', protect, admin, courseController.addQuestion);

module.exports = router;
