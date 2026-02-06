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
    const courseWeb = await Course.create({
        name: 'Web Development (HTML/CSS/JS)',
        courseCode: 'CS101',
        description: 'Introduction to Web',
        semester: 'Fall 2024',
        credits: 3,
        department: 'CS',
        gradingScheme: { lectures: 20, labs: 40, finalExam: 40 },
        startDate: '2024-09-01',
        endDate: '2024-12-31',
        allowLateSubmission: true,
        latePenalty: 10
    });
    const coursePython = await Course.create({
        name: 'Python Programming',
        courseCode: 'CS102',
        description: 'Advanced Programming',
        semester: 'Fall 2024',
        credits: 3,
        department: 'CS',
        gradingScheme: { lectures: 20, labs: 50, finalExam: 30 }
    });

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
        email: 'admin@school.edu',
        password: adminPass,
        role: 'admin',
        fullName: 'System Admin',
    });

    // Teacher
    const teacherPass = await bcrypt.hash('teacher123', 10);
    await User.create({
        username: 'teacher1',
        email: 'teacher1@school.edu',
        password: teacherPass,
        role: 'teacher',
        fullName: 'Teacher Saruul',
        specialization: 'Computer Science'
    });

    // Students
    await User.create({
        username: '10a_001',
        studentId: 'ST2024001',
        email: 'student1@school.edu',
        password: await bcrypt.hash('123456', 10), // Default pass
        role: 'student',
        fullName: 'Bat Bold',
        classGroupId: classes[0].id,
        classYear: '2024'
    });

    // 5. Content for Web Course
    // Week 1: HTML
    const lecture1 = await Lecture.create({
        title: 'Intro to HTML',
        description: '# Welcome to HTML\nHTML stands for...',
        order: 1,
        materials: [
            { type: 'pdf', title: 'HTML Slides', url: '/uploads/lecture1.pdf' },
            { type: 'video', title: 'Intro Video', url: 'https://youtube.com/...' }
        ],
        points: 0,
        availableFrom: new Date(),
        mandatory: true,
        courseId: courseWeb.id
    });

    // Lab for Lecture 1 (Multiple Tasks)
    const lab1 = await Lab.create({
        title: 'HTML Basics Lab',
        description: 'Complete the following tasks to practice HTML structure.',
        order: 1,
        points: 20,
        language: 'html',
        instruction: 'Create a basic webpage.',
        lectureId: lecture1.id,
        allowedAttempts: 3
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
        description: '# Python Basics\nVariables, loops...',
        order: 1,
        courseId: coursePython.id
    });

    const lab2 = await Lab.create({
        title: 'Python Variables',
        description: 'Practice Python variables',
        points: 10,
        language: 'python',
        testCases: [
            { input: '', expectedOutput: 'Hello Python', points: 10 }
        ],
        lectureId: lecture2.id
    });

    await LabTask.create({
        labId: lab2.id,
        description: 'Print "Hello Python"',
        startingCode: 'print()',
        expectedOutput: 'Hello Python',
        points: 10
    });

    // Exam
    await Exam.create({
        title: 'Midterm Exam',
        type: 'midterm',
        totalPoints: 100,
        startTime: new Date(new Date().setDate(new Date().getDate() + 30)),
        endTime: new Date(new Date().setDate(new Date().getDate() + 30) + 7200000), // +2 hours
        courseId: courseWeb.id
    });

    console.log('Database Seeded!');
}

seed().then(() => process.exit());
