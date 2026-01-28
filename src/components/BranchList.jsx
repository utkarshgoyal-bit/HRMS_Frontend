import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Building2, MapPin, GitBranch, Plus, RefreshCw, Trash2, Edit } from 'lucide-react';
import AddBranchModal from './AddBranchModal';

const BranchList = () => {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
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

    const handleBranchAdded = () => {
        fetchBranches();
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
                <div className="flex items-center justify-center text-slate-400">
                    <RefreshCw className="animate-spin mr-2" size={20} />
                    Loading branches...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-red-100 p-8 text-center text-red-500">
                {error}
            </div>
        );
    }

    // Organize branches into hierarchy
    const rootBranches = branches.filter(b => b.isRoot);
    const childBranches = branches.filter(b => !b.isRoot);

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Building2 className="text-emerald-600" size={20} />
                        <h2 className="font-semibold text-slate-800">Branches</h2>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                            {branches.length}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={fetchBranches}
                            className="text-slate-400 hover:text-slate-600 transition-colors p-2"
                        >
                            <RefreshCw size={18} />
                        </button>
                        {isAdmin && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                <Plus size={16} />
                                Add Branch
                            </button>
                        )}
                    </div>
                </div>

                {/* Branch List */}
                {branches.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                        <Building2 size={48} className="mx-auto mb-3 opacity-50" />
                        <p>No branches found. Add your first branch!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {/* Root Branches */}
                        {rootBranches.map(branch => (
                            <div key={branch._id}>
                                <BranchRow
                                    branch={branch}
                                    isRoot={true}
                                    isAdmin={isAdmin}
                                    onDelete={handleDelete}
                                />
                                {/* Child branches under this root */}
                                {childBranches
                                    .filter(child => child.parentBranch?._id === branch._id || child.parentBranch === branch._id)
                                    .map(child => (
                                        <BranchRow
                                            key={child._id}
                                            branch={child}
                                            isRoot={false}
                                            isAdmin={isAdmin}
                                            onDelete={handleDelete}
                                        />
                                    ))
                                }
                            </div>
                        ))}

                        {/* Orphan branches (if any parent was deleted) */}
                        {childBranches
                            .filter(child => !rootBranches.some(root =>
                                root._id === child.parentBranch?._id || root._id === child.parentBranch
                            ))
                            .map(branch => (
                                <BranchRow
                                    key={branch._id}
                                    branch={branch}
                                    isRoot={false}
                                    isAdmin={isAdmin}
                                    onDelete={handleDelete}
                                />
                            ))
                        }
                    </div>
                )}
            </div>

            {/* Add Branch Modal */}
            <AddBranchModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleBranchAdded}
                branches={branches}
            />
        </>
    );
};

const BranchRow = ({ branch, isRoot, isAdmin, onDelete }) => {
    return (
        <div className={`px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors ${!isRoot ? 'pl-12 bg-slate-25' : ''}`}>
            <div className="flex items-center gap-4">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isRoot
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
                    : 'bg-slate-100 text-slate-500'
                    }`}>
                    {isRoot ? <Building2 size={20} /> : <GitBranch size={18} />}
                </div>

                {/* Info */}
                <div>
                    <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-800">{branch.name}</p>
                        {isRoot && (
                            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-700 rounded">
                                ROOT
                            </span>
                        )}
                        <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${branch.status === 'Active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-500'
                            }`}>
                            {branch.status}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500 mt-0.5">
                        {branch.address?.city && (
                            <span className="flex items-center gap-1">
                                <MapPin size={12} />
                                {branch.address.city}, {branch.address.state}
                            </span>
                        )}
                        {branch.gpsCoordinates?.latitude && (
                            <span className="text-xs text-slate-400">
                                📍 {branch.gpsCoordinates.latitude}, {branch.gpsCoordinates.longitude}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            {isAdmin && (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onDelete(branch._id, branch.name)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete branch"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default BranchList;
