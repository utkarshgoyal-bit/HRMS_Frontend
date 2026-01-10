import React from 'react';

const SalarySlip = ({ payroll, onClose }) => {
    if (!payroll) return null;

    const { employeeId, salaryComponents, deductions, attendanceSummary, netSalary, month, year } = payroll;
    const empName = employeeId ? `${employeeId.personal.firstName} ${employeeId.personal.lastName}` : 'Employee';
    const empCode = employeeId?.professional?.employeeId || 'N/A';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
                <div className="bg-blue-600 px-6 py-4 flex justify-between items-center text-white">
                    <h3 className="text-xl font-bold">Payslip: {new Date(year, month - 1).toLocaleString('default', { month: 'long' })} {year}</h3>
                    <button onClick={onClose} className="text-white hover:text-gray-200 text-2xl">&times;</button>
                </div>

                <div className="p-8">
                    {/* Header Details */}
                    <div className="flex justify-between border-b pb-4 mb-6">
                        <div>
                            <p className="text-sm text-gray-500 uppercase">Employee Name</p>
                            <p className="font-semibold text-lg">{empName}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500 uppercase">Employee ID</p>
                            <p className="font-semibold">{empCode}</p>
                        </div>
                    </div>

                    {/* Attendance Summary */}
                    <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100 flex justify-between text-sm text-gray-600">
                        <div><span className="font-bold">Total Days:</span> {attendanceSummary.totalDays}</div>
                        <div><span className="font-bold text-green-600">Paid Days:</span> {attendanceSummary.paidDays}</div>
                        <div><span className="font-bold text-red-600">LOP Days:</span> {attendanceSummary.lopDays}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        {/* Earnings */}
                        <div>
                            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-b mb-3 pb-1">Earnings</h4>
                            <div className="flex justify-between py-1 border-b border-dashed border-gray-200">
                                <span>Basic Salary</span>
                                <span>₹ {salaryComponents.base.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-dashed border-gray-200">
                                <span>HRA</span>
                                <span>₹ {salaryComponents.hra.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-dashed border-gray-200">
                                <span>Conveyance</span>
                                <span>₹ {salaryComponents.conveyance.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-dashed border-gray-200">
                                <span>Special Allow.</span>
                                <span>₹ {salaryComponents.specialAllowance.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between py-2 mt-2 font-bold text-gray-800">
                                <span>Gross Earnings</span>
                                <span>₹ {salaryComponents.grossSalary.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Deductions */}
                        <div>
                            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-b mb-3 pb-1">Deductions</h4>
                            <div className="flex justify-between py-1 border-b border-dashed border-gray-200">
                                <span>Provident Fund</span>
                                <span>₹ {deductions.pf.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-dashed border-gray-200">
                                <span>ESI</span>
                                <span>₹ {deductions.esi.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-dashed border-gray-200">
                                <span>Prof. Tax</span>
                                <span>₹ {deductions.pt.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-dashed border-gray-200">
                                <span>TDS</span>
                                <span>₹ {(deductions.tds || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between py-2 mt-2 font-bold text-red-600">
                                <span>Total Deductions</span>
                                <span>₹ {deductions.totalDeductions.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Net Pay */}
                    <div className="mt-8 bg-blue-50 p-4 rounded-lg flex justify-between items-center border border-blue-100">
                        <div className="text-blue-800 font-medium uppercase tracking-wider">Net Salary Payable</div>
                        <div className="text-3xl font-bold text-blue-700">₹ {netSalary.toLocaleString()}</div>
                    </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 text-center">
                    <button onClick={onClose} className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-100 font-medium">Close View</button>
                    <button className="ml-3 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium">Download PDF</button>
                </div>
            </div>
        </div>
    );
};

export default SalarySlip;
