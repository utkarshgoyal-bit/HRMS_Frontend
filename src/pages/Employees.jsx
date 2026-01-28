import React from 'react';
import MainLayout from '../layouts/MainLayout';
import EmployeeList from '../components/EmployeeList';

const Employees = () => {
    return (
        <MainLayout>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Workforce</h1>
                <p className="text-slate-500 mt-1">Manage all your employees and their roles.</p>
            </div>
            <EmployeeList />
        </MainLayout>
    );
};

export default Employees;
