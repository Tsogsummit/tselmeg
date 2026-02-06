const { User, ClassGroup } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Constants
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const BCRYPT_COST = 12; // Per requirements

// Generate Tokens
const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            role: user.role,
            email: user.email
        },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
};

const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            type: 'refresh'
        },
        process.env.JWT_REFRESH_SECRET || 'refresh_secret',
        { expiresIn: REFRESH_TOKEN_EXPIRY }
    );
};

// Check if account is locked
const isAccountLocked = (user) => {
    if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
        return true;
    }
    return false;
};

// Reset failed attempts
const resetFailedAttempts = async (user) => {
    user.failedLoginAttempts = 0;
    user.accountLockedUntil = null;
    await user.save();
};

// Increment failed attempts
const incrementFailedAttempts = async (user) => {
    user.failedLoginAttempts += 1;

    // Lock account if max attempts reached
    if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.accountLockedUntil = new Date(Date.now() + LOCK_TIME);
    }

    await user.save();
};

/**
 * Login Handler with Security Features
 */
exports.login = async (req, res) => {
    const { loginIdentifier, password } = req.body;

    try {
        // Input validation
        if (!loginIdentifier || !password) {
            return res.status(400).json({ message: 'Email/username and password are required' });
        }

        // 1. Find user by username OR email
        const { Op } = require('sequelize');
        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { username: loginIdentifier },
                    { email: loginIdentifier }
                ],
                isActive: true // Only active accounts
            },
            include: [{ model: ClassGroup, as: 'ClassGroup' }]
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // 2. Check if account is locked
        if (isAccountLocked(user)) {
            const lockTime = Math.ceil((user.accountLockedUntil - new Date()) / 60000);
            return res.status(423).json({
                message: `Account locked. Try again in ${lockTime} minutes.`,
                lockedUntil: user.accountLockedUntil
            });
        }

        // 3. Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            await incrementFailedAttempts(user);

            const remainingAttempts = MAX_LOGIN_ATTEMPTS - user.failedLoginAttempts;
            if (remainingAttempts > 0) {
                return res.status(401).json({
                    message: `Invalid credentials. ${remainingAttempts} attempts remaining.`
                });
            } else {
                return res.status(423).json({
                    message: 'Account locked due to too many failed attempts. Try again in 15 minutes.'
                });
            }
        }

        // 4. Password is correct - Reset failed attempts
        await resetFailedAttempts(user);

        // 5. Update last login
        user.lastLoginAt = new Date();
        await user.save();

        // 6. Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // 7. Return response
        res.json({
            message: 'Logged in successfully',
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                fullName: user.fullName,
                mustChangePassword: user.mustChangePassword,
                classGroup: user.ClassGroup
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

/**
 * Refresh Token Handler
 */
exports.refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token required' });
    }

    try {
        // Verify refresh token
        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET || 'refresh_secret'
        );

        if (decoded.type !== 'refresh') {
            return res.status(401).json({ message: 'Invalid token type' });
        }

        // Get user
        const user = await User.findByPk(decoded.id);
        if (!user || !user.isActive) {
            return res.status(401).json({ message: 'User not found or inactive' });
        }

        // Generate new access token
        const newAccessToken = generateAccessToken(user);

        res.json({
            accessToken: newAccessToken
        });

    } catch (error) {
        console.error('Refresh Token Error:', error);
        res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
};

/**
 * Register User (Admin or Teacher creates accounts)
 */
exports.register = async (req, res) => {
    try {
        const {
            username, email, password, role, fullName,
            studentId, specialization, classYear, phone, classGroupId
        } = req.body;
        const requester = req.user;

        // Permission Check
        if (requester.role === 'student') {
            return res.status(403).json({ message: 'Not authorized to create users' });
        }
        if (requester.role === 'teacher' && role !== 'student') {
            return res.status(403).json({ message: 'Teachers can only create students' });
        }

        // Validation
        if (!email || !fullName) {
            return res.status(400).json({ message: 'Email and full name are required' });
        }

        // Check if user exists
        const { Op } = require('sequelize');
        const userExists = await User.findOne({
            where: {
                [Op.or]: [
                    { username: username },
                    { email: email }
                ]
            }
        });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Generate password if not provided
        let finalPassword = password;
        let autoGeneratedPassword = null;

        if (!finalPassword) {
            if (role === 'student' && studentId) {
                // Default: studentID + suffix
                autoGeneratedPassword = `${studentId}@2024`;
                finalPassword = autoGeneratedPassword;
            } else {
                // Generate random password
                autoGeneratedPassword = crypto.randomBytes(8).toString('hex');
                finalPassword = autoGeneratedPassword;
            }
        }

        // Hash password with cost factor 12
        const salt = await bcrypt.genSalt(BCRYPT_COST);
        const hashedPassword = await bcrypt.hash(finalPassword, salt);

        // Create User
        const user = await User.create({
            username: username || email.split('@')[0],
            email,
            password: hashedPassword,
            role,
            fullName,
            studentId,
            specialization,
            classYear,
            phone,
            classGroupId,
            mustChangePassword: autoGeneratedPassword ? true : false, // Require password change if auto-generated
            isEmailVerified: false
        });

        // TODO: Send email notification with credentials
        // await sendWelcomeEmail(user.email, autoGeneratedPassword);

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                fullName: user.fullName
            },
            temporaryPassword: autoGeneratedPassword // Return to admin/teacher
        });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({
            message: 'Server error during registration',
            error: error.message
        });
    }
};

/**
 * Get Current User
 */
exports.getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            include: [{ model: ClassGroup, as: 'ClassGroup' }],
            attributes: { exclude: ['password', 'resetPasswordToken', 'mfaSecret'] }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('GetMe Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Request Password Reset
 */
exports.requestPasswordReset = async (req, res) => {
    const { email } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            // Don't reveal if user exists or not
            return res.json({ message: 'If the email exists, a reset link has been sent' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Set token and expiry (15 minutes per requirements)
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();

        // Create reset URL
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        // TODO: Send email with reset link
        // await sendPasswordResetEmail(user.email, resetUrl);

        res.json({
            message: 'If the email exists, a reset link has been sent',
            resetToken: resetToken // Remove in production, only for testing
        });

    } catch (error) {
        console.error('Password Reset Request Error:', error);
        res.status(500).json({ message: 'Error requesting password reset' });
    }
};

/**
 * Reset Password with Token
 */
exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        if (!token || !newPassword) {
            return res.status(400).json({ message: 'Token and new password are required' });
        }

        // Validate password strength
        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }

        // Hash the token to compare
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Find user with valid token
        const user = await User.findOne({
            where: {
                resetPasswordToken: hashedToken,
                resetPasswordExpires: {
                    [Op.gt]: new Date() // Token not expired
                }
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(BCRYPT_COST);
        user.password = await bcrypt.hash(newPassword, salt);

        // Clear reset token
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        user.mustChangePassword = false;

        await user.save();

        res.json({ message: 'Password reset successful' });

    } catch (error) {
        console.error('Password Reset Error:', error);
        res.status(500).json({ message: 'Error resetting password' });
    }
};

/**
 * Change Password (authenticated user)
 */
exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new password are required' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters' });
        }

        const user = await User.findByPk(req.user.id);

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(BCRYPT_COST);
        user.password = await bcrypt.hash(newPassword, salt);
        user.mustChangePassword = false;

        await user.save();

        res.json({ message: 'Password changed successfully' });

    } catch (error) {
        console.error('Change Password Error:', error);
        res.status(500).json({ message: 'Error changing password' });
    }
};

/**
 * Logout (invalidate tokens)
 * Note: With JWT, true logout requires token blacklisting with Redis
 */
exports.logout = async (req, res) => {
    try {
        // TODO: Add token to blacklist in Redis
        // await redisClient.setex(`blacklist_${token}`, 900, 'true');

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout Error:', error);
        res.status(500).json({ message: 'Error during logout' });
    }
};

/**
 * Bulk Import Users from CSV/Excel
 */
exports.bulkImport = async (req, res) => {
    try {
        const requester = req.user;

        if (requester.role !== 'admin' && requester.role !== 'teacher') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { users } = req.body; // Array of user objects

        if (!Array.isArray(users) || users.length === 0) {
            return res.status(400).json({ message: 'Users array is required' });
        }

        const results = {
            success: [],
            errors: []
        };

        for (const userData of users) {
            try {
                // Validate required fields
                if (!userData.email || !userData.fullName) {
                    results.errors.push({
                        email: userData.email,
                        error: 'Missing required fields'
                    });
                    continue;
                }

                // Check if user exists
                const { Op } = require('sequelize');
                const exists = await User.findOne({
                    where: {
                        [Op.or]: [
                            { email: userData.email },
                            { username: userData.username || userData.email.split('@')[0] }
                        ]
                    }
                });

                if (exists) {
                    results.errors.push({
                        email: userData.email,
                        error: 'User already exists'
                    });
                    continue;
                }

                // Generate password
                const autoPassword = userData.studentId
                    ? `${userData.studentId}@2024`
                    : crypto.randomBytes(6).toString('hex');

                const salt = await bcrypt.genSalt(BCRYPT_COST);
                const hashedPassword = await bcrypt.hash(autoPassword, salt);

                // Create user
                const newUser = await User.create({
                    username: userData.username || userData.email.split('@')[0],
                    email: userData.email,
                    password: hashedPassword,
                    role: userData.role || 'student',
                    fullName: userData.fullName,
                    studentId: userData.studentId,
                    phone: userData.phone,
                    classGroupId: userData.classGroupId,
                    classYear: userData.classYear,
                    mustChangePassword: true
                });

                results.success.push({
                    id: newUser.id,
                    email: newUser.email,
                    username: newUser.username,
                    temporaryPassword: autoPassword
                });

            } catch (error) {
                results.errors.push({
                    email: userData.email,
                    error: error.message
                });
            }
        }

        res.json({
            message: 'Bulk import completed',
            results
        });

    } catch (error) {
        console.error('Bulk Import Error:', error);
        res.status(500).json({ message: 'Server error during bulk import' });
    }
};

module.exports = exports;