const jwt = require('jsonwebtoken');
const { User, Store } = require('../models');
const config = require('../config/environment');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      storeId: user.storeId,
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, storeCode } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email address already exists.',
      });
    }

    let storeId = null;
    if (storeCode) {
      const store = await Store.findOne({ storeCode: storeCode.toUpperCase() });
      if (store) storeId = store._id;
    }

    if (!storeId) {
      const defaultStore = await Store.findOne({ storeCode: config.defaultStoreId });
      if (defaultStore) storeId = defaultStore._id;
    }

    const user = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      role: 'CUSTOMER',
      storeId,
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          storeId: user.storeId,
        },
      },
      message: 'Account registered successfully',
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Explicitly select password for verification
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'This account has been deactivated. Please contact store management.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          storeId: user.storeId,
        },
      },
      message: 'Logged in successfully',
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('storeId', 'storeCode name address');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    res.status(200).json({
      success: true,
      data: user,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/auth/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: 'Current password does not match.',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/logout
const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

module.exports = {
  register,
  login,
  getCurrentUser,
  updateProfile,
  changePassword,
  logout,
};
