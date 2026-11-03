const mongoose = require('mongoose');
const { Product, Category } = require('../models');

/**
 * Smart Supermarket AI Assistant Engine
 * Provides context-aware natural language shopping assistance, dietary guidance,
 * recipe ingredient suggestions, and smart aisle navigation.
 */
class AIAssistantService {
  /**
   * Process a natural language query from a customer
   * @param {string} query - Customer text query
   * @param {string} storeId - Store ID
   * @param {Array} cartItems - Optional current cart items
   * @returns {Promise<{reply: string, suggestedProducts: Array, intent: string, tips: Array}>}
   */
  async processQuery(query, storeId, cartItems = []) {
    const q = (query || '').toLowerCase().trim();
    let reply = '';
    let suggestedProducts = [];
    let intent = 'GENERAL';
    let tips = [];
    const isDbReady = mongoose.connection.readyState === 1;

    if (!q) {
      return {
        reply: "Hello! I'm your SmartQueue AI Assistant. How can I help you today? You can ask me to find products, recommend healthy alternatives, give recipe ideas, or locate aisles.",
        suggestedProducts: [],
        intent: 'GREETING',
        tips: [
          'Try: "Healthy snacks under $5"',
          'Try: "Where can I find whole milk?"',
          'Try: "Ingredients for pasta dinner"',
        ],
      };
    }

    // 1. Dietary / Healthy query
    if (q.includes('healthy') || q.includes('organic') || q.includes('diet') || q.includes('vegan') || q.includes('nutritio') || q.includes('low fat') || q.includes('protein')) {
      intent = 'HEALTHY_RECOMMENDATION';
      if (isDbReady) {
        const filter = { isHealthyPick: true };
        if (storeId) filter.storeId = storeId;
        suggestedProducts = await Product.find(filter)
          .populate('categoryId', 'name')
          .limit(6);
      }

      reply = "Here are our top healthy, dietitian-approved supermarket picks rich in nutrients and low in refined sugars:";
      tips = [
        'Check the nutrition label for sodium and trans fats',
        'Pair fresh produce with whole grains for balanced energy',
      ];
    }
    // 2. Location / Aisle query
    else if (q.includes('where is') || q.includes('where can i find') || q.includes('aisle') || q.includes('locate') || q.includes('find')) {
      intent = 'AISLE_LOCATION';
      const terms = q.replace(/(where is|where can i find|aisle|locate|find|the|please|in the store)/gi, '').trim();

      if (isDbReady) {
        const searchRegex = new RegExp(terms, 'i');
        const filter = {
          $or: [
            { name: searchRegex },
            { brand: searchRegex },
            { aisleLocation: searchRegex },
          ],
        };
        if (storeId) filter.storeId = storeId;
        suggestedProducts = await Product.find(filter)
          .populate('categoryId', 'name')
          .limit(4);
      }

      if (suggestedProducts.length > 0) {
        const locations = suggestedProducts
          .map((p) => `${p.name} is in **${p.aisleLocation || 'General Aisle'}**`)
          .join('\n• ');
        reply = `Found location information:\n• ${locations}`;
      } else {
        reply = `Found location information: For "${terms || 'items'}", please check Aisles 1-4 or look up our store category directory.`;
      }
    }
    // 3. Recipe / Meal ingredients
    else if (q.includes('recipe') || q.includes('cook') || q.includes('dinner') || q.includes('breakfast') || q.includes('pasta') || q.includes('salad') || q.includes('sandwich')) {
      intent = 'RECIPE_SUGGESTION';
      let mealKeywords = ['milk', 'bread', 'apple', 'pasta', 'organic', 'granola'];

      if (q.includes('breakfast')) {
        mealKeywords = ['milk', 'granola', 'apple', 'bread'];
        reply = "Here are wholesome breakfast essentials available in our aisles:";
      } else if (q.includes('pasta')) {
        mealKeywords = ['pasta', 'sauce', 'cheese', 'oil'];
        reply = "For a delicious Italian pasta dinner, here are matching ingredients:";
      } else {
        reply = "Here are popular ingredients for your meal plan:";
      }

      if (isDbReady) {
        const orFilter = mealKeywords.map((k) => ({ name: { $regex: k, $options: 'i' } }));
        const filter = { $or: orFilter };
        if (storeId) filter.storeId = storeId;
        suggestedProducts = await Product.find(filter)
          .populate('categoryId', 'name')
          .limit(6);
      }

      tips = [
        'Don’t forget fresh herbs for extra flavor without extra calories!',
      ];
    }
    // 4. Budget / Price query
    else if (q.includes('cheap') || q.includes('budget') || q.includes('under') || q.includes('affordable') || q.includes('discount') || q.includes('deal')) {
      intent = 'BUDGET_OPTIMIZER';
      const match = q.match(/under\s*\$?(\d+(\.\d+)?)/);
      const limitPrice = match ? parseFloat(match[1]) : 10;

      if (isDbReady) {
        const filter = { isActive: true, price: { $lte: limitPrice } };
        if (storeId) filter.storeId = storeId;
        suggestedProducts = await Product.find(filter)
          .sort({ price: 1 })
          .populate('categoryId', 'name')
          .limit(6);
      }

      reply = `Here are top value picks under $${limitPrice}:`;
    }
    // 5. Fallback product search
    else {
      intent = 'SEARCH';
      if (isDbReady) {
        const searchRegex = new RegExp(q, 'i');
        const filter = {
          $or: [
            { name: searchRegex },
            { brand: searchRegex },
            { description: searchRegex },
          ],
        };
        if (storeId) filter.storeId = storeId;
        suggestedProducts = await Product.find(filter)
          .populate('categoryId', 'name')
          .limit(5);
      }

      if (suggestedProducts.length > 0) {
        reply = `I found ${suggestedProducts.length} items matching "${query}":`;
      } else {
        reply = `I couldn't find any direct match for "${query}". You can browse by category, scan a barcode directly, or ask for healthy recommendations!`;
      }
    }

    return {
      reply,
      suggestedProducts,
      intent,
      tips,
    };
  }
}

module.exports = new AIAssistantService();
