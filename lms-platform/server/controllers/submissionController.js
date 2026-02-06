const { Submission, Lab, Score, User, Enrollment } = require('../models');
const codeExecutionService = require('../services/codeExecutionService');

/**
 * Submit Lab Assignment
 */
exports.submitLab = async (req, res) => {
    try {
        const { labId, code, language } = req.body;
        const userId = req.user.id;

        // 1. Verify Lab exists
        const lab = await Lab.findByPk(labId, {
            include: ['Lecture']
        });

        if (!lab) {
            return res.status(404).json({ message: 'Lab not found' });
        }

        // 2. Check if student is enrolled in the course
        const enrollment = await Enrollment.findOne({
            where: {
                userId,
                courseId: lab.Lecture.courseId,
                status: 'active'
            }
        });

        if (!enrollment) {
            return res.status(403).json({ message: 'Not enrolled in this course' });
        }

        // 3. Check deadline
        if (lab.hardDeadline && new Date() > new Date(lab.hardDeadline)) {
            return res.status(403).json({ message: 'Hard deadline has passed. No submissions accepted.' });
        }

        // Check soft deadline for late penalty
        let latePenalty = 0;
        if (lab.deadline && new Date() > new Date(lab.deadline)) {
            if (!lab.allowLateSubmission) {
                return res.status(403).json({ message: 'Deadline has passed and late submissions are not allowed' });
            }

            // Calculate late penalty
            const daysLate = Math.ceil((new Date() - new Date(lab.deadline)) / (1000 * 60 * 60 * 24));
            latePenalty = Math.min(100, daysLate * lab.latePenaltyPerDay);
        }

        // 4. Check allowed attempts
        if (lab.allowedAttempts !== -1) {
            const submissionCount = await Submission.count({
                where: {
                    userId,
                    referenceId: labId,
                    type: 'LAB'
                }
            });

            if (submissionCount >= lab.allowedAttempts) {
                return res.status(403).json({
                    message: `Maximum attempts (${lab.allowedAttempts}) reached`
                });
            }
        }

        // 5. Get test cases
        const testCases = lab.testCases || [];

        if (testCases.length === 0) {
            return res.status(400).json({ message: 'No test cases configured for this lab' });
        }

        // 6. Execute code and grade
        const gradingResult = await codeExecutionService.gradeSubmission(
            code,
            language,
            testCases,
            lab.gradingConfig
        );

        // 7. Apply late penalty
        let finalScore = gradingResult.score;
        if (latePenalty > 0) {
            finalScore = finalScore * (1 - latePenalty / 100);
        }

        // 8. Determine status
        const passed = finalScore >= lab.passingScore;
        const status = passed ? 'PASSED' : 'FAILED';

        // 9. Save submission
        const submission = await Submission.create({
            userId,
            type: 'LAB',
            referenceId: labId,
            codeContent: code,
            status,
            submittedAt: new Date(),
            gradingDetails: {
                testResults: gradingResult.details,
                latePenalty,
                originalScore: gradingResult.score,
                finalScore
            },
            executionTime: gradingResult.totalExecutionTime,
            memoryUsage: 0, // TODO: Extract from Docker stats
            score: finalScore,
            passed
        });

        // 10. Update or create Score (keep highest)
        let existingScore = await Score.findOne({
            where: {
                userId,
                type: 'LAB',
                referenceId: labId
            }
        });

        if (existingScore) {
            if (finalScore > existingScore.score) {
                existingScore.score = finalScore;
                existingScore.percentage = gradingResult.percentage;
                existingScore.feedback = `Late penalty: ${latePenalty}%`;
                await existingScore.save();
            }
        } else {
            await Score.create({
                userId,
                type: 'LAB',
                referenceId: labId,
                score: finalScore,
                maxScore: lab.points,
                percentage: (finalScore / lab.points) * 100,
                feedback: latePenalty > 0 ? `Late penalty: ${latePenalty}%` : null
            });
        }

        // 11. Update enrollment progress
        await this.updateEnrollmentProgress(userId, lab.Lecture.courseId);

        // 12. Return result
        res.status(201).json({
            message: 'Submission received and graded',
            submission: {
                id: submission.id,
                status: submission.status,
                score: finalScore,
                maxScore: lab.points,
                percentage: (finalScore / lab.points) * 100,
                passed,
                latePenalty,
                submittedAt: submission.submittedAt
            },
            results: {
                totalTests: testCases.length,
                passedTests: gradingResult.details.filter(t => t.passed).length,
                score: finalScore,
                maxScore: lab.points,
                details: gradingResult.details.map(detail => ({
                    ...detail,
                    // Hide hidden test case details from student
                    input: detail.input,
                    expectedOutput: detail.expectedOutput
                }))
            }
        });

    } catch (error) {
        console.error('Submit Lab Error:', error);
        res.status(500).json({
            message: 'Server error during submission',
            error: error.message
        });
    }
};

/**
 * Get Student Submissions
 */
exports.getMySubmissions = async (req, res) => {
    try {
        const { labId, type } = req.query;

        const where = { userId: req.user.id };
        if (labId) where.referenceId = labId;
        if (type) where.type = type;

        const submissions = await Submission.findAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: 50 // Limit results
        });

        res.json(submissions);

    } catch (error) {
        console.error('Get Submissions Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Get Submission Details (for review)
 */
exports.getSubmission = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const submission = await Submission.findByPk(id, {
            include: [
                { model: User, as: 'User', attributes: ['id', 'fullName', 'username'] }
            ]
        });

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        // Authorization: Students can only view their own
        if (userRole === 'student' && submission.userId !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(submission);

    } catch (error) {
        console.error('Get Submission Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Update enrollment progress after submission
 */
async function updateEnrollmentProgress(userId, courseId) {
    try {
        const enrollment = await Enrollment.findOne({
            where: { userId, courseId }
        });

        if (!enrollment) return;

        // TODO: Calculate actual progress
        // - Count completed lectures
        // - Count completed labs
        // - Update percentComplete

        await enrollment.save();
    } catch (error) {
        console.error('Update Progress Error:', error);
    }
}

/**
 * Teacher: Manual Grading Override
 */
exports.manualGrade = async (req, res) => {
    try {
        const { submissionId, score, feedback } = req.body;
        const teacherRole = req.user.role;

        if (teacherRole !== 'teacher' && teacherRole !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const submission = await Submission.findByPk(submissionId);
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        // Update submission
        submission.score = score;
        submission.status = score >= submission.maxScore * 0.7 ? 'PASSED' : 'FAILED';
        await submission.save();

        // Update score record
        const scoreRecord = await Score.findOne({
            where: {
                userId: submission.userId,
                type: submission.type,
                referenceId: submission.referenceId
            }
        });

        if (scoreRecord) {
            scoreRecord.score = score;
            scoreRecord.feedback = feedback;
            await scoreRecord.save();
        }

        res.json({
            message: 'Submission graded successfully',
            submission
        });

    } catch (error) {
        console.error('Manual Grade Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = exports;