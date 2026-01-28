import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, Mail, AlertCircle } from 'lucide-react';

const Login = () => {
    // 1. Remove organizationId from state
    const [formData, setFormData] = useState({
        email: 'admin@demo.com',
        password: 'password123'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 2. Send ONLY email and password
            const response = await axios.post('http://127.0.0.1:9999/api/v1/auth/login', {
                email: formData.email,
                password: formData.password
            });

            if (response.data.success) {
                // 3. Save the Organization info returned by the backend
                const { token, data: user } = response.data;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));

                // If the user has an org, save it for the dashboard to use
                if (user.organization) {
                    localStorage.setItem('orgSlug', user.organization.slug);
                }

                console.log('✅ Login successful, user role:', user.role);

                // Redirect based on role
                if (user.role === 'SUPER_ADMIN') {
                    navigate('/super-admin');
                } else {
                    navigate('/dashboard');
                }
            }
        } catch (err) {
            console.error("Login Error:", err);
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            {/* Left Side: Brand & Visuals */}
            <div className="hidden lg:flex w-1/2 bg-[#0F172A] relative overflow-hidden flex-col justify-between p-16 text-white">
                <div className="z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-12 w-12 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30">
                            <span className="text-xl font-bold">M</span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">Maitrii<span className="text-violet-500">Tech</span></h1>
                    </div>
                </div>

                <div className="z-10 relative">
                    <h2 className="text-5xl font-bold leading-tight mb-6">Manage your workforce with <span className="text-violet-400">confidence.</span></h2>
                    <p className="text-slate-400 text-lg max-w-md leading-relaxed">
                        Streamline payroll, attendance, and employee management in one unified platform. Designed for modern enterprises.
                    </p>
                </div>

                <div className="z-10 flex items-center gap-4 text-sm text-slate-500 font-medium">
                    <span>© 2024 Maitrii Infotech</span>
                    <span className="h-4 w-px bg-slate-700"></span>
                    <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-slate-300 transition-colors">Terms</a>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4"></div>
            </div>

            {/* Right Side: Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
                {/* Mobile Background Decoration */}
                <div className="absolute inset-0 bg-white lg:bg-transparent z-0">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-violet-100 rounded-full blur-[80px] opacity-60"></div>
                </div>

                <div className="w-full max-w-md z-10">
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome Back</h2>
                        <p className="text-slate-500">Please enter your details to sign in.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Email Input */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-violet-600 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-100 focus:border-violet-500 outline-none transition-all font-medium text-slate-700"
                                    placeholder="admin@company.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-violet-600 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-100 focus:border-violet-500 outline-none transition-all font-medium text-slate-700"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <div className="flex justify-end mt-2">
                                <a href="#" className="text-xs font-semibold text-violet-600 hover:text-violet-700">Forgot Password?</a>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center p-4 text-sm text-red-600 bg-red-50/80 border border-red-100 rounded-xl animate-shake">
                                <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                                <span className="font-medium">{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 px-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-violet-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Signing In...
                                </span>
                            ) : 'Sign In to Dashboard'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-slate-500">
                        Don't have an account? <span className="text-violet-600 font-semibold cursor-pointer hover:underline">Contact Sales</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
