import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBookOpen, FaFlask, FaCheckCircle, FaArrowLeft, FaChevronDown, FaClock } from 'react-icons/fa';
import Editor from '@monaco-editor/react';

const CourseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeLecture, setActiveLecture] = useState(null);
    const [activeTab, setActiveTab] = useState('content'); // content, quiz, lab
    const [code, setCode] = useState('');
    const [submissionResult, setSubmissionResult] = useState(null);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const { data } = await api.get(`/courses/${id}`);
                setCourse(data);
                if (data.Lectures && data.Lectures.length > 0) {
                    setActiveLecture(data.Lectures[0]);
                }
            } catch (error) {
                console.error("Failed to load course", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [id]);

    const handleEditorChange = (value) => {
        setCode(value);
    };

    const handleSubmitCode = async () => {
        if (!activeLecture?.Lab) return;

        try {
            const res = await api.post('/submissions/submit', {
                labId: activeLecture.Lab.id,
                code: code,
                language: activeLecture.Lab.language
            });
            setSubmissionResult(res.data);
            alert(`Илгээгдлээ! Оноо: ${res.data.result.score}/${res.data.result.maxScore}`);
        } catch (err) {
            console.error(err);
            alert('Алдаа гарлаа');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (!course) return <div className="text-white">Хичээл олдсонгүй</div>;

    return (
        <div className="min-h-screen bg-[#0f172a] text-gray-100 font-sans flex flex-col md:flex-row h-screen overflow-hidden">

            {/* Sidebar - Curriculum */}
            <aside className="w-full md:w-80 bg-[#1e293b]/80 border-r border-white/5 flex flex-col h-full overflow-y-auto z-20">
                <div className="p-6 border-b border-white/5 bg-[#0f172a]/50 backdrop-blur-md sticky top-0 z-10">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 text-sm transition"
                    >
                        <FaArrowLeft /> Хичээлүүд рүү буцах
                    </button>
                    <h2 className="text-xl font-bold text-white leading-tight">{course.name}</h2>
                    <div className="flex items-center gap-2 mt-2 text-xs text-indigo-400 font-medium">
                        <span className="bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">
                            {course.Lectures?.length || 0} Модуль
                        </span>
                        <span className="bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 text-emerald-400">
                            Судалж буй
                        </span>
                    </div>
                </div>

                <div className="p-4 space-y-3 flex-1 overflow-y-auto">
                    {course.Lectures?.map((lecture, index) => (
                        <div
                            key={lecture.id}
                            onClick={() => {
                                setActiveLecture(lecture);
                                setActiveTab('content');
                                setCode(''); // Reset code or load saved code
                                setSubmissionResult(null);
                            }}
                            className={`p-4 rounded-xl cursor-pointer border transition-all duration-200 group relative overflow-hidden ${activeLecture?.id === lecture.id
                                ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-600/20'
                                : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-1 relative z-10">
                                <span className={`text-xs font-bold uppercase tracking-wider ${activeLecture?.id === lecture.id ? 'text-indigo-200' : 'text-gray-500'}`}>
                                    Модуль {index + 1}
                                </span>
                                {activeLecture?.id === lecture.id && <FaCheckCircle className="text-white text-sm" />}
                            </div>
                            <h3 className={`font-semibold mb-2 relative z-10 ${activeLecture?.id === lecture.id ? 'text-white' : 'text-gray-300'}`}>
                                {lecture.title}
                            </h3>

                            {/* Progress Bar (Visual Mock) */}
                            <div className="w-full h-1 bg-black/20 rounded-full overflow-hidden mt-2">
                                <div className={`h-full bg-white/30 w-0 group-hover:w-full transition-all duration-700 ${activeLecture?.id === lecture.id ? 'w-full bg-white/40' : ''}`}></div>
                            </div>
                        </div>
                    ))}

                    {course.Lectures?.length === 0 && (
                        <div className="text-center py-10 text-gray-500 text-sm">
                            Лекц ороогүй байна.
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full bg-[#0f172a] relative overflow-hidden">
                {/* Top Header */}
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#1e293b]/40 backdrop-blur-sm z-10">
                    <h3 className="text-lg font-medium text-white truncate max-w-xl">
                        {activeLecture ? activeLecture.title : 'Лекц сонгоно уу'}
                    </h3>
                    <div className="flex gap-4">
                        {/* Progress or Actions */}
                    </div>
                </header>

                {activeLecture ? (
                    <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
                        <div className="max-w-4xl mx-auto pb-20">

                            {/* Tabs */}
                            <div className="flex items-center gap-2 mb-8 bg-white/5 p-1 rounded-xl w-fit">
                                <button
                                    onClick={() => setActiveTab('content')}
                                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'content' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                >
                                    <FaBookOpen className="inline-block mr-2" /> Лекц
                                </button>
                                <button
                                    onClick={() => setActiveTab('lab')}
                                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'lab' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                >
                                    <FaFlask className="inline-block mr-2" /> Лаборатори
                                </button>
                            </div>

                            {/* Content View */}
                            {activeTab === 'content' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-8"
                                >
                                    <div className="prose prose-invert prose-lg max-w-none">
                                        <div className="bg-[#1e293b]/40 p-8 rounded-3xl border border-white/5 shadow-2xl">
                                            {activeLecture.description ? (
                                                <div className="whitespace-pre-wrap font-light text-gray-300 leading-relaxed">
                                                    {activeLecture.description}
                                                </div>
                                            ) : (
                                                <p className="text-gray-500 italic">Агуулга одоогоор хоосон байна.</p>
                                            )}
                                        </div>

                                        {/* File Attachments */}
                                        {activeLecture.materials && activeLecture.materials.length > 0 && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                                {activeLecture.materials.map((material, idx) => (
                                                    <div key={idx} className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-4 text-blue-300">
                                                        <div className="p-3 bg-blue-500/20 rounded-lg">
                                                            <FaBookOpen size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-sm">{material.title || 'Material'}</p>
                                                            <a
                                                                href={material.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-xs hover:underline"
                                                            >
                                                                {material.type === 'video' ? 'Үзэх' : 'Татах / Үзэх'}
                                                            </a>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Quiz Section */}
                                    <div className="mt-12 p-8 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-3xl border border-indigo-500/30">
                                        <h4 className="text-xl font-bold text-white mb-4">Мэдлэг Шалагах</h4>
                                        {activeLecture.Questions?.length > 0 ? (
                                            <div className="space-y-4">
                                                {activeLecture.Questions.map((q, i) => (
                                                    <div key={q.id} className="bg-[#0f172a]/80 p-6 rounded-xl border border-white/10">
                                                        <p className="font-medium text-gray-200 mb-4">{i + 1}. {q.text}</p>
                                                        <div className="space-y-2">
                                                            {JSON.parse(q.options || '[]').map((opt, idx) => (
                                                                <label key={idx} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition">
                                                                    <input type="radio" name={`q-${q.id}`} className="accent-indigo-500 w-5 h-5" />
                                                                    <span className="text-gray-400">{opt}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                                <button className="mt-4 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition shadow-lg shadow-indigo-500/25">
                                                    Хариулт Илгээх
                                                </button>
                                            </div>
                                        ) : (
                                            <p className="text-gray-400">Асуулт байхгүй байна.</p>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* Lab View */}
                            {activeTab === 'lab' && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <div className="bg-[#1e293b]/60 backdrop-blur-md p-8 rounded-3xl border border-white/5 shadow-2xl">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
                                                <FaFlask size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-white">Лабораторийн Ажил</h3>
                                                <p className="text-emerald-400/80 text-sm">{activeLecture.Lab?.points || 10} оноо</p>
                                            </div>
                                        </div>

                                        {activeLecture.Lab ? (
                                            <div className="space-y-6">
                                                <div className="prose prose-invert max-w-none bg-[#0f172a]/50 p-6 rounded-xl border border-white/5">
                                                    <h4 className="text-xl font-bold text-white mb-2">{activeLecture.Lab.title}</h4>
                                                    <p className="text-gray-300">{activeLecture.Lab.description}</p>
                                                </div>

                                                {/* Tasks */}
                                                {activeLecture.Lab.LabTasks && activeLecture.Lab.LabTasks.length > 0 && (
                                                    <div className="space-y-4">
                                                        <h5 className="font-semibold text-lg text-white">Даалгаварууд:</h5>
                                                        {activeLecture.Lab.LabTasks.map((task, idx) => (
                                                            <div key={task.id} className="bg-white/5 p-4 rounded-lg border border-white/10">
                                                                <div className="flex justify-between">
                                                                    <span className="font-bold text-emerald-400">Task {idx + 1}</span>
                                                                    <span className="text-sm text-gray-500">{task.points} оноо</span>
                                                                </div>
                                                                <p className="text-gray-300 mt-1">{task.description}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="pt-6 border-t border-white/5">
                                                    <label className="block text-sm font-semibold text-gray-400 mb-3">Код бичих орчин</label>
                                                    <div className="h-[400px] border border-white/10 rounded-xl overflow-hidden shadow-inner bg-[#1e1e1e]">
                                                        <Editor
                                                            height="100%"
                                                            defaultLanguage={activeLecture.Lab.language || 'javascript'}
                                                            defaultValue={activeLecture.Lab.starterCode || '// Write your code here'}
                                                            theme="vs-dark"
                                                            onChange={handleEditorChange}
                                                            onMount={(editor) => {
                                                                // Set initial value to starter code if code is empty
                                                                if (!code && activeLecture.Lab.starterCode) {
                                                                    setCode(activeLecture.Lab.starterCode);
                                                                }
                                                            }}
                                                            options={{
                                                                minimap: { enabled: false },
                                                                fontSize: 14,
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex justify-end gap-3 mt-4">
                                                    <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-xl transition">
                                                        Тест ажиллуулах
                                                    </button>
                                                    <button
                                                        onClick={handleSubmitCode}
                                                        className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition">
                                                        Илгээх
                                                    </button>
                                                </div>

                                                {/* Submission Result */}
                                                {submissionResult && (
                                                    <div className="mt-6 bg-black/30 p-4 rounded-xl border border-white/10">
                                                        <h4 className="font-bold text-white mb-2">Үр дүн: {submissionResult.result.score} / {submissionResult.result.maxScore}</h4>
                                                        <div className="space-y-2">
                                                            {submissionResult.result.details.map((test, idx) => (
                                                                <div key={idx} className={`flex justify-between p-2 rounded ${test.passed ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                                                    <span>Test Case #{idx + 1}</span>
                                                                    <span>{test.passed ? 'Passed' : 'Failed'}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-10">
                                                <p className="text-gray-500">Лабораторийн ажил байхгүй байна.</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                            <FaBookOpen className="text-6xl mx-auto mb-4 opacity-20" />
                            <p>Эхлүүлэхийн тулд хажуугийн цэснээс лекц сонгоно уу.</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CourseDetail;
