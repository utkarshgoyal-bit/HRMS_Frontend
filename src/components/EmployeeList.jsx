import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Shield, Mail, Phone, RefreshCw } from 'lucide-react';
import RoleAssignmentModal from './RoleAssignmentModal';

const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [currentUserRole, setCurrentUserRole] = useState(null);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://127.0.0.1:9999/api/v1/employees', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setEmployees(response.data.data);

                // Get current user's role from token (decode JWT)
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    // Find current user in employees list to get their role
                    const currentUser = response.data.data.find(emp => emp._id === payload.id);
                    if (currentUser) {
                        setCurrentUserRole(currentUser.professional?.role);
                    }
                } catch (e) {
                    console.log('Could not decode token');
                }
            }
        } catch (err) {
            console.error(err);
            if (err.response && err.response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/';
                return;
            }
            setError('Failed to load employees');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    // Check if current user is an admin
    const isAdmin = currentUserRole === 'ORG_ADMIN' || currentUserRole === 'SUPER_ADMIN';

    const getRoleBadge = (role) => {
        const styles = {
            'EMPLOYEE': 'bg-slate-100 text-slate-700',
            'MANAGER': 'bg-blue-100 text-blue-700',
            'HR_ADMIN': 'bg-purple-100 text-purple-700',
            'ORG_ADMIN': 'bg-amber-100 text-amber-700',
            'SUPER_ADMIN': 'bg-red-100 text-red-700'
        };
        const labels = {
            'EMPLOYEE': 'Employee',
            'MANAGER': 'Manager',
            'HR_ADMIN': 'HR',
            'ORG_ADMIN': 'Admin',
            'SUPER_ADMIN': 'Super Admin'
        };
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[role] || styles['EMPLOYEE']}`}>
                {labels[role] || role}
            </span>
        );
    };

    const openRoleModal = (employee) => {
        setSelectedEmployee(employee);
        setIsRoleModalOpen(true);
    };

    const handleRoleUpdated = () => {
        fetchEmployees();
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
                <div className="flex items-center justify-center text-slate-400">
                    <RefreshCw className="animate-spin mr-2" size={20} />
                    Loading employees...
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

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="text-blue-600" size={20} />
                        <h2 className="font-semibold text-slate-800">Employees</h2>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                            {employees.length}
                        </span>
                    </div>
                    <button
                        onClick={fetchEmployees}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>

                {/* Table */}
                {employees.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                        No employees found. Add your first employee!
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Employee</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                    {isAdmin && (
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {employees.map((emp) => (
                                    <tr key={emp._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                                                    {emp.personal?.firstName?.[0]}{emp.personal?.lastName?.[0]}
                                                </div>
                                                <div className="ml-3">
                                                    <p className="font-medium text-slate-800">
                                                        {emp.personal?.firstName} {emp.personal?.lastName}
                                                    </p>
                                                    <p className="text-sm text-slate-500">
                                                        {emp.professional?.designation || 'No designation'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center text-sm text-slate-600">
                                                    <Mail size={14} className="mr-2 text-slate-400" />
                                                    {emp.contact?.email}
                                                </div>
                                                <div className="flex items-center text-sm text-slate-500">
                                                    <Phone size={14} className="mr-2 text-slate-400" />
                                                    {emp.contact?.mobile || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getRoleBadge(emp.professional?.role)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${emp.status === 'Active'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                {emp.status}
                                            </span>
                                        </td>
                                        {isAdmin && (
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => openRoleModal(emp)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                >
                                                    <Shield size={14} />
                                                    Assign Role
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Role Assignment Modal */}
            <RoleAssignmentModal
                isOpen={isRoleModalOpen}
                onClose={() => setIsRoleModalOpen(false)}
                employee={selectedEmployee}
                onSuccess={handleRoleUpdated}
            />
        </>
    );
};

export default EmployeeList;
