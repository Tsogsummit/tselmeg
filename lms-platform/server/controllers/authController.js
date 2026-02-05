const { User, ClassGroup } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { loginIdentifier, password } = req.body;
    // loginIdentifier can be username or email

    try {
        // 1. Check if user exists (by username OR email)
        const { Op } = require('sequelize');
        let user = await User.findOne({
            where: {
                [Op.or]: [
                    { username: loginIdentifier },
                    { email: loginIdentifier }
                ]
            }
        });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // 2. User exists - Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate Token
        // Using environment variable for secret or fallback
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Logged in successfully',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                fullName: user.fullName
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error' });
    }

};

exports.register = async (req, res) => {
    try {
        const { username, email, password, role, fullName, studentId, specialization, classYear } = req.body;
        const requester = req.user; // From protect middleware

        // Permission Check
        if (requester.role === 'student') {
            return res.status(403).json({ message: 'Not authorized to create users' });
        }
        if (requester.role === 'teacher' && role !== 'student') {
            return res.status(403).json({ message: 'Teachers can only create students' });
        }
        // Admin can create 'teacher' or 'student'

        // Check if user exists
        const { Op } = require('sequelize');
        let userExists = await User.findOne({
            where: {
                [Op.or]: [
                    { username },
                    { email: email || '' } // Handle null email if needed
                ]
            }
        });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create User
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            role,
            fullName,
            studentId,
            specialization,
            classYear
        });

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            include: ['ClassGroup'] // Include class info
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
