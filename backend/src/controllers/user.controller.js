const { User, Store } = require('../models');

// POST /api/users (Create Employee)
const createEmployee = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, storeId } = req.body;

    if (!['CASHIER', 'MANAGER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid employee role specified.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Email already registered.' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      role,
      storeId: storeId || req.user.storeId || null,
    });

    res.status(201).json({
      success: true,
      data: user,
      message: 'Employee account created successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/users
const listUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .populate('storeId', 'storeCode name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));

    res.status(200).json({
      success: true,
      data: {
        users,
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:id
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('storeId');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/:id
const updateUser = async (req, res, next) => {
  try {
    const { name, phone, role, storeId, isActive } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (role) user.role = role;
    if (storeId !== undefined) user.storeId = storeId;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    res.status(200).json({
      success: true,
      data: user,
      message: 'User updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/users/:id/status
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      data: user,
      message: `User account has been ${user.isActive ? 'activated' : 'deactivated'}.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEmployee,
  listUsers,
  getUserById,
  updateUser,
  toggleUserStatus,
};
