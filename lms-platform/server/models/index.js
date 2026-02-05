const sequelize = require('../config/database');
const User = require('./User');
const ClassGroup = require('./ClassGroup');
const Course = require('./Course');
const Lecture = require('./Lecture');
const Lab = require('./Lab');
const LabTask = require('./LabTask');
const Exam = require('./Exam');
const Question = require('./Question');
const Score = require('./Score');
const Submission = require('./Submission');

// User - Class Relationship
ClassGroup.hasMany(User, { foreignKey: 'classGroupId' });
User.belongsTo(ClassGroup, { foreignKey: 'classGroupId' });

// Class - Course Relationship (Many-to-Many)
// A class (10a) can have multiple courses (HTML, Math), A course can belong to multiple classes (HTML for 10a, 10b)
ClassGroup.belongsToMany(Course, { through: 'ClassCourses' });
Course.belongsToMany(ClassGroup, { through: 'ClassCourses' });

// Course - Lecture
Course.hasMany(Lecture, { foreignKey: 'courseId' });
Lecture.belongsTo(Course, { foreignKey: 'courseId' });

// Lecture - Lab (One-to-One or One-to-Many, req implies linked)
Lecture.hasOne(Lab, { foreignKey: 'lectureId' });
Lab.belongsTo(Lecture, { foreignKey: 'lectureId' });



// Lab - LabTasks
Lab.hasMany(LabTask, { foreignKey: 'labId' });
LabTask.belongsTo(Lab, { foreignKey: 'labId' });

// Course - Exam
Course.hasMany(Exam, { foreignKey: 'courseId' });
Exam.belongsTo(Course, { foreignKey: 'courseId' });

// Lecture - Questions (Quiz)
Lecture.hasMany(Question, { foreignKey: 'lectureId' });
Question.belongsTo(Lecture, { foreignKey: 'lectureId' });

// Exam - Questions
Exam.hasMany(Question, { foreignKey: 'examId' });
Question.belongsTo(Exam, { foreignKey: 'examId' });

// User - Scores
User.hasMany(Score, { foreignKey: 'userId' });
Score.belongsTo(User, { foreignKey: 'userId' });


// Submission Relations
User.hasMany(Submission, { foreignKey: 'userId' });
Submission.belongsTo(User, { foreignKey: 'userId' });

// Exports
module.exports = {
    sequelize,
    User,
    ClassGroup,
    Course,
    Lecture,
    Lab,
    LabTask,
    Exam,
    Question,
    Score,
    Submission
};
