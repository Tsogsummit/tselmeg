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
            courses = classGroup ? classGroup.Courses : []; // Access via the alias 'Courses'
            if (!courses) courses = [];
        }
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Create Course
exports.createCourse = async (req, res) => {
    try {
        const course = await Course.create(req.body);
        res.status(201).json(course);
    } catch (error) {
        console.error("Create Course Error:", error);
        res.status(500).json({ message: 'Error creating course' });
    }
};

// Get Course Details (with Lectures, Labs, Exams)
exports.getCourse = async (req, res) => {
    try {
        let course = await Course.findByPk(req.params.id, {
            include: [
                {
                    model: Lecture,
                    include: [
                        { model: Lab, include: ['LabTasks'] },
                        Question
                    ]
                },
                Exam
            ],
            order: [[Lecture, 'order', 'ASC']]
        });

        if (!course) return res.status(404).json({ message: 'Course not found' });

        // Convert to plain object to modify
        const courseData = course.toJSON();

        // Manually parse JSON fields for SQLite compatibility
        if (courseData.Lectures) {
            courseData.Lectures = courseData.Lectures.map(lecture => {
                // Parse Materials
                if (typeof lecture.materials === 'string') {
                    try {
                        lecture.materials = JSON.parse(lecture.materials);
                    } catch (e) {
                        lecture.materials = [];
                    }
                }

                // Parse Question Options
                if (lecture.Questions) {
                    lecture.Questions = lecture.Questions.map(q => {
                        if (typeof q.options === 'string') {
                            try {
                                q.options = JSON.parse(q.options);
                            } catch (e) {
                                q.options = [];
                            }
                        }
                        return q;
                    });
                }
                return lecture;
            });
        }

        res.json(courseData);
    } catch (error) {
        console.error("Get Course Error:", error);
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
