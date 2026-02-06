const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const {
    loginLimiter,
    passwordResetLimiter
} = require('../middleware/ratelimitMiddleware');

// Public routes with rate limiting
router.post('/login',
    loginLimiter,
    validate('login'),
    authController.login
);

router.post('/refresh',
    authController.refreshToken
);

router.post('/password/request-reset',
    passwordResetLimiter,
    validate('passwordResetRequest'),
    authController.requestPasswordReset
);

router.post('/password/reset',
    validate('passwordReset'),
    authController.resetPassword
);

// Protected routes
router.post('/register',
    protect,
    validate('registerUser'),
    authController.register
);

router.post('/bulk-import',
    protect,
    authController.bulkImport
);

router.get('/me',
    protect,
    authController.getMe
);

router.post('/password/change',
    protect,
    authController.changePassword
);

router.post('/logout',
    protect,
    authController.logout
);

module.exports = router;