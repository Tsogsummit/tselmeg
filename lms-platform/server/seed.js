const { sequelize, User, ClassGroup, Course, Lecture, Lab, Exam, Question } = require('./models');
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

    // Students (Auto-created logic simulated here)
    await User.create({
        username: '10a_001',
        password: await bcrypt.hash('123456', 10), // Default pass
        role: 'student',
        fullName: 'Bat Bold',
        classGroupId: classes[0].id
    });

    // 5. Content for Web Course
    const lecture1 = await Lecture.create({
        title: 'Intro to HTML',
        content: '# Welcome to HTML\nHTML stands for...',
        order: 1,
        points: 0,
        courseId: courseWeb.id
    });

    // Lab for Lecture 1
    await Lab.create({
        title: 'Create your first page',
        description: 'Create index.html and add h1 tag.',
        maxScore: 10,
        lectureId: lecture1.id
    });

    // Quiz for Lecture 1
    await Question.create({
        text: 'What does HTML stand for?',
        options: JSON.stringify(['Hyper Text Markup Language', 'High Text Make Language']),
        correctAnswer: 'Hyper Text Markup Language',
        lectureId: lecture1.id,
        type: 'LECTURE_QUIZ'
    });

    console.log('Database Seeded!');
}

seed().then(() => process.exit());
