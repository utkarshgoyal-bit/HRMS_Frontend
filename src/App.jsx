import PayrollCenter from './pages/PayrollCenter';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [view, setView] = useState('dashboard');

  // ... (previous code)

  return (
    <div className='min-h-screen bg-gray-50'>
      <header className='bg-white shadow px-6 py-4 flex justify-between items-center sticky top-0 z-10'>
        {/* ... (header logo) */}
        <div className='flex items-center gap-2'>
          <div className='h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold'>HR</div>
          <h1 className='text-xl font-bold text-gray-800'>
            {localStorage.getItem('slug')?.toUpperCase()} <span className='text-gray-400 font-normal'>| Admin</span>
          </h1>
        </div>
        <div className='flex items-center gap-4'>
          <button onClick={() => setView('dashboard')}
            className={`px-4 py-2 rounded-md transition ${view === 'dashboard' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
            Employees
          </button>
          <button onClick={() => setView('payroll')}
            className={`px-4 py-2 rounded-md transition ${view === 'payroll' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
            Payroll
          </button>
          <button onClick={() => setView('addEmployee')}
            className={`px-4 py-2 rounded-md transition ${view === 'addEmployee' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
            + Add New
          </button>
          <button onClick={handleLogout} className='text-red-600 hover:bg-red-50 px-3 py-2 rounded-md transition ml-2'>Logout</button>
        </div>
      </header>
      <main className='max-w-6xl mx-auto p-8'>
        {view === 'dashboard' && (
          // ... (Dashboard code)
          <>
            {/* Dashboard Visuals */}
            {!loading && <DashboardStats employees={employees} />}

            <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
              <div className='px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50'>
                <h2 className='font-semibold text-gray-700'>All Employees</h2>
                <span className='text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full'>{employees.length} Total</span>
              </div>
              {loading ? (
                <div className='p-8 text-center text-gray-500'>Loading data...</div>
              ) : (
                <table className='w-full text-left'>
                  <thead>
                    <tr className='bg-gray-50 text-gray-500 text-sm uppercase tracking-wider'>
                      <th className='px-6 py-3 font-medium'>Name</th>
                      <th className='px-6 py-3 font-medium'>Contact</th>
                      <th className='px-6 py-3 font-medium'>Role</th>
                      <th className='px-6 py-3 font-medium'>Designation</th>
                      <th className='px-6 py-3 font-medium'>Status</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-100'>
                    {employees.map(emp => (
                      <tr key={emp._id} className='hover:bg-gray-50 transition'>
                        <td className='px-6 py-4'><div className='font-medium text-gray-900'>{emp.personal.firstName} {emp.personal.lastName}</div></td>
                        <td className='px-6 py-4 text-gray-600 text-sm'>
                          <div>{emp.contact.email}</div>
                          <div className='text-xs text-gray-400'>{emp.contact.mobile}</div>
                        </td>
                        <td className='px-6 py-4'><span className='px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-md border border-purple-200'>{emp.professional.role}</span></td>
                        <td className='px-6 py-4 text-gray-600'>{emp.professional.designation}</td>
                        <td className='px-6 py-4'><span className='px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full'>{emp.status}</span></td>
                      </tr>
                    ))}
                    {employees.length === 0 && <tr><td colSpan='5' className='p-6 text-center text-gray-400'>No employees found.</td></tr>}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {view === 'payroll' && <PayrollCenter employees={employees} />}

        {view === 'addEmployee' && (
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 max-w-2xl mx-auto'>
            {/* ... (Add Employee Form) */}
            <div className='px-6 py-4 border-b border-gray-100 bg-gray-50'><h2 className='font-semibold text-gray-700'>Onboard New Employee</h2></div>
            <form onSubmit={handleAddEmployee} className='p-6 grid grid-cols-2 gap-6'>
              <div className='col-span-2 text-xs font-bold text-gray-400 uppercase tracking-wide'>Personal Details</div>
              <input className='border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none' placeholder='First Name' value={newEmp.firstName} onChange={e => setNewEmp({ ...newEmp, firstName: e.target.value })} required />
              <input className='border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none' placeholder='Last Name' value={newEmp.lastName} onChange={e => setNewEmp({ ...newEmp, lastName: e.target.value })} required />
              <div className='col-span-2 text-xs font-bold text-gray-400 uppercase tracking-wide mt-2'>Contact Info</div>
              <input className='border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none' placeholder='Email Address' type='email' value={newEmp.email} onChange={e => setNewEmp({ ...newEmp, email: e.target.value })} required />
              <input className='border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none' placeholder='Mobile Number' value={newEmp.mobile} onChange={e => setNewEmp({ ...newEmp, mobile: e.target.value })} required />
              <div className='col-span-2 text-xs font-bold text-gray-400 uppercase tracking-wide mt-2'>Professional</div>
              <input className='border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none col-span-2' placeholder='Designation' value={newEmp.designation} onChange={e => setNewEmp({ ...newEmp, designation: e.target.value })} required />
              <div className='col-span-2 text-xs font-bold text-gray-400 uppercase tracking-wide mt-2'>Payroll Configuration</div>
              <input className='border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none' type='number' placeholder='Base Salary' value={newEmp.baseSalary} onChange={e => setNewEmp({ ...newEmp, baseSalary: e.target.value })} required />
              <input className='border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none' type='number' placeholder='HRA' value={newEmp.hra} onChange={e => setNewEmp({ ...newEmp, hra: e.target.value })} />
              <div className='col-span-2 pt-4'><button className='w-full bg-blue-600 text-white font-medium p-3 rounded hover:bg-blue-700 transition shadow-sm'>Complete Onboarding</button></div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
