import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { User, Lock, Bell, Save, Shield, Mail, Key, Banknote, ToggleLeft, ToggleRight, Plus, Trash2, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:9999';

const Toggle = ({ enabled, onToggle, label }) => (
    <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <button onClick={onToggle} className="focus:outline-none">
            {enabled ? <ToggleRight size={28} className="text-violet-600" /> : <ToggleLeft size={28} className="text-slate-300" />}
        </button>
    </div>
);

const ConfigInput = ({ label, value, onChange, suffix = '', type = 'number', hint }) => (
    <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
        <div className="relative">
            <input
                type={type}
                value={value}
                onChange={e => onChange(type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none text-sm pr-8"
            />
            {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">{suffix}</span>}
        </div>
        {hint && <p className="text-[10px] text-slate-400 mt-0.5">{hint}</p>}
    </div>
);

const Settings = () => {
    const [activeTab, setActiveTab] = useState('account');
    const [loading, setLoading] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');
    const [user] = useState({ user: JSON.parse(localStorage.getItem('user')) || { name: 'Admin', email: 'admin@demo.com' } });

    const [config, setConfig] = useState(null);
    const [configLoading, setConfigLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'payroll') fetchConfig();
    }, [activeTab]);

    const fetchConfig = async () => {
        setConfigLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/v1/salary-config`, { headers: { Authorization: `Bearer ${token}` } });
            if (res.data.success) setConfig(res.data.data);
        } catch (err) { console.error('Failed to fetch config:', err); }
        finally { setConfigLoading(false); }
    };

    const saveConfig = async () => {
        setLoading(true); setSaveMsg('');
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`${API_URL}/api/v1/salary-config`, config, { headers: { Authorization: `Bearer ${token}` } });
            if (res.data.success) { setConfig(res.data.data); setSaveMsg('Configuration saved successfully!'); setTimeout(() => setSaveMsg(''), 3000); }
        } catch (err) { setSaveMsg('Failed to save: ' + (err.response?.data?.message || err.message)); }
        finally { setLoading(false); }
    };

    const updateConfig = (path, value) => {
        setConfig(prev => {
            const updated = JSON.parse(JSON.stringify(prev));
            const keys = path.split('.');
            let obj = updated;
            for (let i = 0; i < keys.length - 1; i++) { obj = obj[keys[i]]; }
            obj[keys[keys.length - 1]] = value;
            return updated;
        });
    };

    const addPTSlab = () => {
        setConfig(prev => {
            const updated = JSON.parse(JSON.stringify(prev));
            if (!updated.pt.state_slabs) updated.pt.state_slabs = [];
            updated.pt.state_slabs.push({ min_gross: 0, max_gross: 0, amount: 0 });
            return updated;
        });
    };

    const removePTSlab = (index) => {
        setConfig(prev => {
            const updated = JSON.parse(JSON.stringify(prev));
            updated.pt.state_slabs.splice(index, 1);
            return updated;
        });
    };

    const updatePTSlab = (index, field, value) => {
        setConfig(prev => {
            const updated = JSON.parse(JSON.stringify(prev));
            updated.pt.state_slabs[index][field] = parseFloat(value) || 0;
            return updated;
        });
    };

    return (
        <MainLayout>
            <div className="mb-0">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Settings</h1>
                <p className="text-slate-500 mt-1 mb-8">Manage your account preferences, security, and payroll configuration.</p>
            </div>
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Sidebar */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="glass rounded-xl overflow-hidden p-2">
                        {[
                            { id: 'account', label: 'Account', icon: User },
                            { id: 'security', label: 'Security', icon: Lock },
                            { id: 'notifications', label: 'Notifications', icon: Bell },
                            { id: 'payroll', label: 'Payroll Config', icon: Banknote },
                        ].map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-violet-50 text-violet-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
                                <tab.icon size={18} />{tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 w-full">
                    {/* Account */}
                    {activeTab === 'account' && (
                        <div className="glass rounded-2xl p-8 animate-fade-in-up">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><User size={20} className="text-violet-500" />Profile Information</h3>
                            <div className="flex items-center gap-6 mb-8">
                                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg ring-4 ring-white">{user.user.firstName?.[0] || 'A'}</div>
                                <div><button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors">Change Avatar</button><p className="text-xs text-slate-400 mt-2">JPG, GIF or PNG. Max 800K</p></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div><label className="block text-sm font-medium text-slate-700 mb-2">First Name</label><input defaultValue={user.user.firstName} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none text-sm" /></div>
                                <div><label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label><input defaultValue={user.user.lastName} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none text-sm" /></div>
                                <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input defaultValue={user.user.email} disabled className="w-full pl-10 pr-4 py-3 bg-slate-100 border rounded-lg text-slate-500 text-sm cursor-not-allowed" /></div></div>
                            </div>
                            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end"><button className="flex items-center gap-2 px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg shadow-lg shadow-violet-500/20 transition-all active:scale-95"><Save size={18} /> Save Changes</button></div>
                        </div>
                    )}

                    {/* Security */}
                    {activeTab === 'security' && (
                        <div className="glass rounded-2xl p-8 animate-fade-in-up">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Shield size={20} className="text-emerald-500" />Security Settings</h3>
                            <div className="max-w-md space-y-4">
                                <div><label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label><div className="relative"><Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="password" placeholder="••••••••" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" /></div></div>
                                <div><label className="block text-sm font-medium text-slate-700 mb-2">New Password</label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="password" placeholder="Enter new password" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" /></div></div>
                                <button className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm transition-colors shadow-lg shadow-emerald-500/20">Update Password</button>
                            </div>
                        </div>
                    )}

                    {/* Notifications */}
                    {activeTab === 'notifications' && (
                        <div className="glass rounded-2xl p-8 animate-fade-in-up">
                            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Bell size={20} className="text-amber-500" />Notification Preferences</h3>
                            <div className="space-y-6">
                                {[
                                    { title: 'Email Notifications', desc: 'Receive emails about account activity.' },
                                    { title: 'Payroll Alerts', desc: 'Get notified when payroll is generated.' },
                                    { title: 'New Employee Alerts', desc: 'Get notified when a new employee joins.' }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between pb-4 border-b border-slate-100 last:border-0">
                                        <div><p className="font-medium text-slate-800">{item.title}</p><p className="text-sm text-slate-500">{item.desc}</p></div>
                                        <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" className="sr-only peer" defaultChecked /><div className="w-11 h-6 bg-slate-200 peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div></label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* === PAYROLL CONFIG === */}
                    {activeTab === 'payroll' && (
                        <div className="animate-fade-in-up space-y-6">
                            <div className="glass rounded-2xl p-8">
                                <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2"><Banknote size={20} className="text-emerald-500" />Payroll Configuration</h3>
                                <p className="text-sm text-slate-500 mb-6">Configure statutory deductions and payroll rules. All calculations are driven by this config — zero hardcoded values.</p>

                                {configLoading ? (
                                    <div className="text-center py-12 text-slate-400">Loading configuration...</div>
                                ) : config ? (
                                    <div className="space-y-8">

                                        {/* ===== EPF ===== */}
                                        <div className="p-5 bg-blue-50/50 rounded-xl border border-blue-100">
                                            <div className="flex items-center justify-between mb-4">
                                                <div><h4 className="font-bold text-slate-800">Employees' Provident Fund (EPF)</h4><b><p className="text-xs text-slate-500">Contribution on Basic </p></b></div>
                                                <Toggle enabled={config.pf?.enabled} onToggle={() => updateConfig('pf.enabled', !config.pf?.enabled)} label="" />
                                            </div>
                                            {config.pf?.enabled && (
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                    <ConfigInput label="Employee Contribution" value={config.pf?.employee_contribution} onChange={v => updateConfig('pf.employee_contribution', v)} suffix="%" />
                                                    <ConfigInput label="Employer Contribution" value={config.pf?.employer_contribution} onChange={v => updateConfig('pf.employer_contribution', v)} suffix="%" />
                                                    <ConfigInput label="EPS Split (from Employer)" value={config.pf?.eps_split} onChange={v => updateConfig('pf.eps_split', v)} suffix="%" hint="Diverted to Pension" />
                                                    <ConfigInput label="Admin Charge Rate (%)" value={config.pf?.admin_charge_rate} onChange={v => updateConfig('pf.admin_charge_rate', v)} suffix="%" hint="Per-employee %; ₹500 min at org level" />
                                                    <ConfigInput label="EDLI Rate (%)" value={config.pf?.edli_rate} onChange={v => updateConfig('pf.edli_rate', v)} suffix="%" hint="Insurance, capped at ₹15k" />
                                                    <ConfigInput label="Wage Ceiling" value={config.pf?.wage_ceiling} onChange={v => updateConfig('pf.wage_ceiling', v)} suffix="₹" />
                                                    <ConfigInput label="Min Admin Charge (Org)" value={config.pf?.min_admin_charge} onChange={v => updateConfig('pf.min_admin_charge', v)} suffix="₹" hint="Monthly org minimum, NOT per-employee" />
                                                    <Toggle enabled={config.pf?.restrict_contribution_to_ceiling} onToggle={() => updateConfig('pf.restrict_contribution_to_ceiling', !config.pf?.restrict_contribution_to_ceiling)} label="Cap at Ceiling" />
                                                </div>
                                            )}
                                        </div>

                                        {/* ===== ESI ===== */}
                                        <div className="p-5 bg-green-50/50 rounded-xl border border-green-100">
                                            <div className="flex items-center justify-between mb-4">
                                                <div><h4 className="font-bold text-slate-800">Employees' State Insurance (ESI)</h4><b><p className="text-xs text-slate-500">Contribution on ESI Wage (Basic + HRA)</p></b></div>
                                                <Toggle enabled={config.esi?.enabled} onToggle={() => updateConfig('esi.enabled', !config.esi?.enabled)} label="" />
                                            </div>
                                            {config.esi?.enabled && (
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                        <ConfigInput label="Employee Contribution" value={config.esi?.employee_contribution} onChange={v => updateConfig('esi.employee_contribution', v)} suffix="%" />
                                                        <ConfigInput label="Employer Contribution" value={config.esi?.employer_contribution} onChange={v => updateConfig('esi.employer_contribution', v)} suffix="%" />
                                                        <ConfigInput label="Wage Ceiling" value={config.esi?.wage_ceiling} onChange={v => updateConfig('esi.wage_ceiling', v)} suffix="₹" />
                                                    </div>
                                                    <div className="flex items-center gap-3 p-3 bg-green-100/60 rounded-lg">
                                                        <Toggle enabled={config.esi?.exclude_conveyance} onToggle={() => updateConfig('esi.exclude_conveyance', !config.esi?.exclude_conveyance)} label="Exclude Conveyance from ESI Wage" />
                                                        <span className="text-[10px] text-green-700 bg-green-200 px-1.5 py-0.5 rounded font-medium">Supreme Court Ruling</span>
                                                    </div>
                                                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-2">
                                                        <AlertTriangle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                                                        <p className="text-[11px] text-amber-700">ESI follows <strong>Contribution Periods</strong> (Apr-Sep, Oct-Mar). If an employee crosses ₹21k during a period, deductions continue until period end. Set <code>esi_active_until</code> via the Increment module.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* ===== PT ===== */}
                                        <div className="p-5 bg-amber-50/50 rounded-xl border border-amber-100">
                                            <div className="flex items-center justify-between mb-4">
                                                <div><h4 className="font-bold text-slate-800">Professional Tax (PT)</h4><p className="text-xs text-slate-500">State-specific deduction</p></div>
                                                <Toggle enabled={config.pt?.enabled} onToggle={() => updateConfig('pt.enabled', !config.pt?.enabled)} label="" />
                                            </div>
                                            {config.pt?.enabled && (
                                                <div className="space-y-4">
                                                    {/* Mode Selector */}
                                                    <div className="flex gap-2">
                                                        {['flat', 'slab'].map(mode => (
                                                            <button key={mode} onClick={() => updateConfig('pt.mode', mode)}
                                                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${config.pt?.mode === mode ? 'bg-amber-600 text-white shadow' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}>
                                                                {mode}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    {config.pt?.mode === 'flat' && (
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <ConfigInput label="Monthly Amount" value={config.pt?.flat_amount} onChange={v => updateConfig('pt.flat_amount', v)} suffix="₹" />
                                                        </div>
                                                    )}

                                                    {config.pt?.mode === 'slab' && (
                                                        <div className="space-y-3">
                                                            <p className="text-xs text-slate-500">Define gross salary slabs and corresponding PT amounts for your state.</p>
                                                            {(config.pt?.state_slabs || []).map((slab, idx) => (
                                                                <div key={idx} className="flex items-center gap-2">
                                                                    <input type="number" placeholder="Min Gross" value={slab.min_gross} onChange={e => updatePTSlab(idx, 'min_gross', e.target.value)}
                                                                        className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 outline-none" />
                                                                    <span className="text-xs text-slate-400">to</span>
                                                                    <input type="number" placeholder="Max Gross" value={slab.max_gross} onChange={e => updatePTSlab(idx, 'max_gross', e.target.value)}
                                                                        className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 outline-none" />
                                                                    <span className="text-xs text-slate-400">=</span>
                                                                    <input type="number" placeholder="₹" value={slab.amount} onChange={e => updatePTSlab(idx, 'amount', e.target.value)}
                                                                        className="w-20 p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none" />
                                                                    <button onClick={() => removePTSlab(idx)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                                                                </div>
                                                            ))}
                                                            <button onClick={addPTSlab} className="flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-800"><Plus size={14} /> Add Slab</button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* ===== TDS ===== */}
                                        <div className="p-5 bg-red-50/50 rounded-xl border border-red-100">
                                            <div className="flex items-center justify-between mb-4">
                                                <div><h4 className="font-bold text-slate-800">TDS / Income Tax</h4><p className="text-xs text-slate-500">Simplified TDS on Gross</p></div>
                                                <Toggle enabled={config.tax?.enabled} onToggle={() => updateConfig('tax.enabled', !config.tax?.enabled)} label="" />
                                            </div>
                                            {config.tax?.enabled && (
                                                <div className="grid grid-cols-2 gap-4">
                                                    <ConfigInput label="TDS Rate" value={config.tax?.rate} onChange={v => updateConfig('tax.rate', v)} suffix="%" />
                                                </div>
                                            )}
                                        </div>

                                        {/* ===== 2025 Compliance ===== */}
                                        <div className="p-5 bg-purple-50/50 rounded-xl border border-purple-100">
                                            <h4 className="font-bold text-slate-800 mb-1">2025 Labor Code Compliance</h4>
                                            <p className="text-xs text-slate-500 mb-4">Future-proofing for upcoming regulations</p>
                                            <div className="flex items-center gap-3 p-3 bg-purple-100/60 rounded-lg">
                                                <Toggle
                                                    enabled={config.compliance?.enforce_50_percent_rule}
                                                    onToggle={() => updateConfig('compliance.enforce_50_percent_rule', !config.compliance?.enforce_50_percent_rule)}
                                                    label="Enforce 50% Rule"
                                                />
                                            </div>
                                            <p className="text-[10px] text-purple-600 mt-2">If allowances exceed 50% of gross, excess is added to PF wage for calculation.</p>
                                        </div>

                                        {/* ===== Operational ===== */}
                                        <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                                            <h4 className="font-bold text-slate-800 mb-4">Operational Settings</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                <ConfigInput label="Standard Working Days" value={config.standard_working_days} onChange={v => updateConfig('standard_working_days', v)} suffix="days" />
                                                <ConfigInput label="Payout Date" value={config.payout_date} onChange={v => updateConfig('payout_date', v)} suffix="day" />
                                                <ConfigInput label="Attendance Lock Date" value={config.auto_lock_attendance_date} onChange={v => updateConfig('auto_lock_attendance_date', v)} suffix="day" />
                                                <Toggle enabled={config.lwp_deduction} onToggle={() => updateConfig('lwp_deduction', !config.lwp_deduction)} label="LWP Deduction" />
                                            </div>
                                        </div>

                                        {/* Save */}
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                            {saveMsg && <p className={`text-sm font-medium ${saveMsg.includes('success') ? 'text-emerald-600' : 'text-red-600'}`}>{saveMsg}</p>}
                                            <button onClick={saveConfig} disabled={loading}
                                                className="ml-auto flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-lg shadow-emerald-500/20 transition-all active:scale-95">
                                                {loading ? 'Saving...' : <><Save size={18} /> Save Configuration</>}
                                            </button>
                                        </div>
                                    </div>
                                ) : <div className="text-center py-12 text-red-500">Failed to load configuration.</div>}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default Settings;
