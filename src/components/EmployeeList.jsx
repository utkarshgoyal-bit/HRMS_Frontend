import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Shield, Mail, Phone, RefreshCw, Search, MoreVertical, Filter, Plus } from 'lucide-react';
import RoleAssignmentModal from './RoleAssignmentModal';
import AddEmployeeModal from './AddEmployeeModal';

const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
                setFilteredEmployees(response.data.data);

                // Get current user's role
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
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

    // Search Filter
    useEffect(() => {
        const lowerSearch = searchTerm.toLowerCase();
        const filtered = employees.filter(emp =>
            emp.personal?.firstName?.toLowerCase().includes(lowerSearch) ||
            emp.personal?.lastName?.toLowerCase().includes(lowerSearch) ||
            emp.contact?.email?.toLowerCase().includes(lowerSearch)
        );
        setFilteredEmployees(filtered);
    }, [searchTerm, employees]);

    const isAdmin = currentUserRole === 'ORG_ADMIN' || currentUserRole === 'SUPER_ADMIN';

    const getRoleBadge = (role) => {
        const styles = {
            'EMPLOYEE': 'bg-slate-100 text-slate-600 ring-slate-500/10',
            'MANAGER': 'bg-blue-50 text-blue-700 ring-blue-700/10',
            'HR_ADMIN': 'bg-violet-50 text-violet-700 ring-violet-700/10',
            'ORG_ADMIN': 'bg-amber-50 text-amber-700 ring-amber-600/20',
            'SUPER_ADMIN': 'bg-red-50 text-red-700 ring-red-600/10'
        };
        const labels = {
            'EMPLOYEE': 'Employee',
            'MANAGER': 'Manager',
            'HR_ADMIN': 'HR Admin',
            'ORG_ADMIN': 'Org Admin',
            'SUPER_ADMIN': 'Super Admin'
        };
        return (
            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${styles[role] || styles['EMPLOYEE']}`}>
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
            <div className="glass rounded-2xl p-8 flex items-center justify-center text-slate-400">
                <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="animate-spin text-violet-500" size={24} />
                    <p className="text-sm font-medium">Loading workforce data...</p>
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
                        <div className="bg-violet-100 p-2 rounded-lg text-violet-600">
                            <Users size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800">All Employees</h2>
                            <p className="text-xs text-slate-500">{employees.length} total active records</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search employees..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none w-64 transition-all"
                            />
                        </div>

                        <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                            <Filter size={18} />
                        </button>

                        <button
                            onClick={fetchEmployees}
                            className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                        >
                            <RefreshCw size={18} />
                        </button>

                        {isAdmin && (
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-violet-500/20 transition-all hover:-translate-y-0.5"
                            >
                                <Plus size={16} />
                                <span className="hidden sm:inline">Add New</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Data Grid */}
                {filteredEmployees.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
                            <Search size={24} className="text-slate-300" />
                        </div>
                        <h3 className="text-slate-900 font-medium mb-1">No employees found</h3>
                        <p className="text-slate-500 text-sm">Try adjusting your search criteria.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">Employee</th>
                                    <th className="px-6 py-4">Role & Designation</th>
                                    <th className="px-6 py-4">Contact Info</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredEmployees.map((emp) => (
                                    <tr key={emp._id} className="group hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white">
                                                    {emp.personal?.firstName?.[0]}{emp.personal?.lastName?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800">{emp.personal?.firstName} {emp.personal?.lastName}</p>
                                                    <p className="text-xs text-slate-500">ID: {emp.professional?.employeeId || '---'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col items-start gap-1">
                                                <p className="text-sm font-medium text-slate-700">{emp.professional?.designation || 'No designation'}</p>
                                                {getRoleBadge(emp.professional?.role)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center text-sm text-slate-500 group-hover:text-slate-700 transition-colors">
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
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${emp.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${emp.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                                {emp.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => openRoleModal(emp)}
                                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors tooltip"
                                                        title="Manage Roles"
                                                    >
                                                        <Shield size={16} />
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

            {/* Modals */}
            <RoleAssignmentModal
                isOpen={isRoleModalOpen}
                onClose={() => setIsRoleModalOpen(false)}
                employee={selectedEmployee}
                onSuccess={handleRoleUpdated}
            />

            <AddEmployeeModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => {
                    setIsAddModalOpen(false);
                    fetchEmployees();
                }}
            />
        </>
    );
};

export default EmployeeList;
