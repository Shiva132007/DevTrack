import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, clearError } from '../store/slices/authSlice.js';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());

    const result = await dispatch(loginUser({ email, password }));

    // Only navigate if login actually succeeded
    if (loginUser.fulfilled.match(result)) {
      const role = result.payload.user.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'manager') navigate('/manager');
      else navigate('/employee');
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-layout">
        <section className="auth-panel auth-panel--brand">
          <div>
            <div className="auth-brand">
              <div className="auth-brand__mark">DT</div>
              <span>DevTrack</span>
            </div>

            <div className="auth-copy">
              <h1 className="auth-copy__title">One workspace for tasks, teams, and delivery.</h1>
              <p className="auth-copy__text">
                Manage work with role-aware dashboards, real-time updates, and a cleaner path from planning to release.
              </p>
            </div>
          </div>

          <div className="auth-list">
            <div className="auth-list__item">
              <span className="auth-list__bullet" />
              <span>Live collaboration across employee, manager, and admin views.</span>
            </div>
            <div className="auth-list__item">
              <span className="auth-list__bullet" />
              <span>Task tracking designed for focus, visibility, and accountability.</span>
            </div>
            <div className="auth-list__item">
              <span className="auth-list__bullet" />
              <span>Clear access control with a polished, modern interface.</span>
            </div>
          </div>
        </section>

        <section className="auth-panel auth-panel--form">
          <div className="auth-form">
            <div>
              <h2 className="auth-form__title">Welcome back</h2>
              <p className="auth-form__subtitle">Sign in to continue to your workspace.</p>
            </div>

            {error && <div className="pill pill--danger">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="field">
                <label className="field__label" htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@company.com"
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  className="input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
              </div>

              <button className="btn btn--primary" type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login to DevTrack'}
              </button>
            </form>

            <p className="auth-form__footer">
              Don&apos;t have an account? <Link className="auth-link" to="/register">Create one</Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;