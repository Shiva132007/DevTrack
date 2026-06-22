import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, clearError } from '../store/slices/authSlice.js';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());

    // Self-registration always creates an employee account
    // Admins/managers create other admins/managers via the admin panel
    const result = await dispatch(registerUser({ ...formData, role: 'employee' }));

    if (registerUser.fulfilled.match(result)) {
      navigate('/employee');
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
              <h1 className="auth-copy__title">Build a cleaner work culture from day one.</h1>
              <p className="auth-copy__text">
                Create an employee account and get access to a polished workspace that keeps tasks, approvals, and progress visible.
              </p>
            </div>
          </div>

          <div className="auth-list">
            <div className="auth-list__item">
              <span className="auth-list__bullet" />
              <span>Self-service onboarding for employee accounts.</span>
            </div>
            <div className="auth-list__item">
              <span className="auth-list__bullet" />
              <span>Admin-created manager and admin roles for tighter control.</span>
            </div>
            <div className="auth-list__item">
              <span className="auth-list__bullet" />
              <span>A consistent interface that feels more premium and focused.</span>
            </div>
          </div>
        </section>

        <section className="auth-panel auth-panel--form">
          <div className="auth-form">
            <div>
              <h2 className="auth-form__title">Create an account</h2>
              <p className="auth-form__subtitle">
                Public registration creates an employee account. Admin and manager accounts are created in the admin panel.
              </p>
            </div>

            {error && <div className="pill pill--danger">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="field">
                <label className="field__label" htmlFor="register-username">Username</label>
                <input
                  id="register-username"
                  className="input"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="Your name"
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="register-email">Email</label>
                <input
                  id="register-email"
                  className="input"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@company.com"
                />
              </div>

              <div className="field">
                <label className="field__label" htmlFor="register-password">Password</label>
                <input
                  id="register-password"
                  className="input"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="Create a secure password"
                />
              </div>

              <button className="btn btn--primary" type="submit" disabled={loading}>
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <p className="auth-form__footer">
              Already have an account? <Link className="auth-link" to="/login">Sign in</Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Register;