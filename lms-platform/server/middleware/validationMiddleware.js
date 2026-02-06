const Joi = require('joi');

/**
 * Validation schemas per requirements
 */

const schemas = {
    // Login validation
    login: Joi.object({
        loginIdentifier: Joi.string().required().min(3),
        password: Joi.string().required().min(6)
    }),

    // User registration
    registerUser: Joi.object({
        username: Joi.string().alphanum().min(3).max(30).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
        ).messages({
            'string.pattern.base': 'Password must contain uppercase, lowercase, number and special character'
        }),
        fullName: Joi.string().required(),
        role: Joi.string().valid('student', 'teacher', 'admin').required(),
        phone: Joi.string().pattern(/^[0-9+\-\s()]*$/).allow(null, ''),
        studentId: Joi.string().when('role', {
            is: 'student',
            then: Joi.string().required(),
            otherwise: Joi.string().allow(null, '')
        }),
        specialization: Joi.string().allow(null, ''),
        classYear: Joi.string().allow(null, ''),
        classGroupId: Joi.number().integer().allow(null)
    }),

    // Create course
    createCourse: Joi.object({
        name: Joi.string().required(),
        courseCode: Joi.string().required(),
        description: Joi.string().allow(null, ''),
        semester: Joi.string().allow(null, ''),
        credits: Joi.number().integer().min(1).max(10).default(3),
        department: Joi.string().allow(null, ''),
        startDate: Joi.date().allow(null),
        endDate: Joi.date().allow(null),
        maxStudents: Joi.number().integer().min(1).default(50),
        allowLateSubmission: Joi.boolean().default(false),
        latePenalty: Joi.number().integer().min(0).max(100).default(10),
        gradingScheme: Joi.object({
            lectures: Joi.number().integer().min(0).max(100),
            labs: Joi.number().integer().min(0).max(100),
            finalExam: Joi.number().integer().min(0).max(100)
        }).custom((value, helpers) => {
            const sum = value.lectures + value.labs + value.finalExam;
            if (sum !== 100) {
                return helpers.error('Grading scheme must sum to 100');
            }
            return value;
        })
    }),

    // Create lecture
    createLecture: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().allow(null, ''),
        content: Joi.string().allow(null, ''),
        order: Joi.number().integer().min(1).required(),
        courseId: Joi.number().integer().required(),
        estimatedDuration: Joi.number().integer().min(1).default(90),
        availableFrom: Joi.date().allow(null),
        availableUntil: Joi.date().allow(null),
        deadline: Joi.date().allow(null),
        mandatory: Joi.boolean().default(true),
        points: Joi.number().integer().min(0).default(0),
        hasQuiz: Joi.boolean().default(false),
        quizConfig: Joi.object({
            totalPoints: Joi.number().integer().min(1),
            passingScore: Joi.number().integer().min(1),
            duration: Joi.number().integer().min(1),
            attempts: Joi.number().integer().min(1),
            shuffleQuestions: Joi.boolean(),
            showAnswersAfter: Joi.string().valid('submission', 'deadline', 'never'),
            startTime: Joi.date(),
            deadline: Joi.date()
        }).allow(null)
    }),

    // Create lab
    createLab: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().allow(null, ''),
        instruction: Joi.string().allow(null, ''),
        lectureId: Joi.number().integer().required(),
        points: Joi.number().integer().min(1).default(10),
        passingScore: Joi.number().integer().min(1),
        language: Joi.string().valid('html', 'python', 'javascript', 'java', 'cpp', 'c', 'ruby', 'go').default('javascript'),
        allowedAttempts: Joi.number().integer().default(-1),
        deadline: Joi.date().allow(null),
        hardDeadline: Joi.date().allow(null),
        allowLateSubmission: Joi.boolean().default(false),
        latePenaltyPerDay: Joi.number().integer().min(0).max(100).default(10),
        starterCode: Joi.string().allow(null, ''),
        testCases: Joi.array().items(Joi.object({
            id: Joi.number().integer(),
            input: Joi.string().allow(''),
            expectedOutput: Joi.string().allow(''),
            points: Joi.number().integer().min(0),
            hidden: Joi.boolean().default(false),
            timeout: Joi.number().integer().min(100).default(5000),
            memoryLimit: Joi.number().integer().min(16).default(128)
        })).default([])
    }),

    // Create question
    createQuestion: Joi.object({
        type: Joi.string().valid('multiple_choice', 'true_false', 'short_answer', 'fill_in_blank', 'code_output', 'matching').required(),
        text: Joi.string().required(),
        codeSnippet: Joi.string().allow(null, ''),
        options: Joi.array().when('type', {
            is: Joi.string().valid('multiple_choice', 'matching'),
            then: Joi.array().min(2).required(),
            otherwise: Joi.array().allow(null)
        }),
        correctAnswer: Joi.alternatives().try(
            Joi.string(),
            Joi.boolean(),
            Joi.array(),
            Joi.object()
        ).required(),
        explanation: Joi.string().allow(null, ''),
        points: Joi.number().integer().min(1).default(1),
        difficulty: Joi.string().valid('easy', 'medium', 'hard').default('medium'),
        order: Joi.number().integer().min(1).default(1),
        lectureId: Joi.number().integer().allow(null),
        examId: Joi.number().integer().allow(null)
    }).custom((value, helpers) => {
        // Ensure question belongs to either lecture or exam
        if ((value.lectureId && value.examId) || (!value.lectureId && !value.examId)) {
            return helpers.error('Question must belong to either lecture or exam');
        }
        return value;
    }),

    // Submit lab code
    submitLab: Joi.object({
        labId: Joi.number().integer().required(),
        code: Joi.string().required().max(50000), // Max 50KB of code
        language: Joi.string().valid('html', 'python', 'javascript', 'java', 'cpp', 'c', 'ruby', 'go').required()
    }),

    // Submit quiz
    submitQuiz: Joi.object({
        lectureId: Joi.number().integer().allow(null),
        examId: Joi.number().integer().allow(null),
        answers: Joi.object().required()
    }).custom((value, helpers) => {
        if ((!value.lectureId && !value.examId) || (value.lectureId && value.examId)) {
            return helpers.error('Must specify either lectureId or examId');
        }
        return value;
    }),

    // Password reset request
    passwordResetRequest: Joi.object({
        email: Joi.string().email().required()
    }),

    // Password reset
    passwordReset: Joi.object({
        token: Joi.string().required(),
        newPassword: Joi.string().min(8).pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
        ).required()
    })
};

/**
 * Validation middleware factory
 */
const validate = (schemaName) => {
    return (req, res, next) => {
        const schema = schemas[schemaName];

        if (!schema) {
            return res.status(500).json({ message: 'Validation schema not found' });
        }

        const { error, value } = schema.validate(req.body, {
            abortEarly: false, // Return all errors
            stripUnknown: true // Remove unknown fields
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                message: 'Validation error',
                errors
            });
        }

        // Replace req.body with validated data
        req.body = value;
        next();
    };
};

/**
 * Sanitize input to prevent XSS
 */
const sanitize = (req, res, next) => {
    const sanitizeHtml = require('sanitize-html');

    const sanitizeValue = (value) => {
        if (typeof value === 'string') {
            return sanitizeHtml(value, {
                allowedTags: [], // Strip all HTML
                allowedAttributes: {}
            });
        }
        if (typeof value === 'object' && value !== null) {
            for (const key in value) {
                value[key] = sanitizeValue(value[key]);
            }
        }
        return value;
    };

    if (req.body) {
        req.body = sanitizeValue(req.body);
    }

    next();
};

module.exports = {
    validate,
    sanitize,
    schemas
};