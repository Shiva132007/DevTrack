import User from '../models/User.js';
import jwt from 'jsonwebtoken';

//Generate Token
const generateToken = (id) => {
  return jwt.sign(
    { id },                        // ← must be "id" not "userId"
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

//Registration
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({      // ← added return so it stops here
        success: false,
        message: 'User already exists',
      });
    }

    const user = await User.create({
      username,
      email,
      password,
      role: 'employee',
      managedBy: null,
    });

    const token = generateToken(user._id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // ← true in production
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user,                              
    });
  } catch (error) {
    res.status(500).json({              
      success: false,
      message: error.message,
    });
  }
};

//LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if account is active
    if (!user.isActive) {                
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Contact admin.',
      });
    }

    // Use comparePassword method from User model
    const isMatch = await user.comparePassword(password); 
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user,                              
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//LOGOUT 
const logout = async (req, res) => {
  try {
    res.clearCookie('token');
    return res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//GET ME (who is currently logged in)
const getMe = async (req, res) => {
  try {
    // req.user is already attached by protect middleware
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { register, login, logout, getMe };