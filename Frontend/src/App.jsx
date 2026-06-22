import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from './store/slices/authSlice.js';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import EmployeeDashboard from './pages/EmployeeDashboard.jsx';
import ManagerDashboard from './pages/ManagerDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Landing from './pages/Landing.jsx';
import PrivateRoute from './components/Auth/PrivateRoute.jsx';

function App() {
  const dispatch = useDispatch();
  const { token, user, authReady } = useSelector((state) => state.auth);
  const isAuthed = authReady && !!user;

  useEffect(() => {
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [token, dispatch]);

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'manager') return '/manager';
    return '/employee';
  };

  return (
    !authReady ? (
      <div className="auth-shell">
        <div className="panel" style={{ textAlign: 'center', maxWidth: 420 }}>
          <div className="badge badge--solid" style={{ marginBottom: 12 }}>DevTrack</div>
          <h2 style={{ marginBottom: 8 }}>Checking your workspace</h2>
          <p className="page-header__description">Verifying your session before loading protected pages.</p>
        </div>
      </div>
    ) : (
    <Routes>
      <Route path="/" element={isAuthed ? <Navigate to={getDashboardPath()} /> : <Landing />} />
      <Route path="/login" element={isAuthed ? <Navigate to={getDashboardPath()} /> : <Login />} />
      <Route path="/register" element={isAuthed ? <Navigate to={getDashboardPath()} /> : <Register />} />

      <Route
        path="/employee"
        element={
          <PrivateRoute allowedRoles={['employee']}>
            <EmployeeDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/manager"
        element={
          <PrivateRoute allowedRoles={['manager']}>
            <ManagerDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </PrivateRoute>
        }
      />

      <Route path="*" element={isAuthed ? <Navigate to={getDashboardPath()} /> : <Navigate to="/" replace />} />
    </Routes>
    )
  );
}

export default App;