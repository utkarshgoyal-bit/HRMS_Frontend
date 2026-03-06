import React, { useState, useEffect } from 'react';
import API from '../api';
import SalarySlip from '../components/SalarySlip';

const PayrollCenter = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [processingId, setProcessingId] = useState(null);
    const [selectedSlip, setSelectedSlip] = useState(null);
    const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [attendanceSummary, setAttendanceSummary] = useState({});
    const [editedDays, setEditedDays] = useState({});

    useEffect(() => {
        fetchEmployees();
        fetchAttendanceSummary();
    }, [month, year]);

    const fetchEmployees = async () => {
        try {
            const res = await API.get('/employees');
            setEmployees(res.data.data);
        } catch (err) {
            console.error("Failed to fetch employees", err);
        }
    };

    const fetchAttendanceSummary = async () => {
        if (!month || !year) return;
        setLoading(true);
        try {
            const res = await API.get(`/attendance/summary?month=${month}&year=${year}`);
            if (res.data.success) {
                setAttendanceSummary(res.data.data);

                // Initialize editable dictionary
                const initialDays = {};
                for (let empId in res.data.data) {
                    initialDays[empId] = res.data.data[empId];
                }
                setEditedDays(initialDays);
            }
        } catch (err) {
            console.error("Failed to fetch attendance summary", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRunPayroll = async (emp) => {
        setProcessingId(emp._id);
        try {
            // Ask Backend to calculate for THIS month
            const shortMonthToNum = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

            // Check if explicitly edited, otherwise fallback to summary or standard 30 (backend handles null case perfectly)
            const wDays = editedDays[emp._id] !== undefined ? editedDays[emp._id] : (attendanceSummary[emp._id] !== undefined ? attendanceSummary[emp._id] : null);

            const payload = {
                employeeId: emp._id,
                month: shortMonthToNum[parseInt(month) - 1],
                year: parseInt(year),
                workedDays: wDays
            };

            const res = await API.post('/payroll/generate', payload);
            alert(`Payroll Processed for ${emp.personal.firstName}! Net Pay: ₹${res.data.data.netPay}`);

            const slipData = { ...res.data.data, employeeId: emp };
            setSelectedSlip(slipData);

        } catch (err) {
            alert("Error: " + (err.response?.data?.message || err.message));
        } finally {
            setProcessingId(null);
        }
    };

    const handleDaysChange = (empId, value) => {
        setEditedDays(prev => ({ ...prev, [empId]: value }));
    };

    const months = [
        { value: "1", label: "January" }, { value: "2", label: "February" }, { value: "3", label: "March" },
        { value: "4", label: "April" }, { value: "5", label: "May" }, { value: "6", label: "June" },
        { value: "7", label: "July" }, { value: "8", label: "August" }, { value: "9", label: "September" },
        { value: "10", label: "October" }, { value: "11", label: "November" }, { value: "12", label: "December" }
    ];
    const years = ["2024", "2025", "2026", "2027"];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-wrap gap-4">
                <div>
                    <h2 className="text-lg font-bold text-gray-800">Payroll Center</h2>
                    <p className="text-sm text-gray-500">Select month below to calculate attendance and run payroll based on it.</p>
                </div>

                <div className="flex bg-white ring-1 ring-slate-200 rounded-lg overflow-hidden shadow-sm">
                    <select
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="p-2 border-r border-slate-200 focus:outline-none text-sm font-medium"
                    >
                        {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                    <select
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="p-2 focus:outline-none text-sm font-medium"
                    >
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>

                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {loading ? "Loading..." : `${employees.length} Pending`}
                </span>
            </div>

            <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                    <tr>
                        <th className="px-6 py-4">Employee</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Base Salary</th>
                        <th className="px-6 py-4 text-center">Worked Days</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {employees.map(emp => {
                        const defaultDays = attendanceSummary[emp._id] !== undefined ? attendanceSummary[emp._id] : 30;
                        const currentVal = editedDays[emp._id] !== undefined ? editedDays[emp._id] : defaultDays;

                        return (
                            <tr key={emp._id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    {emp.personal.firstName} {emp.personal.lastName}
                                </td>
                                <td className="px-6 py-4 text-gray-600">{emp.professional.designation}</td>
                                <td className="px-6 py-4 text-gray-900 font-mono">₹{emp.payroll?.salary?.base || 0}</td>
                                <td className="px-6 py-4 text-center">
                                    <input
                                        type="number"
                                        min="0"
                                        max="31"
                                        step="0.5"
                                        value={currentVal}
                                        onChange={(e) => handleDaysChange(emp._id, e.target.value)}
                                        className="w-20 p-1 border border-slate-300 rounded text-sm text-center focus:ring-1 focus:ring-blue-500 outline-none"
                                    />
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium shadow-sm">Pending</span>
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
                        );
                    })}
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
