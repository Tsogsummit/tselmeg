import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaLock, FaUsers, FaArrowRight, FaGraduationCap } from 'react-icons/fa';
import logo from '../assets/tselmeg.jpg';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [className, setClassName] = useState('');
    const [error, setError] = useState('');
    const [needsClass, setNeedsClass] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            // If we already know we need class, send it.
            // If not, try without it first (unless user filled it anyway?)
            // Actually, let's always send className if it has value.

            await login(username, password, className || null);
            navigate('/');
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || 'Login failed';

            if (msg.includes('provide Class') || msg.includes('User not found')) {
                // If user not found, we assume they might be new -> Show Class Input
                if (!needsClass) {
                    setNeedsClass(true);
                    setError('Анх удаа нэвтэрч байна уу? Ангиа оруулна уу (Ж: 10a).');
                } else {
                    setError(msg); // Already showed class input, but maybe class was wrong
                }
            } else {
                setError('Нэвтрэхэд алдаа гарлаа');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/30 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/20 rounded-full blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md p-8 relative z-10"
            >
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 overflow-hidden">
                            <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                        </div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Тавтай морилно уу</h2>
                        <p className="text-gray-400 mt-2 text-sm">Сургалтын Нэгдсэн Платформ</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <AnimatePresence mode='wait'>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm text-center"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-4">
                            <div className="relative">
                                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="Нэвтрэх нэр / Сурагчийн код"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>

                            <div className="relative">
                                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="Нууц үг"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <AnimatePresence>
                                {needsClass && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="relative pt-1">
                                            <FaUsers className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 mt-0.5" />
                                            <input
                                                type="text"
                                                required={needsClass}
                                                className="w-full bg-white/5 border border-indigo-500/50 rounded-xl px-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                placeholder="Class Group (e.g. 10a)"
                                                value={className}
                                                onChange={(e) => setClassName(e.target.value)}
                                                autoFocus
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
                        >
                            {isLoading ? 'Уншиж байна...' : (
                                <>
                                    {needsClass ? 'Бүртгүүлэх & Нэвтрэх' : 'Нэвтрэх'} <FaArrowRight />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-xs text-gray-500">
                        <p>Багш, админ эрхээр нэвтрэх бол шууд нэвтэрнэ үү.</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
