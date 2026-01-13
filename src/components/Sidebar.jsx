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
        <div className="h-screen w-64 bg-slate-900 text-white fixed left-0 top-0 flex flex-col shadow-xl z-20">
            {/* Logo Area */}
            <div className="p-6 border-b border-slate-700 bg-slate-900">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/50">HR</div>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-tight">HRMS<span className="text-blue-400">Portal</span></h1>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Admin Workspace</p>
                    </div>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <div
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 group ${isActive
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20 translate-x-1'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white hover:translate-x-1'
                                }`}
                        >
                            <div className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'} transition-colors`}>
                                {item.icon}
                            </div>
                            <span className="font-medium text-sm">{item.name}</span>
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-sm"></div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* User Profile Snippet & Logout */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                        AD
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium text-white truncate">Administrator</p>
                        <p className="text-xs text-slate-500 truncate">admin@company.com</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center justify-center space-x-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full p-2.5 rounded-lg transition-colors text-sm font-medium border border-transparent hover:border-red-500/20"
                >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
