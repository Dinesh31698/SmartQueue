const { Cart, Product, Inventory, Store } = require('../models');

// Helper to recalculate cart subtotal
const calculateTotals = (cart) => {
  let subtotal = 0;
  cart.items.forEach((item) => {
    subtotal += item.priceAtAdd * item.quantity;
  });
  cart.subtotal = Math.round(subtotal * 100) / 100;
  return cart;
};

// GET /api/cart
const getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let cart = await Cart.findOne({ userId }).populate({
      path: 'items.productId',
      select: 'name brand barcode price imageUrl unit aisleLocation isHealthyPick',
    });

    if (!cart) {
      const defaultStore = await Store.findOne({ isActive: true });
      cart = await Cart.create({
        userId,
        storeId: defaultStore ? defaultStore._id : null,
        items: [],
        subtotal: 0,
      });
    }

    // Filter out any items where productId was deleted or null
    cart.items = cart.items.filter((item) => item.productId !== null);
    calculateTotals(cart);
    await cart.save();

    res.status(200).json({
      success: true,
      data: {
        cart,
        itemCount: cart.items.reduce((acc, i) => acc + i.quantity, 0),
        subtotal: cart.subtotal,
        estimatedTax: Math.round(cart.subtotal * 0.05 * 100) / 100,
        estimatedTotal: Math.round(cart.subtotal * 1.05 * 100) / 100,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/cart/items
const addItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product || (product.isActive === false && product.isAvailable === false)) {
      return res.status(404).json({ success: false, error: 'Product not available.' });
    }

    // Check inventory stock
    const inventory = await Inventory.findOne({ productId: product._id });
    const availableStock = inventory ? inventory.currentStock : (product.stockQuantity || 999);

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      const defaultStore = await Store.findOne({ isActive: true });
      cart = new Cart({
        userId,
        storeId: defaultStore ? defaultStore._id : product.storeId,
        items: [],
        subtotal: 0,
      });
    }

    const existingIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    const currentQtyInCart = existingIndex > -1 ? cart.items[existingIndex].quantity : 0;
    const requestedTotalQty = currentQtyInCart + parseInt(quantity, 10);

    if (requestedTotalQty > availableStock) {
      return res.status(400).json({
        success: false,
        error: `Only ${availableStock} units available in store.`,
      });
    }

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity = requestedTotalQty;
      cart.items[existingIndex].priceAtAdd = product.price;
    } else {
      cart.items.push({
        productId: product._id,
        quantity: parseInt(quantity, 10),
        priceAtAdd: product.price,
      });
    }

    calculateTotals(cart);
    await cart.save();

    await cart.populate({
      path: 'items.productId',
      select: 'name brand barcode price imageUrl unit aisleLocation',
    });

    res.status(200).json({
      success: true,
      data: cart,
      message: `${product.name} added to cart.`,
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/cart/items/:productId
const updateItemQuantity = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { quantity } = req.body;
    const newQty = parseInt(quantity, 10);

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ success: false, error: 'Cart not found.' });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId.toString()
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, error: 'Item not in cart.' });
    }

    if (newQty <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      // Check stock limit
      const inventory = await Inventory.findOne({ productId });
      const availableStock = inventory ? inventory.currentStock : 999;
      if (newQty > availableStock) {
        return res.status(400).json({
          success: false,
          error: `Cannot set quantity to ${newQty}. Only ${availableStock} available in store.`,
        });
      }
      cart.items[itemIndex].quantity = newQty;
    }

    calculateTotals(cart);
    await cart.save();

    await cart.populate({
      path: 'items.productId',
      select: 'name brand barcode price imageUrl unit aisleLocation',
    });

    res.status(200).json({
      success: true,
      data: cart,
      message: 'Cart updated successfully',
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/cart/items/:productId
const removeItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ success: false, error: 'Cart not found.' });
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId.toString()
    );

    calculateTotals(cart);
    await cart.save();

    res.status(200).json({
      success: true,
      data: cart,
      message: 'Item removed from cart.',
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/cart
const clearCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { items: [], subtotal: 0 },
      { new: true }
    );
    res.status(200).json({
      success: true,
      data: cart,
      message: 'Cart cleared successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCart,
  addItem,
  updateItemQuantity,
  removeItem,
  clearCart,
};
