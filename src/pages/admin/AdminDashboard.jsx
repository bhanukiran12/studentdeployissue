import { useEffect, useState } from 'react';

import DashboardLayout from '../../components/DashboardLayout';
import api from '../../services/api';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [message, setMessage] = useState('');

  const fetchData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([api.get('/admin/users'), api.get('/admin/stats')]);
      setUsers(usersRes.data.users || []);
      setStats(statsRes.data.stats || null);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to load admin data');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateRole = async (userId, role) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role });
      setMessage('User role updated');
      fetchData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not update role');
    }
  };

  return (
    <DashboardLayout title="Admin Dashboard">
      {message && <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm font-medium text-amber-700">{message}</p>}

      <section className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card">
          <p className="text-sm text-slate-500">Total Users</p>
          <p className="text-2xl font-bold text-secondary">{stats?.totalUsers || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Patients / Doctors</p>
          <p className="text-2xl font-bold text-secondary">
            {stats?.totalPatients || 0} / {stats?.totalDoctors || 0}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Appointments</p>
          <p className="text-2xl font-bold text-secondary">{stats?.totalAppointments || 0}</p>
        </div>
      </section>

      <section className="card overflow-x-auto">
        <h3 className="mb-3 text-lg font-semibold text-secondary">Manage Users</h3>
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="pb-2">Name</th>
              <th className="pb-2">Email</th>
              <th className="pb-2">Current Role</th>
              <th className="pb-2">Change Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-t border-slate-100">
                <td className="py-2 font-medium text-slate-700">{user.name}</td>
                <td className="py-2">{user.email}</td>
                <td className="py-2">
                  <span
                    className={`tag ${
                      user.role === 'admin' ? 'tag-warning' : user.role === 'doctor' ? 'tag-info' : 'tag-success'
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="py-2">
                  <select
                    className="input max-w-[160px] px-3 py-2"
                    value={user.role}
                    onChange={(event) => updateRole(user._id, event.target.value)}
                  >
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </DashboardLayout>
  );
};

export default AdminDashboard;
