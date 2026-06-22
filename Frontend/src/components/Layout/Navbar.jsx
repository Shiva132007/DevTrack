import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../store/slices/authSlice.js';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const roleStyles = {
    admin: 'pill pill--danger',
    manager: 'pill pill--primary',
    employee: 'pill pill--success',
  };

  const initials = user?.username
    ? user.username
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'DT';

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <div className="navbar__brand">
          <div className="brand-mark">DT</div>
          <div className="navbar__brand-copy">
            <span className="navbar__brand-name">DevTrack</span>
            <span className="navbar__brand-tag">Operations workspace</span>
          </div>
        </div>

        <div className="navbar__meta">
          <div className="user-chip">
            <div className="user-chip__avatar">{initials}</div>
            <div className="user-chip__copy">
              <span className="user-chip__name">{user?.username || 'Guest'}</span>
              <span className="user-chip__role">{user?.role || 'workspace user'}</span>
            </div>
          </div>
          <span className={roleStyles[user?.role] || 'pill pill--primary'}>
            {user?.role || 'member'}
          </span>
          <button className="btn btn--ghost" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;