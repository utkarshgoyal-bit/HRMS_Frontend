import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Send, CheckCircle, XCircle, AlertTriangle, Loader2, QrCode } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:9999';

const QRScan = () => {
    const { token } = useParams();
    const [employeeCode, setEmployeeCode] = useState('');
    const [location, setLocation] = useState(null);
    const [locationError, setLocationError] = useState('');
    const [loading, setLoading] = useState(false);
    const [locating, setLocating] = useState(true);
    const [result, setResult] = useState(null); // { success, message, type }

    // Auto-fetch location on mount
    useEffect(() => {
        if (navigator.geolocation) {
            setLocating(true);
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setLocation({
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude
                    });
                    setLocating(false);
                },
                (err) => {
                    setLocationError('Location access denied. Please enable GPS and refresh.');
                    setLocating(false);
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        } else {
            setLocationError('Geolocation is not supported by your browser.');
            setLocating(false);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!employeeCode.trim()) return;

        setLoading(true);
        setResult(null);

        try {
            const res = await axios.post(`${API_URL}/api/v1/qr/submit`, {
                qrToken: token,
                employeeCode: employeeCode.trim(),
                latitude: location?.latitude,
                longitude: location?.longitude
            });

            setResult({
                success: true,
                message: res.data.message,
                type: res.data.type
            });

        } catch (err) {
            setResult({
                success: false,
                message: err.response?.data?.message || 'Failed to submit attendance. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 flex items-center justify-center px-4">
            <div className="w-full max-w-md">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-violet-500/30 mb-4">
                        <QrCode size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Attendance Check-in</h1>
                    <p className="text-violet-300 text-sm mt-1">Enter your Employee ID to record attendance</p>
                </div>

                {/* Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">

                    {/* Result Display */}
                    {result && (
                        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${result.success ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
                            {result.success
                                ? <CheckCircle size={20} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                                : <XCircle size={20} className="text-red-400 mt-0.5 flex-shrink-0" />
                            }
                            <div>
                                <p className={`text-sm font-medium ${result.success ? 'text-emerald-200' : 'text-red-200'}`}>{result.message}</p>
                                {result.type === 'check_in' && <p className="text-xs text-emerald-300/60 mt-1">You can scan again later to check out.</p>}
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    {!result?.success && (
                        <form onSubmit={handleSubmit} className="space-y-5">

                            {/* Employee ID */}
                            <div>
                                <label className="block text-xs font-medium text-violet-200 mb-2">Employee ID</label>
                                <input
                                    type="text"
                                    value={employeeCode}
                                    onChange={e => setEmployeeCode(e.target.value)}
                                    placeholder="e.g., EMP001"
                                    className="w-full p-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-sm font-mono"
                                    autoFocus
                                    required
                                />
                            </div>

                            {/* Location Status */}
                            <div className={`p-3 rounded-xl flex items-center gap-3 ${locating ? 'bg-blue-500/10 border border-blue-500/20' : location ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                                {locating ? (
                                    <>
                                        <Loader2 size={16} className="text-blue-400 animate-spin" />
                                        <span className="text-xs text-blue-300">Detecting location...</span>
                                    </>
                                ) : location ? (
                                    <>
                                        <MapPin size={16} className="text-emerald-400" />
                                        <span className="text-xs text-emerald-300">
                                            Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <AlertTriangle size={16} className="text-red-400" />
                                        <span className="text-xs text-red-300">{locationError}</span>
                                    </>
                                )}
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading || locating || !location}
                                className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-violet-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <><Loader2 size={18} className="animate-spin" /> Submitting...</>
                                ) : (
                                    <><Send size={18} /> Submit Attendance</>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Submit Another */}
                    {result?.success && (
                        <button
                            onClick={() => { setResult(null); setEmployeeCode(''); }}
                            className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all text-sm"
                        >
                            Submit for Another Employee
                        </button>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-white/20 text-[10px] mt-6">Powered by HRMS • QR Attendance System</p>
            </div>
        </div>
    );
};

export default QRScan;
