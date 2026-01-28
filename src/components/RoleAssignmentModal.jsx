import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Shield, AlertCircle, Check } from 'lucide-react';

const RoleAssignmentModal = ({ isOpen, onClose, employee, onSuccess }) => {
    const [selectedRole, setSelectedRole] = useState('EMPLOYEE');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Update selected role when employee changes
    useEffect(() => {
        if (employee) {
            setSelectedRole(employee.professional?.role || 'EMPLOYEE');
            setError('');
        }
    }, [employee]);

    const roles = [
        { value: 'EMPLOYEE', label: 'Employee', description: 'Regular employee with basic access', color: 'bg-slate-100 text-slate-700' },
        { value: 'MANAGER', label: 'Manager', description: 'Can manage team and view reports', color: 'bg-blue-100 text-blue-700' },
        { value: 'HR_ADMIN', label: 'HR', description: 'HR operations and employee management', color: 'bg-purple-100 text-purple-700' },
        { value: 'ORG_ADMIN', label: 'Admin', description: 'Full administrative access', color: 'bg-amber-100 text-amber-700' }
    ];

    if (!isOpen || !employee) return null;

    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        console.log('🔄 Updating role for:', employee._id, 'to:', selectedRole);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Not authenticated. Please login again.');
                setLoading(false);
                return;
            }

            const response = await axios.put(
                `http://127.0.0.1:9999/api/v1/employees/${employee._id}/role`,
                { role: selectedRole },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log('✅ Response:', response.data);

            if (response.data.success) {
                onSuccess();
                onClose();
            } else {
                setError(response.data.message || 'Failed to update role');
            }
        } catch (err) {
            console.error('❌ Error:', err);
            setError(err.response?.data?.message || err.response?.data?.error || 'Failed to update role');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-purple-600">
                    <div className="flex items-center space-x-2 text-white">
                        <Shield size={22} />
                        <h3 className="font-bold text-lg">Assign Role</h3>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Employee Info */}
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
                    <p className="text-sm text-slate-500">Assigning role for:</p>
                    <p className="text-lg font-semibold text-slate-800">
                        {employee.personal?.firstName} {employee.personal?.lastName}
                    </p>
                    <p className="text-sm text-slate-500">{employee.contact?.email}</p>
                </div>

                {/* Role Selection */}
                <div className="p-6 space-y-3">
                    {roles.map((role) => (
                        <button
                            key={role.value}
                            onClick={() => setSelectedRole(role.value)}
                            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${selectedRole === role.value
                                    ? 'border-indigo-500 bg-indigo-50'
                                    : 'border-slate-200 hover:border-slate-300 bg-white'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${role.color}`}>
                                            {role.label}
                                        </span>
                                        {selectedRole === role.value && (
                                            <Check size={16} className="text-indigo-600" />
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-500 mt-1">{role.description}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mx-6 mb-4 flex items-center text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                        <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                        {error}
                    </div>
                )}

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-all disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Update Role'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoleAssignmentModal;
