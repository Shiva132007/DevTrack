import { useSelector } from 'react-redux';

const priorityColors = {
  high: { bg: '#fdecea', text: '#a61b1b' },
  medium: { bg: '#fff4e0', text: '#8a5a00' },
  low: { bg: '#e8f5e9', text: '#1b5e20' },
};

const TaskCard = ({ task }) => {
  const { user } = useSelector((state) => state.auth);
  const colors = priorityColors[task.priority?.toLowerCase()] || priorityColors.medium;

  return (
    <div className="task-card">
      <div className="task-card__title">{task.title}</div>

      {task.description && (
        <div className="task-card__description">{task.description}</div>
      )}

      <div className="task-card__footer">
        <span
          className="task-card__tag"
          style={{
            background: colors.bg,
            color: colors.text,
          }}
        >
          {task.priority}
        </span>

        {/* Show who it's assigned to — useful for manager/admin views */}
        {user?.role !== 'employee' && task.assignedTo && (
          <span className="task-card__meta">
            {task.assignedTo.username}
          </span>
        )}
      </div>

      {task.dueDate && (
        <div className="task-card__meta" style={{ marginTop: 8 }}>
          Due: {new Date(task.dueDate).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};

export default TaskCard;