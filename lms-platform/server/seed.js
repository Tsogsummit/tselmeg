const { sequelize, User, ClassGroup, Course, Lecture, Lab, LabTask, Exam, Question } = require('./models');
const bcrypt = require('bcryptjs');

async function seed() {
    await sequelize.sync({ force: true }); // Reset DB

    // 1. Create Classes
    const classes = await ClassGroup.bulkCreate([
        { name: '10a', gradeLevel: 10 },
        { name: '10b', gradeLevel: 10 },
        { name: '10c', gradeLevel: 10 },
        { name: '11a', gradeLevel: 11 },
        { name: '11b', gradeLevel: 11 },
        { name: '11c', gradeLevel: 11 },
        { name: '12a', gradeLevel: 12 },
        { name: '12b', gradeLevel: 12 },
    ]);

    // 2. Create Courses
    const courseWeb = await Course.create({ name: 'Web Development (HTML/CSS/JS)', description: 'Introduction to Web' });
    const coursePython = await Course.create({ name: 'Python Programming', description: 'Advanced Programming' });

    // 3. Assign Courses to Classes
    // 10a, 10b -> Web
    await classes[0].addCourse(courseWeb);
    await classes[1].addCourse(courseWeb);
    await classes[2].addCourse(courseWeb);
    // 11a, 12a -> Python
    await classes[3].addCourse(coursePython);
    await classes[4].addCourse(coursePython);
    await classes[5].addCourse(coursePython);
    await classes[6].addCourse(coursePython);
    await classes[7].addCourse(coursePython);

    // 4. Create Users
    // Admin
    const adminPass = await bcrypt.hash('admin123', 10);
    await User.create({
        username: 'admin',
        password: adminPass,
        role: 'admin',
        fullName: 'Teacher Bat',
    });

    // Students
    await User.create({
        username: '10a_001',
        password: await bcrypt.hash('123456', 10), // Default pass
        role: 'student',
        fullName: 'Bat Bold',
        classGroupId: classes[0].id
    });

    // 5. Content for Web Course
    // Week 1: HTML
    const lecture1 = await Lecture.create({
        title: 'Intro to HTML',
        content: '# Welcome to HTML\nHTML stands for...',
        order: 1,
        points: 0,
        startDate: new Date(),
        deadline: new Date(new Date().setDate(new Date().getDate() + 7)),
        isMandatory: true,
        courseId: courseWeb.id
    });

    // Lab for Lecture 1 (Multiple Tasks)
    const lab1 = await Lab.create({
        title: 'HTML Basics Lab',
        description: 'Complete the following tasks to practice HTML structure.',
        maxScore: 20,
        language: 'html',
        lectureId: lecture1.id
    });

    await LabTask.bulkCreate([
        {
            labId: lab1.id,
            order: 1,
            description: 'Create a basic HTML structure with <html>, <head>, and <body> tags.',
            startingCode: '<!DOCTYPE html>\n<html>\n  \n</html>',
            expectedOutput: '<html><head></head><body></body></html>', // Simplified check
            points: 10
        },
        {
            labId: lab1.id,
            order: 2,
            description: 'Add an <h1> tag with text "Hello World" inside the body.',
            startingCode: '<body>\n\n</body>',
            expectedOutput: '<h1>Hello World</h1>',
            points: 10
        }
    ]);

    // Quiz for Lecture 1
    await Question.create({
        text: 'What does HTML stand for?',
        options: JSON.stringify(['Hyper Text Markup Language', 'High Text Make Language']),
        correctAnswer: 'Hyper Text Markup Language',
        lectureId: lecture1.id,
        type: 'LECTURE_QUIZ'
    });

    // Week 2: Python
    const lecture2 = await Lecture.create({
        title: 'Python Syntax',
        content: '# Python Basics\nVariables, loops...',
        order: 1,
        courseId: coursePython.id
    });

    const lab2 = await Lab.create({
        title: 'Python Variables',
        description: 'Practice Python variables',
        maxScore: 10,
        language: 'python',
        lectureId: lecture2.id
    });

    await LabTask.create({
        labId: lab2.id,
        description: 'Print "Hello Python"',
        startingCode: 'print()',
        expectedOutput: 'Hello Python',
        points: 10
    });

    console.log('Database Seeded!');
}

seed().then(() => process.exit());
