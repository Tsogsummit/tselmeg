const sequelize = require('../config/database');
const User = require('./User');
const ClassGroup = require('./ClassGroup');
const Course = require('./Course');
const Lecture = require('./Lecture');
const Lab = require('./Lab');
const Exam = require('./Exam');
const Question = require('./Question');
const Score = require('./Score');

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

// Exports
module.exports = {
    sequelize,
    User,
    ClassGroup,
    Course,
    Lecture,
    Lab,
    Exam,
    Question,
    Score
};
