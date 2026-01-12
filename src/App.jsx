import React, { useState, useEffect } from 'react';
import API from './api';
import PayrollCenter from './pages/PayrollCenter';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [view, setView] = useState('dashboard'); // dashboard, addEmployee, payroll

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [slug, setSlug] = useState('');

  // Dashboard Data
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  // New Employee Form
  const [newEmp, setNewEmp] = useState({
    firstName: '', lastName: '', email: '', mobile: '',
    designation: '', baseSalary: '', hra: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('slug', slug);
      setToken(res.data.token);
      fetchEmployees();
    } catch (err) {
      alert('Login Failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setEmployees([]);
    setSlug('');
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await API.get('/employees');
      setEmployees(res.data.data);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      await API.post('/employees', newEmp);
      alert('Employee Added!');
      setView('dashboard');
      fetchEmployees();
      setNewEmp({ firstName: '', lastName: '', email: '', mobile: '', designation: '', baseSalary: '', hra: '' });
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    if (token) fetchEmployees();
  }, [token]);

  // --- LOGIN VIEW ---
  if (!token) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-96">
          <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">HRMS Portal</h2>
          <label className="block text-sm font-medium text-gray-700 mb-1">Organization ID</label>
          <input className="w-full border p-2 mb-4 rounded" placeholder="e.g., cyber" value={slug} onChange={e => setSlug(e.target.value)} required />
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input className="w-full border p-2 mb-4 rounded" placeholder="admin@cyber.com" value={email} onChange={e => setEmail(e.target.value)} required />
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input className="w-full border p-2 mb-6 rounded" type="password" placeholder="********" value={password} onChange={e => setPassword(e.target.value)} required />
          <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Login</button>
        </form>
      </div>
    );
  }

  // --- MAIN DASHBOARD VIEW ---
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-white shadow px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">HR</div>
          <h1 className="text-xl font-bold text-gray-800">
            {localStorage.getItem('slug').toUpperCase()} <span className="text-gray-400 font-normal">| Admin</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setView('dashboard')}
            className={`px-4 py-2 rounded-md transition ${view === 'dashboard' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
            Employees
          </button>
          <button onClick={() => setView('payroll')}
            className={`px-4 py-2 rounded-md transition ${view === 'payroll' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
            Payroll Center
          </button>
          <button onClick={() => setView('addEmployee')}
            className={`px-4 py-2 rounded-md transition ${view === 'addEmployee' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
            + Add New
          </button>
          <div className="h-6 w-px bg-gray-300 mx-2"></div>
          <button onClick={handleLogout} className="text-red-600 hover:bg-red-50 px-3 py-2 rounded-md transition">Logout</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-8">

        {/* VIEW 1: EMPLOYEE LIST */}
        {view === 'dashboard' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="font-semibold text-gray-700">All Employees</h2>
              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{employees.length} Total</span>
            </div>
            {loading ? <div className="p-8 text-center text-gray-500">Loading...</div> : (
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-sm uppercase">
                  <tr>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Contact</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Salary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {employees.map(emp => (
                    <tr key={emp._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{emp.personal.firstName} {emp.personal.lastName}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{emp.contact.email}</td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-md">{emp.professional.role}</span></td>
                      <td className="px-6 py-4">₹{emp.payroll?.salary?.base}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* VIEW 2: PAYROLL CENTER */}
        {view === 'payroll' && <PayrollCenter />}

        {/* VIEW 3: ADD EMPLOYEE */}
        {view === 'addEmployee' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-2xl mx-auto">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50"><h2 className="font-semibold text-gray-700">Onboard New Employee</h2></div>
            <form onSubmit={handleAddEmployee} className="p-6 grid grid-cols-2 gap-6">
              <input className="border p-2 rounded" placeholder="First Name" value={newEmp.firstName} onChange={e => setNewEmp({ ...newEmp, firstName: e.target.value })} required />
              <input className="border p-2 rounded" placeholder="Last Name" value={newEmp.lastName} onChange={e => setNewEmp({ ...newEmp, lastName: e.target.value })} required />
              <input className="border p-2 rounded" placeholder="Email" value={newEmp.email} onChange={e => setNewEmp({ ...newEmp, email: e.target.value })} required />
              <input className="border p-2 rounded" placeholder="Mobile" value={newEmp.mobile} onChange={e => setNewEmp({ ...newEmp, mobile: e.target.value })} required />
              <input className="border p-2 rounded col-span-2" placeholder="Designation" value={newEmp.designation} onChange={e => setNewEmp({ ...newEmp, designation: e.target.value })} required />
              <input className="border p-2 rounded" type="number" placeholder="Base Salary" value={newEmp.baseSalary} onChange={e => setNewEmp({ ...newEmp, baseSalary: e.target.value })} required />
              <input className="border p-2 rounded" type="number" placeholder="HRA" value={newEmp.hra} onChange={e => setNewEmp({ ...newEmp, hra: e.target.value })} />
              <button className="col-span-2 bg-blue-600 text-white p-3 rounded hover:bg-blue-700">Complete Onboarding</button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
