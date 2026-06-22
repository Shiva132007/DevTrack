import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Not logged in at all → send to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in, but wrong role for this page → send to their correct dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const correctPath =
      user.role === 'admin' ? '/admin' : user.role === 'manager' ? '/manager' : '/employee';
    return <Navigate to={correctPath} replace />;
  }

  // All checks passed → show the actual page
  return children;
};

export default PrivateRoute;