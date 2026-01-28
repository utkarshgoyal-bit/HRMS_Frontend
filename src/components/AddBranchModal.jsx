import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Building2, Save, AlertCircle, MapPin, Navigation } from 'lucide-react';

const AddBranchModal = ({ isOpen, onClose, onSuccess, branches = [] }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fetchingLocation, setFetchingLocation] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        isRoot: true,
        parentBranch: '',
        completeAddress: '',
        country: '',
        state: '',
        city: '',
        postalCode: '',
        latitude: '',
        longitude: ''
    });

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: '',
                isRoot: true,
                parentBranch: '',
                completeAddress: '',
                country: '',
                state: '',
                city: '',
                postalCode: '',
                latitude: '',
                longitude: ''
            });
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        if (type === 'radio') {
            setFormData({
                ...formData,
                isRoot: value === 'true',
                parentBranch: value === 'true' ? '' : formData.parentBranch
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const fetchGPSLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        setFetchingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData({
                    ...formData,
                    latitude: position.coords.latitude.toFixed(6),
                    longitude: position.coords.longitude.toFixed(6)
                });
                setFetchingLocation(false);
            },
            (error) => {
                console.error('GPS Error:', error);
                setError('Failed to get location. Please allow location access or enter manually.');
                setFetchingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://127.0.0.1:9999/api/v1/branches',
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                onSuccess();
                onClose();
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to create branch');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white";
    const labelClass = "block text-xs font-medium text-slate-600 mb-1";

    // Filter parent branches (only show existing branches that can be parents)
    const parentOptions = branches.filter(b => b.status === 'Active');

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-emerald-600 to-teal-600 sticky top-0">
                    <div className="flex items-center space-x-2 text-white">
                        <Building2 size={22} />
                        <h3 className="font-bold text-lg">Register New Branch</h3>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {/* Branch Name */}
                    <div>
                        <label className={labelClass}>Branch Name *</label>
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className={inputClass}
                            placeholder="Enter branch name"
                        />
                    </div>

                    {/* Root Branch Radio */}
                    <div>
                        <label className={labelClass}>Is this a root branch?</label>
                        <div className="flex gap-4 mt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="isRoot"
                                    value="true"
                                    checked={formData.isRoot === true}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-emerald-600"
                                />
                                <span className="text-sm text-slate-700">Yes</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="isRoot"
                                    value="false"
                                    checked={formData.isRoot === false}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-emerald-600"
                                />
                                <span className="text-sm text-slate-700">No</span>
                            </label>
                        </div>
                    </div>

                    {/* Parent Branch (only shown if not root) */}
                    {!formData.isRoot && (
                        <div>
                            <label className={labelClass}>Parent Branch *</label>
                            <select
                                name="parentBranch"
                                value={formData.parentBranch}
                                onChange={handleChange}
                                required={!formData.isRoot}
                                className={inputClass}
                            >
                                <option value="">Select parent branch</option>
                                {parentOptions.map(branch => (
                                    <option key={branch._id} value={branch._id}>
                                        {branch.name} {branch.isRoot ? '(Root)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Complete Address */}
                    <div>
                        <label className={labelClass}>Complete Address</label>
                        <textarea
                            name="completeAddress"
                            value={formData.completeAddress}
                            onChange={handleChange}
                            className={`${inputClass} resize-none`}
                            rows={2}
                            placeholder="Enter complete address"
                        />
                    </div>

                    {/* Country & State */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Country *</label>
                            <input
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                required
                                className={inputClass}
                                placeholder="Select country"
                            />
                        </div>
                        <div>
                            <label className={labelClass}>State/Province *</label>
                            <input
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                required
                                className={inputClass}
                                placeholder="Select state"
                            />
                        </div>
                    </div>

                    {/* City & Postal Code */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>City</label>
                            <input
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="Select city"
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Postal Code</label>
                            <input
                                name="postalCode"
                                value={formData.postalCode}
                                onChange={handleChange}
                                className={inputClass}
                                placeholder="Enter postal code"
                            />
                        </div>
                    </div>

                    {/* GPS Coordinates */}
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <MapPin size={16} className="text-emerald-600" />
                                GPS Coordinates
                            </label>
                            <button
                                type="button"
                                onClick={fetchGPSLocation}
                                disabled={fetchingLocation}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <Navigation size={14} className={fetchingLocation ? 'animate-pulse' : ''} />
                                {fetchingLocation ? 'Fetching...' : 'Get Location'}
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Latitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    name="latitude"
                                    value={formData.latitude}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="e.g. 28.6139"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Longitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    name="longitude"
                                    value={formData.longitude}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="e.g. 77.2090"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                            <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span>Creating...</span>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Register Branch
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddBranchModal;
