import React, { useState } from 'react';
import axios from 'axios';
import { X, UserPlus, Save, AlertCircle } from 'lucide-react';

const AddEmployeeModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        mobile: '', // <--- Added mobile field
        password: '',
        role: 'EMPLOYEE',
        salary: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://127.0.0.1:9999/api/v1/employees',
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                onSuccess();
                onClose();
                setFormData({ firstName: '', lastName: '', email: '', mobile: '', password: '', role: 'EMPLOYEE', salary: '' });
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to add employee');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div className="flex items-center space-x-2 text-blue-600">
                        <UserPlus size={20} />
                        <h3 className="font-bold text-lg text-slate-800">New Employee</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">First Name</label>
                            <input name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Sarah" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Last Name</label>
                            <input name="lastName" value={formData.lastName} onChange={handleChange} required className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Smith" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Email Address</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="sarah@demo.com" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Mobile Number</label>
                            <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} required className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="9876543210" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Password</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} required className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••••" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Monthly Salary</label>
                            <input type="number" name="salary" value={formData.salary} onChange={handleChange} className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="5000" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Role</label>
                        <select name="role" value={formData.role} onChange={handleChange} className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                            <option value="EMPLOYEE">Employee</option>
                            <option value="HR_ADMIN">HR Manager</option>
                            <option value="ORG_ADMIN">Admin</option>
                        </select>
                    </div>

                    {error && (
                        <div className="flex items-center text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                            <AlertCircle size={16} className="mr-2" /> {error}
                        </div>
                    )}

                    <div className="pt-2 flex space-x-3">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                        <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm shadow-blue-200 flex items-center justify-center space-x-2 transition-all">
                            {loading ? <span>Saving...</span> : <><Save size={18} /> <span>Create Employee</span></>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEmployeeModal;
