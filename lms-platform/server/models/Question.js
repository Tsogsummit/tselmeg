const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Question = sequelize.define('Question', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },

    // Question Type - Expanded per requirements
    type: {
        type: DataTypes.ENUM(
            'multiple_choice',
            'true_false',
            'short_answer',
            'fill_in_blank',
            'code_output',
            'matching'
        ),
        defaultValue: 'multiple_choice',
    },

    // Question Content
    text: {
        type: DataTypes.TEXT,
        allowNull: false,
    },

    // Code snippet (for code_output type)
    codeSnippet: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    // Multiple Choice Options
    options: {
        type: DataTypes.JSON,
        allowNull: true,
        // Structure per requirements:
        // [
        //   { id: 'a', text: 'Option A', correct: true },
        //   { id: 'b', text: 'Option B', correct: false }
        // ]
    },

    // Correct Answer(s)
    correctAnswer: {
        type: DataTypes.JSON, // Can be string, array, or object depending on type
        allowNull: false,
        // multiple_choice: 'a' or ['a', 'b'] for multiple correct
        // true_false: true or false
        // short_answer: 'expected text'
        // fill_in_blank: ['word1', 'word2']
        // code_output: 'expected output'
        // matching: [{ left: 'A', right: '1' }]
    },

    // Explanation (shown after submission)
    explanation: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    // Points for this question
    points: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },

    // Difficulty
    difficulty: {
        type: DataTypes.ENUM('easy', 'medium', 'hard'),
        defaultValue: 'medium'
    },

    // Order in quiz
    order: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },

    // Image/Media attachments
    mediaUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },

    // Tags for categorization
    tags: {
        type: DataTypes.JSON,
        defaultValue: []
    },

    // Question Context (LECTURE_QUIZ or EXAM)
    context: {
        type: DataTypes.ENUM('LECTURE_QUIZ', 'EXAM'),
        defaultValue: 'LECTURE_QUIZ',
    },

    // Foreign Keys - Polymorphic (belongs to Lecture OR Exam)
    lectureId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Lectures',
            key: 'id'
        }
    },
    examId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Exams',
            key: 'id'
        }
    },

    // Created by
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
        { fields: ['examId'] },
        { fields: ['type'] },
        { fields: ['order'] },
        { fields: ['context'] }
    ],
    validate: {
        // Ensure question belongs to either lecture or exam, not both
        eitherLectureOrExam() {
            if ((this.lectureId && this.examId) || (!this.lectureId && !this.examId)) {
                throw new Error('Question must belong to either a Lecture or an Exam, not both or neither');
            }
        }
    }
});

module.exports = Question;