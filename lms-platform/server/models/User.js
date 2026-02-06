const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false, // Required per requirements
        validate: {
            isEmail: true
        }
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            is: /^[0-9+\-\s()]*$/ // Basic phone validation
        }
    },
    studentId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    specialization: {
        type: DataTypes.STRING, // For teachers
        allowNull: true
    },
    classYear: {
        type: DataTypes.STRING, // For students
        allowNull: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('student', 'admin', 'teacher'),
        defaultValue: 'student',
    },
    fullName: {
        type: DataTypes.STRING,
        allowNull: false, // Required per requirements
    },

    // Password Reset Fields
    resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true
    },

    // MFA Fields (optional)
    mfaEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    mfaSecret: {
        type: DataTypes.STRING,
        allowNull: true
    },

    // Security Fields
    failedLoginAttempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    accountLockedUntil: {
        type: DataTypes.DATE,
        allowNull: true
    },
    lastLoginAt: {
        type: DataTypes.DATE,
        allowNull: true
    },

    // Account Status
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    isEmailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    emailVerificationToken: {
        type: DataTypes.STRING,
        allowNull: true
    },

    // First Login Flag (for password change requirement)
    mustChangePassword: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

    // Profile Fields
    avatar: {
        type: DataTypes.STRING,
        allowNull: true
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    // Preferences (JSON)
    preferences: {
        type: DataTypes.JSON,
        defaultValue: {
            language: 'mn',
            notifications: {
                email: true,
                push: true
            },
            theme: 'light'
        }
    }
}, {
    timestamps: true,
    indexes: [
        { fields: ['email'] },
        { fields: ['username'] },
        { fields: ['studentId'] },
        { fields: ['role'] },
        { fields: ['classGroupId'] }
    ]
});

module.exports = User;