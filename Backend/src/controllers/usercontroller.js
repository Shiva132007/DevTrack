import User from '../models/User.js';

// GET ALL USERS
const getUsers = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'manager') {
      filter = { managedBy: req.user._id };
    } else if (req.user.role === 'employee') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const users = await User.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE USER
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (
      req.user.role === 'manager' &&
      user.managedBy?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// CREATE USER
const createUser = async (req, res) => {
  try {
    const { username, email, password, role, managedBy } = req.body;

    if (req.user.role === 'manager' && role !== 'employee') {
      return res.status(403).json({
        success: false,
        message: 'Managers can only create employee accounts',
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    const user = await User.create({
      username,
      email,
      password,
      role,
      managedBy: req.user.role === 'manager' ? req.user._id : (managedBy || null),
    });

    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE USER
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (req.user.role === 'manager') {
      if (user.managedBy?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    const allowedFields = ['username', 'isActive'];

    if (req.user.role === 'admin') {
      allowedFields.push('role', 'managedBy');
    }

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE USER
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { getUsers, getUserById, createUser, updateUser, deleteUser };