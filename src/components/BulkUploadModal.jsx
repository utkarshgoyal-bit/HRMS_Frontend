import React, { useState } from 'react';
import axios from 'axios';
import Papa from 'papaparse';
import { X, Upload, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';

const BulkUploadModal = ({ isOpen, onClose, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [results, setResults] = useState(null);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            parseFile(selectedFile);
        }
    };

    const parseFile = (file) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.data.length > 0) {
                    setPreview(results.data.slice(0, 5)); // Preview first 5
                    setError('');
                } else {
                    setError('File appears to be empty or invalid CSV');
                }
            },
            error: (err) => {
                setError('Failed to parse CSV file');
            }
        });
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setError('');

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const employees = results.data.map(row => ({
                        firstName: row['First Name'],
                        lastName: row['Last Name'],
                        email: row['Email'],
                        mobile: row['Mobile'],
                        role: row['Role'] || 'EMPLOYEE',
                        designation: row['Designation'],
                        dateOfJoining: row['Joining Date'],
                        baseSalary: row['Base Salary']
                    }));

                    const token = localStorage.getItem('token');
                    // Use environment variable or fallback
                    const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:9999';

                    const response = await axios.post(`${API_URL}/api/v1/employees/bulk`,
                        { employees },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );

                    if (response.data.success) {
                        setResults(response.data.results);
                        if (response.data.results.failed.length === 0) {
                            setTimeout(() => {
                                onSuccess();
                                onClose();
                            }, 2000);
                        }
                    }
                } catch (err) {
                    console.error(err);
                    setError(err.response?.data?.message || 'Upload failed');
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    const downloadTemplate = () => {
        const csv = 'First Name,Last Name,Email,Mobile,Role,Designation,Joining Date,Base Salary\nJohn,Doe,john@example.com,9876543210,EMPLOYEE,Developer,2024-01-01,50000';
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'employee_template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Upload size={20} /> Bulk Upload Employees
                    </h3>
                    <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full text-white"><X size={20} /></button>
                </div>

                <div className="p-6">
                    {/* Template Download */}
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg flex justify-between items-center border border-blue-100">
                        <div>
                            <p className="text-sm font-medium text-blue-900">Need a template?</p>
                            <p className="text-xs text-blue-700">Download the CSV template to ensure correct formatting.</p>
                        </div>
                        <button onClick={downloadTemplate} className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:underline">
                            <Download size={16} /> Download CSV
                        </button>
                    </div>

                    {/* File Upload Area */}
                    {!file && (
                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors">
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="hidden"
                                id="csvUpload"
                            />
                            <label htmlFor="csvUpload" className="cursor-pointer flex flex-col items-center">
                                <FileText size={48} className="text-slate-400 mb-2" />
                                <span className="text-slate-700 font-medium">Click to upload CSV</span>
                                <span className="text-slate-500 text-xs mt-1">or drag and drop</span>
                            </label>
                        </div>
                    )}

                    {/* File Preview */}
                    {file && !results && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between bg-slate-100 p-3 rounded-lg">
                                <span className="text-sm font-medium text-slate-700">{file.name}</span>
                                <button onClick={() => { setFile(null); setPreview([]); }} className="text-red-500 text-xs hover:underline">Remove</button>
                            </div>

                            {preview.length > 0 && (
                                <div className="overflow-x-auto border rounded-lg">
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-slate-50 text-slate-500 uppercase font-medium">
                                            <tr>
                                                <th className="px-3 py-2">First Name</th>
                                                <th className="px-3 py-2">Email</th>
                                                <th className="px-3 py-2">Mobile</th>
                                                <th className="px-3 py-2">Role</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {preview.map((row, idx) => (
                                                <tr key={idx}>
                                                    <td className="px-3 py-2">{row['First Name']}</td>
                                                    <td className="px-3 py-2">{row['Email']}</td>
                                                    <td className="px-3 py-2">{row['Mobile']}</td>
                                                    <td className="px-3 py-2">{row['Role']}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            <button
                                onClick={handleUpload}
                                disabled={loading}
                                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm flex justify-center items-center gap-2"
                            >
                                {loading ? 'Uploading...' : 'Start Upload'}
                            </button>
                        </div>
                    )}

                    {/* Results */}
                    {results && (
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-1 bg-green-50 p-3 rounded-lg border border-green-100 text-center">
                                    <p className="text-2xl font-bold text-green-600">{results.success.length}</p>
                                    <p className="text-xs text-green-800">Successful</p>
                                </div>
                                <div className="flex-1 bg-red-50 p-3 rounded-lg border border-red-100 text-center">
                                    <p className="text-2xl font-bold text-red-600">{results.failed.length}</p>
                                    <p className="text-xs text-red-800">Failed</p>
                                </div>
                            </div>

                            {results.failed.length > 0 && (
                                <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-xs">
                                    <p className="font-semibold text-red-700 mb-2">Errors:</p>
                                    <ul className="list-disc pl-4 space-y-1 text-red-600">
                                        {results.failed.slice(0, 5).map((fail, i) => (
                                            <li key={i}>{fail.email}: {fail.error}</li>
                                        ))}
                                        {results.failed.length > 5 && <li>...and {results.failed.length - 5} more</li>}
                                    </ul>
                                </div>
                            )}

                            <button
                                onClick={onClose}
                                className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-medium"
                            >
                                Close
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 text-red-600 text-sm bg-red-50 p-3 rounded-lg flex items-center gap-2">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BulkUploadModal;
