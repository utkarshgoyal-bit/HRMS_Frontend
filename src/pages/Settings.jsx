import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { User, Lock, Bell, Moon, Save, Shield, Mail, Key } from 'lucide-react';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('account');
    const [loading, setLoading] = useState(false);

    // Mock User Data
    const [user, setUser] = useState({
        user: JSON.parse(localStorage.getItem('user')) || { name: 'Admin', email: 'admin@demo.com' }
    });

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => setLoading(false), 1000);
    };

    return (
        <MainLayout>
            <div className="mb-0">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Settings</h1>
                <p className="text-slate-500 mt-1 mb-8">Manage your account preferences and security.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">

                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="glass rounded-xl overflow-hidden p-2">
                        {[
                            { id: 'account', label: 'Account', icon: User },
                            { id: 'security', label: 'Security', icon: Lock },
                            { id: 'notifications', label: 'Notifications', icon: Bell },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                        ? 'bg-violet-50 text-violet-700 shadow-sm'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                    }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 w-full">

                    {/* Account Settings */}
                    {activeTab === 'account' && (
                        <div className="glass rounded-2xl p-8 animate-fade-in-up">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <User size={20} className="text-violet-500" />
                                Profile Information
                            </h3>

                            <div className="flex items-center gap-6 mb-8">
                                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg ring-4 ring-white">
                                    {user.user.firstName?.[0] || 'A'}
                                </div>
                                <div>
                                    <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors">
                                        Change Avatar
                                    </button>
                                    <p className="text-xs text-slate-400 mt-2">JPG, GIF or PNG. Max size of 800K</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                                    <input
                                        defaultValue={user.user.firstName}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none text-sm transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                                    <input
                                        defaultValue={user.user.lastName}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none text-sm transition-all"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            defaultValue={user.user.email}
                                            disabled
                                            className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 text-sm cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg shadow-lg shadow-violet-500/20 transition-all active:scale-95"
                                >
                                    {loading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Security Settings */}
                    {activeTab === 'security' && (
                        <div className="glass rounded-2xl p-8 animate-fade-in-up">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Shield size={20} className="text-emerald-500" />
                                Security Settings
                            </h3>

                            <div className="max-w-md space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
                                    <div className="relative">
                                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input type="password" placeholder="••••••••" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input type="password" placeholder="Enter new password" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                                    </div>
                                </div>
                                <button className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm transition-colors shadow-lg shadow-emerald-500/20">
                                    Update Password
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Notifications */}
                    {activeTab === 'notifications' && (
                        <div className="glass rounded-2xl p-8 animate-fade-in-up">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Bell size={20} className="text-amber-500" />
                                Notification Preferences
                            </h3>

                            <div className="space-y-6">
                                {[
                                    { title: 'Email Notifications', desc: 'Receive emails about your account activity.' },
                                    { title: 'Payroll Alerts', desc: 'Get notified when payroll is generated.' },
                                    { title: 'New Employee Alerts', desc: 'Get notified when a new employee joins.' }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between pb-4 border-b border-slate-100 last:border-0">
                                        <div>
                                            <p className="font-medium text-slate-800">{item.title}</p>
                                            <p className="text-sm text-slate-500">{item.desc}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </MainLayout>
    );
};

export default Settings;
