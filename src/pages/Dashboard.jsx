import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { Users, Building2, Activity, Database } from 'lucide-react';
import useDashboardStats from '../hooks/useDashboardStats'; // <--- The Connector

const StatCard = ({ title, value, color, icon, subtext }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between">
        <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
            {subtext && <p className="text-xs text-slate-400 mt-2">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color} text-white shadow-sm`}>
            {icon}
        </div>
    </div>
);

const Dashboard = () => {
    // Use the real data!
    const { employeeCount, orgCount, dbStatus, loading } = useDashboardStats();
    const isConnected = dbStatus === 'Connected';

    return (
        <MainLayout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800">Overview</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Real Employee Count */}
                <StatCard
                    title="Total Employees"
                    value={loading ? "..." : employeeCount}
                    color="bg-blue-600"
                    icon={<Users size={22} />}
                    subtext="Active in Database"
                />

                {/* Real Org Count */}
                <StatCard
                    title="Organizations"
                    value={loading ? "..." : orgCount}
                    color="bg-indigo-600"
                    icon={<Building2 size={22} />}
                    subtext="Registered Tenants"
                />

                {/* Real DB Status */}
                <StatCard
                    title="System Health"
                    value={loading ? "..." : (isConnected ? "100%" : "Offline")}
                    color={isConnected ? "bg-emerald-500" : "bg-red-500"}
                    icon={<Activity size={22} />}
                    subtext="Operational"
                />
            </div>
        </MainLayout>
    );
};

export default Dashboard;
