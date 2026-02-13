import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../layouts/MainLayout';
import { Banknote, Calendar, CheckCircle, AlertCircle, Play, FileText, Download, ChevronRight, Users, TrendingUp } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:9999';

const Payroll = () => {
    const [step, setStep] = useState(1); // 1: Select, 2: Confirm, 3: Success
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(false);
    const [payrolls, setPayrolls] = useState([]);
    const [stats, setStats] = useState({ totalPaid: 0, totalEmployees: 0, pending: 0 });
    const [generateResults, setGenerateResults] = useState(null);
    const [error, setError] = useState('');

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    const fetchPayrolls = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/v1/payroll?month=${month}&year=${year}`, { headers });
            if (res.data.success) {
                setPayrolls(res.data.data);
                const total = res.data.data.reduce((acc, curr) => acc + (curr.netPay || 0), 0);
                const processed = res.data.data.filter(s => s.status === 'Processed').length;
                const draft = res.data.data.filter(s => s.status === 'Draft').length;
                setStats({ totalPaid: total, totalEmployees: res.data.data.length, pending: draft });
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchPayrolls();
    }, [month, year]);

    const handleGenerate = async () => {
        setLoading(true);
        setError('');
        setGenerateResults(null);
        try {
            const res = await axios.post(`${API_URL}/api/v1/payroll/bulk-generate`,
                { month, year },
                { headers }
            );

            if (res.data.success) {
                setGenerateResults({ ...res.data.results, orgLevelCosts: res.data.orgLevelCosts });
                setStep(3);
                fetchPayrolls();
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to generate payroll');
        } finally {
            setLoading(false);
        }
    };

    const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

    return (
        <MainLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Payroll Management</h1>
                <p className="text-slate-500 mt-1">Process salaries and manage payslips — all deductions are auto-calculated from your org config.</p>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="glass p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                    <div className="relative z-10">
                        <p className="text-sm font-semibold text-slate-500 uppercase">Total Disbursed</p>
                        <h3 className="text-3xl font-bold text-slate-800 mt-1">₹{stats.totalPaid.toLocaleString()}</h3>
                        <p className="text-xs text-emerald-600 font-medium mt-2 bg-emerald-50 inline-block px-2 py-1 rounded">{monthName} {year}</p>
                    </div>
                    <div className="absolute right-0 bottom-0 p-4 opacity-10">
                        <Banknote size={80} className="text-emerald-600" />
                    </div>
                </div>

                <div className="glass p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                    <div className="relative z-10">
                        <p className="text-sm font-semibold text-slate-500 uppercase">Employees Processed</p>
                        <h3 className="text-3xl font-bold text-slate-800 mt-1">{stats.totalEmployees}</h3>
                        <p className="text-xs text-blue-600 font-medium mt-2 bg-blue-50 inline-block px-2 py-1 rounded">
                            <Users size={12} className="inline mr-1" />Total Slips
                        </p>
                    </div>
                    <div className="absolute right-0 bottom-0 p-4 opacity-10">
                        <TrendingUp size={80} className="text-blue-600" />
                    </div>
                </div>

                {/* Generator Card */}
                <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-6 rounded-2xl text-white relative overflow-hidden shadow-lg shadow-violet-500/30">
                    <div className="relative z-10">
                        <h3 className="text-lg font-bold">Run Payroll</h3>
                        <p className="text-violet-200 text-sm mb-4">Generate slips for {monthName} {year}</p>

                        {step === 1 && (
                            <button
                                onClick={() => setStep(2)}
                                className="bg-white text-violet-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-violet-50 transition-colors"
                            >
                                <Play size={16} className="mr-2" /> Start Process
                            </button>
                        )}
                        {step === 2 && (
                            <div className="space-y-3">
                                <p className="text-xs bg-white/10 p-2 rounded">This will generate salary slips for all active employees using your org's payroll config.</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleGenerate}
                                        disabled={loading}
                                        className="bg-white text-violet-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-violet-50 transition-colors"
                                    >
                                        {loading ? 'Processing...' : 'Confirm & Generate'}
                                    </button>
                                    <button
                                        onClick={() => setStep(1)}
                                        className="bg-transparent border border-white/30 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-white/10 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                        {step === 3 && (
                            <div className="flex flex-col items-start">
                                <span className="flex items-center text-sm font-bold mb-1"><CheckCircle size={16} className="mr-1" /> Done!</span>
                                {generateResults && (
                                    <div className="text-xs text-violet-200 mb-2 space-y-1">
                                        <p>{generateResults.success.length} processed | ₹{generateResults.totalNetPay?.toLocaleString()} total
                                            {generateResults.failed.length > 0 && ` | ${generateResults.failed.length} failed`}</p>
                                        {generateResults.orgLevelCosts?.adminChargeShortfall > 0 && (
                                            <p className="bg-amber-500/20 p-1.5 rounded text-amber-100">⚠ Admin Charge shortfall: ₹{generateResults.orgLevelCosts.adminChargeShortfall} (org minimum applies)</p>
                                        )}
                                    </div>
                                )}
                                <button
                                    onClick={() => { setStep(1); setGenerateResults(null); }}
                                    className="text-xs underline opacity-80 hover:opacity-100"
                                >
                                    Run Another
                                </button>
                            </div>
                        )}
                        {error && <p className="text-xs text-red-200 mt-2 bg-red-500/20 p-2 rounded">{error}</p>}
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="glass p-4 rounded-xl mb-6 flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-600">Period:</span>
                </div>
                <select
                    value={month}
                    onChange={e => setMonth(parseInt(e.target.value))}
                    className="bg-slate-50 border-none rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-violet-500"
                >
                    {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                    ))}
                </select>
                <select
                    value={year}
                    onChange={e => setYear(parseInt(e.target.value))}
                    className="bg-slate-50 border-none rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-violet-500"
                >
                    <option value={2024}>2024</option>
                    <option value={2025}>2025</option>
                    <option value={2026}>2026</option>
                </select>
            </div>

            {/* Salary Slips Table */}
            <div className="glass rounded-2xl overflow-hidden border border-slate-200/50">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Generated Slips</h3>
                    <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium">{payrolls.length} records</span>
                </div>
                {payrolls.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                        <FileText size={48} className="mx-auto mb-3 opacity-30" />
                        <p>No payroll records found for this period.</p>
                        <p className="text-xs mt-1">Click "Start Process" above to generate salary slips.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50/80 text-slate-500 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="px-5 py-3">Employee</th>
                                    <th className="px-3 py-3 text-center">Days</th>
                                    <th className="px-3 py-3 text-right">Gross</th>
                                    <th className="px-2 py-3 text-right">PF (Emp)</th>
                                    <th className="px-2 py-3 text-right">EPS</th>
                                    <th className="px-2 py-3 text-right">EPF (Empr)</th>
                                    <th className="px-2 py-3 text-right">EDLI</th>
                                    <th className="px-3 py-3 text-right">ESI</th>
                                    <th className="px-3 py-3 text-right">PT</th>
                                    <th className="px-3 py-3 text-right">Net Pay</th>
                                    <th className="px-3 py-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {payrolls.map((slip) => (
                                    <tr key={slip._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                                                    {slip.employeeId?.personal?.firstName?.[0] || '?'}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-700 text-sm">
                                                        {slip.employeeId?.personal?.firstName} {slip.employeeId?.personal?.lastName}
                                                    </p>
                                                    <p className="text-xs text-slate-400">{slip.employeeId?.professional?.designation}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-4 text-center text-slate-600 font-mono text-xs">{slip.workedDays}</td>
                                        <td className="px-3 py-4 text-right text-slate-700 font-mono text-xs">₹{slip.earnings?.gross?.toLocaleString()}</td>
                                        <td className="px-2 py-4 text-right text-red-500 font-mono text-xs" title="Employee PF Contribution">-₹{slip.deductions?.pf_employee?.toLocaleString() || 0}</td>
                                        <td className="px-2 py-4 text-right text-blue-500 font-mono text-xs" title="Employer EPS (Pension) - 8.33%">₹{slip.deductions?.eps_employer?.toLocaleString() || 0}</td>
                                        <td className="px-2 py-4 text-right text-blue-500 font-mono text-xs" title="Employer EPF Share - 3.67%">₹{slip.deductions?.epf_employer_share?.toLocaleString() || 0}</td>
                                        <td className="px-2 py-4 text-right text-blue-500 font-mono text-xs" title="EDLI Insurance (Capped at ₹15k)">₹{slip.deductions?.edli_employer?.toLocaleString() || 0}</td>
                                        <td className="px-3 py-4 text-right text-red-500 font-mono text-xs">-₹{slip.deductions?.esi_employee?.toLocaleString() || 0}</td>
                                        <td className="px-3 py-4 text-right text-red-500 font-mono text-xs">-₹{slip.deductions?.pt?.toLocaleString() || 0}</td>
                                        <td className="px-3 py-4 text-right font-bold text-slate-800 font-mono text-sm">₹{slip.netPay?.toLocaleString()}</td>
                                        <td className="px-4 py-4 text-center">
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${slip.status === 'Paid'
                                                ? 'bg-emerald-50 text-emerald-600'
                                                : slip.status === 'Processed'
                                                    ? 'bg-blue-50 text-blue-600'
                                                    : 'bg-amber-50 text-amber-600'
                                                }`}>{slip.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default Payroll;
