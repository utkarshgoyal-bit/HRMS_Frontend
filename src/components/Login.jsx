import React, { useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [slug, setSlug] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            console.log("🔵 Attempting login...", { email, slug });
            const res = await API.post('/auth/login', { email, password });

            console.log("🟢 Login Response:", res.data);

            if (res.data.success) {
                console.log("✅ Login Successful! Saving token...");
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('slug', slug);
                localStorage.setItem('user', JSON.stringify(res.data.data));

                console.log("🚀 Navigating to /dashboard...");
                navigate('/dashboard');
            } else {
                console.warn("⚠️ Login succeeded but success flag is false:", res.data);
                throw new Error(res.data.message || 'Login failed unexpectedly');
            }
        } catch (err) {
            console.error("🔴 Login Error:", err);
            const errMsg = err.response?.data?.message || err.message || 'Login Failed';
            setError(errMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-8 pb-6">
                    <div className="text-center mb-8">
                        <div className="mx-auto w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-3 text-white font-bold text-xl shadow-lg shadow-blue-500/30">
                            HR
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
                        <p className="text-gray-500 text-sm mt-1">Sign in to your administrative account</p>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Organization ID</label>
                            <input
                                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                placeholder="e.g., cyber"
                                value={slug}
                                onChange={e => setSlug(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                            <input
                                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                placeholder="admin@company.com"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                            <input
                                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            disabled={isLoading}
                            className={`w-full bg-blue-600 text-white p-3 rounded-lg font-medium shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-blue-600/40 transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>
                </div>
                <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                        Protected by enterprise-grade security
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
