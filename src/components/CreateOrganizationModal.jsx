import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Building2, User, Save, AlertCircle, Check } from 'lucide-react';

const CreateOrganizationModal = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(null);
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        // Organization Details
        organizationName: '',
        orgType: 'IT Services',
        status: 'Active',
        email: '',
        address: '',
        mobileNumber: '',

        // Modules
        modules: {
            payroll: true,
            attendance: true,
            leaves: true,
            recruitment: false,
            performance: false,
            commonManager: false
        },

        // Admin Details
        adminFirstName: '',
        adminLastName: '',
        adminEmail: '',
        adminMobile: '',
        adminAddress: '',
        adminCountry: 'India',
        adminState: '',
        adminPassword: 'Welcome@123'
    });

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setError('');
            setSuccess(null);
            setFormData({
                organizationName: '',
                orgType: 'IT Services',
                status: 'Active',
                email: '',
                address: '',
                mobileNumber: '',
                modules: {
                    payroll: true,
                    attendance: true,
                    leaves: true,
                    recruitment: false,
                    performance: false,
                    commonManager: false
                },
                adminFirstName: '',
                adminLastName: '',
                adminEmail: '',
                adminMobile: '',
                adminAddress: '',
                adminCountry: 'India',
                adminState: '',
                adminPassword: 'Welcome@123'
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith('module_')) {
            const moduleName = name.replace('module_', '');
            setFormData({
                ...formData,
                modules: { ...formData.modules, [moduleName]: checked }
            });
        } else {
            setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://127.0.0.1:9999/api/v1/super-admin/organizations',
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                setSuccess(response.data.data);
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to create organization');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none text-sm bg-white";
    const labelClass = "block text-xs font-medium text-slate-600 mb-1";

    // Success screen
    if (success) {
        return (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check size={32} className="text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Organization Created!</h3>
                        <p className="text-slate-500 mb-6">
                            <strong>{success.organization.name}</strong> has been set up successfully.
                        </p>

                        <div className="bg-slate-50 rounded-lg p-4 text-left mb-6">
                            <p className="text-xs text-slate-500 mb-2">Org Admin Credentials:</p>
                            <div className="space-y-1">
                                <p className="text-sm"><span className="text-slate-500">Email:</span> <strong>{success.orgAdmin.email}</strong></p>
                                <p className="text-sm"><span className="text-slate-500">Password:</span> <strong>{success.orgAdmin.tempPassword}</strong></p>
                            </div>
                        </div>

                        <button
                            onClick={() => { onSuccess(); onClose(); }}
                            className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-violet-600 to-purple-600 sticky top-0 z-10">
                    <div className="flex items-center space-x-2 text-white">
                        <Building2 size={22} />
                        <h3 className="font-bold text-lg">Create New Organization</h3>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                {/* Step Indicators */}
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        {[
                            { num: 1, label: 'Organization Details' },
                            { num: 2, label: 'Modules & Permissions' },
                            { num: 3, label: 'Admin Details' }
                        ].map((s, i) => (
                            <button
                                key={s.num}
                                onClick={() => setStep(s.num)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${step === s.num
                                        ? 'bg-violet-100 text-violet-700'
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === s.num ? 'bg-violet-600 text-white' : 'bg-slate-200 text-slate-600'
                                    }`}>
                                    {s.num}
                                </span>
                                <span className="hidden sm:inline">{s.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">

                    {/* Step 1: Organization Details */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <div>
                                <label className={labelClass}>Organization Name *</label>
                                <input
                                    name="organizationName"
                                    value={formData.organizationName}
                                    onChange={handleChange}
                                    required
                                    className={inputClass}
                                    placeholder="Enter organization name"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Organization Type</label>
                                    <select name="orgType" value={formData.orgType} onChange={handleChange} className={inputClass}>
                                        <option value="IT Services">IT Services</option>
                                        <option value="Manufacturing">Manufacturing</option>
                                        <option value="Retail">Retail</option>
                                        <option value="Logistics">Logistics</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Status *</label>
                                    <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="Pending">Pending</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Organization Email</label>
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="org@company.com"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Address</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className={`${inputClass} resize-none`}
                                    rows={2}
                                    placeholder="Enter complete address"
                                />
                            </div>

                            <div className="pt-4">
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors"
                                >
                                    Next: Modules
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Modules */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <p className="text-sm text-slate-500 mb-4">
                                Select modules for this organization. These can be changed later.
                            </p>

                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { key: 'payroll', label: 'Payroll', desc: 'Salary management' },
                                    { key: 'attendance', label: 'Attendance', desc: 'Time tracking' },
                                    { key: 'leaves', label: 'Leaves', desc: 'Leave management' },
                                    { key: 'recruitment', label: 'Recruitment', desc: 'Hiring workflow' },
                                    { key: 'performance', label: 'Performance', desc: 'Reviews & goals' },
                                    { key: 'commonManager', label: 'Common Manager', desc: 'Shared management' }
                                ].map(mod => (
                                    <label
                                        key={mod.key}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.modules[mod.key]
                                                ? 'border-violet-500 bg-violet-50'
                                                : 'border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <input
                                                type="checkbox"
                                                name={`module_${mod.key}`}
                                                checked={formData.modules[mod.key]}
                                                onChange={handleChange}
                                                className="mt-1 w-4 h-4 text-violet-600 rounded"
                                            />
                                            <div>
                                                <p className="font-medium text-slate-800">{mod.label}</p>
                                                <p className="text-xs text-slate-500">{mod.desc}</p>
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-3 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep(3)}
                                    className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors"
                                >
                                    Next: Admin Details
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Admin Details */}
                    {step === 3 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg text-blue-700 text-sm mb-4">
                                <User size={16} />
                                <span>This admin will manage the organization</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>First Name *</label>
                                    <input
                                        name="adminFirstName"
                                        value={formData.adminFirstName}
                                        onChange={handleChange}
                                        required
                                        className={inputClass}
                                        placeholder="First name"
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Last Name *</label>
                                    <input
                                        name="adminLastName"
                                        value={formData.adminLastName}
                                        onChange={handleChange}
                                        required
                                        className={inputClass}
                                        placeholder="Last name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Email *</label>
                                <input
                                    name="adminEmail"
                                    type="email"
                                    value={formData.adminEmail}
                                    onChange={handleChange}
                                    required
                                    className={inputClass}
                                    placeholder="admin@company.com"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Mobile Number</label>
                                    <input
                                        name="adminMobile"
                                        value={formData.adminMobile}
                                        onChange={handleChange}
                                        className={inputClass}
                                        placeholder="Mobile number"
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Password</label>
                                    <input
                                        name="adminPassword"
                                        value={formData.adminPassword}
                                        onChange={handleChange}
                                        className={inputClass}
                                        placeholder="Default: Welcome@123"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Address</label>
                                <input
                                    name="adminAddress"
                                    value={formData.adminAddress}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="Address"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Country *</label>
                                    <input
                                        name="adminCountry"
                                        value={formData.adminCountry}
                                        onChange={handleChange}
                                        required
                                        className={inputClass}
                                        placeholder="Country"
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>State/Province *</label>
                                    <input
                                        name="adminState"
                                        value={formData.adminState}
                                        onChange={handleChange}
                                        required
                                        className={inputClass}
                                        placeholder="State"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                                    <AlertCircle size={16} className="mr-2" />
                                    {error}
                                </div>
                            )}

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="flex-1 py-3 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Creating...' : (
                                        <>
                                            <Save size={18} />
                                            Create Organization
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default CreateOrganizationModal;
