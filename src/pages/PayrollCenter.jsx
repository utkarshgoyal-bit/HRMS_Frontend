import React, { useState, useEffect } from 'react';
import { generatePayroll, getPayrolls } from '../services/payrollService';
import SalarySlip from '../components/SalarySlip';

const PayrollCenter = ({ employees }) => {
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPayroll, setSelectedPayroll] = useState(null);
    const [showRunModal, setShowRunModal] = useState(false);

    // Run Payroll State
    const [runDetails, setRunDetails] = useState({
        employeeId: '',
        month: new Date().getMonth() + 1, // Current Month
        year: new Date().getFullYear()
    });

    const token = localStorage.getItem('token');

    const fetchPayrolls = async () => {
        setLoading(true);
        try {
            const res = await getPayrolls(token);
            setPayrolls(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayrolls();
    }, []);

    const handleRunPayroll = async (e) => {
        e.preventDefault();
        try {
            await generatePayroll(token, runDetails);
            alert('Payroll Generated Successfully!');
            setShowRunModal(false);
            fetchPayrolls();
        } catch (err) {
            alert('Error: ' + (err.message || 'Failed to generate payroll'));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Payroll Center</h2>
                    <p className="text-gray-500 text-sm">Manage salaries and view payslips</p>
                </div>
                <button
                    onClick={() => setShowRunModal(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 shadow-sm flex items-center gap-2"
                >
                    <span>⚡ Run Payroll</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="text-gray-500 text-xs uppercase font-bold tracking-wider">Total Payout (This Month)</div>
                    <div className="text-2xl font-bold text-gray-800 mt-2">₹ {payrolls.reduce((acc, p) => acc + p.netSalary, 0).toLocaleString()}</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="text-gray-500 text-xs uppercase font-bold tracking-wider">Pending Process</div>
                    <div className="text-2xl font-bold text-orange-600 mt-2">{employees.length - payrolls.length} Employees</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="text-gray-500 text-xs uppercase font-bold tracking-wider">Avg. Salary</div>
                    <div className="text-2xl font-bold text-blue-600 mt-2">₹ {payrolls.length ? Math.round(payrolls.reduce((acc, p) => acc + p.netSalary, 0) / payrolls.length).toLocaleString() : 0}</div>
                </div>
            </div>

            {/* Payroll History Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 font-semibold text-gray-700">
                    Payroll History
                </div>
                {loading ? (
                    <div className="p-8 text-center text-gray-400">Loading payrolls...</div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                                <th className="px-6 py-3 font-medium">Employee</th>
                                <th className="px-6 py-3 font-medium">Month/Year</th>
                                <th className="px-6 py-3 font-medium text-right">Gross Pay</th>
                                <th className="px-6 py-3 font-medium text-right">Deductions</th>
                                <th className="px-6 py-3 font-medium text-right">Net Pay</th>
                                <th className="px-6 py-3 font-medium text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {payrolls.map(pay => (
                                <tr key={pay._id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{pay.employeeId?.personal?.firstName} {pay.employeeId?.personal?.lastName}</div>
                                        <div className="text-xs text-gray-400">{pay.employeeId?.professional?.employeeId}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {new Date(pay.year, pay.month - 1).toLocaleString('default', { month: 'short' })} {pay.year}
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-gray-600">₹ {pay.salaryComponents.grossSalary.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right text-red-500">- ₹ {pay.deductions.totalDeductions.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right font-bold text-green-700">₹ {pay.netSalary.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => setSelectedPayroll(pay)}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                        >
                                            View Slip
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {payrolls.length === 0 && (
                                <tr><td colSpan="6" className="p-8 text-center text-gray-400">No payroll records found.</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Run Payroll Modal */}
            {showRunModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-96 overflow-hidden">
                        <div className="bg-green-600 px-6 py-4 text-white font-bold text-lg">Run Payroll</div>
                        <form onSubmit={handleRunPayroll} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Employee</label>
                                <select
                                    className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 outline-none"
                                    value={runDetails.employeeId}
                                    onChange={e => setRunDetails({ ...runDetails, employeeId: e.target.value })}
                                    required
                                >
                                    <option value="">-- Choose Employee --</option>
                                    {employees.map(emp => (
                                        <option key={emp._id} value={emp._id}>{emp.personal.firstName} {emp.personal.lastName}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                                    <select
                                        className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 outline-none"
                                        value={runDetails.month}
                                        onChange={e => setRunDetails({ ...runDetails, month: parseInt(e.target.value) })}
                                    >
                                        {[...Array(12)].map((_, i) => (
                                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                                    <input
                                        type="number"
                                        className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 outline-none"
                                        value={runDetails.year}
                                        onChange={e => setRunDetails({ ...runDetails, year: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <button className="w-full bg-green-600 text-white font-bold py-2 rounded mt-4 hover:bg-green-700 transition">
                                Calculate & Generate
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowRunModal(false)}
                                className="w-full text-gray-500 text-sm mt-2 hover:text-gray-700"
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Salary Slip Viewer */}
            {selectedPayroll && (
                <SalarySlip payroll={selectedPayroll} onClose={() => setSelectedPayroll(null)} />
            )}
        </div>
    );
};

export default PayrollCenter;
