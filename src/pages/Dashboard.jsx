import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { Users, DollarSign, Briefcase, Activity, ArrowUpRight, ArrowDownRight, MoreHorizontal } from 'lucide-react';
import API from '../api';

const StatCard = ({ title, value, trend, trendUp, color, icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 flex items-start justify-between hover:shadow-lg transition-shadow duration-300 cursor-default">
        <div>
            <div className="flex items-center space-x-2 mb-1">
                <div className={`p-2 rounded-lg ${color} bg-opacity-10 text-opacity-100`}>
                    {React.cloneElement(icon, { size: 18, className: color.replace('bg-', 'text-') })}
                </div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mt-2">{value}</h3>
            <div className="flex items-center mt-2 space-x-1">
                {trendUp ? <ArrowUpRight size={14} className="text-green-500" /> : <ArrowDownRight size={14} className="text-red-500" />}
                <span className={`text-xs font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>{trend}</span>
                <span className="text-xs text-gray-400">vs last month</span>
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    // Note: Data is hardcoded for now as per V2 requirements, but structure allows easy wiring.

    const checkHealth = async () => {
        try {
            const res = await API.get('/health');
            if (res.data.data.issues.length > 0) alert("System Issues:\n" + res.data.data.issues.join("\n"));
            else alert("System is 100% Healthy! 🟢");
        } catch (err) {
            alert("CRITICAL: Cannot connect to Backend Agent. Is it running?");
        }
    };

    return (
        <MainLayout>
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Dashboard Overview</h1>
                    <p className="text-gray-500 mt-1">Welcome back, Admin. Here's what's happening today.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={checkHealth} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
                        🩺 <span className="hidden sm:inline">System Health</span>
                    </button>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20">
                        + Add Employee
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Employees"
                    value="24"
                    trend="12%"
                    trendUp={true}
                    color="bg-blue-500"
                    icon={<Users />}
                />
                <StatCard
                    title="Total Payroll"
                    value="$128k"
                    trend="0.8%"
                    trendUp={true}
                    color="bg-green-500"
                    icon={<DollarSign />}
                />
                <StatCard
                    title="Active Projects"
                    value="12"
                    trend="4%"
                    trendUp={false}
                    color="bg-purple-500"
                    icon={<Briefcase />}
                />
                <StatCard
                    title="Attendance Rate"
                    value="96%"
                    trend="2%"
                    trendUp={true}
                    color="bg-orange-500"
                    icon={<Activity />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity Section */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-800">Recent Activity</h2>
                        <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={20} /></button>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-xl">🔔</div>
                            <div>
                                <p className="text-sm text-gray-800"><span className="font-semibold">Sarah Smith</span> applied for Leave (Sick Leave)</p>
                                <p className="text-xs text-gray-400 mt-1">2 mins ago</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 text-xl">✅</div>
                            <div>
                                <p className="text-sm text-gray-800"><span className="font-semibold">Admin</span> updated Payroll Settings for April</p>
                                <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 text-xl">👤</div>
                            <div>
                                <p className="text-sm text-gray-800"><span className="font-semibold">John Doe</span> updated their profile information</p>
                                <p className="text-xs text-gray-400 mt-1">3 hours ago</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 p-3 text-center border-t border-gray-100">
                        <button className="text-sm text-blue-600 font-medium hover:underline">View All Activity</button>
                    </div>
                </div>

                {/* Quick Actions / Mini Calendar Placeholder */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
                    <div className="space-y-3">
                        <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all flex items-center justify-between group">
                            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Approve Leaves</span>
                            <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">3</span>
                        </button>
                        <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all flex items-center justify-between group">
                            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Review Expenses</span>
                            <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full">12</span>
                        </button>
                        <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all flex items-center justify-between group">
                            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">Pending Onboarding</span>
                            <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">1</span>
                        </button>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Dashboard;
