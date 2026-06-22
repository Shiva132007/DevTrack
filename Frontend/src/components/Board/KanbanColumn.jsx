import TaskCard from '../Task/TaskCard.jsx';

const columnColors = {
  todo: '#888',
  in_progress: '#534AB7',
  review: '#BA7517',
  done: '#0F6E56',
};

const columnLabels = {
  todo: 'Todo',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
};

const KanbanColumn = ({ status, tasks, onDrop }) => {
  const columnTasks = tasks.filter((t) => t.status === status);

  const handleDragOver = (e) => {
    e.preventDefault(); // required to allow dropping
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    onDrop(taskId, status);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="kanban-column"
    >
      <div className="kanban-column__header" style={{ color: columnColors[status] }}>
        <span>{columnLabels[status]}</span>
        <span className="kanban-column__count">{columnTasks.length}</span>
      </div>

      <div className="kanban-column__body">
      {columnTasks.map((task) => (
        <div
          key={task._id}
          draggable
          onDragStart={(e) => e.dataTransfer.setData('taskId', task._id)}
        >
          <TaskCard task={task} />
        </div>
      ))}
      </div>
    </div>
  );
};

export default KanbanColumn;