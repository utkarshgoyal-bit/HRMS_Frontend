import React from 'react';
import Sidebar from '../components/Sidebar';
import { Bell, Search, Menu } from 'lucide-react';

const MainLayout = ({ children }) => {
    return (
        <div className="flex h-screen bg-gray-50 text-gray-800 font-sans">
            {/* Sidebar - Fixed Width */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 ml-72 flex flex-col h-screen overflow-hidden relative bg-slate-50/50">

                {/* Top Header */}
                <header className="h-20 flex items-center justify-between px-8 py-4 z-10 sticky top-0">
                    <div className="glass w-full h-full rounded-2xl flex items-center justify-between px-6">
                        {/* Search Bar */}
                        <div className="flex items-center text-slate-400 bg-slate-50/50 px-4 py-2.5 rounded-xl border border-slate-200/60 w-96 focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-100 transition-all">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search employees, payrolls..."
                                className="bg-transparent border-none outline-none text-sm ml-3 w-full text-slate-700 placeholder-slate-400 font-medium"
                            />
                        </div>

                        <div className="flex items-center space-x-6">
                            <button className="p-2.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-full relative transition-colors">
                                <Bell size={20} />
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                            </button>

                            <div className="h-8 w-px bg-slate-200"></div>

                            <div className="flex items-center space-x-3 cursor-pointer hover:bg-slate-50/80 p-1.5 pr-3 rounded-full border border-transparent hover:border-slate-200 transition-all">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-violet-200">
                                    A
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-bold text-slate-700 leading-none">Admin User</p>
                                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mt-0.5">● Online</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dynamic Page Content */}
                <main className="flex-1 overflow-y-auto p-8 scroll-smooth">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
