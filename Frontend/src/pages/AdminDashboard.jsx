import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, deleteTask, fetchTaskStats } from '../store/slices/taskSlice.js';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, ResponsiveContainer
} from 'recharts';
import Navbar from '../components/Layout/Navbar.jsx';
import useSocket from '../hooks/useSocket.js';
import api from '../api/axios.js';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { tasks, loading, stats } = useSelector((state) => state.tasks);

  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('tasks');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'employee',
    managedBy: '',
  });
  const [managers, setManagers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    username: '',
    role: 'employee',
    managedBy: '',
  });

  useSocket();

  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchTaskStats());
    fetchUsers();
  }, [dispatch]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      const allUsers = response.data.users;
      setUsers(allUsers);
      setManagers(allUsers.filter((u) => u.role === 'manager'));
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  const handleUserFormChange = (e) => {
    setUserForm({ ...userForm, [e.target.name]: e.target.value });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', userForm);
      setShowCreateUser(false);
      setUserForm({ username: '', email: '', password: '', role: 'employee', managedBy: '' });
      fetchUsers();
    } catch (err) {
      console.error('Failed to create user', err);
    }
  };

  const handleDeactivateUser = async (userId, isActive) => {
    try {
      await api.patch(`/users/${userId}`, { isActive: !isActive });
      fetchUsers();
    } catch (err) {
      console.error('Failed to update user', err);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user._id);
    setEditForm({
      username: user.username,
      role: user.role,
      managedBy: user.managedBy || '',
    });
  };

  const handleEditFormChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/users/${editingUser}`, editForm);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error('Failed to update user', err);
    }
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      dispatch(deleteTask(taskId));
    }
  };

  const getStatusCount = (statusId) => {
    const found = (stats.byStatus || []).find((s) => s._id === statusId);
    return found ? found.count : 0;
  };

  const formatStatus = (status) => status?.replace(/_/g, ' ') || 'unknown';

  const taskStatusClass = (status) => {
    if (status === 'done') return 'pill pill--success';
    if (status === 'review') return 'pill pill--warning';
    if (status === 'in_progress') return 'pill pill--primary';
    return 'pill';
  };

  const priorityClass = (priority) => {
    if (priority === 'high') return 'pill pill--danger';
    if (priority === 'medium') return 'pill pill--warning';
    return 'pill pill--success';
  };

  // Chart data
  const statusChartData = (stats.byStatus || []).map((s) => ({
    name: formatStatus(s._id).toUpperCase(),
    count: s.count,
    id: s._id,
  }));

  const priorityChartData = (stats.byPriority || []).map((p) => ({
    name: p._id?.toUpperCase(),
    value: p.count,
    id: p._id?.toLowerCase(),
  }));

  const statusColors = {
    todo: '#888',
    in_progress: '#534AB7',
    review: '#BA7517',
    done: '#0F6E56',
  };

  const priorityColors = {
    high: '#a61b1b',
    medium: '#BA7517',
    low: '#0F6E56',
  };

  const totalTasks = stats.total || 0;

  const completionRate = totalTasks > 0
    ? Math.round((getStatusCount('done') / totalTasks) * 100)
    : 0;

  const isUserTab = activeTab === 'users';

  return (
    <div className="app-shell">
      <Navbar />

      <div className="page-shell page-shell--wide">
        <section className="hero-panel" style={{ marginBottom: 22 }}>
          <div className="page-header__eyebrow" style={{ color: 'rgba(226, 232, 240, 0.78)' }}>
            Admin Control Panel
          </div>
          <h1 className="hero-panel__title">Full visibility across users, tasks, and delivery.</h1>
          <p className="hero-panel__description">
            Monitor throughput, manage access, and keep the workspace moving with a calmer, more readable interface.
          </p>

          <div className="hero-panel__meta">
            <span className="badge">{totalTasks} total tasks</span>
            <span className="badge">{users.length} users</span>
            <span className="badge">{managers.length} managers</span>
            <span className="badge">{completionRate}% completion rate</span>
          </div>
        </section>

        <div className="metric-grid">
          {[
            { label: 'Total Tasks', value: totalTasks, hint: 'Across all boards', color: '#4f46e5' },
            { label: 'Todo', value: getStatusCount('todo'), hint: 'Queued for action', color: '#6b7280' },
            { label: 'In Progress', value: getStatusCount('in_progress'), hint: 'Currently active', color: '#d97706' },
            { label: 'Done', value: getStatusCount('done'), hint: 'Completed work', color: '#059669' },
          ].map((stat) => (
            <div key={stat.label} className="metric-card">
              <div className="metric-card__label">{stat.label}</div>
              <div className="metric-card__value" style={{ color: stat.color }}>{stat.value}</div>
              <div className="metric-card__hint">{stat.hint}</div>
            </div>
          ))}
        </div>

        <div className="toolbar">
          <div className="segmented-control" role="tablist" aria-label="Admin views">
            <button className={`segmented-control__button ${activeTab === 'tasks' ? 'is-active' : ''}`} onClick={() => setActiveTab('tasks')}>All Tasks</button>
            <button className={`segmented-control__button ${activeTab === 'users' ? 'is-active' : ''}`} onClick={() => setActiveTab('users')}>Users</button>
            <button className={`segmented-control__button ${activeTab === 'stats' ? 'is-active' : ''}`} onClick={() => setActiveTab('stats')}>Stats</button>
          </div>

          <div className="badge badge--solid">
            {loading ? 'Refreshing data' : 'Live workspace connected'}
          </div>
        </div>

        {activeTab === 'tasks' && (
          <section className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Assigned To</th>
                  <th>Created By</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td className="data-table__empty" colSpan="6">Loading tasks...</td>
                  </tr>
                )}
                {!loading && tasks.length === 0 && (
                  <tr>
                    <td className="data-table__empty" colSpan="6">No tasks yet.</td>
                  </tr>
                )}
                {!loading && tasks.map((task) => (
                  <tr key={task._id}>
                    <td>
                      <div className="data-table__title">{task.title}</div>
                    </td>
                    <td className="data-table__muted">{task.assignedTo?.username || '—'}</td>
                    <td className="data-table__muted">{task.createdBy?.username || '—'}</td>
                    <td>
                      <span className={taskStatusClass(task.status)}>{formatStatus(task.status)}</span>
                    </td>
                    <td>
                      <span className={priorityClass(task.priority)}>{task.priority}</span>
                    </td>
                    <td>
                      <button className="btn btn--danger" onClick={() => handleDeleteTask(task._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {activeTab === 'users' && (
          <div className="stack">
            <div className="toolbar" style={{ marginBottom: 0 }}>
              <div>
                <h3 className="panel__title">User management</h3>
                <p className="page-header__description">Create access, assign reporting lines, and keep the workspace tidy.</p>
              </div>
              <button
                onClick={() => setShowCreateUser(!showCreateUser)}
                className="btn btn--primary"
              >
                {showCreateUser ? 'Cancel' : '+ Add User'}
              </button>
            </div>

            {showCreateUser && (
              <form onSubmit={handleCreateUser} className="panel">
                <h3 className="panel__title">Create new user</h3>
                <div className="form-grid">
                  <div className="field">
                    <label className="field__label" htmlFor="admin-username">Username</label>
                    <input id="admin-username" className="input" name="username" value={userForm.username} onChange={handleUserFormChange} required />
                  </div>
                  <div className="field">
                    <label className="field__label" htmlFor="admin-email">Email</label>
                    <input id="admin-email" className="input" name="email" type="email" value={userForm.email} onChange={handleUserFormChange} required />
                  </div>
                  <div className="field">
                    <label className="field__label" htmlFor="admin-password">Password</label>
                    <input id="admin-password" className="input" name="password" type="password" value={userForm.password} onChange={handleUserFormChange} required minLength={6} />
                  </div>
                  <div className="field">
                    <label className="field__label" htmlFor="admin-role">Role</label>
                    <select id="admin-role" className="select" name="role" value={userForm.role} onChange={handleUserFormChange}>
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  {userForm.role === 'employee' && (
                    <div className="field field--full">
                      <label className="field__label" htmlFor="admin-manager">Assign Manager</label>
                      <select id="admin-manager" className="select" name="managedBy" value={userForm.managedBy} onChange={handleUserFormChange}>
                        <option value="">No manager</option>
                        {managers.map((m) => (
                          <option key={m._id} value={m._id}>{m.username}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                <div style={{ marginTop: 16 }}>
                  <button type="submit" className="btn btn--primary">Create User</button>
                </div>
              </form>
            )}

            <section className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 && (
                    <tr>
                      <td className="data-table__empty" colSpan="5">No users found.</td>
                    </tr>
                  )}
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td className="data-table__title">{u.username}</td>
                      <td className="data-table__muted">{u.email}</td>
                      <td>
                        <span className="pill pill--primary" style={{ textTransform: 'capitalize' }}>{u.role}</span>
                      </td>
                      <td>
                        <span className={u.isActive ? 'pill pill--success' : 'pill pill--danger'}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleDeactivateUser(u._id, u.isActive)}
                          className={u.isActive ? 'btn btn--danger' : 'btn btn--secondary'}
                          style={{ marginRight: 8 }}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleEditUser(u)}
                          className="btn btn--secondary"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {editingUser && (
              <div style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.5)',
                display: 'grid',
                placeItems: 'center',
                zIndex: 200,
                padding: 16,
              }}>
                <form
                  onSubmit={handleSaveEdit}
                  className="panel"
                  style={{ maxWidth: 520, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
                >
                  <h3 className="panel__title">Edit user</h3>
                  <div className="form-grid">
                    <div className="field field--full">
                      <label className="field__label" htmlFor="edit-username">Username</label>
                      <input id="edit-username" className="input" name="username" value={editForm.username} onChange={handleEditFormChange} />
                    </div>
                    <div className="field">
                      <label className="field__label" htmlFor="edit-role">Role</label>
                      <select id="edit-role" className="select" name="role" value={editForm.role} onChange={handleEditFormChange}>
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    {editForm.role === 'employee' && (
                      <div className="field">
                        <label className="field__label" htmlFor="edit-manager">Assign Manager</label>
                        <select id="edit-manager" className="select" name="managedBy" value={editForm.managedBy} onChange={handleEditFormChange}>
                          <option value="">No manager</option>
                          {managers.map((m) => (
                            <option key={m._id} value={m._id}>{m.username}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                    <button type="submit" className="btn btn--primary">
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingUser(null)}
                      className="btn btn--secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="stack">
            <div className="page-header">
              <div>
                <div className="page-header__eyebrow">Analytics</div>
                <h3 className="page-header__title" style={{ fontSize: 'clamp(24px, 3vw, 32px)' }}>Task analytics</h3>
                <p className="page-header__description">A quick read on throughput, focus, and delivery health.</p>
              </div>
            </div>

            <div className="chart-grid">
              <div className="chart-panel">
                <h4 className="chart-panel__title">Tasks by status</h4>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={statusChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #e5e7eb' }} cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {statusChartData.map((entry) => (
                        <Cell key={entry.id} fill={statusColors[entry.id] || '#4f46e5'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-panel">
                <h4 className="chart-panel__title">Tasks by priority</h4>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={priorityChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={64}
                      outerRadius={108}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {priorityChartData.map((entry) => (
                        <Cell key={entry.id} fill={priorityColors[entry.id] || '#4f46e5'} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #e5e7eb' }} />
                    <Legend
                      iconType="circle"
                      iconSize={10}
                      formatter={(value) => (
                        <span style={{ fontSize: 12, color: '#6b7280' }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="panel">
              <h4 className="panel__title">Key metrics</h4>
              <div className="metric-grid" style={{ marginBottom: 0 }}>
                {[
                  {
                    label: 'Completion Rate',
                    value: `${completionRate}%`,
                    hint: 'Tasks marked as done',
                    color: '#059669',
                  },
                  {
                    label: 'In Progress',
                    value: getStatusCount('in_progress'),
                    hint: 'Currently being worked on',
                    color: '#4f46e5',
                  },
                  {
                    label: 'High Priority',
                    value: (stats.byPriority || []).find((p) => p._id?.toLowerCase() === 'high')?.count || 0,
                    hint: 'Needs urgent attention',
                    color: '#dc2626',
                  },
                ].map((card) => (
                  <div key={card.label} className="metric-card">
                    <div className="metric-card__label">{card.label}</div>
                    <div className="metric-card__value" style={{ color: card.color }}>{card.value}</div>
                    <div className="metric-card__hint">{card.hint}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;