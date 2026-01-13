import React from 'react';
import Sidebar from '../components/Sidebar';
import { Bell, Search, Menu } from 'lucide-react';

const MainLayout = ({ children }) => {
    return (
        <div className="flex h-screen bg-gray-50 text-gray-800 font-sans">
            {/* Sidebar - Fixed Width */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden relative">

                {/* Top Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm flex-shrink-0 z-10">

                    {/* Search Bar */}
                    <div className="flex items-center text-gray-400 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 w-96 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search employees, payrolls..."
                            className="bg-transparent border-none outline-none text-sm ml-2 w-full text-gray-700 placeholder-gray-400"
                        />
                    </div>

                    <div className="flex items-center space-x-5">
                        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="h-8 w-px bg-gray-200"></div>
                        <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded-lg transition-colors">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                                A
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-semibold text-gray-700 leading-tight">Admin User</p>
                                <p className="text-[10px] text-green-600 font-medium">● Online</p>
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
