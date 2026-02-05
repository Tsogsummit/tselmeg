const { Submission, Lab, LabTask } = require('../models');

class GradingService {
    /**
     * Run code against test cases
     * @param {string} code - The source code
     * @param {string} language - The programming language
     * @param {Array} testCases - Array of test cases
     * @returns {Promise<Object>} - Grading result { score, details, executionTime }
     */
    async gradeSubmission(code, language, testCases) {
        // TODO: Implement actual sandbox execution
        // This is a stub that mocks execution

        console.log(`Grading ${language} code...`);

        const results = testCases.map(test => {
            // Mock result: pass if code contains the expected output (very naive)
            // Real implementation would use Docker/ChildProcess
            const passed = Math.random() > 0.1; // 90% pass rate for mock
            return {
                id: test.id,
                passed,
                input: test.input,
                expected: test.expectedOutput,
                actual: passed ? test.expectedOutput : 'Error or wrong output',
                points: passed ? test.points : 0
            };
        });

        const totalScore = results.reduce((sum, r) => sum + r.points, 0);
        const maxScore = testCases.reduce((sum, t) => sum + t.points, 0);

        return {
            score: totalScore,
            maxScore,
            details: results,
            executionTime: Math.random() * 100, // mock match
            memoryUsage: 10 + Math.random() * 50 // mock mb
        };
    }

    /**
     * Calculate final grade for a student in a course
     * @param {number} userId 
     * @param {number} courseId 
     */
    async calculateFinalGrade(userId, courseId) {
        // TODO: Fetch all submissions and calculate weighted average
        return 0;
    }
}

module.exports = new GradingService();
