const { Category } = require('../models');

// GET /api/categories
const listCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
    res.status(200).json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};

// GET /api/categories/:id
const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }
    res.status(200).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

// POST /api/categories
const createCategory = async (req, res, next) => {
  try {
    const { name, description, icon, displayOrder } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existing = await Category.findOne({ slug });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Category already exists' });
    }

    const category = await Category.create({
      name,
      slug,
      description,
      icon,
      displayOrder: displayOrder || 0,
    });

    res.status(201).json({ success: true, data: category, message: 'Category created' });
  } catch (err) {
    next(err);
  }
};

// PUT /api/categories/:id
const updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }
    res.status(200).json({ success: true, data: category, message: 'Category updated' });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/categories/:id
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }
    res.status(200).json({ success: true, message: 'Category deactivated' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
