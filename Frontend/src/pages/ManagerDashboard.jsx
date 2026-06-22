import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTasks,
  createTask,
  updateTaskStatus,
} from '../store/slices/taskSlice.js';
import KanbanColumn from '../components/Board/KanbanColumn.jsx';
import Navbar from '../components/Layout/Navbar.jsx';
import useSocket from '../hooks/useSocket.js';
import api from '../api/axios.js';

const COLUMNS = ['todo', 'in_progress', 'review', 'done'];

const ManagerDashboard = () => {
  const dispatch = useDispatch();
  const { tasks, loading, error } = useSelector((state) => state.tasks);

  // List of employees to assign tasks to
  const [employees, setEmployees] = useState([]);

  // Create task form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    dueDate: '',
  });

  useSocket();

  useEffect(() => {
    dispatch(fetchTasks());
    fetchEmployees();
  }, [dispatch]);

  // Fetch only employees managed by this manager
  const fetchEmployees = async () => {
    try {
      const response = await api.get('/users');
      // Filter to only employees (backend already filters by managedBy)
      setEmployees(response.data.users.filter((u) => u.role === 'employee'));
    } catch (err) {
      console.error('Failed to fetch employees', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const result = await dispatch(createTask(formData));
    if (createTask.fulfilled.match(result)) {
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        assignedTo: '',
        priority: 'medium',
        dueDate: '',
      });
    }
  };

  const handleDrop = (taskId, newStatus) => {
    dispatch(updateTaskStatus({ id: taskId, status: newStatus, note: '' }));
  };

  return (
    <div className="app-shell">
      <Navbar />

      <div className="page-shell page-shell--wide">
        <section className="hero-panel" style={{ marginBottom: 22 }}>
          <div className="page-header__eyebrow" style={{ color: 'rgba(226, 232, 240, 0.78)' }}>
            Manager workspace
          </div>
          <div className="page-header" style={{ marginBottom: 0, alignItems: 'flex-end' }}>
          <div>
            <h1 className="hero-panel__title">Team board</h1>
            <p className="hero-panel__description">
              Track progress in real time, assign work cleanly, and keep the team focused on the next move.
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn--secondary"
          >
            {showForm ? 'Close form' : '+ Create Task'}
          </button>
        </div>
          <div className="hero-panel__meta">
            <span className="badge">Live task stream</span>
            <span className="badge">Manager controls</span>
          </div>
        </section>

        {loading && <p className="page-header__description">Loading tasks...</p>}
        {error && <div className="pill pill--danger" style={{ marginBottom: 16 }}>{error}</div>}

        {/* Create Task Form */}
        {showForm && (
          <form
            onSubmit={handleCreateTask}
            className="panel"
            style={{ marginBottom: 20 }}
          >
            <h3 className="panel__title">New task</h3>
            <div className="form-grid">
              <div className="field">
                <label className="field__label" htmlFor="task-title">Title *</label>
                <input
                  id="task-title"
                  className="input"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="task-assignee">Assign To *</label>
                <select
                  id="task-assignee"
                  className="select"
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select employee</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.username}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label className="field__label" htmlFor="task-priority">Priority</label>
                <select
                  id="task-priority"
                  className="select"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="field">
                <label className="field__label" htmlFor="task-due-date">Due Date</label>
                <input
                  id="task-due-date"
                  className="input"
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                />
              </div>
              <div className="field field--full">
                <label className="field__label" htmlFor="task-description">Description</label>
                <textarea
                  id="task-description"
                  className="textarea"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <button type="submit" className="btn btn--primary">
                Create Task
              </button>
            </div>
          </form>
        )}

        {!loading && (
          <div className="kanban-board">
            {COLUMNS.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                tasks={tasks}
                onDrop={handleDrop}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;