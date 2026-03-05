import React, { useState, useEffect, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';
import { RefreshCw, MapPin, Building, LogOut } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:9999';

const BranchQRDisplay = () => {
    const [qrData, setQrData] = useState(null);
    const [countdown, setCountdown] = useState(0);
    const [loading, setLoading] = useState(true);

    // Get user data from local storage to verify this is a BRANCH_QR login
    const [user] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));
    const [token] = useState(() => localStorage.getItem('token'));

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    };

    // If not a branch QR user, kick them out
    useEffect(() => {
        if (!user || user.role !== 'BRANCH_QR') {
            handleLogout();
        }
    }, [user]);

    const generateQR = useCallback(async () => {
        setLoading(true);
        try {
            // BRANCH_QR users call /generate/self — the server resolves the branchId from the token
            const res = await axios.get(`${API_URL}/api/v1/qr/generate/self`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setQrData(res.data.data);
                setCountdown(res.data.data.expiresIn);
            }
        } catch (err) {
            console.error("Failed to fetch QR:", err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    // Initial Fetch on mount
    useEffect(() => {
        generateQR();
    }, [generateQR]);

    // Auto-refresh timer
    useEffect(() => {
        if (!qrData) return;
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    generateQR(); // Auto-refresh when hitting 0
                    return qrData.expiresIn; // Temporary placeholder until new request completes
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [qrData, generateQR]);

    const scanUrl = qrData ? `${window.location.origin}/scan/${qrData.token}` : '';

    return (
        <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-8 relative overflow-hidden font-sans text-white">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-violet-600/20 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 z-0"></div>
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/4 z-0"></div>

            {/* Header / Admin controls */}
            <div className="absolute top-6 right-6 z-20">
                <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-colors text-slate-300 hover:text-white backdrop-blur-md">
                    <LogOut size={16} /> Exit Display Mode
                </button>
            </div>

            <div className="z-10 flex flex-col items-center w-full max-w-4xl">

                {/* Branding */}
                <div className="flex items-center gap-4 mb-12">
                    <div className="h-16 w-16 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30">
                        <span className="text-3xl font-bold">M</span>
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">Maitrii<span className="text-violet-500">Tech</span></h1>
                        <p className="text-slate-400 font-medium">Smart Attendance Check-in</p>
                    </div>
                </div>

                {/* Main QR Card */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-12 rounded-[2.5rem] shadow-2xl flex flex-col lg:flex-row items-center gap-16">

                    {/* Left Side: Instructions */}
                    <div className="flex-1 space-y-8 max-w-sm">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-semibold mb-6">
                                <Building size={18} />
                                {user.name}
                            </div>
                            <h2 className="text-4xl font-bold leading-tight mb-4">Scan to register attendance</h2>
                            <p className="text-slate-400 text-lg">Use your smartphone camera to scan the QR code and log your entry/exit.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                <div className="h-10 w-10 bg-violet-500/20 rounded-xl flex items-center justify-center text-violet-400 font-bold shrink-0">1</div>
                                <p className="text-slate-300">Open your mobile camera or preferred QR scanner app</p>
                            </div>
                            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                <div className="h-10 w-10 bg-violet-500/20 rounded-xl flex items-center justify-center text-violet-400 font-bold shrink-0">2</div>
                                <p className="text-slate-300">Point at the QR code and tap the notification link</p>
                            </div>
                            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                                <div className="h-10 w-10 bg-violet-500/20 rounded-xl flex items-center justify-center text-violet-400 font-bold shrink-0">3</div>
                                <p className="text-slate-300">Enter your Employee ID to successfully check in/out</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: QR Code Area */}
                    <div className="relative group shrink-0">
                        {loading && !qrData ? (
                            <div className="w-[400px] h-[400px] bg-white rounded-[2rem] flex items-center justify-center">
                                <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <>
                                <div className="bg-white p-6 rounded-[2rem] shadow-[0_0_60px_rgba(139,92,246,0.2)] transition-all">
                                    <QRCodeSVG
                                        value={scanUrl}
                                        size={350}
                                        level="H"
                                        includeMargin={true}
                                        bgColor="#ffffff"
                                        fgColor="#0F172A"
                                        className="rounded-xl shadow-inner"
                                    />

                                    {/* Security Refresh Indicator embedded below QR */}
                                    <div className="mt-6 flex flex-col items-center justify-center gap-2">
                                        <div className="flex items-center gap-2 text-slate-800 font-bold">
                                            <RefreshCw size={18} className={`text-violet-600 ${countdown <= 30 ? 'animate-spin' : ''}`} />
                                            <span>Auto-refreshing in {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-1000 ease-linear ${countdown <= 30 ? 'bg-red-500' : 'bg-violet-500'}`}
                                                style={{ width: `${(countdown / (qrData?.expiresIn || 300)) * 100}%` }}
                                            />
                                        </div>
                                        <p className="text-[11px] text-slate-400 font-medium">Dynamic secure token • <MapPin size={10} className="inline mb-0.5" /> Area geofenced</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <p className="mt-12 text-slate-500 text-sm font-medium">Maitrii System Secure Kiosk • Display Mode Active</p>
            </div>
        </div>
    );
};

export default BranchQRDisplay;
