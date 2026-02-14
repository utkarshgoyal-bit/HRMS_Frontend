import React, { useState, useEffect, useCallback } from 'react';
import MainLayout from '../layouts/MainLayout';
import { QrCode, Clock, CheckCircle, XCircle, Users, Filter, RefreshCw, MapPin, Shield } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:9999';

const Attendance = () => {
    const [activeTab, setActiveTab] = useState('qr');
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    return (
        <MainLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Attendance</h1>
                <p className="text-slate-500 mt-1">QR-based attendance with approval workflow.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-8 w-fit">
                {[
                    { id: 'qr', label: 'QR Generator', icon: QrCode },
                    { id: 'pending', label: 'Pending Approvals', icon: Clock },
                    { id: 'log', label: 'Attendance Log', icon: Users }
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        <tab.icon size={16} />{tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'qr' && <QRGenerator headers={headers} />}
            {activeTab === 'pending' && <PendingApprovals headers={headers} />}
            {activeTab === 'log' && <AttendanceLog headers={headers} />}
        </MainLayout>
    );
};

// ===================================================================
// TAB 1: QR GENERATOR
// ===================================================================
const QRGenerator = ({ headers }) => {
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [qrData, setQrData] = useState(null);
    const [countdown, setCountdown] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/v1/branches`, { headers });
            if (res.data.success) setBranches(res.data.data);
        } catch (err) { console.error(err); }
    };

    const generateQR = useCallback(async () => {
        if (!selectedBranch) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/v1/qr/generate/${selectedBranch}`, { headers });
            if (res.data.success) {
                setQrData(res.data.data);
                setCountdown(res.data.data.expiresIn);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [selectedBranch, headers]);

    // Auto-refresh timer
    useEffect(() => {
        if (!qrData) return;
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    generateQR(); // Auto-refresh
                    return qrData.expiresIn;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [qrData, generateQR]);

    const scanUrl = qrData ? `${window.location.origin}/scan/${qrData.token}` : '';

    return (
        <div className="glass rounded-2xl p-8 animate-fade-in-up">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <QrCode className="text-violet-500" size={22} /> Branch QR Code
            </h3>

            {/* Branch Selector */}
            <div className="mb-6 max-w-sm">
                <label className="block text-sm font-medium text-slate-600 mb-2">Select Branch</label>
                <select
                    value={selectedBranch}
                    onChange={e => { setSelectedBranch(e.target.value); setQrData(null); }}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none text-sm"
                >
                    <option value="">-- Choose a branch --</option>
                    {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
            </div>

            {selectedBranch && !qrData && (
                <button onClick={generateQR} disabled={loading}
                    className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg shadow-lg shadow-violet-500/20 transition-all active:scale-95">
                    {loading ? 'Generating...' : 'Generate QR Code'}
                </button>
            )}

            {/* QR Display */}
            {qrData && (
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* QR Code */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-violet-100 flex flex-col items-center">
                        <QRCodeSVG value={scanUrl} size={240} level="H" includeMargin={true}
                            bgColor="#ffffff" fgColor="#1e1b4b" />
                        <p className="text-xs text-slate-500 mt-3 font-mono">{qrData.branchName}</p>
                    </div>

                    {/* Info Panel */}
                    <div className="space-y-4 flex-1">
                        {/* Countdown */}
                        <div className="p-4 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl border border-violet-100">
                            <div className="flex items-center gap-3 mb-2">
                                <RefreshCw size={16} className={`text-violet-500 ${countdown <= 30 ? 'animate-spin' : ''}`} />
                                <span className="text-sm font-bold text-slate-700">Auto-refresh in</span>
                            </div>
                            <div className="text-3xl font-mono font-bold text-violet-700">
                                {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">QR rotates every {qrData.expiresIn / 60} minutes for security</p>
                        </div>

                        {/* Instructions */}
                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                            <h4 className="font-bold text-emerald-800 text-sm mb-2 flex items-center gap-2"><MapPin size={14} /> How it works</h4>
                            <ol className="text-xs text-emerald-700 space-y-1 list-decimal pl-4">
                                <li>Display this QR at the branch entrance</li>
                                <li>Employee scans with phone camera</li>
                                <li>Employee enters their Employee ID and allows location</li>
                                <li>System verifies location is within range</li>
                                <li>Attendance request is sent for approval</li>
                            </ol>
                        </div>

                        <button onClick={() => { setQrData(null); setSelectedBranch(''); }}
                            className="text-xs text-slate-500 hover:text-slate-700 underline">
                            Stop & Select Different Branch
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// ===================================================================
// TAB 2: PENDING APPROVALS
// ===================================================================
const PendingApprovals = ({ headers }) => {
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => { fetchPending(); }, []);

    const fetchPending = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/v1/attendance/pending`, { headers });
            if (res.data.success) setPending(res.data.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleAction = async (id, action) => {
        setActionLoading(id);
        try {
            await axios.put(`${API_URL}/api/v1/attendance/${id}/approve`, { action }, { headers });
            setPending(prev => prev.filter(p => p._id !== id));
        } catch (err) { console.error(err); }
        finally { setActionLoading(null); }
    };

    return (
        <div className="glass rounded-2xl p-8 animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Clock className="text-amber-500" size={22} /> Pending Approvals
                    {pending.length > 0 && (
                        <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">{pending.length}</span>
                    )}
                </h3>
                <button onClick={fetchPending} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <RefreshCw size={16} className="text-slate-400" />
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12 text-slate-400">Loading...</div>
            ) : pending.length === 0 ? (
                <div className="text-center py-16">
                    <CheckCircle size={48} className="mx-auto text-emerald-300 mb-3" />
                    <p className="text-slate-500 font-medium">All caught up!</p>
                    <p className="text-slate-400 text-sm">No pending attendance requests.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {pending.map(record => (
                        <div key={record._id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:shadow-sm transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                                    {record.employeeId?.personal?.firstName?.[0] || '?'}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-700 text-sm">
                                        {record.employeeId?.personal?.firstName} {record.employeeId?.personal?.lastName}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {record.employeeId?.professional?.employeeId} • {record.branchId?.name || 'Unknown Branch'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-right mr-3">
                                    <p className="text-xs text-slate-500">{new Date(record.punchIn).toLocaleTimeString()}</p>
                                    {record.location_data?.distance_from_base != null && (
                                        <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                            <MapPin size={10} /> {record.location_data.distance_from_base}m away
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleAction(record._id, 'Approved')}
                                    disabled={actionLoading === record._id}
                                    className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors"
                                    title="Approve"
                                >
                                    <CheckCircle size={18} />
                                </button>
                                <button
                                    onClick={() => handleAction(record._id, 'Rejected')}
                                    disabled={actionLoading === record._id}
                                    className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors"
                                    title="Reject"
                                >
                                    <XCircle size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ===================================================================
// TAB 3: ATTENDANCE LOG
// ===================================================================
const AttendanceLog = ({ headers }) => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    useEffect(() => { fetchRecords(); }, [month, year]);

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/v1/attendance?month=${month}&year=${year}`, { headers });
            if (res.data.success) setRecords(res.data.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const statusColors = {
        Present: 'bg-emerald-50 text-emerald-600',
        Absent: 'bg-red-50 text-red-600',
        'Half-Day': 'bg-amber-50 text-amber-600',
        Leave: 'bg-blue-50 text-blue-600',
        Holiday: 'bg-purple-50 text-purple-600',
        Late: 'bg-orange-50 text-orange-600',
        'Week-Off': 'bg-slate-50 text-slate-506'
    };

    const approvalColors = {
        Approved: 'text-emerald-600',
        Rejected: 'text-red-500',
        Pending: 'text-amber-500',
        Auto: 'text-blue-500'
    };

    return (
        <div className="glass rounded-2xl p-8 animate-fade-in-up">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Users className="text-blue-500" size={22} /> Attendance Log
                </h3>
                <div className="flex items-center gap-3">
                    <select value={month} onChange={e => setMonth(Number(e.target.value))}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none">
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>{new Date(2025, i).toLocaleString('default', { month: 'long' })}</option>
                        ))}
                    </select>
                    <select value={year} onChange={e => setYear(Number(e.target.value))}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none">
                        {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-slate-400">Loading...</div>
            ) : records.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                    <Filter size={48} className="mx-auto mb-3 opacity-30" />
                    <p>No attendance records for this period.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50/80 text-slate-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-4 py-3">Employee</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-3 py-3 text-center">Status</th>
                                <th className="px-3 py-3">Check-in</th>
                                <th className="px-3 py-3">Check-out</th>
                                <th className="px-3 py-3 text-center">Duration</th>
                                <th className="px-3 py-3 text-center">Method</th>
                                <th className="px-3 py-3 text-center">Approval</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {records.map(r => (
                                <tr key={r._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <p className="font-semibold text-slate-700 text-sm">
                                            {r.employeeId?.personal?.firstName} {r.employeeId?.personal?.lastName}
                                        </p>
                                        <p className="text-xs text-slate-400">{r.employeeId?.professional?.employeeId}</p>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-600">{new Date(r.date).toLocaleDateString()}</td>
                                    <td className="px-3 py-3 text-center">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[r.status] || 'bg-slate-50 text-slate-400'}`}>{r.status}</span>
                                    </td>
                                    <td className="px-3 py-3 text-xs font-mono text-slate-600">{r.punchIn ? new Date(r.punchIn).toLocaleTimeString() : '-'}</td>
                                    <td className="px-3 py-3 text-xs font-mono text-slate-600">{r.punchOut ? new Date(r.punchOut).toLocaleTimeString() : '-'}</td>
                                    <td className="px-3 py-3 text-center text-xs font-mono text-slate-600">{r.duration ? `${Math.floor(r.duration / 60)}h ${r.duration % 60}m` : '-'}</td>
                                    <td className="px-3 py-3 text-center">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">{r.verification_method || '-'}</span>
                                    </td>
                                    <td className="px-3 py-3 text-center">
                                        <span className={`text-xs font-bold ${approvalColors[r.approval_status] || 'text-slate-400'}`}>
                                            {r.approval_status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Attendance;
