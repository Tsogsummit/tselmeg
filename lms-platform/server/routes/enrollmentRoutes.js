const express = require('express');
const router = express.Router();
const { protect, teacherOrAdmin, admin } = require('../middleware/authMiddleware');
const enrollmentController = require('../controllers/enrollmentController');
const { validate } = require('../middleware/validationMiddleware');

// Teacher/Admin: Enroll students
router.post('/enroll',
    protect,
    teacherOrAdmin,
    enrollmentController.enrollStudents
);

// Teacher/Admin: Unenroll student
router.delete('/:enrollmentId',
    protect,
    teacherOrAdmin,
    enrollmentController.unenrollStudent
);

// Teacher/Admin: Get course enrollments
router.get('/course/:courseId',
    protect,
    teacherOrAdmin,
    enrollmentController.getCourseEnrollments
);

// Teacher/Admin: Bulk enroll from CSV
router.post('/bulk-enroll',
    protect,
    teacherOrAdmin,
    enrollmentController.bulkEnrollFromCSV
);

// Teacher/Admin: Transfer student
router.post('/transfer',
    protect,
    teacherOrAdmin,
    enrollmentController.transferStudent
);

// Teacher/Admin: Mark course completed
router.patch('/:enrollmentId/complete',
    protect,
    teacherOrAdmin,
    enrollmentController.completeCourse
);

// Teacher/Admin: Get course statistics
router.get('/course/:courseId/stats',
    protect,
    teacherOrAdmin,
    enrollmentController.getCourseStats
);

// Student: Get my enrollments
router.get('/my',
    protect,
    enrollmentController.getMyEnrollments
);

module.exports = router;