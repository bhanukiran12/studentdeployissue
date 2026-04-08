import { Navigate, Route, Routes } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import AdminDashboard from './pages/admin/AdminDashboard';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PatientDashboard from './pages/patient/PatientDashboard';

const App = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="p-8 text-center text-slate-700">Preparing your workspace...</div>;
  }

  return (
    <div className="app-shell">
      <div className="ambient-bg" aria-hidden="true">
        <div className="bg-orb bg-orb-one" />
        <div className="bg-orb bg-orb-two" />
        <div className="bg-orb bg-orb-three" />
      </div>

      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate replace to={`/${user.role}`} /> : <LoginPage />} />
        <Route path="/register" element={isAuthenticated ? <Navigate replace to={`/${user.role}`} /> : <RegisterPage />} />

        <Route
          path="/patient"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate replace to={isAuthenticated ? `/${user.role}` : '/login'} />} />
      </Routes>
    </div>
  );
};

export default App;
