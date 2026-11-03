const { Product, Inventory, Category } = require('../models');

// GET /api/products
const listProducts = async (req, res, next) => {
  try {
    const {
      search,
      categoryId,
      storeId,
      isHealthyPick,
      isTrending,
      page = 1,
      limit = 24,
      sortBy = 'name',
      sortOrder = 'asc',
    } = req.query;

    const filter = { isActive: true };

    if (storeId) filter.storeId = storeId;
    if (categoryId) filter.categoryId = categoryId;
    if (isHealthyPick === 'true') filter.isHealthyPick = true;
    if (isTrending === 'true') filter.isTrending = true;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate('categoryId', 'name slug icon')
      .populate('storeId', 'storeCode name')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));

    // Attach inventory stock level to each product
    const productIds = products.map((p) => p._id);
    const inventories = await Inventory.find({ productId: { $in: productIds } });
    const stockMap = {};
    inventories.forEach((inv) => {
      stockMap[inv.productId.toString()] = inv.currentStock;
    });

    const productsWithStock = products.map((p) => {
      const obj = p.toObject();
      obj.currentStock = stockMap[p._id.toString()] !== undefined ? stockMap[p._id.toString()] : 0;
      return obj;
    });

    res.status(200).json({
      success: true,
      data: {
        products: productsWithStock,
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/barcode/:barcode
const getByBarcode = async (req, res, next) => {
  try {
    const { barcode } = req.params;
    const { storeId } = req.query;

    const filter = { barcode: barcode.trim(), isActive: true };
    if (storeId) filter.storeId = storeId;

    const product = await Product.findOne(filter)
      .populate('categoryId', 'name slug icon')
      .populate('storeId', 'storeCode name');

    if (!product) {
      return res.status(404).json({
        success: false,
        error: `No product found for barcode "${barcode}".`,
      });
    }

    // Lookup current stock
    const inventory = await Inventory.findOne({
      productId: product._id,
      storeId: product.storeId,
    });

    const data = product.toObject();
    data.currentStock = inventory ? inventory.currentStock : 0;
    data.aisleLocation = data.aisleLocation || (inventory ? inventory.aisleLocation : 'Aisle 1');

    res.status(200).json({
      success: true,
      data,
      message: 'Product retrieved successfully',
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('categoryId', 'name slug icon')
      .populate('storeId', 'storeCode name');

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const inventory = await Inventory.findOne({ productId: product._id, storeId: product.storeId });
    const data = product.toObject();
    data.currentStock = inventory ? inventory.currentStock : 0;

    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// POST /api/products
const createProduct = async (req, res, next) => {
  try {
    const {
      storeId,
      barcode,
      name,
      brand,
      description,
      categoryId,
      price,
      costPrice,
      taxPercent,
      unit,
      nutrition,
      isHealthyPick,
      isTrending,
      imageUrl,
      aisleLocation,
      initialStock = 100,
    } = req.body;

    // Check duplicate barcode in store
    const existing = await Product.findOne({ storeId, barcode });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: `Barcode "${barcode}" is already registered in this store.`,
      });
    }

    const product = await Product.create({
      storeId,
      barcode,
      name,
      brand,
      description,
      categoryId,
      price,
      costPrice: costPrice || price * 0.7,
      taxPercent: taxPercent || 5,
      unit: unit || 'item',
      nutrition: nutrition || {},
      isHealthyPick: !!isHealthyPick,
      isTrending: !!isTrending,
      imageUrl,
      aisleLocation,
    });

    // Create corresponding Inventory record
    await Inventory.create({
      storeId,
      productId: product._id,
      currentStock: initialStock,
      minStockAlert: 10,
      aisleLocation: aisleLocation || 'Aisle 1',
      stockMovements: [
        {
          type: 'PURCHASE',
          quantity: initialStock,
          balanceAfter: initialStock,
          reason: 'Initial stock intake',
        },
      ],
    });

    res.status(201).json({
      success: true,
      data: product,
      message: 'Product registered successfully with inventory tracking.',
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product, message: 'Product updated successfully' });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.status(200).json({ success: true, message: 'Product deactivated successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listProducts,
  getByBarcode,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
