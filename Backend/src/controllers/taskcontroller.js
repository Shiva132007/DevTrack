import User from '../models/User.js';
import Task from '../models/Task.js';

// CREATE TASK
const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, priority, dueDate, project } = req.body;

    const employee = await User.findById(assignedTo);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Assigned employee not found',
      });
    }

    if (employee.role !== 'employee') {
      return res.status(400).json({
        success: false,
        message: 'Tasks can only be assigned to employees',
      });
    }

    if (req.user.role === 'manager') {
      if (employee.managedBy?.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only assign tasks to your own employees',
        });
      }
    }

    const task = await Task.create({
      title,
      description,
      assignedTo,
      priority,
      dueDate,
      project,
      createdBy: req.user._id,
      history: [{ status: 'todo', changedBy: req.user._id, note: 'Task created' }],
    });

    await task.populate([
      { path: 'assignedTo', select: 'username email role' },
      { path: 'createdBy', select: 'username email role' },
    ]);

    req.io.emit('task:created', task);

    res.status(201).json({
      success: true,
      task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET TASKS
const getTasks = async (req, res) => {
  try {
    const { status, priority, assignedTo, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (req.user.role === 'admin') {
      if (assignedTo) filter.assignedTo = assignedTo;
    } else if (req.user.role === 'manager') {
      filter.createdBy = req.user._id;
      if (assignedTo) filter.assignedTo = assignedTo;
    } else {
      filter.assignedTo = req.user._id;
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const skip = (Number(page) - 1) * Number(limit);

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate('assignedTo', 'username email role')
        .populate('createdBy', 'username email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Task.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      tasks,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET TASK BY ID
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'username email role')
      .populate('createdBy', 'username email role')
      .populate('history.changedBy', 'username email role');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    if (
      req.user.role === 'employee' &&
      task.assignedTo._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE TASK STATUS
const updateTaskStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    if (req.user.role === 'employee' && task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own tasks',
      });
    }

    task.status = status;
    task.history.push({
      status,
      changedBy: req.user._id,
      note: note || '',
    });

    await task.save();
    await task.populate([
      { path: 'assignedTo', select: 'username email role' },
      { path: 'createdBy', select: 'username email role' },
    ]);

    req.io.emit('task:updated', task);

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// EDIT TASK DETAILS (MANAGER & ADMIN)
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    if (
      req.user.role === 'manager' &&
      task.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Managers can only edit their own tasks',
      });
    }

    const allowedFields = ['title', 'description', 'priority', 'dueDate', 'assignedTo'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) task[field] = req.body[field];
    });

    await task.save();
    await task.populate([
      { path: 'assignedTo', select: 'username email role' },
      { path: 'createdBy', select: 'username email role' },
    ]);

    req.io.emit('task:updated', task);

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE TASK
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    req.io.emit('task:deleted', { id: req.params.id });

    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET TASK STATS
const getTaskStats = async (req, res) => {
  try {
    const filter = req.user.role === 'manager' ? { createdBy: req.user._id } : {};

    const [byStatus, byPriority, total] = await Promise.all([
      Task.aggregate([{ $match: filter }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Task.aggregate([{ $match: filter }, { $group: { _id: '$priority', count: { $sum: 1 } } }]),
      Task.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      byStatus,
      byPriority,
      total,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  createTask,
  getTasks,
  getTaskById,
  updateTaskStatus,
  updateTask,
  deleteTask,
  getTaskStats,
};