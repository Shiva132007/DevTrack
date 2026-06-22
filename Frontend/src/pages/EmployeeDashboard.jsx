import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, updateTaskStatus } from '../store/slices/taskSlice.js';
import KanbanColumn from '../components/Board/KanbanColumn.jsx';
import Navbar from '../components/Layout/Navbar.jsx';
import useSocket from '../hooks/useSocket.js';

const COLUMNS = ['todo', 'in_progress', 'review', 'done'];

const EmployeeDashboard = () => {
  const dispatch = useDispatch();
  const { tasks, loading, error } = useSelector((state) => state.tasks);

  // Connect to Socket.io — receive live updates
  useSocket();

  // Fetch tasks on mount — backend filters by role automatically
  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  // Called when employee drags a card to a new column
  const handleDrop = (taskId, newStatus) => {
    dispatch(updateTaskStatus({ id: taskId, status: newStatus, note: '' }));
  };

  return (
    <div className="app-shell">
      <Navbar />

      <div className="page-shell page-shell--wide">
        <section className="hero-panel" style={{ marginBottom: 22 }}>
          <div className="page-header__eyebrow" style={{ color: 'rgba(226, 232, 240, 0.78)' }}>
            Employee workspace
          </div>
          <h1 className="hero-panel__title">My tasks</h1>
          <p className="hero-panel__description">
            Drag cards across the board to keep status changes fast, clear, and visible to the team.
          </p>
          <div className="hero-panel__meta">
            <span className="badge">Real-time updates</span>
            <span className="badge">Drag and drop workflow</span>
          </div>
        </section>

        {loading && <p className="page-header__description">Loading tasks...</p>}
        {error && <div className="pill pill--danger" style={{ marginBottom: 16 }}>{error}</div>}

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

export default EmployeeDashboard;