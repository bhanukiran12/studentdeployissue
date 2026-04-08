import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

const DashboardLayout = ({ title, children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen px-4 py-6 sm:px-8">
      <header className="panel-glow fade-up mx-auto mb-6 flex w-full max-w-6xl flex-col gap-4 rounded-2xl border border-cyan-100 bg-white/90 p-5 shadow-xl shadow-cyan-100/40 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary">{title}</h1>
          <p className="text-sm text-slate-500">
            Signed in as <span className="font-semibold text-slate-700">{user?.name}</span>{' '}
            <span className="tag tag-role">{user?.role}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link className="btn-secondary" to={`/${user?.role}`}>
            Dashboard
          </Link>
          <button className="btn-warning" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl">{children}</main>
    </div>
  );
};

export default DashboardLayout;
