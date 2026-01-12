import React from 'react';

const SalarySlip = ({ salary, onClose }) => {
    if (!salary) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="bg-blue-600 text-white p-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold">Salary Slip</h2>
                        <p className="opacity-90">{salary.month} {salary.year}</p>
                    </div>
                    <button onClick={onClose} className="text-white hover:text-gray-200 text-xl font-bold">&times;</button>
                </div>

                {/* Body */}
                <div className="p-8">
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <p className="text-sm text-gray-500 uppercase tracking-wide">Employee</p>
                            <p className="font-semibold text-lg">{salary.employeeId?.personal?.firstName} {salary.employeeId?.personal?.lastName}</p>
                            <p className="text-gray-600">{salary.employeeId?.professional?.designation}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500 uppercase tracking-wide">Worked Days</p>
                            <p className="font-semibold text-lg">{salary.workedDays} Days</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 border-t border-b border-gray-200 py-6">
                        {/* Earnings */}
                        <div>
                            <h3 className="text-green-600 font-bold mb-4 uppercase text-sm">Earnings</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between"><span>Basic Salary</span> <span>₹{salary.earnings.basic}</span></div>
                                <div className="flex justify-between"><span>HRA</span> <span>₹{salary.earnings.hra}</span></div>
                                <div className="flex justify-between"><span>Special Allow.</span> <span>₹{salary.earnings.specialAllowance || 0}</span></div>
                                <div className="flex justify-between font-bold border-t pt-2 mt-2"><span>Gross Earnings</span> <span>₹{salary.earnings.gross}</span></div>
                            </div>
                        </div>

                        {/* Deductions */}
                        <div>
                            <h3 className="text-red-500 font-bold mb-4 uppercase text-sm">Deductions</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between"><span>Provident Fund</span> <span>₹{salary.deductions.pf}</span></div>
                                <div className="flex justify-between"><span>ESI</span> <span>₹{salary.deductions.esi || 0}</span></div>
                                <div className="flex justify-between"><span>Tax (TDS)</span> <span>₹{salary.deductions.tax || 0}</span></div>
                                <div className="flex justify-between font-bold border-t pt-2 mt-2"><span>Total Deductions</span> <span>₹{salary.deductions.totalDeductions}</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Net Pay */}
                    <div className="bg-blue-50 p-6 mt-6 rounded-lg flex justify-between items-center">
                        <span className="text-blue-800 font-semibold uppercase tracking-wide">Net Payable</span>
                        <span className="text-3xl font-bold text-blue-900">₹{salary.netPay}</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 p-4 text-center border-t">
                    <p className="text-xs text-gray-400">Computer Generated Slip • Cyber Systems</p>
                </div>
            </div>
        </div>
    );
};

export default SalarySlip;
