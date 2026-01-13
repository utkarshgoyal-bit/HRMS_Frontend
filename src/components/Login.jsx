import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, Mail, ChevronRight, AlertCircle } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({
        organizationId: 'demo',
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
            // Backend expects only email and password in the request body
            const response = await axios.post('http://127.0.0.1:9999/api/v1/auth/login', {
                email: formData.email,
                password: formData.password
            });

            if (response.data.success) {
                // Store token and user data
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('slug', formData.organizationId);
                localStorage.setItem('user', JSON.stringify(response.data.data));

                console.log('✅ Login successful, navigating to dashboard...');
                navigate('/dashboard');
            }
        } catch (err) {
            console.error("Login Error:", err);
            setError(err.response?.data?.message || 'Connection refused. Is the server running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">

                {/* Header Section */}
                <div className="bg-blue-600 p-8 text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">Maitrii HR</h1>
                    <p className="text-blue-100 opacity-90">Secure Admin Workspace</p>
                </div>

                {/* Form Section */}
                <div className="p-8 pt-10">
                    <form onSubmit={handleLogin} className="space-y-6">

                        {/* Organization Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Organization ID</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="organizationId"
                                    value={formData.organizationId}
                                    onChange={handleChange}
                                    className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="e.g. demo"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="admin@company.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed group"
                        >
                            {loading ? 'Authenticating...' : 'Sign In'}
                            {!loading && <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-500">
                        Protected by enterprise-grade security. <br />
                        v1.0.0
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
