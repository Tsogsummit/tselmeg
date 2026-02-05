const { Course, Lecture, Lab, Exam, Question, ClassGroup, User } = require('../models');

// Get courses
exports.getCourses = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        let courses;

        if (user.role === 'admin') {
            courses = await Course.findAll({
                include: [
                    ClassGroup,
                    {
                        model: Lecture,
                        include: [{ model: Lab, include: ['LabTasks'] }]
                    },
                    Exam
                ]
            });
        } else {
            // If student, get courses for their class
            const classGroup = await ClassGroup.findByPk(user.classGroupId, {
                include: [{
                    model: Course,
                    include: [
                        {
                            model: Lecture,
                            include: [{ model: Lab, include: ['LabTasks'] }]
                        },
                        Exam
                    ]
                }]
            });
            courses = classGroup ? classGroup.Courses : [];
        }
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get Course Details (with Lectures, Labs, Exams)
exports.getCourse = async (req, res) => {
    try {
        const course = await Course.findByPk(req.params.id, {
            include: [
                {
                    model: Lecture,
                    include: [
                        { model: Lab, include: ['LabTasks'] }, // Include Labs and their Tasks
                        Question
                    ] // Include Lab and Quiz
                },
                {
                    model: Exam
                }
            ],
            order: [[Lecture, 'order', 'ASC']]
        });

        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Admin: Create Lecture
exports.createLecture = async (req, res) => {
    try {
        console.log("Create Lecture Request Body:", req.body);
        console.log("Create Lecture File:", req.file);

        const lectureData = {
            ...req.body,
            fileUrl: req.file ? req.file.path : null // Save file path if uploaded
        };

        const lecture = await Lecture.create(lectureData);
        console.log("Lecture Created:", lecture);
        res.status(201).json(lecture);
    } catch (error) {
        console.error("Create Lecture Error:", error);
        res.status(500).json({ message: 'Error creating lecture', error: error.message });
    }
};

// Admin: Add Question to Lecture
exports.addQuestion = async (req, res) => {
    try {
        const question = await Question.create(req.body); // { text, options, correctAnswer, lectureId, type }
        res.status(201).json(question);
    } catch (error) {
        res.status(500).json({ message: 'Error adding question' });
    }
};

// Admin: Create Lab
exports.createLab = async (req, res) => {
    try {
        const lab = await Lab.create(req.body); // { title, description, maxScore, lectureId }
        res.status(201).json(lab);
    } catch (error) {
        console.error("Create Lab Error:", error);
        res.status(500).json({ message: 'Error creating lab' });
    }
};

// Admin: Create Exam
exports.createExam = async (req, res) => {
    try {
        const exam = await Exam.create(req.body); // { title, type, maxScore, courseId }
        res.status(201).json(exam);
    } catch (error) {
        console.error("Create Exam Error:", error);
        res.status(500).json({ message: 'Error creating exam' });
    }
};
