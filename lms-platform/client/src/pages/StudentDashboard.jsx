import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaBook, FaSignOutAlt, FaSearch, FaUserCircle, FaPlayCircle, FaCheckCircle, FaClock } from 'react-icons/fa';
import logo from '../assets/tselmeg.jpg';

const StudentDashboard = () => {
    const { user, logout } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('home');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { data } = await api.get('/courses');
                setCourses(data);
            } catch (error) {
                console.error("Failed to fetch courses", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-white font-sans selection:bg-indigo-500 selection:text-white">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 backdrop-blur-lg bg-[#0f172a]/80 border-b border-white/10 px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 overflow-hidden">
                            <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Сургалтын Платформ
                        </span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-1 text-sm font-medium text-gray-400 bg-white/5 p-1 rounded-xl">
                            <button onClick={() => setActiveTab('home')} className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'home' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:text-white hover:bg-white/5'}`}>Хичээлүүд</button>
                            <button onClick={() => setActiveTab('lectures')} className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'lectures' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:text-white hover:bg-white/5'}`}>Лекц</button>
                            <button onClick={() => setActiveTab('labs')} className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'labs' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:text-white hover:bg-white/5'}`}>Лаборатори</button>
                            <button onClick={() => setActiveTab('exams')} className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'exams' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:text-white hover:bg-white/5'}`}>Шалгалт</button>
                            <button onClick={() => setActiveTab('grades')} className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'grades' ? 'bg-indigo-600 text-white shadow-lg' : 'hover:text-white hover:bg-white/5'}`}>Дүн</button>
                        </div>
                        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                            <FaUserCircle className="text-indigo-400 text-xl" />
                            <div className="text-sm">
                                <span className="block font-medium text-white">{user?.fullName}</span>
                                <span className="block text-xs text-indigo-300 capitalize">{user?.role}</span>
                            </div>
                        </div>

                        <button
                            onClick={logout}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                            title="Logout"
                        >
                            <FaSignOutAlt className="text-xl" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-12 pb-20 px-6 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
                    <div className="absolute top-20 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/20 rounded-full blur-[100px]" />
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="md:w-2/3"
                    >
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                            Мэдлэгээ тэлэхэд <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                                бэлэн үү?
                            </span>
                        </h1>
                        <p className="text-gray-400 text-lg mb-8 max-w-xl">
                            Хичээлүүдээ үзэж, даалгавраа илгээж, өөрийн явцаа нэг дороос хянах боломжтой.
                        </p>

                        <div className="relative max-w-md">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Хичээл хайх..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-xl"
                            />
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* Courses Grid or Tab Content */}
            <main className="max-w-7xl mx-auto px-6 pb-20 relative z-10">
                <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                    {activeTab === 'home' && <><FaBook className="text-indigo-400" /> Миний Хичээлүүд</>}
                    {activeTab === 'lectures' && <><FaPlayCircle className="text-indigo-400" /> Бүх Лекцүүд</>}
                    {activeTab === 'labs' && <><FaCheckCircle className="text-indigo-400" /> Лабораторийн Ажил</>}
                    {activeTab === 'exams' && <><FaClock className="text-indigo-400" /> Шалгалтууд</>}
                    {activeTab === 'grades' && <><FaBook className="text-indigo-400" /> Дүнгийн Мэдээлэл</>}
                </h2>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 bg-white/5 rounded-3xl animate-pulse"></div>
                        ))}
                    </div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {activeTab === 'home' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {courses.map((course, index) => (
                                    <motion.div
                                        key={course.id}
                                        variants={itemVariants}
                                        whileHover={{ y: -10, transition: { duration: 0.2 } }}
                                        className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300"
                                    >
                                        <div className={`h-40 relative overflow-hidden bg-gradient-to-br ${index % 2 === 0 ? 'from-blue-600 to-indigo-700' : 'from-purple-600 to-pink-700'}`}>
                                            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                                            <div className="absolute bottom-4 left-4">
                                                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-semibold text-white border border-white/10">
                                                    {course.ClassGroups?.length > 0 ? 'Судалж буй' : 'Нээлттэй'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                                                {course.name}
                                            </h3>
                                            <p className="text-gray-400 text-sm mb-6 line-clamp-2">
                                                {course.description || "Энэхүү хичээлийг судалснаар та шинэ мэдлэг эзэмших болно."}
                                            </p>

                                            <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-auto">
                                                <Link to={`/course/${course.id}`} className="flex items-center gap-2 bg-white text-indigo-900 px-4 py-2 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors transform active:scale-95 w-full justify-center">
                                                    <FaPlayCircle /> Үргэлжлүүлэх
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'lectures' && (
                            <div className="space-y-4">
                                {courses.flatMap(c => c.Lectures?.map(l => ({ ...l, courseName: c.name, courseId: c.id })) || []).map((lecture, idx) => (
                                    <motion.div key={lecture.id || idx} variants={itemVariants} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between hover:bg-white/10 transition">
                                        <div>
                                            <h4 className="font-bold text-lg">{lecture.title}</h4>
                                            <p className="text-gray-400 text-sm">{lecture.courseName}</p>
                                        </div>
                                        <Link to={`/course/${lecture.courseId}`} className="px-4 py-2 bg-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-500">Үзэх</Link>
                                    </motion.div>
                                ))}
                                {courses.every(c => !c.Lectures?.length) && <p className="text-gray-500 text-center py-10">Лекц олдсонгүй.</p>}
                            </div>
                        )}

                        {activeTab === 'labs' && (
                            <div className="space-y-4">
                                {courses.flatMap(c => c.Lectures?.flatMap(l => l.Labs?.map(lab => ({ ...lab, lectureTitle: l.title, courseName: c.name, courseId: c.id }))) || []).map((lab, idx) => (
                                    <motion.div key={lab.id || idx} variants={itemVariants} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between hover:bg-white/10 transition">
                                        <div>
                                            <h4 className="font-bold text-lg">{lab.title}</h4>
                                            <p className="text-gray-400 text-sm">{lab.courseName} - {lab.lectureTitle}</p>
                                        </div>
                                        <Link to={`/course/${lab.courseId}`} className="px-4 py-2 bg-pink-600 rounded-lg text-sm font-bold hover:bg-pink-500">Гүйцэтгэх</Link>
                                    </motion.div>
                                ))}
                                {courses.every(c => c.Lectures?.every(l => !l.Labs?.length)) && <p className="text-gray-500 text-center py-10">Лабораторийн ажил олдсонгүй.</p>}
                            </div>
                        )}

                        {activeTab === 'exams' && (
                            <div className="space-y-4">
                                {courses.flatMap(c => c.Exams?.map(e => ({ ...e, courseName: c.name, courseId: c.id })) || []).map((exam, idx) => (
                                    <motion.div key={exam.id || idx} variants={itemVariants} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between hover:bg-white/10 transition">
                                        <div>
                                            <h4 className="font-bold text-lg">{exam.title}</h4>
                                            <p className="text-gray-400 text-sm">{exam.courseName} • {exam.duration} мин</p>
                                        </div>
                                        <Link to={`/course/${exam.courseId}`} className="px-4 py-2 bg-purple-600 rounded-lg text-sm font-bold hover:bg-purple-500">Эхлүүлэх</Link>
                                    </motion.div>
                                ))}
                                {courses.every(c => !c.Exams?.length) && <p className="text-gray-500 text-center py-10">Шалгалт олдсонгүй.</p>}
                            </div>
                        )}

                        {activeTab === 'grades' && (
                            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-white/5 text-gray-400 text-xs uppercase font-bold">
                                        <tr>
                                            <th className="px-6 py-4">Хичээл</th>
                                            <th className="px-6 py-4">Лекц</th>
                                            <th className="px-6 py-4">Лаб</th>
                                            <th className="px-6 py-4">Шалгалт</th>
                                            <th className="px-6 py-4 text-right">Нийт</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {courses.map(course => (
                                            <tr key={course.id} className="hover:bg-white/5 text-sm">
                                                <td className="px-6 py-4 font-medium">{course.name}</td>
                                                <td className="px-6 py-4 text-gray-500">-</td>
                                                <td className="px-6 py-4 text-gray-500">-</td>
                                                <td className="px-6 py-4 text-gray-500">-</td>
                                                <td className="px-6 py-4 text-right font-bold text-emerald-400">-</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>
                )}
            </main>
        </div>
    );
};

export default StudentDashboard;
