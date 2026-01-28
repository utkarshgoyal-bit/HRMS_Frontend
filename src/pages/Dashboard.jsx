import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { Users, Building2, Activity, Database } from 'lucide-react';
import useDashboardStats from '../hooks/useDashboardStats';
import AddEmployeeModal from '../components/AddEmployeeModal';
import EmployeeList from '../components/EmployeeList';
import BranchList from '../components/BranchList';

const StatCard = ({ title, value, color, icon, subtext }) => (
    <div className="glass p-6 rounded-2xl flex items-start justify-between card-hover relative overflow-hidden group">
        <div className="z-10 relative">
            <p className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wide">{title}</p>
            <h3 className="text-4xl font-bold text-slate-800 tracking-tight">{value}</h3>
            {subtext && <p className="text-xs text-slate-400 mt-2 font-medium bg-slate-100/50 inline-block px-2 py-1 rounded-md">{subtext}</p>}
        </div>
        <div className={`p-4 rounded-2xl ${color} text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform`}>
            {icon}
        </div>

        {/* Decorative Circle */}
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br from-slate-50 to-slate-100 rounded-full opacity-50 z-0"></div>
    </div>
);

const Dashboard = () => {
    const { employeeCount, orgCount, dbStatus, loading } = useDashboardStats();
    const isConnected = dbStatus === 'Connected';
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleEmployeeAdded = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <MainLayout>
            <div className="mb-10 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Overview</h1>
                    <p className="text-slate-500 mt-1">Welcome back, Admin! Here's what's happening today.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-violet-500/30 flex items-center gap-2 hover:-translate-y-0.5"
                >
                    <Users size={18} />
                    Add Employee
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                <StatCard
                    title="Total Employees"
                    value={loading ? "..." : employeeCount}
                    color="bg-gradient-to-br from-violet-500 to-indigo-600"
                    icon={<Users size={24} />}
                    subtext="Active in Database"
                />
                <StatCard
                    title="Organizations"
                    value={loading ? "..." : orgCount}
                    color="bg-gradient-to-br from-blue-500 to-cyan-600"
                    icon={<Building2 size={24} />}
                    subtext="Registered Tenants"
                />
                <StatCard
                    title="System Health"
                    value={loading ? "..." : (isConnected ? "100%" : "Offline")}
                    color={isConnected ? "bg-gradient-to-br from-emerald-400 to-teal-500" : "bg-gradient-to-br from-red-500 to-pink-600"}
                    icon={<Activity size={24} />}
                    subtext={isConnected ? "All Systems Operational" : "Database Error"}
                />
            </div>

            {/* Branch List */}
            <div className="mb-8">
                <BranchList key={`branch-${refreshKey}`} />
            </div>

            {/* Employee List with Role Assignment */}
            <EmployeeList key={`emp-${refreshKey}`} />

            {/* Add Employee Modal */}
            <AddEmployeeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleEmployeeAdded}
            />
        </MainLayout>
    );
};

export default Dashboard;
