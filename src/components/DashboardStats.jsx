import React from 'react';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const DashboardStats = ({ employees }) => {
    // 1. Calculations
    const totalEmployees = employees.length;
    const totalSalaries = employees.reduce((sum, emp) => sum + (Number(emp.payroll?.salary?.base) || 0), 0);
    const averageSalary = totalEmployees > 0 ? (totalSalaries / totalEmployees).toFixed(0) : 0;

    // 2. Data Preparation for Charts

    // Role Distribution
    const roleCounts = employees.reduce((acc, emp) => {
        const role = emp.professional?.role || 'Unknown';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
    }, {});

    const roleData = Object.keys(roleCounts).map(role => ({
        name: role,
        value: roleCounts[role]
    }));

    // Department Distribution (or Designation if dept missing)
    const deptCounts = employees.reduce((acc, emp) => {
        const dept = emp.professional?.designation || 'Other'; // Using designation as department mostly empty in mock
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
    }, {});

    const deptData = Object.keys(deptCounts).map(dept => ({
        name: dept,
        count: deptCounts[dept]
    }));

    return (
        <div className="mb-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-700 mb-6">Organization Overview</h3>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <p className="text-gray-500 text-sm font-medium">Total Employees</p>
                    <p className="text-2xl font-bold text-blue-700">{totalEmployees}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <p className="text-gray-500 text-sm font-medium">Monthly Payroll</p>
                    <p className="text-2xl font-bold text-green-700">₹{totalSalaries.toLocaleString()}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                    <p className="text-gray-500 text-sm font-medium">Avg. Base Salary</p>
                    <p className="text-2xl font-bold text-purple-700">₹{Number(averageSalary).toLocaleString()}</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Pie Chart: Roles */}
                <div className="bg-slate-50 p-4 rounded-lg border border-gray-100 flex flex-col items-center">
                    <h4 className="text-sm font-semibold text-gray-600 mb-4 self-start w-full text-center">Employee Roles</h4>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={roleData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                    label
                                >
                                    {roleData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 mt-2">
                        {roleData.map((entry, index) => (
                            <div key={index} className="flex items-center gap-1 text-xs text-gray-500">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                {entry.name}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bar Chart: Designations */}
                <div className="bg-slate-50 p-4 rounded-lg border border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-600 mb-4 text-center">Staff by Designation</h4>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={deptData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="count" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DashboardStats;
