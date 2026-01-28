import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../layouts/MainLayout';
import { Banknote, Calendar, CheckCircle, AlertCircle, Play, FileText, Download, ChevronRight } from 'lucide-react';

const Payroll = () => {
    const [step, setStep] = useState(1); // 1: Select, 2: Confirm, 3: Success
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(false);
    const [payrolls, setPayrolls] = useState([]);
    const [stats, setStats] = useState({ totalPaid: 0, pending: 0 });

    const fetchPayrolls = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://127.0.0.1:9999/api/v1/payroll?month=${month}&year=${year}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setPayrolls(res.data.data);
                // Simple stats calc
                const total = res.data.data.reduce((acc, curr) => acc + (curr.netSalary || 0), 0);
                setStats({ totalPaid: total, pending: 0 }); // Todo: Real pending count
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
        try {
            const token = localStorage.getItem('token');
            // Mock: In real app, we might loop through all employees or hit a bulk endpoint
            // For now, we just rely on individual generation or a 'bulk' placeholders
            // This button might trigger a 'bulk generate' logic if the backend supported it
            // For MVP, we'll just refresh or show a message

            // Simulating a bulk process delay
            await new Promise(r => setTimeout(r, 1500));

            setStep(3);
            fetchPayrolls();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Payroll Management</h1>
                <p className="text-slate-500 mt-1">Process salaries and manage payslips.</p>
            </div>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="glass p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                    <div className="relative z-10">
                        <p className="text-sm font-semibold text-slate-500 uppercase">Total Disbursed</p>
                        <h3 className="text-3xl font-bold text-slate-800 mt-1">₹{stats.totalPaid.toLocaleString()}</h3>
                        <p className="text-xs text-emerald-600 font-medium mt-2 bg-emerald-50 inline-block px-2 py-1 rounded">This Month</p>
                    </div>
                    <div className="absolute right-0 bottom-0 p-4 opacity-10">
                        <Banknote size={80} className="text-emerald-600" />
                    </div>
                </div>

                <div className="glass p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                    <div className="relative z-10">
                        <p className="text-sm font-semibold text-slate-500 uppercase">Pending Review</p>
                        <h3 className="text-3xl font-bold text-slate-800 mt-1">{stats.pending}</h3>
                        <p className="text-xs text-amber-600 font-medium mt-2 bg-amber-50 inline-block px-2 py-1 rounded">Action Required</p>
                    </div>
                    <div className="absolute right-0 bottom-0 p-4 opacity-10">
                        <AlertCircle size={80} className="text-amber-600" />
                    </div>
                </div>

                {/* Generator Card */}
                <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-6 rounded-2xl text-white relative overflow-hidden shadow-lg shadow-violet-500/30">
                    <div className="relative z-10">
                        <h3 className="text-lg font-bold">Run Payroll</h3>
                        <p className="text-violet-200 text-sm mb-4">Generate slips for {new Date(year, month - 1).toLocaleString('default', { month: 'long' })} {year}</p>

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
                                <p className="text-xs bg-white/10 p-2 rounded">Confirm generation for all active employees?</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleGenerate}
                                        disabled={loading}
                                        className="bg-white text-violet-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-violet-50 transition-colors"
                                    >
                                        {loading ? 'Processing...' : 'Confirm'}
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
                                <span className="flex items-center text-sm font-bold mb-2"><CheckCircle size={16} className="mr-1" /> Done!</span>
                                <button
                                    onClick={() => setStep(1)}
                                    className="text-xs underline opacity-80 hover:opacity-100"
                                >
                                    Run Another
                                </button>
                            </div>
                        )}
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

            {/* List */}
            <div className="glass rounded-2xl overflow-hidden border border-slate-200/50">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800">Generated Slips</h3>
                </div>
                {payrolls.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                        <FileText size={48} className="mx-auto mb-3 opacity-30" />
                        <p>No payroll records found for this period.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {payrolls.map((slip) => (
                            <div key={slip._id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                        {slip.employeeId?.personal?.firstName?.[0]}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-700">{slip.employeeId?.personal?.firstName} {slip.employeeId?.personal?.lastName}</p>
                                        <p className="text-xs text-slate-400">{slip.employeeId?.professional?.employeeId}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-slate-800">₹{slip.netSalary?.toLocaleString()}</p>
                                    <p className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded inline-block">{slip.status}</p>
                                </div>
                                <button className="p-2 hover:bg-violet-50 text-slate-400 hover:text-violet-600 rounded-lg transition-colors">
                                    <Download size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default Payroll;
