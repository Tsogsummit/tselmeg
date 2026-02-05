const { Submission, Lab, LabTask } = require('../models');
const gradingService = require('../services/gradingService');

exports.submitLab = async (req, res) => {
    try {
        const { labId, code, language } = req.body;
        const userId = req.user.id; // From auth middleware

        // 1. Verify Lab exists
        const lab = await Lab.findByPk(labId);
        if (!lab) {
            return res.status(404).json({ message: 'Lab not found' });
        }

        // 2. Fetch test cases (assuming they are stored in the Lab model as JSON or separate table)
        // Requirements say testCases are in Lab model as JSON
        const testCases = lab.testCases || [];

        // 3. Run Grading Service
        const gradingResult = await gradingService.gradeSubmission(code, language, testCases);

        // 4. Save Submission
        const submission = await Submission.create({
            userId,
            type: 'LAB',
            referenceId: labId,
            codeContent: code,
            status: gradingResult.score === gradingResult.maxScore ? 'PASSED' : 'FAILED', // Simple logic
            gradingDetails: gradingResult.details,
            executionTime: gradingResult.executionTime,
            memoryUsage: gradingResult.memoryUsage,
            score: gradingResult.score
        });

        res.status(201).json({
            message: 'Submission received',
            submission,
            result: gradingResult
        });

    } catch (error) {
        console.error('Submission Error:', error);
        res.status(500).json({ message: 'Server error during submission' });
    }
};

exports.getMySubmissions = async (req, res) => {
    try {
        const submissions = await Submission.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
