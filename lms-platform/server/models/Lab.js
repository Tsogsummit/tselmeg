const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Lab = sequelize.define('Lab', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    instruction: {
        type: DataTypes.TEXT, // Detailed Markdown instructions
        allowNull: true
    },
    order: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },

    // Points and Grading
    points: {
        type: DataTypes.INTEGER,
        defaultValue: 10,
    },
    passingScore: {
        type: DataTypes.INTEGER,
        defaultValue: 7, // 70% to pass
    },

    // Deadlines
    availableFrom: {
        type: DataTypes.DATE,
        allowNull: true
    },
    deadline: {
        type: DataTypes.DATE,
        allowNull: true // Per requirements
    },
    hardDeadline: {
        type: DataTypes.DATE,
        allowNull: true // No submissions accepted after this
    },

    // Late Submission Settings
    allowLateSubmission: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    latePenaltyPerDay: {
        type: DataTypes.INTEGER, // Percentage per day
        defaultValue: 10
    },

    // Programming Language
    language: {
        type: DataTypes.ENUM('html', 'python', 'javascript', 'java', 'cpp', 'c', 'ruby', 'go'),
        defaultValue: 'javascript',
    },

    // Attempt Limits
    allowedAttempts: {
        type: DataTypes.INTEGER,
        defaultValue: -1, // -1 means unlimited
    },

    // Code Templates
    starterCode: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    solutionCode: {
        type: DataTypes.TEXT,
        allowNull: true // Hidden from students
    },

    // Test Cases - Structured per requirements
    testCases: {
        type: DataTypes.JSON,
        defaultValue: [],
        // Structure per requirements:
        // [
        //   {
        //     id: 1,
        //     input: "test input",
        //     expectedOutput: "expected result",
        //     points: 5,
        //     hidden: false, // If true, student can't see this test case
        //     timeout: 5000, // milliseconds
        //     memoryLimit: 128 // MB
        //   }
        // ]
    },

    // Grading Configuration
    gradingConfig: {
        type: DataTypes.JSON,
        defaultValue: {
            strictOutput: true, // Exact match or fuzzy comparison
            trimWhitespace: true,
            caseSensitive: true,
            partialCredit: true, // Award points for passing some tests
            timeoutMs: 5000,
            memoryLimitMB: 128
        }
    },

    // File Attachments (supplementary files)
    attachments: {
        type: DataTypes.JSON,
        defaultValue: [],
        // [{ filename: '', filepath: '', description: '' }]
    },

    // Hints System
    hints: {
        type: DataTypes.JSON,
        defaultValue: [],
        // [{ id: 1, text: 'Hint 1', pointsDeduction: 2 }]
    },

    // Status
    isPublished: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    publishedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },

    // Difficulty Level
    difficulty: {
        type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
        defaultValue: 'beginner'
    },

    // Tags for categorization
    tags: {
        type: DataTypes.JSON,
        defaultValue: []
        // ['loops', 'arrays', 'functions']
    },

    // Foreign Keys
    lectureId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Lectures',
            key: 'id'
        }
    },

    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    }
}, {
    timestamps: true,
    indexes: [
        { fields: ['lectureId'] },
        { fields: ['language'] },
        { fields: ['difficulty'] },
        { fields: ['isPublished'] },
        { fields: ['deadline'] }
    ]
});

module.exports = Lab;