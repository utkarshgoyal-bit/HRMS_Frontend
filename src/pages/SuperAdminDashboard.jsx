import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Building2, Users, Activity, Plus, RefreshCw, Settings, Power } from 'lucide-react';
import CreateOrganizationModal from '../components/CreateOrganizationModal';

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

const SuperAdminDashboard = () => {
    const [stats, setStats] = useState({
        totalOrganizations: 0,
        activeOrganizations: 0,
        suspendedOrganizations: 0,
        totalEmployees: 0
    });
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [statsRes, orgsRes] = await Promise.all([
                axios.get('http://127.0.0.1:9999/api/v1/super-admin/stats', { headers }),
                axios.get('http://127.0.0.1:9999/api/v1/super-admin/organizations', { headers })
            ]);

            if (statsRes.data.success) setStats(statsRes.data.data);
            if (orgsRes.data.success) setOrganizations(orgsRes.data.data);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSuspend = async (orgId) => {
        if (!window.confirm('Are you sure you want to suspend this organization?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://127.0.0.1:9999/api/v1/super-admin/organizations/${orgId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to suspend organization');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            'Active': 'bg-green-100 text-green-700',
            'Inactive': 'bg-slate-100 text-slate-600',
            'Pending': 'bg-yellow-100 text-yellow-700',
            'Suspended': 'bg-red-100 text-red-700'
        };
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || styles['Inactive']}`}>
                {status}
            </span>
        );
    };

    const getModuleBadges = (modules) => {
        if (!modules) return null;
        const active = Object.entries(modules).filter(([_, v]) => v).map(([k]) => k);
        return (
            <div className="flex flex-wrap gap-1">
                {active.slice(0, 3).map(mod => (
                    <span key={mod} className="px-1.5 py-0.5 text-[10px] bg-blue-50 text-blue-600 rounded">
                        {mod}
                    </span>
                ))}
                {active.length > 3 && (
                    <span className="px-1.5 py-0.5 text-[10px] bg-slate-100 text-slate-500 rounded">
                        +{active.length - 3}
                    </span>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-violet-600 to-purple-600 text-white p-6">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
                        <p className="text-violet-200 text-sm mt-1">Manage all organizations</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-violet-600 font-medium rounded-lg hover:bg-violet-50 transition-colors"
                    >
                        <Plus size={18} />
                        Create Organization
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Organizations"
                        value={loading ? '...' : stats.totalOrganizations}
                        color="bg-violet-600"
                        icon={<Building2 size={22} />}
                        subtext="Registered"
                    />
                    <StatCard
                        title="Active Organizations"
                        value={loading ? '...' : stats.activeOrganizations}
                        color="bg-emerald-500"
                        icon={<Activity size={22} />}
                        subtext="Currently active"
                    />
                    <StatCard
                        title="Suspended"
                        value={loading ? '...' : stats.suspendedOrganizations}
                        color="bg-red-500"
                        icon={<Power size={22} />}
                        subtext="Inactive orgs"
                    />
                    <StatCard
                        title="Total Employees"
                        value={loading ? '...' : stats.totalEmployees}
                        color="bg-blue-600"
                        icon={<Users size={22} />}
                        subtext="Across all orgs"
                    />
                </div>

                {/* Organizations List */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Building2 className="text-violet-600" size={20} />
                            <h2 className="font-semibold text-slate-800">Organizations</h2>
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                                {organizations.length}
                            </span>
                        </div>
                        <button onClick={fetchData} className="text-slate-400 hover:text-slate-600">
                            <RefreshCw size={18} />
                        </button>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-slate-400">
                            <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
                            Loading organizations...
                        </div>
                    ) : organizations.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                            <Building2 size={48} className="mx-auto mb-3 opacity-50" />
                            <p>No organizations yet. Create your first one!</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Organization</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Admin</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Modules</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {organizations.map(org => (
                                        <tr key={org._id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                                        {org.organizationName?.[0] || 'O'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-800">{org.organizationName}</p>
                                                        <p className="text-xs text-slate-400">{org.slug}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-slate-700">
                                                    {org.orgAdmin?.personal?.firstName} {org.orgAdmin?.personal?.lastName}
                                                </p>
                                                <p className="text-xs text-slate-400">{org.orgAdmin?.contact?.email}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getModuleBadges(org.modules)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(org.status)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {org.status !== 'Suspended' && (
                                                        <button
                                                            onClick={() => handleSuspend(org._id)}
                                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Suspend organization"
                                                        >
                                                            <Power size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* Create Organization Modal */}
            <CreateOrganizationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchData}
            />
        </div>
    );
};

export default SuperAdminDashboard;
