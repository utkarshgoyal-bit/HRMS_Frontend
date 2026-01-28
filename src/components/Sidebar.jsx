import React from 'react';
import {
    LayoutDashboard,
    Users,
    Banknote,
    CalendarCheck,
    Settings,
    LogOut
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
        { name: 'Employees', icon: <Users size={20} />, path: '/employees' },
        { name: 'Payroll', icon: <Banknote size={20} />, path: '/payroll' },
        { name: 'Attendance', icon: <CalendarCheck size={20} />, path: '/attendance' },
        { name: 'Settings', icon: <Settings size={20} />, path: '/settings' },
    ];

    const handleLogout = () => {
        localStorage.clear();
        // Force a full reload to clear any state if needed, or simple navigation
        window.location.href = '/';
    };

    return (
        <div className="h-screen w-72 bg-[#0F172A] text-slate-300 fixed left-0 top-0 flex flex-col shadow-2xl z-30 font-sans border-r border-slate-800">
            {/* Logo Area */}
            <div className="p-8 pb-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-violet-500/30">
                        <span className="text-lg">M</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white tracking-tight leading-none">Maitrii<span className="text-violet-500">Tech</span></h1>
                        <p className="text-[11px] text-slate-500 font-medium tracking-wide mt-1">HR MANAGEMENT</p>
                    </div>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto py-4">
                <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Main Menu</p>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <div
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 group ${isActive
                                ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/40 relative overflow-hidden'
                                : 'hover:bg-slate-800/50 hover:text-white'
                                }`}
                        >
                            {isActive && (
                                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
                            )}
                            <div className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'} transition-colors`}>
                                {item.icon}
                            </div>
                            <span className="font-medium text-[15px]">{item.name}</span>
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* User Profile Snippet & Logout */}
            <div className="p-4 m-4 bg-slate-800/40 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-xs font-bold text-white shadow-inner border list-item-none border-slate-500">
                        AD
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-semibold text-white truncate">Administrator</p>
                        <p className="text-[11px] text-slate-400 truncate">admin@maitrii.com</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center justify-center space-x-2 text-slate-400 hover:text-white hover:bg-slate-700 w-full py-2.5 rounded-xl transition-all text-xs font-semibold uppercase tracking-wide border border-transparent hover:border-slate-600"
                >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
