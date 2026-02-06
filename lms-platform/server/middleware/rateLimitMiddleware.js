const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');

/**
 * Rate Limiting Configuration per requirements
 * - 5 failed login attempts → 15 minute lock (handled in authController)
 * - General API rate limiting
 */

// Login Rate Limiter - Strict
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: {
        message: 'Too many login attempts. Please try again after 15 minutes.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Use Redis store in production
    // store: new RedisStore({
    //     client: redisClient,
    //     prefix: 'rl:login:'
    // })
});

// General API Rate Limiter
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: {
        message: 'Too many requests. Please slow down.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting for certain paths or roles
        return req.user && req.user.role === 'admin';
    }
});

// Code Submission Rate Limiter - Prevent spam
const submissionLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // 10 submissions per minute
    message: {
        message: 'Too many submissions. Please wait before trying again.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.user ? req.user.id.toString() : req.ip;
    }
});

// File Upload Rate Limiter
const uploadLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 20, // 20 uploads per 5 minutes
    message: {
        message: 'Too many file uploads. Please wait before uploading more files.',
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Password Reset Rate Limiter
const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 reset requests per hour
    message: {
        message: 'Too many password reset requests. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Email Verification Rate Limiter
const emailVerificationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 verification emails per hour
    message: {
        message: 'Too many verification email requests. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Custom Rate Limiter for specific use cases
 */
const createCustomLimiter = (options) => {
    return rateLimit({
        windowMs: options.windowMs || 60 * 1000,
        max: options.max || 60,
        message: options.message || { message: 'Rate limit exceeded' },
        standardHeaders: true,
        legacyHeaders: false,
        ...options
    });
};

/**
 * IP-based rate limiting (additional layer)
 */
const ipLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 300, // 300 requests per IP per minute
    message: {
        message: 'Too many requests from this IP address.',
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    loginLimiter,
    apiLimiter,
    submissionLimiter,
    uploadLimiter,
    passwordResetLimiter,
    emailVerificationLimiter,
    createCustomLimiter,
    ipLimiter
};