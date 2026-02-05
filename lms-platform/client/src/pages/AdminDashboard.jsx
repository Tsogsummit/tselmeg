import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaChalkboardTeacher, FaPlus, FaUsers, FaFileExcel,
    FaBook, FaFlask, FaClipboardList, FaSearch, FaTimes, FaGraduationCap, FaChevronRight
} from 'react-icons/fa';
import * as XLSX from 'xlsx';
import logo from '../assets/tselmeg.jpg';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('courses');
    const [courses, setCourses] = useState([]);
    const [studentsData, setStudentsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [showAddLecture, setShowAddLecture] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [newLecture, setNewLecture] = useState({ title: '', content: '', order: 1 });
    const [showAddLab, setShowAddLab] = useState(false);
    const [newLab, setNewLab] = useState({ title: '', description: '', maxScore: 10, lectureId: '' });
    const [showAddExam, setShowAddExam] = useState(false);
    const [newExam, setNewExam] = useState({ title: '', type: 'PROGRESS', maxScore: 100, courseId: '' });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [coursesRes, gradesRes] = await Promise.all([
                api.get('/courses'),
                api.get('/scores/all')
            ]);
            setCourses(coursesRes.data);
            setStudentsData(gradesRes.data);
        } catch (error) {
            console.error("Error details:", error.response || error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddLecture = async (e) => {
        e.preventDefault();
        const courseId = selectedCourse?.id || newLecture.courseId;

        if (!courseId) {
            alert("Please select a course!");
            return;
        }

        try {
            const formData = new FormData();
            formData.append('title', newLecture.title);
            formData.append('content', newLecture.content);
            formData.append('order', parseInt(newLecture.order) || 1);
            formData.append('courseId', courseId);
            if (newLecture.file) {
                formData.append('file', newLecture.file);
            }

            // Important: Do not set Content-Type manually with axios when sending FormData
            // Axios will set it automatically to multipart/form-data with the correct boundary
            await api.post('/courses/lectures', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setShowAddLecture(false);
            setNewLecture({ title: '', content: '', order: 1, courseId: '' });
            alert('Lecture added successfully!');
            fetchInitialData(); // Refresh
        } catch (error) {
            console.error("Add Lecture Failed:", error);
            alert(`Error adding lecture: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleAddLab = async (e) => {
        e.preventDefault();
        try {
            await api.post('/courses/labs', {
                ...newLab,
                maxScore: parseInt(newLab.maxScore) || 10
            });
            setShowAddLab(false);
            setNewLab({ title: '', description: '', maxScore: 10, lectureId: '' });
            alert('Lab added successfully!');
            fetchInitialData();
        } catch (error) {
            console.error("Add Lab Failed:", error);
            alert(`Error adding lab: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleAddExam = async (e) => {
        e.preventDefault();
        try {
            await api.post('/courses/exams', {
                ...newExam,
                maxScore: parseInt(newExam.maxScore) || 100
            });
            setShowAddExam(false);
            setNewExam({ title: '', type: 'PROGRESS', maxScore: 100, courseId: '' });
            alert('Exam added successfully!');
            fetchInitialData();
        } catch (error) {
            console.error("Add Exam Failed:", error);
            alert(`Error adding exam: ${error.response?.data?.message || error.message}`);
        }
    };

    const exportToExcel = () => {
        const data = studentsData.map(student => {
            const row = {
                'Student ID': student.username,
                'Name': student.fullName,
                'Class': student.ClassGroup?.name,
            };
            student.Scores?.forEach(score => {
                const key = `${score.type} (${score.referenceId})`;
                row[key] = score.score;
            });
            return row;
        });

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Grades");
        XLSX.writeFile(wb, "Students_Grades.xlsx");
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-gray-100 font-sans flex overflow-hidden">

            {/* Sidebar */}
            <aside className="w-72 bg-[#1e293b]/50 backdrop-blur-xl border-r border-white/5 flex flex-col fixed h-full z-20">
                <div className="p-8">
                    <div className="flex items-center gap-3 text-indigo-400 mb-8">
                        <div className="p-0.5 bg-indigo-500/20 rounded-lg w-10 h-10 overflow-hidden">
                            <img src={logo} alt="Logo" className="w-full h-full object-cover rounded-md" />
                        </div>
                        <h1 className="text-xl font-bold text-white tracking-wide">Админ Самбар</h1>
                    </div>

                    <nav className="space-y-2">
                        {[
                            { id: 'courses', label: 'Хичээлүүд', icon: FaBook },
                            { id: 'lectures', label: 'Лекцүүд', icon: FaChalkboardTeacher },
                            { id: 'labs', label: 'Лаборатори', icon: FaFlask },
                            { id: 'exams', label: 'Шалгалтууд', icon: FaClipboardList },
                            { id: 'students', label: 'Сурагчид & Дүн', icon: FaUsers }
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full text-left px-4 py-3.5 rounded-xl flex items-center justify-between transition-all duration-200 group ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className={activeTab === item.id ? 'text-indigo-200' : 'text-gray-500'} />
                                    <span className="font-medium capitalize">{item.label}</span>
                                </div>
                                {activeTab === item.id && <FaChevronRight className="text-xs opacity-50" />}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-white/5 bg-[#1e293b]/30">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-sm shadow-inner cursor-pointer hover:ring-2 ring-white/20 transition">
                            {user?.fullName?.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-semibold text-sm text-gray-200 truncate">{user?.fullName}</p>
                            <p className="text-xs text-gray-500">Багш/Админ</p>
                        </div>
                    </div>
                    <button onClick={logout} className="w-full bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 py-2.5 rounded-lg text-sm transition-all border border-transparent hover:border-red-500/20">
                        Гарах
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-72 p-8 overflow-y-auto h-screen relative">
                <div className="max-w-6xl mx-auto">

                    {/* Header */}
                    <div className="flex justify-between items-end mb-12">
                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold text-white mb-2">
                                {activeTab === 'courses' ? 'Хичээлийн Удирдлага' : 'Сурагчдын Гүйцэтгэл'}
                            </h2>
                            <p className="text-gray-400">
                                {activeTab === 'courses' && 'Хичээлийн агуулга, лекц нэмэх, засах'}
                                {activeTab === 'students' && 'Сурагчдын дүн, ирц, явцыг хянах'}
                                {activeTab === 'lectures' && 'Бүх лекцүүдийн жагсаалт'}
                                {activeTab === 'labs' && 'Лабораторийн даалгаварууд'}
                                {activeTab === 'exams' && 'Шалгалт, сорилууд'}
                            </p>
                        </div>

                        {activeTab === 'students' && (
                            <button
                                onClick={exportToExcel}
                                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-900/20 transition transform hover:scale-105 active:scale-95"
                            >
                                <FaFileExcel className="text-lg" /> Excel Татах
                            </button>
                        )}
                    </div>

                    {/* Tab Content */}
                    <div className="min-h-[500px]">
                        {activeTab === 'courses' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {courses.map(course => (
                                    <div
                                        key={course.id}
                                        className="bg-[#1e293b]/60 backdrop-blur-md rounded-2xl p-6 border border-white/5 hover:border-indigo-500/30 transition group relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>

                                        <div className="flex justify-between items-start mb-6 relative z-10">
                                            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center text-2xl text-indigo-400 border border-indigo-500/20 shadow-lg">
                                                <FaBook />
                                            </div>
                                            <button
                                                onClick={() => { setSelectedCourse(course); setShowAddLecture(true); }}
                                                className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all"
                                                title="Add Lecture"
                                            >
                                                <FaPlus />
                                            </button>
                                        </div>

                                        <h3 className="text-xl font-bold text-white mb-2">{course.name}</h3>
                                        <p className="text-gray-400 text-sm mb-6 h-10 overflow-hidden">{course.description || "Тайлбар байхгүй."}</p>

                                        <div className="space-y-3 pt-4 border-t border-white/5">
                                            <div className="flex justify-between text-sm items-center">
                                                <span className="text-gray-500 flex items-center gap-2"><FaClipboardList size={14} /> Лекцүүд</span>
                                                <span className="bg-white/5 px-2 py-0.5 rounded text-gray-300 text-xs">{course.Lectures?.length || 0} модуль</span>
                                            </div>
                                            <div className="flex justify-between text-sm items-center">
                                                <span className="text-gray-500 flex items-center gap-2"><FaFlask size={14} /> Лаб</span>
                                                <span className="bg-white/5 px-2 py-0.5 rounded text-gray-300 text-xs">
                                                    {course.Lectures?.reduce((acc, l) => acc + (l.Lab ? 1 : 0), 0) || 0} даалгавар
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Add New Course Placeholder (Visual) */}
                                <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-500 hover:border-indigo-500/50 hover:text-indigo-400 hover:bg-white/5 transition cursor-pointer min-h-[250px]">
                                    <FaPlus className="text-3xl mb-4" />
                                    <span className="font-semibold">Шинэ Хичээл Нэмэх</span>
                                </div>
                            </div>
                        )}

                        {activeTab === 'students' && (
                            <>
                                <div className="bg-[#1e293b]/60 backdrop-blur-md rounded-3xl border border-white/5 overflow-hidden">
                                    <div className="relative flex-1 max-w-md p-4">
                                        <FaSearch className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Сурагчийн нэр, кодоор хайх..."
                                            className="w-full pl-11 pr-4 py-2.5 bg-[#0f172a] rounded-xl border border-white/10 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-white/5 text-gray-400 text-xs font-bold uppercase tracking-wider">
                                                <tr>
                                                    <th className="px-6 py-5">Сурагч</th>
                                                    <th className="px-6 py-5">Анги</th>
                                                    <th className="px-6 py-5 text-center">Лекц</th>
                                                    <th className="px-6 py-5 text-center">Лаб</th>
                                                    <th className="px-6 py-5 text-center">Шалгалт</th>
                                                    <th className="px-6 py-5 text-right">Нийт Оноо</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5 text-sm">
                                                {studentsData
                                                    .filter(student =>
                                                        student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                        student.username?.toLowerCase().includes(searchTerm.toLowerCase())
                                                    )
                                                    .map(student => {
                                                        const totalScore = student.Scores?.reduce((acc, curr) => acc + curr.score, 0) || 0;
                                                        return (
                                                            <tr key={student.id} className="hover:bg-white/5 transition">
                                                                <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 text-xs">
                                                                        {student.fullName?.charAt(0)}
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-sm">{student.fullName || student.username}</div>
                                                                        <div className="text-xs text-gray-500">{student.username}</div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 rounded-md text-xs font-bold ring-1 ring-indigo-500/30">
                                                                        {student.ClassGroup?.name}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 text-center text-gray-500">-</td>
                                                                <td className="px-6 py-4 text-center text-gray-500">-</td>
                                                                <td className="px-6 py-4 text-center text-gray-500">-</td>
                                                                <td className="px-6 py-4 text-right">
                                                                    <span className={`font-bold text-lg ${totalScore >= 90 ? 'text-emerald-400' : 'text-indigo-400'}`}>
                                                                        {Math.min(100, totalScore)}
                                                                        <span className="text-xs text-gray-600 font-normal ml-1">/100</span>
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        )
                                                    })}
                                            </tbody>
                                        </table>
                                        {studentsData.length === 0 && (
                                            <div className="p-16 text-center text-gray-500 flex flex-col items-center">
                                                <FaUsers className="text-4xl mb-4 opacity-50" />
                                                <p>Сурагчид бүртгэгдээгүй байна.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'lectures' && (() => {
                            const allLectures = courses.flatMap(c => c.Lectures?.map(l => ({ ...l, courseName: c.name })) || []);
                            return (
                                <div className="bg-[#1e293b]/60 backdrop-blur-md rounded-3xl border border-white/5 p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-white flex items-center gap-2"><FaChalkboardTeacher /> Бүх Лекцүүд ({allLectures.length})</h3>
                                        <button onClick={() => { setSelectedCourse(null); setShowAddLecture(true); }} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-indigo-500/20 text-sm flex items-center gap-2"><FaPlus /> Нэмэх</button>
                                    </div>
                                    <div className="space-y-3">
                                        {allLectures.map((lecture, idx) => (
                                            <div key={lecture.id || idx} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5 hover:border-indigo-500/30 transition group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                                        <FaChalkboardTeacher />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-white group-hover:text-indigo-400 transition">{lecture.title}</h4>
                                                        <p className="text-sm text-gray-400">{lecture.courseName} • Order: {lecture.order}</p>
                                                    </div>
                                                </div>
                                                <button className="text-sm bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-white transition shadow-lg shadow-indigo-500/20">Засах</button>
                                            </div>
                                        ))}
                                        {allLectures.length === 0 && <p className="text-gray-500 text-center py-8">Лекц олдсонгүй.</p>}
                                    </div>
                                </div>
                            );
                        })()}

                        {activeTab === 'labs' && (() => {
                            const allLabs = courses.flatMap(c => c.Lectures?.map(l => l.Lab ? { ...l.Lab, courseName: c.name, lectureTitle: l.title } : null).filter(Boolean) || []);
                            return (
                                <div className="bg-[#1e293b]/60 backdrop-blur-md rounded-3xl border border-white/5 p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-white flex items-center gap-2"><FaFlask /> Лабораторийн Ажил ({allLabs.length})</h3>
                                        <button onClick={() => setShowAddLab(true)} className="bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-pink-500/20 text-sm flex items-center gap-2"><FaPlus /> Нэмэх</button>
                                    </div>
                                    <div className="space-y-3">
                                        {allLabs.map((lab, idx) => (
                                            <div key={lab.id || idx} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5 hover:border-pink-500/30 transition group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400">
                                                        <FaFlask />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-white group-hover:text-pink-400 transition">{lab.title}</h4>
                                                        <p className="text-sm text-gray-400">{lab.courseName} / {lab.lectureTitle}</p>
                                                    </div>
                                                </div>
                                                <button className="text-sm bg-pink-600 hover:bg-pink-500 px-4 py-2 rounded-lg text-white transition shadow-lg shadow-pink-500/20">Засах</button>
                                            </div>
                                        ))}
                                        {allLabs.length === 0 && <p className="text-gray-500 text-center py-8">Лаборатори олдсонгүй.</p>}
                                    </div>
                                </div>
                            );
                        })()}

                        {activeTab === 'exams' && (() => {
                            const allExams = courses.flatMap(c => c.Exams?.map(e => ({ ...e, courseName: c.name })) || []);
                            return (
                                <div className="bg-[#1e293b]/60 backdrop-blur-md rounded-3xl border border-white/5 p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-white flex items-center gap-2"><FaClipboardList /> Шалгалтууд ({allExams.length})</h3>
                                        <button onClick={() => setShowAddExam(true)} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-purple-500/20 text-sm flex items-center gap-2"><FaPlus /> Нэмэх</button>
                                    </div>
                                    <div className="space-y-3">
                                        {allExams.map((exam, idx) => (
                                            <div key={exam.id || idx} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5 hover:border-purple-500/30 transition group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                                                        <FaClipboardList />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-white group-hover:text-purple-400 transition">{exam.title}</h4>
                                                        <p className="text-sm text-gray-400">{exam.courseName} • {exam.duration} мин</p>
                                                    </div>
                                                </div>
                                                <button className="text-sm bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg text-white transition shadow-lg shadow-purple-500/20">Засах</button>
                                            </div>
                                        ))}
                                        {allExams.length === 0 && <p className="text-gray-500 text-center py-8">Шалгалт олдсонгүй.</p>}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                </div>
            </main >

            {/* Modern Modal for Adding Lecture */}
            <AnimatePresence>
                {showAddLecture && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddLecture(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-[#1e293b] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl relative z-10 overflow-hidden"
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Лекц Нэмэх</h3>
                                    {selectedCourse ? (
                                        <p className="text-xs text-indigo-300 mt-1">Хичээл: {selectedCourse.name}</p>
                                    ) : (
                                        <p className="text-xs text-gray-400 mt-1">Хичээл сонгоно уу</p>
                                    )}
                                </div>
                                <button onClick={() => setShowAddLecture(false)} className="text-gray-400 hover:text-white transition bg-white/5 p-2 rounded-lg"><FaTimes /></button>
                            </div>
                            <form onSubmit={handleAddLecture} className="p-6 space-y-5">
                                {!selectedCourse && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-300 mb-2">Хичээл сонгох</label>
                                        <select
                                            required
                                            className="w-full px-4 py-3 bg-[#0f172a] border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-white transition"
                                            value={newLecture.courseId || ''}
                                            onChange={e => setNewLecture({ ...newLecture, courseId: e.target.value })}
                                        >
                                            <option value="">Сонгох...</option>
                                            {courses.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-2">Лекцийн Гарчиг</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Жишээ: Оршил хичээл"
                                        className="w-full px-4 py-3 bg-[#0f172a] border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-white placeholder-gray-600 transition"
                                        value={newLecture.title}
                                        onChange={e => setNewLecture({ ...newLecture, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-2">Агуулга (Markdown/Текст)</label>
                                    <textarea
                                        className="w-full px-4 py-3 bg-[#0f172a] border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-40 text-white placeholder-gray-600 transition resize-none"
                                        placeholder="# Лекц 1&#10;Агуулгаа энд бичнэ үү..."
                                        value={newLecture.content}
                                        onChange={e => setNewLecture({ ...newLecture, content: e.target.value })}
                                    ></textarea>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-300 mb-2">Эрэмбэ (Order)</label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-3 bg-[#0f172a] border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white"
                                            value={newLecture.order}
                                            onChange={e => setNewLecture({ ...newLecture, order: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-300 mb-2">Хавсралт файл (PPT / PDF)</label>
                                        <input
                                            type="file"
                                            accept=".pdf, .ppt, .pptx"
                                            className="w-full px-4 py-3 bg-[#0f172a] border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                                            onChange={e => setNewLecture({ ...newLecture, file: e.target.files[0] })}
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-indigo-500/20 active:scale-[0.98]">
                                        Лекц Үүсгэх
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal for Adding Lab */}
            <AnimatePresence>
                {showAddLab && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddLab(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-[#1e293b] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl relative z-10 p-6 overflow-hidden">
                            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                                <h3 className="text-xl font-bold text-white">Лаборатори Нэмэх</h3>
                                <button onClick={() => setShowAddLab(false)}><FaTimes className="text-gray-400 hover:text-white" /></button>
                            </div>
                            <form onSubmit={handleAddLab} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-2">Гарчиг</label>
                                    <input type="text" required className="w-full px-4 py-3 bg-[#0f172a] rounded-xl border border-white/10 text-white focus:ring-2 focus:ring-indigo-500 outline-none" value={newLab.title} onChange={e => setNewLab({ ...newLab, title: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-2">Тайлбар</label>
                                    <textarea className="w-full px-4 py-3 bg-[#0f172a] rounded-xl border border-white/10 text-white h-24 focus:ring-2 focus:ring-indigo-500 outline-none" value={newLab.description} onChange={e => setNewLab({ ...newLab, description: e.target.value })}></textarea>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-300 mb-2">Оноо</label>
                                        <input type="number" className="w-full px-4 py-3 bg-[#0f172a] rounded-xl border border-white/10 text-white focus:ring-2 focus:ring-indigo-500 outline-none" value={newLab.maxScore} onChange={e => setNewLab({ ...newLab, maxScore: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-300 mb-2">Лекц сонгох</label>
                                        <select required className="w-full px-4 py-3 bg-[#0f172a] rounded-xl border border-white/10 text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none" value={newLab.lectureId} onChange={e => setNewLab({ ...newLab, lectureId: e.target.value })}>
                                            <option value="">Сонгох...</option>
                                            {courses.flatMap(c => c.Lectures || []).map(l => (
                                                <option key={l.id} value={l.id}>{l.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-pink-500/20 mt-2">Лаб Үүсгэх</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal for Adding Exam */}
            <AnimatePresence>
                {showAddExam && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddExam(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-[#1e293b] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl relative z-10 p-6 overflow-hidden">
                            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                                <h3 className="text-xl font-bold text-white">Шалгалт Нэмэх</h3>
                                <button onClick={() => setShowAddExam(false)}><FaTimes className="text-gray-400 hover:text-white" /></button>
                            </div>
                            <form onSubmit={handleAddExam} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-2">Гарчиг</label>
                                    <input type="text" required className="w-full px-4 py-3 bg-[#0f172a] rounded-xl border border-white/10 text-white focus:ring-2 focus:ring-indigo-500 outline-none" value={newExam.title} onChange={e => setNewExam({ ...newExam, title: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-300 mb-2">Төрөл</label>
                                        <select className="w-full px-4 py-3 bg-[#0f172a] rounded-xl border border-white/10 text-white focus:ring-2 focus:ring-indigo-500 outline-none" value={newExam.type} onChange={e => setNewExam({ ...newExam, type: e.target.value })}>
                                            <option value="PROGRESS">Явцын</option>
                                            <option value="MIDTERM">Сорил</option>
                                            <option value="FINAL">Бие даалт</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-300 mb-2">Оноо</label>
                                        <input type="number" className="w-full px-4 py-3 bg-[#0f172a] rounded-xl border border-white/10 text-white focus:ring-2 focus:ring-indigo-500 outline-none" value={newExam.maxScore} onChange={e => setNewExam({ ...newExam, maxScore: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-300 mb-2">Хичээл</label>
                                    <select required className="w-full px-4 py-3 bg-[#0f172a] rounded-xl border border-white/10 text-white focus:ring-2 focus:ring-indigo-500 outline-none" value={newExam.courseId} onChange={e => setNewExam({ ...newExam, courseId: e.target.value })}>
                                        <option value="">Хичээл сонгох...</option>
                                        {courses.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-purple-500/20 mt-2">Шалгалт Үүсгэх</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;
