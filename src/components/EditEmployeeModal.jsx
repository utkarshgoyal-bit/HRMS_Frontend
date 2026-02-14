import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, UserPlus, Save, AlertCircle, User, Phone, Briefcase, FileText, CreditCard, ChevronLeft, ChevronRight, Edit2 } from 'lucide-react';

const EditEmployeeModal = ({ isOpen, onClose, onSuccess, employee }) => {
    const [currentSection, setCurrentSection] = useState(0);
    const [loading, setLoading] = useState(false);
    const [branches, setBranches] = useState([]);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        // Personal Details
        firstName: '', lastName: '', dob: '', gender: '', maritalStatus: '', qualification: '',
        // Contact Details
        email: '', mobile: '', addressLine1: '', addressLine2: '', country: '', state: '',
        // Professional Details
        role: 'EMPLOYEE', designation: '', joiningDate: '', status: 'Active', branchId: '',
        // Documents
        aadhar: '', pan: '', passport: '', voterID: '', drivingLicense: '',
        // Payroll
        baseSalary: '', hra: '', conveyance: '', incentive: '', commission: '', ledgerBalance: '',
        // Bank Details
        accountNumber: '', accountName: '', ifsc: '', bankName: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetchBranches();
            if (employee) populateForm(employee);
        }
    }, [isOpen, employee]);

    const fetchBranches = async () => {
        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:9999';
            const res = await axios.get(`${API_URL}/api/v1/branches`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setBranches(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch branches', err);
        }
    };

    const populateForm = (emp) => {
        // Extract branch ID safely
        const branchIds = emp.professional?.branches?.map(b => typeof b === 'object' ? b._id : b) || [];
        const currentBranch = branchIds.length > 0 ? branchIds[0] : '';

        setFormData({
            firstName: emp.personal?.firstName || '',
            lastName: emp.personal?.lastName || '',
            dob: emp.personal?.dob ? new Date(emp.personal.dob).toISOString().split('T')[0] : '',
            gender: emp.personal?.gender || '',
            maritalStatus: emp.personal?.maritalStatus || '',
            qualification: emp.personal?.qualification || '',

            email: emp.contact?.email || '',
            mobile: emp.contact?.mobile || '',
            addressLine1: emp.contact?.addressLine1 || '',
            addressLine2: emp.contact?.addressLine2 || '',
            country: emp.contact?.country || '',
            state: emp.contact?.state || '',

            role: emp.professional?.role || 'EMPLOYEE',
            designation: emp.professional?.designation || '',
            joiningDate: emp.professional?.dateOfJoining ? new Date(emp.professional.dateOfJoining).toISOString().split('T')[0] : '',
            status: emp.status || 'Active',
            branchId: currentBranch,

            aadhar: emp.documents?.aadhar || '',
            pan: emp.documents?.pan || '',
            passport: emp.documents?.passport || '',
            voterID: emp.documents?.voterID || '',
            drivingLicense: emp.documents?.drivingLicense || '',

            baseSalary: emp.payroll?.salary?.base || '',
            hra: emp.payroll?.salary?.hra || '',
            conveyance: emp.payroll?.salary?.conveyance || '',
            incentive: emp.payroll?.salary?.incentive || '', // Assuming these exist in schema
            commission: emp.payroll?.salary?.commission || '',
            ledgerBalance: emp.payroll?.salary?.ledgerBalance || '',

            accountNumber: emp.bankDetails?.accountNumber || '',
            accountName: emp.bankDetails?.accountName || '',
            ifsc: emp.bankDetails?.ifsc || '',
            bankName: emp.bankDetails?.bankName || ''
        });
    };

    const sections = [
        { id: 0, name: 'Personal', icon: User },
        { id: 1, name: 'Contact', icon: Phone },
        { id: 2, name: 'Professional', icon: Briefcase },
        { id: 3, name: 'Documents', icon: FileText },
        { id: 4, name: 'Payroll & Bank', icon: CreditCard }
    ];

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validate Base Salary
        if (!formData.baseSalary || formData.baseSalary <= 0) {
            setError('Base Salary is required and must be greater than 0');
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:9999';

            const response = await axios.put(`${API_URL}/api/v1/employees/${employee._id}`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                onSuccess();
                onClose();
                setCurrentSection(0);
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || err.response?.data?.error || 'Failed to update employee');
        } finally {
            setLoading(false);
        }
    };

    const nextSection = () => { if (currentSection < sections.length - 1) setCurrentSection(currentSection + 1); };
    const prevSection = () => { if (currentSection > 0) setCurrentSection(currentSection - 1); };

    const inputClass = "w-full p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white";
    const labelClass = "block text-xs font-medium text-slate-600 mb-1";

    const renderPersonalSection = () => (
        <div className="grid grid-cols-2 gap-4">
            <div><label className={labelClass}>First Name *</label><input name="firstName" value={formData.firstName} onChange={handleChange} required className={inputClass} /></div>
            <div><label className={labelClass}>Last Name *</label><input name="lastName" value={formData.lastName} onChange={handleChange} required className={inputClass} /></div>
            <div><label className={labelClass}>Date of Birth</label><input type="date" name="dob" value={formData.dob} onChange={handleChange} className={inputClass} /></div>
            <div>
                <label className={labelClass}>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass}>
                    <option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                </select>
            </div>
            <div>
                <label className={labelClass}>Marital Status</label>
                <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className={inputClass}>
                    <option value="">Select</option><option value="Single">Single</option><option value="Married">Married</option><option value="Divorced">Divorced</option>
                </select>
            </div>
            <div><label className={labelClass}>Qualification</label><input name="qualification" value={formData.qualification} onChange={handleChange} className={inputClass} /></div>
        </div>
    );

    const renderContactSection = () => (
        <div className="grid grid-cols-2 gap-4">
            <div><label className={labelClass}>Email *</label><input type="email" name="email" value={formData.email} onChange={handleChange} required className={inputClass} /></div>
            <div><label className={labelClass}>Mobile Number *</label><input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} required className={inputClass} /></div>
            <div className="col-span-2"><label className={labelClass}>Address Line 1</label><input name="addressLine1" value={formData.addressLine1} onChange={handleChange} className={inputClass} /></div>
            <div className="col-span-2"><label className={labelClass}>Address Line 2</label><input name="addressLine2" value={formData.addressLine2} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Country</label><input name="country" value={formData.country} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>State</label><input name="state" value={formData.state} onChange={handleChange} className={inputClass} /></div>
        </div>
    );

    const renderProfessionalSection = () => (
        <div className="grid grid-cols-2 gap-4">
            <div><label className={labelClass}>Designation</label><input name="designation" value={formData.designation} onChange={handleChange} className={inputClass} /></div>
            <div>
                <label className={labelClass}>Role</label>
                <select name="role" value={formData.role} onChange={handleChange} className={inputClass}>
                    <option value="EMPLOYEE">Employee</option><option value="MANAGER">Manager</option><option value="HR_ADMIN">HR Manager</option><option value="ORG_ADMIN">Admin</option>
                </select>
            </div>
            <div><label className={labelClass}>Joining Date</label><input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} className={inputClass} /></div>
            <div>
                <label className={labelClass}>Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>
                    <option value="Active">Active</option><option value="Inactive">Inactive</option><option value="Notice Period">Notice Period</option><option value="Terminated">Terminated</option>
                </select>
            </div>
            <div className="col-span-2">
                <label className={labelClass}>Branch Assignment *</label>
                <select name="branchId" value={formData.branchId} onChange={handleChange} required className={inputClass}>
                    <option value="">-- Select Branch --</option>
                    {branches.map(b => (
                        <option key={b._id} value={b._id}>{b.name} ({b.address?.city || 'Main'})</option>
                    ))}
                </select>
            </div>
        </div>
    );

    const renderDocumentsSection = () => (
        <div className="grid grid-cols-2 gap-4">
            <div><label className={labelClass}>Aadhar / UID</label><input name="aadhar" value={formData.aadhar} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>PAN Card</label><input name="pan" value={formData.pan} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Passport</label><input name="passport" value={formData.passport} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Voter ID</label><input name="voterID" value={formData.voterID} onChange={handleChange} className={inputClass} /></div>
            <div className="col-span-2"><label className={labelClass}>Driving License</label><input name="drivingLicense" value={formData.drivingLicense} onChange={handleChange} className={inputClass} /></div>
        </div>
    );

    const renderPayrollSection = () => (
        <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-700 border-b pb-2">Salary Components & Bank</h4>
            <div className="grid grid-cols-3 gap-4">
                <div><label className={labelClass}>Base Salary *</label><input type="number" name="baseSalary" value={formData.baseSalary} onChange={handleChange} required className={inputClass} min="1" /></div>
                <div><label className={labelClass}>HRA</label><input type="number" name="hra" value={formData.hra} onChange={handleChange} className={inputClass} /></div>
                <div><label className={labelClass}>Conveyance</label><input type="number" name="conveyance" value={formData.conveyance} onChange={handleChange} className={inputClass} /></div>
                <div><label className={labelClass}>Incentive</label><input type="number" name="incentive" value={formData.incentive} onChange={handleChange} className={inputClass} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Account No.</label><input name="accountNumber" value={formData.accountNumber} onChange={handleChange} className={inputClass} /></div>
                <div><label className={labelClass}>IFSC</label><input name="ifsc" value={formData.ifsc} onChange={handleChange} className={inputClass} /></div>
                <div><label className={labelClass}>Bank Name</label><input name="bankName" value={formData.bankName} onChange={handleChange} className={inputClass} /></div>
            </div>
        </div>
    );

    const renderSection = () => {
        switch (currentSection) {
            case 0: return renderPersonalSection();
            case 1: return renderContactSection();
            case 2: return renderProfessionalSection();
            case 3: return renderDocumentsSection();
            case 4: return renderPayrollSection();
            default: return renderPersonalSection();
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-600">
                    <div className="flex items-center space-x-2 text-white">
                        <Edit2 size={22} />
                        <h3 className="font-bold text-lg">Edit Employee</h3>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex border-b border-slate-100 bg-slate-50">
                    {sections.map((section) => {
                        const Icon = section.icon;
                        return (
                            <button
                                key={section.id}
                                type="button"
                                onClick={() => setCurrentSection(section.id)}
                                className={`flex-1 py-3 px-2 text-xs font-medium flex flex-col items-center gap-1 transition-all border-b-2 ${currentSection === section.id ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                <Icon size={16} />{section.name}
                            </button>
                        );
                    })}
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6 min-h-[320px]">
                        {renderSection()}
                    </div>

                    {error && (
                        <div className="mx-6 mb-4 flex items-center text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                            <AlertCircle size={16} className="mr-2 flex-shrink-0" />{error}
                        </div>
                    )}

                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                        <button type="button" onClick={prevSection} disabled={currentSection === 0} className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm ${currentSection === 0 ? 'text-slate-300' : 'text-slate-600 hover:bg-slate-200'}`}>
                            <ChevronLeft size={18} className="mr-1" /> Previous
                        </button>

                        <div className="flex items-center gap-2">
                            {sections.map((_, idx) => (
                                <div key={idx} className={`w-2 h-2 rounded-full transition-all ${idx === currentSection ? 'bg-blue-600 w-4' : 'bg-slate-300'}`} />
                            ))}
                        </div>

                        {currentSection < sections.length - 1 ? (
                            <button type="button" onClick={nextSection} className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg">
                                Next <ChevronRight size={18} className="ml-1" />
                            </button>
                        ) : (
                            <button type="submit" disabled={loading} className="flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm">
                                {loading ? 'Updating...' : <><Save size={18} className="mr-2" /> Update Employee</>}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditEmployeeModal;
