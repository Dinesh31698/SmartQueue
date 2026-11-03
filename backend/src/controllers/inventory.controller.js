const { Inventory, Product } = require('../models');

// GET /api/inventory
const listInventory = async (req, res, next) => {
  try {
    const { storeId, lowStockOnly, page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (storeId) filter.storeId = storeId;

    if (lowStockOnly === 'true') {
      filter.$expr = { $lte: ['$currentStock', '$minStockAlert'] };
    }

    let inventoryQuery = Inventory.find(filter)
      .populate('productId', 'name barcode brand price imageUrl categoryId')
      .sort({ currentStock: 1 });

    const total = await Inventory.countDocuments(filter);
    const items = await inventoryQuery
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));

    // Optional client search filter on populated product name
    let resultItems = items;
    if (search) {
      const reg = new RegExp(search, 'i');
      resultItems = items.filter(
        (i) => i.productId && (reg.test(i.productId.name) || reg.test(i.productId.barcode))
      );
    }

    res.status(200).json({
      success: true,
      data: {
        inventory: resultItems,
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/inventory/low-stock
const getLowStockAlerts = async (req, res, next) => {
  try {
    const { storeId } = req.query;
    const filter = {
      $expr: { $lte: ['$currentStock', '$minStockAlert'] },
    };
    if (storeId) filter.storeId = storeId;

    const lowStockItems = await Inventory.find(filter)
      .populate('productId', 'name barcode brand price unit')
      .populate('storeId', 'storeCode name')
      .sort({ currentStock: 1 });

    res.status(200).json({
      success: true,
      data: lowStockItems,
      count: lowStockItems.length,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/inventory/restock
const restockProduct = async (req, res, next) => {
  try {
    const { productId, storeId, quantity, type = 'RESTOCK', reason = 'Regular Restock' } = req.body;
    const qty = parseInt(quantity, 10);

    if (isNaN(qty) || qty === 0) {
      return res.status(400).json({ success: false, error: 'Invalid quantity provided.' });
    }

    let inventory = await Inventory.findOne({ productId, storeId });
    if (!inventory) {
      // Create record if missing
      inventory = new Inventory({
        storeId,
        productId,
        currentStock: 0,
        minStockAlert: 10,
        stockMovements: [],
      });
    }

    const previousStock = inventory.currentStock;
    const balanceAfter = Math.max(0, previousStock + qty);
    inventory.currentStock = balanceAfter;
    inventory.lastRestockedAt = new Date();

    inventory.stockMovements.push({
      type: type || (qty > 0 ? 'RESTOCK' : 'ADJUSTMENT'),
      quantity: qty,
      balanceAfter,
      reason,
      recordedBy: req.user ? req.user.id : null,
      timestamp: new Date(),
    });

    await inventory.save();

    res.status(200).json({
      success: true,
      data: inventory,
      message: `Stock updated successfully. Previous: ${previousStock}, New: ${balanceAfter}`,
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/inventory/:id
const updateInventoryDetails = async (req, res, next) => {
  try {
    const { minStockAlert, aisleLocation, shelfNumber, batchNumber, expiryDate } = req.body;
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ success: false, error: 'Inventory record not found' });
    }

    if (minStockAlert !== undefined) inventory.minStockAlert = minStockAlert;
    if (aisleLocation !== undefined) inventory.aisleLocation = aisleLocation;
    if (shelfNumber !== undefined) inventory.shelfNumber = shelfNumber;
    if (batchNumber !== undefined) inventory.batchNumber = batchNumber;
    if (expiryDate !== undefined) inventory.expiryDate = expiryDate;

    await inventory.save();

    res.status(200).json({
      success: true,
      data: inventory,
      message: 'Inventory details updated',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listInventory,
  getLowStockAlerts,
  restockProduct,
  updateInventoryDetails,
};
