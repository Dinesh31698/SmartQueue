const mongoose = require('mongoose');
const {
  User,
  Store,
  Category,
  Product,
  Inventory,
  Counter,
  StoreSettings,
} = require('../models');
const { connectDB } = require('../config/db');

const seedSupermarketData = async () => {
  try {
    console.log('[Seed] Checking and seeding SmartQueue baseline data...');

    // 1. Seed Store
    let store = await Store.findOne({ storeCode: 'STORE-001' });
    if (!store) {
      store = await Store.create({
        storeCode: 'STORE-001',
        name: 'SmartQueue Supermarket Flagship',
        address: {
          street: '100 Feet Road, Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          zipCode: '560038',
          country: 'India',
        },
        phone: '+91 80 4123 4567',
        email: 'flagship@smartqueue.com',
        nfcTagPayload: 'SMARTQUEUE:STORE:STORE-001',
        qrCodePayload: 'SMARTQUEUE:STORE:STORE-001',
        isActive: true,
      });
      console.log(`[Seed] Created Store: ${store.name}`);
    }

    // 2. Seed Store Settings
    await StoreSettings.findOneAndUpdate(
      { storeId: store._id },
      {
        storeId: store._id,
        maxQueuePerLane: 15,
        defaultEstimatedWaitPerCustomerMinutes: 2.5,
        autoAssignCounter: true,
        enableAiRecommendations: true,
        enableNfc: true,
        enableQr: true,
      },
      { upsert: true, new: true }
    );

    // 3. Seed Users
    const defaultUsers = [
      {
        name: 'Super Administrator',
        email: 'admin@smartqueue.com',
        password: 'Admin@123',
        role: 'ADMIN',
        storeId: store._id,
      },
      {
        name: 'Suresh Kumar (Store Manager)',
        email: 'manager@smartqueue.com',
        password: 'Manager@123',
        role: 'MANAGER',
        storeId: store._id,
      },
      {
        name: 'Aarav Sharma (Cashier 1)',
        email: 'cashier1@smartqueue.com',
        password: 'Cashier@123',
        role: 'CASHIER',
        storeId: store._id,
      },
      {
        name: 'Priya Patel (Cashier 2)',
        email: 'cashier2@smartqueue.com',
        password: 'Cashier@123',
        role: 'CASHIER',
        storeId: store._id,
      },
      {
        name: 'Rahul Verma (Customer)',
        email: 'customer1@smartqueue.com',
        phone: '9876543210',
        password: 'Customer@123',
        role: 'CUSTOMER',
        storeId: store._id,
      },
      {
        name: 'Ananya Sen (Customer)',
        email: 'customer2@smartqueue.com',
        phone: '9876543211',
        password: 'Customer@123',
        role: 'CUSTOMER',
        storeId: store._id,
      },
    ];

    const seededUsers = {};
    for (const u of defaultUsers) {
      let user = await User.findOne({ email: u.email });
      if (!user) {
        user = await User.create(u);
        console.log(`[Seed] Created User: ${u.email} [${u.role}]`);
      }
      seededUsers[u.email] = user;
    }

    // 4. Seed Categories
    const categories = [
      { name: 'Dairy & Eggs', slug: 'dairy-eggs', icon: 'milk' },
      { name: 'Staples & Grains', slug: 'staples-grains', icon: 'wheat' },
      { name: 'Bakery & Bread', slug: 'bakery-bread', icon: 'cookie' },
      { name: 'Snacks & Packaged', slug: 'snacks-packaged', icon: 'package' },
      { name: 'Beverages', slug: 'beverages', icon: 'coffee' },
      { name: 'Personal Care', slug: 'personal-care', icon: 'heart' },
    ];

    const categoryMap = {};
    for (const cat of categories) {
      const savedCat = await Category.findOneAndUpdate({ slug: cat.slug }, cat, { upsert: true, new: true });
      categoryMap[cat.name] = savedCat._id;
    }

    // 5. Seed Products
    const productsData = [
      {
        barcode: '8901262010114',
        name: 'Amul Taaza Homogenised Toned Milk 1L',
        brand: 'Amul',
        category: 'Dairy & Eggs',
        price: 74,
        costPrice: 62,
        stockQuantity: 50,
        minStockThreshold: 15,
        unit: 'L',
        aisleLocation: 'Aisle 1 - Dairy',
        taxPercent: 5,
        isHealthyPick: true,
        isTrending: true,
        isActive: true,
        isAvailable: true,
        dietaryFlags: { isOrganic: false, isGlutenFree: true, isVegan: false },
        nutritionalInfo: { calories: 58, sugar: '4.7g', protein: '3.1g', fat: '3.0g', sodium: '45mg' },
      },
      {
        barcode: '8901030383321',
        name: 'Aashirvaad Shudh Chakki Atta 5kg',
        brand: 'Aashirvaad',
        category: 'Staples & Grains',
        price: 285,
        costPrice: 240,
        stockQuantity: 30,
        minStockThreshold: 10,
        unit: 'kg',
        aisleLocation: 'Aisle 2 - Grains',
        taxPercent: 5,
        isHealthyPick: true,
        isTrending: true,
        isActive: true,
        isAvailable: true,
        dietaryFlags: { isOrganic: false, isGlutenFree: false, isVegan: true },
        nutritionalInfo: { calories: 340, sugar: '2g', protein: '11g', fat: '1.5g', sodium: '10mg' },
      },
      {
        barcode: '8901491101836',
        name: 'Tata Salt Vacuum Evaporated Iodised 1kg',
        brand: 'Tata',
        category: 'Staples & Grains',
        price: 28,
        costPrice: 22,
        stockQuantity: 100,
        minStockThreshold: 20,
        unit: 'kg',
        aisleLocation: 'Aisle 2 - Spices',
        taxPercent: 5,
        isHealthyPick: false,
        isTrending: false,
        isActive: true,
        isAvailable: true,
        dietaryFlags: { isOrganic: false, isGlutenFree: true, isVegan: true },
        nutritionalInfo: { calories: 0, sugar: '0g', protein: '0g', fat: '0g', sodium: '387mg' },
      },
      {
        barcode: '8901058852441',
        name: 'Maggi 2-Minute Instant Noodles Masala 280g',
        brand: 'Nestle',
        category: 'Snacks & Packaged',
        price: 58,
        costPrice: 48,
        stockQuantity: 40,
        minStockThreshold: 12,
        unit: 'pack',
        aisleLocation: 'Aisle 3 - Instant Foods',
        taxPercent: 12,
        isHealthyPick: false,
        isTrending: true,
        isActive: true,
        isAvailable: true,
        dietaryFlags: { isOrganic: false, isGlutenFree: false, isVegan: true },
        nutritionalInfo: { calories: 427, sugar: '2.5g', protein: '8g', fat: '15.7g', sodium: '850mg' },
      },
      {
        barcode: '8901725181122',
        name: 'Britannia 100% Whole Wheat Bread 400g',
        brand: 'Britannia',
        category: 'Bakery & Bread',
        price: 50,
        costPrice: 40,
        stockQuantity: 25,
        minStockThreshold: 8,
        unit: 'pack',
        aisleLocation: 'Aisle 4 - Bakery',
        taxPercent: 5,
        isHealthyPick: true,
        isTrending: true,
        isActive: true,
        isAvailable: true,
        dietaryFlags: { isOrganic: false, isGlutenFree: false, isVegan: true },
        nutritionalInfo: { calories: 245, sugar: '3g', protein: '9.2g', fat: '1.8g', sodium: '320mg' },
      },
      {
        barcode: '8901063012885',
        name: 'Tata Tea Gold Leaf Tea 500g',
        brand: 'Tata Tea',
        category: 'Beverages',
        price: 320,
        costPrice: 275,
        stockQuantity: 35,
        minStockThreshold: 10,
        unit: 'pack',
        aisleLocation: 'Aisle 5 - Beverages',
        taxPercent: 5,
        isHealthyPick: true,
        isTrending: false,
        isActive: true,
        isAvailable: true,
        dietaryFlags: { isOrganic: false, isGlutenFree: true, isVegan: true },
        nutritionalInfo: { calories: 0, sugar: '0g', protein: '0g', fat: '0g', sodium: '0mg' },
      },
    ];

    for (const p of productsData) {
      const categoryId = categoryMap[p.category] || null;
      const product = await Product.findOneAndUpdate(
        { storeId: store._id, barcode: p.barcode },
        { ...p, storeId: store._id, categoryId },
        { upsert: true, new: true }
      );

      // Seed / update inventory record
      await Inventory.findOneAndUpdate(
        { storeId: store._id, productId: product._id },
        {
          storeId: store._id,
          productId: product._id,
          currentStock: product.stockQuantity,
          minThreshold: product.minStockThreshold,
          aisleLocation: p.aisleLocation,
          lastRestockedAt: new Date(),
        },
        { upsert: true }
      );
    }

    // 6. Seed Checkout Counters
    const countersData = [
      {
        counterNumber: 'Counter 1',
        name: 'Express Lane (UPI)',
        assignedCashierId: seededUsers['cashier1@smartqueue.com']?._id || null,
        status: 'OPEN',
        acceptedPaymentType: 'UPI',
      },
      {
        counterNumber: 'Counter 2',
        name: 'General Counter (All Payment)',
        assignedCashierId: seededUsers['cashier2@smartqueue.com']?._id || null,
        status: 'OPEN',
        acceptedPaymentType: 'ALL',
      },
      {
        counterNumber: 'Counter 3',
        name: 'Card & Cash Counter',
        assignedCashierId: null,
        status: 'OPEN',
        acceptedPaymentType: 'CARD',
      },
      {
        counterNumber: 'Counter 4',
        name: 'Automated Self-Checkout 1',
        assignedCashierId: null,
        status: 'OPEN',
        acceptedPaymentType: 'SELF_CHECKOUT',
      },
    ];

    for (const c of countersData) {
      await Counter.findOneAndUpdate(
        { storeId: store._id, counterNumber: c.counterNumber },
        { ...c, storeId: store._id },
        { upsert: true }
      );
    }

    console.log('[Seed] Supermarket database successfully seeded with baseline store, accounts, catalog, inventory, and counters.');
  } catch (error) {
    console.error('[Seed Error] Failed to seed baseline data:', error.message);
  }
};

if (require.main === module) {
  connectDB().then(async () => {
    await seedSupermarketData();
    process.exit(0);
  });
}

module.exports = { seedSupermarketData };
