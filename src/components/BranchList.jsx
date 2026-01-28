import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Building2, MapPin, GitBranch, Plus, RefreshCw, Trash2, Search, Filter, MoreVertical } from 'lucide-react';
import AddBranchModal from './AddBranchModal';

const BranchList = () => {
    const [branches, setBranches] = useState([]);
    const [filteredBranches, setFilteredBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUserRole, setCurrentUserRole] = useState(null);

    const fetchBranches = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://127.0.0.1:9999/api/v1/branches', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setBranches(response.data.data);
                setFilteredBranches(response.data.data);
            }

            // Get current user's role
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const empResponse = await axios.get('http://127.0.0.1:9999/api/v1/employees', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const currentUser = empResponse.data.data.find(emp => emp._id === payload.id);
                if (currentUser) {
                    setCurrentUserRole(currentUser.professional?.role);
                }
            } catch (e) {
                console.log('Could not get user role');
            }
        } catch (err) {
            console.error(err);
            if (err.response && err.response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/';
                return;
            }
            setError('Failed to load branches');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBranches();
    }, []);

    // Search Filter
    useEffect(() => {
        const lowerSearch = searchTerm.toLowerCase();
        const filtered = branches.filter(b =>
            b.name.toLowerCase().includes(lowerSearch) ||
            b.address?.city?.toLowerCase().includes(lowerSearch)
        );
        setFilteredBranches(filtered);
    }, [searchTerm, branches]);

    const isAdmin = currentUserRole === 'ORG_ADMIN' || currentUserRole === 'SUPER_ADMIN';

    const handleDelete = async (branchId, branchName) => {
        if (!window.confirm(`Are you sure you want to delete "${branchName}"?`)) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://127.0.0.1:9999/api/v1/branches/${branchId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchBranches();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to delete branch');
        }
    };

    // Organize branches into hierarchy for display if needed, 
    // but for the Data Grid view, a flat list with indicators is often cleaner.
    // OR we can group them. Let's do a smart flat list with parent indicators.
    const getParentName = (parentId) => {
        if (!parentId) return null;
        const parent = branches.find(b => b._id === parentId);
        return parent ? parent.name : 'Unknown';
    };

    if (loading) {
        return (
            <div className="glass rounded-2xl p-8 flex items-center justify-center text-slate-400">
                <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="animate-spin text-emerald-500" size={24} />
                    <p className="text-sm font-medium">Loading branches...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="glass rounded-2xl border border-white/20 shadow-xl overflow-hidden flex flex-col">

                {/* Toolbar */}
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                            <Building2 size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800">Branches</h2>
                            <p className="text-xs text-slate-500">{branches.length} active locations</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search branches..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-64 transition-all"
                            />
                        </div>

                        <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                            <Filter size={18} />
                        </button>

                        <button
                            onClick={fetchBranches}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                            <RefreshCw size={18} />
                        </button>

                        {isAdmin && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5"
                            >
                                <Plus size={16} />
                                <span className="hidden sm:inline">Add Branch</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Grid */}
                {filteredBranches.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                        <Building2 size={48} className="mx-auto mb-3 opacity-30" />
                        <p>No branches found matches your search.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">Branch Name</th>
                                    <th className="px-6 py-4">Location</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredBranches.map((branch) => (
                                    <tr key={branch._id} className="group hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm text-white font-bold
                                                    ${branch.isRoot ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-white border border-slate-200 text-slate-400'}`}>
                                                    {branch.isRoot ? <Building2 size={18} /> : <GitBranch size={18} />}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800">{branch.name}</p>
                                                    {!branch.isRoot && (
                                                        <p className="text-xs text-slate-400 flex items-center gap-1">
                                                            <span className="text-slate-300">↳</span> {getParentName(branch.parentBranch)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center text-sm text-slate-600">
                                                    <MapPin size={14} className="mr-2 text-slate-400" />
                                                    {branch.address?.city || 'N/A'}, {branch.address?.state}
                                                </div>
                                                {branch.gpsCoordinates?.latitude && (
                                                    <span className="text-[10px] text-slate-400 font-mono pl-6">
                                                        {branch.gpsCoordinates.latitude}, {branch.gpsCoordinates.longitude}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {branch.isRoot ? (
                                                <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                                                    Head Office
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                                                    Regional Branch
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${branch.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${branch.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                                {branch.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => handleDelete(branch._id, branch.name)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete Branch"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                                <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                                                    <MoreVertical size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <AddBranchModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchBranches}
                branches={branches}
            />
        </>
    );
};

export default BranchList;
