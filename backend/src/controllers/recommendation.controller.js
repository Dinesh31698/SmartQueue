const { Product, Recommendation } = require('../models');
const aiAssistant = require('../services/aiAssistant');

// GET /api/recommendations/trending
const getTrending = async (req, res, next) => {
  try {
    const { storeId, limit = 8 } = req.query;
    const filter = {
      $or: [{ isActive: true }, { isAvailable: true }, { isActive: { $exists: false } }],
      isTrending: true,
    };
    if (storeId) filter.storeId = storeId;

    let products = await Product.find(filter)
      .populate('categoryId', 'name slug icon')
      .limit(parseInt(limit, 10));

    // Fallback if none flagged
    if (products.length === 0) {
      products = await Product.find({
        $or: [{ isActive: true }, { isAvailable: true }, { isActive: { $exists: false } }],
      }).limit(parseInt(limit, 10));
    }

    res.status(200).json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
};

// GET /api/recommendations/healthy
const getHealthyPicks = async (req, res, next) => {
  try {
    const { storeId, limit = 8 } = req.query;
    const filter = {
      $or: [{ isActive: true }, { isAvailable: true }, { isActive: { $exists: false } }],
      isHealthyPick: true,
    };
    if (storeId) filter.storeId = storeId;

    let products = await Product.find(filter)
      .populate('categoryId', 'name slug icon')
      .limit(parseInt(limit, 10));

    if (products.length === 0) {
      products = await Product.find({
        $or: [{ isActive: true }, { isAvailable: true }, { isActive: { $exists: false } }],
      }).limit(parseInt(limit, 10));
    }

    res.status(200).json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
};

// GET /api/recommendations/frequently-bought-together/:productId
const getFrequentlyBoughtTogether = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const rec = await Recommendation.findOne({ productId }).populate('relatedProductIds');

    if (rec && rec.relatedProductIds && rec.relatedProductIds.length > 0) {
      return res.status(200).json({ success: true, data: rec.relatedProductIds });
    }

    // Fallback: return products in same category
    const currentProduct = await Product.findById(productId);
    if (currentProduct) {
      const categoryRelated = await Product.find({
        categoryId: currentProduct.categoryId,
        _id: { $ne: currentProduct._id },
        isActive: true,
      }).limit(4);
      return res.status(200).json({ success: true, data: categoryRelated });
    }

    const fallbackProducts = await Product.find({ isActive: true }).limit(4);
    res.status(200).json({ success: true, data: fallbackProducts });
  } catch (err) {
    next(err);
  }
};

// POST /api/recommendations/ai-assistant
const queryAIAssistant = async (req, res, next) => {
  try {
    const { query, storeId, cartItems } = req.body;
    const targetStoreId = storeId || (req.user ? req.user.storeId : null);

    const result = await aiAssistant.processQuery(query, targetStoreId, cartItems);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTrending,
  getHealthyPicks,
  getFrequentlyBoughtTogether,
  queryAIAssistant,
};
