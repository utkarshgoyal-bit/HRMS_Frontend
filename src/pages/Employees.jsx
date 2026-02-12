import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import EmployeeList from '../components/EmployeeList';
import BulkUploadModal from '../components/BulkUploadModal';
import { Upload } from 'lucide-react';

const Employees = () => {
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

    return (
        <MainLayout>
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Workforce</h1>
                    <p className="text-slate-500 mt-1">Manage all your employees and their roles.</p>
                </div>
                <button
                    onClick={() => setIsBulkModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
                >
                    <Upload size={16} /> Bulk Upload
                </button>
            </div>

            <EmployeeList />

            <BulkUploadModal
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                onSuccess={() => window.location.reload()} // Simple reload to refresh list
            />
        </MainLayout>
    );
};

export default Employees;
