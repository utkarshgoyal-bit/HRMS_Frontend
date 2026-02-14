import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Building, Plus, Edit2, Trash2, Save, X, RefreshCw, Navigation } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:9999';

const BranchManager = () => {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        isRoot: false,
        parentBranch: '',
        completeAddress: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        latitude: '',
        longitude: ''
    });

    const [getLocationLoading, setGetLocationLoading] = useState(false);

    const fetchBranches = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/v1/branches`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setBranches(res.data.data);
            }
        } catch (err) {
            console.error('Failed to load branches', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBranches();
    }, []);

    const handleEdit = (branch) => {
        setEditingBranch(branch);
        setFormData({
            name: branch.name,
            isRoot: branch.isRoot,
            parentBranch: branch.parentBranch || '',
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

            // Adjust payload for backend expectations
            // If isRoot is true, parentBranch should be null/undefined logic handled by backend? 
            // Backend Controller says: if (isRoot) parentBranch = null. So sending empty string might be issue if not handled.
            if (payload.isRoot) payload.parentBranch = null;

            if (editingBranch) {
                await axios.put(`${API_URL}/api/v1/branches/${editingBranch._id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`${API_URL}/api/v1/branches`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setIsModalOpen(false);
            setEditingBranch(null);
            fetchBranches();
        } catch (err) {
            alert('Operation failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const getCurrentLocation = () => {
        setGetLocationLoading(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(function (position) {
                setFormData(prev => ({
                    ...prev,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }));
                setGetLocationLoading(false);
            }, function (error) {
                console.error("Error Code = " + error.code + " - " + error.message);
                alert('Unable to get location. Ensure GPS is enabled.');
                setGetLocationLoading(false);
            });
        } else {
            alert("Geolocation not supported");
            setGetLocationLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            isRoot: false,
            parentBranch: '',
            completeAddress: '',
            city: '',
            state: '',
            country: '',
            postalCode: '',
            latitude: '',
            longitude: ''
        });
        setEditingBranch(null);
    };

    return (
        <div className="animate-fade-in-up space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Building size={20} className="text-blue-500" />
                        Branch Management
                    </h3>
                    <p className="text-sm text-slate-500">Manage your organization's locations and offices.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20"
                >
                    <Plus size={18} /> Add Branch
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12 text-slate-400">
                    <RefreshCw className="animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {branches.map(branch => (
                        <div key={branch._id} className="glass rounded-xl p-5 border border-slate-100 hover:border-blue-200 transition-all group">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${branch.isRoot ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                        <Building size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">{branch.name}</h4>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${branch.isRoot ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {branch.isRoot ? 'Head Office' : 'Branch'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEdit(branch)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
                                    <button onClick={() => handleDelete(branch._id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-slate-600">
                                <div className="flex items-start gap-2">
                                    <MapPin size={14} className="mt-1 text-slate-400 shrink-0" />
                                    <p>{branch.address?.complete || 'No address'}, {branch.address?.city}</p>
                                </div>
                                {branch.gpsCoordinates?.latitude && (
                                    <div className="flex items-center gap-2 text-xs text-slate-500 pl-6">
                                        <Navigation size={12} />
                                        <span>{branch.gpsCoordinates.latitude.toFixed(4)}, {branch.gpsCoordinates.longitude.toFixed(4)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
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
                                <input type="checkbox" id="isRoot" checked={formData.isRoot} onChange={e => setFormData({ ...formData, isRoot: e.target.checked })} className="w-4 h-4 text-blue-600" />
                                <label htmlFor="isRoot" className="text-sm font-medium text-slate-800">This is the Head Office (Root Branch)</label>
                            </div>

                            {!formData.isRoot && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Parent Branch</label>
                                    <select value={formData.parentBranch} onChange={e => setFormData({ ...formData, parentBranch: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                                        <option value="">Select Parent...</option>
                                        {branches.filter(b => b._id !== editingBranch?._id).map(b => (
                                            <option key={b._id} value={b._id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                                <textarea required value={formData.completeAddress} onChange={e => setFormData({ ...formData, completeAddress: e.target.value })} rows="2" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Street, Building, etc." />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <input placeholder="City" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                                <input placeholder="State" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                                <input placeholder="Country" value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                                <input placeholder="Zip Code" value={formData.postalCode} onChange={e => setFormData({ ...formData, postalCode: e.target.value })} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-slate-700">GPS Coordinates</label>
                                    <button type="button" onClick={getCurrentLocation} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                        {getLocationLoading ? 'Locating...' : <><Navigation size={12} /> Get Current Location</>}
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="number" placeholder="Latitude" value={formData.latitude} onChange={e => setFormData({ ...formData, latitude: e.target.value })} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                                    <input type="number" placeholder="Longitude" value={formData.longitude} onChange={e => setFormData({ ...formData, longitude: e.target.value })} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1">Used for Geo-fencing attendance validation.</p>
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
