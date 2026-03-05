import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    MapPin, Building, Plus, Edit2, Trash2, Save, X, RefreshCw,
    Navigation, Key, Check, Copy, AlertCircle, ChevronDown, ChevronRight, Crown, GitBranch
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:9999';

// ============================================================
// Build a tree from a flat array of branches
// ============================================================
const buildTree = (branches) => {
    const map = {};
    const roots = [];

    branches.forEach(b => {
        map[b._id] = { ...b, children: [] };
    });

    branches.forEach(b => {
        const parentId = b.parentBranch?._id || b.parentBranch;
        if (b.isRoot || !parentId || !map[parentId]) {
            roots.push(map[b._id]);
        } else {
            map[parentId].children.push(map[b._id]);
        }
    });

    return roots;
};

// ============================================================
// Build a flat list for nested dropdown (indented)
// ============================================================
const buildFlatList = (nodes, depth = 0, result = []) => {
    nodes.forEach(node => {
        result.push({ ...node, depth });
        if (node.children?.length) {
            buildFlatList(node.children, depth + 1, result);
        }
    });
    return result;
};

// ============================================================
// Recursive BranchNode component
// ============================================================
const BranchNode = ({ node, isLast, onEdit, onDelete, onCredentials, depth = 0 }) => {
    const [expanded, setExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;

    return (
        <div className="relative">
            {/* Connector from parent to this node */}
            {depth > 0 && (
                <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-200" style={{ left: '-1px' }} />
            )}

            <div className="flex items-start gap-0">
                {/* Vertical + horizontal connector line */}
                {depth > 0 && (
                    <div className="flex flex-col items-center mr-3 mt-5 shrink-0" style={{ width: 20 }}>
                        <div className="w-5 h-px bg-slate-200" />
                    </div>
                )}

                <div className="flex-1 min-w-0 mb-3">
                    {/* Node Card */}
                    <div className={`group relative rounded-xl border transition-all ${node.isRoot
                            ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 shadow-md shadow-amber-100'
                            : 'bg-white border-slate-200 hover:border-blue-200 hover:shadow-sm'
                        }`}>
                        <div className="p-4">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-3 min-w-0">
                                    {/* Expand/Collapse toggle */}
                                    {hasChildren ? (
                                        <button
                                            onClick={() => setExpanded(!expanded)}
                                            className="shrink-0 p-1 rounded-md hover:bg-slate-100 transition-colors text-slate-400"
                                        >
                                            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                        </button>
                                    ) : (
                                        <div className="shrink-0 w-6 h-6 flex items-center justify-center">
                                            <GitBranch size={13} className="text-slate-300" />
                                        </div>
                                    )}

                                    {/* Branch Icon */}
                                    <div className={`shrink-0 p-2 rounded-lg ${node.isRoot ? 'bg-amber-100' : 'bg-blue-50'}`}>
                                        {node.isRoot
                                            ? <Crown size={16} className="text-amber-600" />
                                            : <Building size={16} className="text-blue-500" />
                                        }
                                    </div>

                                    {/* Branch Info */}
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="font-bold text-slate-800 text-sm truncate">{node.name}</h4>
                                            <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${node.isRoot
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                {node.isRoot ? '🏢 Head Office' : 'Branch'}
                                            </span>
                                            {hasChildren && (
                                                <span className="shrink-0 text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-bold">
                                                    {node.children.length} sub-{node.children.length === 1 ? 'branch' : 'branches'}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                                            {node.address?.city && (
                                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                                    <MapPin size={10} /> {node.address.city}{node.address.state ? `, ${node.address.state}` : ''}
                                                </span>
                                            )}
                                            {node.username && (
                                                <span className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                                                    <Key size={9} /> {node.username}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions (shown on hover) */}
                                <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => onCredentials(node)}
                                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                        title="Manage Credentials"
                                    >
                                        <Key size={14} />
                                    </button>
                                    <button
                                        onClick={() => onEdit(node)}
                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(node._id)}
                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Children subtree */}
                    {hasChildren && expanded && (
                        <div className="mt-2 pl-8 border-l-2 border-slate-100 ml-4">
                            {node.children.map((child, idx) => (
                                <BranchNode
                                    key={child._id}
                                    node={child}
                                    isLast={idx === node.children.length - 1}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    onCredentials={onCredentials}
                                    depth={depth + 1}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


// ============================================================
// Main BranchManager component
// ============================================================
const BranchManager = () => {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState(null);

    // Credentials State
    const [credentialsModal, setCredentialsModal] = useState({ isOpen: false, branchId: null, branchName: '', username: '', password: '' });
    const [generatingCreds, setGeneratingCreds] = useState(false);
    const [copied, setCopied] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '', isRoot: false, parentBranch: '',
        completeAddress: '', city: '', state: '', country: '', postalCode: '',
        latitude: '', longitude: ''
    });
    const [getLocationLoading, setGetLocationLoading] = useState(false);

    const fetchBranches = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/v1/branches`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) setBranches(res.data.data);
        } catch (err) {
            console.error('Failed to load branches', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBranches(); }, []);

    const handleEdit = (branch) => {
        setEditingBranch(branch);
        setFormData({
            name: branch.name,
            isRoot: branch.isRoot,
            parentBranch: branch.parentBranch?._id || branch.parentBranch || '',
            completeAddress: branch.address?.complete || '',
            city: branch.address?.city || '',
            state: branch.address?.state || '',
            country: branch.address?.country || '',
            postalCode: branch.address?.postalCode || '',
            latitude: branch.gpsCoordinates?.latitude || '',
            longitude: branch.gpsCoordinates?.longitude || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this branch?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/v1/branches/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchBranches();
        } catch (err) {
            alert('Failed to delete branch: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const payload = { ...formData };
            if (payload.isRoot) payload.parentBranch = null;

            let res;
            if (editingBranch) {
                res = await axios.put(`${API_URL}/api/v1/branches/${editingBranch._id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                res = await axios.post(`${API_URL}/api/v1/branches`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setIsModalOpen(false);
            setEditingBranch(null);
            fetchBranches();

            if (!editingBranch && res.data.credentials) {
                setCredentialsModal({
                    isOpen: true,
                    branchId: res.data.data._id,
                    branchName: res.data.data.name,
                    username: res.data.credentials.username,
                    password: res.data.credentials.password
                });
            }
        } catch (err) {
            alert('Operation failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const getCurrentLocation = () => {
        setGetLocationLoading(true);
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setFormData(prev => ({ ...prev, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
                    setGetLocationLoading(false);
                },
                () => { alert('Unable to get location.'); setGetLocationLoading(false); }
            );
        } else {
            alert('Geolocation not supported');
            setGetLocationLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', isRoot: false, parentBranch: '', completeAddress: '', city: '', state: '', country: '', postalCode: '', latitude: '', longitude: '' });
        setEditingBranch(null);
    };

    const handleGenerateCredentials = async (branchId) => {
        if (!window.confirm('Warning: This will immediately invalidate the old password. Continue?')) return;
        setGeneratingCreds(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/api/v1/branches/${branchId}/credentials/generate`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setCredentialsModal(prev => ({ ...prev, username: res.data.data.username, password: res.data.data.password }));
            }
        } catch (err) {
            alert('Failed to generate credentials: ' + (err.response?.data?.message || err.message));
        } finally {
            setGeneratingCreds(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Build tree and flat list for dropdown from fetched branches
    const treeRoots = buildTree(branches);
    const flatListForDropdown = buildFlatList(treeRoots).filter(b => b._id !== editingBranch?._id);

    return (
        <div className="animate-fade-in-up space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Building size={20} className="text-blue-500" />
                        Branch Hierarchy
                    </h3>
                    <p className="text-sm text-slate-500">Visual tree of your organization's offices and branches.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20"
                >
                    <Plus size={18} /> Add Branch
                </button>
            </div>

            {/* Tree View */}
            {loading ? (
                <div className="flex justify-center py-12 text-slate-400">
                    <RefreshCw className="animate-spin" />
                </div>
            ) : branches.length === 0 ? (
                <div className="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                    <Building size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="font-medium text-slate-500">No branches yet</p>
                    <p className="text-sm mt-1">Start by adding the Head Office branch.</p>
                </div>
            ) : treeRoots.length === 0 ? (
                <div className="text-center py-10 text-slate-400 border-2 border-dashed border-amber-200 bg-amber-50 rounded-2xl">
                    <Crown size={36} className="mx-auto mb-3 text-amber-300" />
                    <p className="font-medium text-slate-600">No Head Office defined</p>
                    <p className="text-sm mt-1">Create a branch with "Head Office" checked to start the hierarchy.</p>
                </div>
            ) : (
                <div className="space-y-1 p-2">
                    {treeRoots.map((root) => (
                        <BranchNode
                            key={root._id}
                            node={root}
                            isLast={true}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onCredentials={(b) => setCredentialsModal({ isOpen: true, branchId: b._id, branchName: b.name, username: b.username || 'Not Configured', password: '' })}
                            depth={0}
                        />
                    ))}
                    {/* Orphan branches (no parent, no root flag) */}
                    {branches.filter(b => !b.isRoot && !b.parentBranch && !treeRoots.find(r => r._id === b._id)).length > 0 && (
                        <div className="mt-6 pt-4 border-t border-slate-100">
                            <p className="text-xs text-slate-400 font-medium mb-2 px-2">⚠️ Unlinked Branches (no parent assigned)</p>
                            {branches
                                .filter(b => !b.isRoot && !b.parentBranch)
                                .map((branch) => (
                                    <BranchNode
                                        key={branch._id}
                                        node={{ ...branch, children: [] }}
                                        isLast={true}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onCredentials={(b) => setCredentialsModal({ isOpen: true, branchId: b._id, branchName: b.name, username: b.username || 'Not Configured', password: '' })}
                                        depth={0}
                                    />
                                ))}
                        </div>
                    )}
                </div>
            )}

            {/* Credentials Modal */}
            {credentialsModal.isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Key size={18} className="text-amber-500" /> Branch Login Credentials</h3>
                                <p className="text-xs text-slate-500 font-medium">{credentialsModal.branchName}</p>
                            </div>
                            <button onClick={() => setCredentialsModal({ isOpen: false, branchId: null, branchName: '', username: '', password: '' })} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Username</label>
                                <div className="flex items-center p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                    <code className="text-sm font-bold text-slate-700 font-mono grow">{credentialsModal.username}</code>
                                    <button onClick={() => copyToClipboard(credentialsModal.username)} className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors">
                                        {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>
                            {credentialsModal.password ? (
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                                        <span>Password</span>
                                        <span className="text-[10px] text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full font-bold">Only shown once!</span>
                                    </label>
                                    <div className="flex items-center p-3 bg-amber-50 border border-amber-200 rounded-xl">
                                        <code className="text-sm font-bold text-amber-800 font-mono grow tracking-wide">{credentialsModal.password}</code>
                                        <button onClick={() => copyToClipboard(credentialsModal.password)} className="p-1.5 text-amber-600 hover:text-amber-800">
                                            {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2 flex items-start gap-1">
                                        <AlertCircle size={12} className="shrink-0 mt-0.5 text-amber-500" />
                                        Make sure to copy this password now — it cannot be retrieved later.
                                    </p>
                                </div>
                            ) : (
                                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                                    <p className="text-sm text-slate-500 mb-3">Password is hidden for security.</p>
                                    <button onClick={() => handleGenerateCredentials(credentialsModal.branchId)} disabled={generatingCreds}
                                        className="w-full flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50">
                                        {generatingCreds ? <RefreshCw size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                                        Generate New Password
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button onClick={() => setCredentialsModal({ isOpen: false, branchId: null, branchName: '', username: '', password: '' })} className="px-5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold shadow-sm transition-colors">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add / Edit Branch Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h3 className="text-lg font-bold text-slate-800">{editingBranch ? 'Edit Branch' : 'New Branch'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Branch Name</label>
                                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                                <input type="checkbox" id="isRoot" checked={formData.isRoot} onChange={e => setFormData({ ...formData, isRoot: e.target.checked, parentBranch: '' })} className="w-4 h-4 text-amber-500" />
                                <label htmlFor="isRoot" className="text-sm font-medium text-slate-800 flex items-center gap-2">
                                    <Crown size={14} className="text-amber-500" /> This is the Head Office (Root)
                                </label>
                            </div>

                            {/* Nested Parent Branch Selector */}
                            {!formData.isRoot && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Parent Branch</label>
                                    <select
                                        value={formData.parentBranch}
                                        onChange={e => setFormData({ ...formData, parentBranch: e.target.value })}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    >
                                        <option value="">— Select Parent Branch —</option>
                                        {flatListForDropdown.map(b => (
                                            <option key={b._id} value={b._id}>
                                                {'　'.repeat(b.depth)}{b.depth > 0 ? '↳ ' : ''}{b.isRoot ? '🏢 ' : '🔹 '}{b.name}
                                                {b.address?.city ? ` (${b.address.city})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-[10px] text-slate-400 mt-1">Indentation reflects the hierarchy level.</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                                <textarea required value={formData.completeAddress} onChange={e => setFormData({ ...formData, completeAddress: e.target.value })} rows="2" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Street, Building, etc." />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <input placeholder="City" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                                <input placeholder="State" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                                <input placeholder="Country" value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                                <input placeholder="Zip Code" value={formData.postalCode} onChange={e => setFormData({ ...formData, postalCode: e.target.value })} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-slate-700">GPS Coordinates</label>
                                    <button type="button" onClick={getCurrentLocation} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                        {getLocationLoading ? 'Locating...' : <><Navigation size={12} /> Get Current Location</>}
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="number" placeholder="Latitude" value={formData.latitude} onChange={e => setFormData({ ...formData, latitude: e.target.value })} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                                    <input type="number" placeholder="Longitude" value={formData.longitude} onChange={e => setFormData({ ...formData, longitude: e.target.value })} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1">Used for geo-fencing attendance validation.</p>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-lg shadow-blue-500/20">
                                    {editingBranch ? 'Update Branch' : 'Create Branch'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BranchManager;
