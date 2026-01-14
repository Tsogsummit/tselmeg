const { User, ClassGroup } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { username, password, className, fullName } = req.body;
    // Expected input: username (unique ID), password, className (e.g. '10a' - optional if admin), fullName

    try {
        // 1. Check if user exists
        let user = await User.findOne({ where: { username } });

        if (!user) {
            // Auto-create logic for students
            // If className provided, try to find the class
            if (!className) {
                return res.status(400).json({ message: 'User not found. Please provide Class to register.' });
            }

            const classGroup = await ClassGroup.findOne({ where: { name: className } });
            if (!classGroup) {
                return res.status(400).json({ message: 'Class not found' });
            }

            // Create new student
            // Password hashing
            const hashedPassword = await bcrypt.hash(password, 10);
            user = await User.create({
                username,
                password: hashedPassword,
                role: 'student',
                fullName: fullName || username,
                classGroupId: classGroup.id
            });

            // Generate Token
            const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
            return res.status(201).json({ message: 'Account created and logged in', token, user });
        }

        // 2. User exists - Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate Token
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
        res.json({ message: 'Logged in', token, user });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
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
