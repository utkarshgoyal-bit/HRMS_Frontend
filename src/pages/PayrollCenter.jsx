import React, { useState, useEffect } from 'react';
import API from '../api';
import SalarySlip from '../components/SalarySlip';

const PayrollCenter = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [processingId, setProcessingId] = useState(null);
    const [selectedSlip, setSelectedSlip] = useState(null);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await API.get('/employees');
            setEmployees(res.data.data);
        } catch (err) {
            console.error("Failed to fetch employees", err);
        }
    };

    const handleRunPayroll = async (emp) => {
        setProcessingId(emp._id);
        try {
            // Logic: Ask Backend to calculate for THIS month
            const payload = {
                employeeId: emp._id,
                month: "January",
                year: 2026,
                workedDays: 30 // Assuming full attendance for now
            };

            const res = await API.post('/payroll/generate', payload);
            alert(`Payroll Processed for ${emp.personal.firstName}! Net Pay: ₹${res.data.data.netPay}`);

            // Auto-show the slip
            // We need to fetch the full object including populated fields if the backend returns partial
            // For now, let's assume backend returns fully populated or we use local data
            const slipData = { ...res.data.data, employeeId: emp };
            setSelectedSlip(slipData);

        } catch (err) {
            alert("Error: " + (err.response?.data?.message || err.message));
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div>
                    <h2 className="text-lg font-bold text-gray-800">Payroll Center</h2>
                    <p className="text-sm text-gray-500">Process salaries for January 2026</p>
                </div>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {employees.length} Pending
                </span>
            </div>

            <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                    <tr>
                        <th className="px-6 py-4">Employee</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Base Salary</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {employees.map(emp => (
                        <tr key={emp._id} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4 font-medium text-gray-900">
                                {emp.personal.firstName} {emp.personal.lastName}
                            </td>
                            <td className="px-6 py-4 text-gray-600">{emp.professional.designation}</td>
                            <td className="px-6 py-4 text-gray-900 font-mono">₹{emp.payroll?.salary?.base}</td>
                            <td className="px-6 py-4">
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">Pending</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button
                                    onClick={() => handleRunPayroll(emp)}
                                    disabled={processingId === emp._id}
                                    className={`px-4 py-2 rounded text-sm font-medium transition shadow-sm ${processingId === emp._id
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "bg-green-600 text-white hover:bg-green-700 hover:shadow"
                                        }`}
                                >
                                    {processingId === emp._id ? "Processing..." : "Run Payroll"}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Salary Slip Modal */}
            {selectedSlip && (
                <SalarySlip salary={selectedSlip} onClose={() => setSelectedSlip(null)} />
            )}
        </div>
    );
};

export default PayrollCenter;
