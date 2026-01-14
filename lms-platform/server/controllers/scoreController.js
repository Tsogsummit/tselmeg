const { Score, User, ClassGroup } = require('../models');

// Submit Score (Auto calculated or Manual)
exports.submitScore = async (req, res) => {
    try {
        const { type, referenceId, score, maxScore } = req.body;
        const userId = req.user.id;

        // Check if score exists, update if so (or create new attempt?)
        // For simplicity, update or create
        let existingScore = await Score.findOne({
            where: { userId, type, referenceId }
        });

        if (existingScore) {
            existingScore.score = score;
            await existingScore.save();
            return res.json(existingScore);
        }

        const newScore = await Score.create({
            userId, type, referenceId, score, maxScore
        });
        res.status(201).json(newScore);
    } catch (error) {
        res.status(500).json({ message: 'Error submitting score' });
    }
};

// Get My Scores
exports.getMyScores = async (req, res) => {
    try {
        const scores = await Score.findAll({ where: { userId: req.user.id } });
        res.json(scores);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching scores' });
    }
};

// Admin: Get All Grades (Grouped/Filtered)
exports.getAllGrades = async (req, res) => {
    try {
        const grades = await User.findAll({
            where: { role: 'student' },
            include: [
                { model: ClassGroup },
                { model: Score }
            ]
        });
        // Frontend can massage this data into a table
        res.json(grades);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching grades' });
    }
};
