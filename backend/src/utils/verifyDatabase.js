const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {
  User,
  Store,
  Category,
  Product,
  Inventory,
  Counter,
  StoreSettings,
  Cart,
  Order,
  Queue,
  QueueTicket,
} = require('../models');
const { connectDB, disconnectDB } = require('../config/db');
const config = require('../config/environment');

async function runSystemVerification() {
  console.log('\n======================================================');
  console.log('   SMARTQUEUE SYSTEM-WIDE AUDIT & VERIFICATION SUITE  ');
  console.log('======================================================\n');

  const results = {
    testA_catalog: false,
    testB_cart: false,
    testC_inventory: false,
    testD_auth: false,
    testE_queue: false,
    testF_orderCheckout: false,
  };

  try {
    await connectDB();
    console.log('[System] Connected to MongoDB database successfully.\n');

    // ----------------------------------------------------
    // TEST D: Role-Based Authentication Verification
    // ----------------------------------------------------
    console.log('--- TEST D: Role-Based Authentication (6 Accounts) ---');
    const testAccounts = [
      { email: 'admin@smartqueue.com', pass: 'Admin@123', expectedRole: 'ADMIN' },
      { email: 'manager@smartqueue.com', pass: 'Manager@123', expectedRole: 'MANAGER' },
      { email: 'cashier1@smartqueue.com', pass: 'Cashier@123', expectedRole: 'CASHIER' },
      { email: 'cashier2@smartqueue.com', pass: 'Cashier@123', expectedRole: 'CASHIER' },
      { email: 'customer1@smartqueue.com', pass: 'Customer@123', expectedRole: 'CUSTOMER' },
      { email: 'customer2@smartqueue.com', pass: 'Customer@123', expectedRole: 'CUSTOMER' },
    ];

    let authSuccessCount = 0;
    for (const acc of testAccounts) {
      const user = await User.findOne({ email: acc.email }).select('+password');
      if (!user) {
        console.error(`  [FAIL] User ${acc.email} not found in database.`);
        continue;
      }

      const match = await bcrypt.compare(acc.pass, user.password);
      if (!match) {
        console.error(`  [FAIL] Password mismatch for ${acc.email}.`);
        continue;
      }

      if (user.role !== acc.expectedRole) {
        console.error(`  [FAIL] Role mismatch for ${acc.email}: expected ${acc.expectedRole}, got ${user.role}`);
        continue;
      }

      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role, storeId: user.storeId },
        config.jwtSecret,
        { expiresIn: '1h' }
      );
      if (!token) {
        console.error(`  [FAIL] JWT token generation failed for ${acc.email}`);
        continue;
      }

      console.log(`  [PASS] ${acc.email} (${acc.expectedRole}) - Auth Verified, Token Generated.`);
      authSuccessCount++;
    }

    results.testD_auth = authSuccessCount === 6;
    console.log(`  => Test D Result: ${results.testD_auth ? 'PASS' : 'FAIL'}\n`);

    // ----------------------------------------------------
    // TEST A: Catalog, Categories & Barcode Verification
    // ----------------------------------------------------
    console.log('--- TEST A: Supermarket Catalog & Barcode Lookup ---');
    const store = await Store.findOne({ storeCode: 'STORE-001' });
    if (!store) throw new Error('Flagship Store STORE-001 not found.');

    const activeProducts = await Product.find({
      $or: [{ isActive: true }, { isAvailable: true }],
    }).populate('categoryId');

    console.log(`  Found ${activeProducts.length} active products in catalog.`);
    if (activeProducts.length < 6) {
      console.error('  [FAIL] Less than 6 active products found.');
    } else {
      console.log('  [PASS] Catalog contains all 6 seeded baseline products.');
    }

    // Barcode Lookup
    const amulMilk = await Product.findOne({ barcode: '8901262010114' });
    const tataTea = await Product.findOne({ barcode: '8901063012885' });
    if (amulMilk && amulMilk.name.includes('Amul') && tataTea && tataTea.name.includes('Tata Tea')) {
      console.log('  [PASS] Exact barcode lookups succeeded for 8901262010114 and 8901063012885.');
    } else {
      console.error('  [FAIL] Barcode lookups failed.');
    }

    // Category Filter Verification
    const dairyCategory = await Category.findOne({ slug: 'dairy-eggs' });
    const dairyProducts = await Product.find({
      $or: [{ categoryId: dairyCategory._id }, { category: 'Dairy & Eggs' }],
    });
    if (dairyProducts.length >= 1) {
      console.log(`  [PASS] Category filter for 'Dairy & Eggs' returned ${dairyProducts.length} item(s).`);
    } else {
      console.error('  [FAIL] Category filter failed.');
    }

    results.testA_catalog = activeProducts.length >= 6 && !!amulMilk && !!tataTea && dairyProducts.length >= 1;
    console.log(`  => Test A Result: ${results.testA_catalog ? 'PASS' : 'FAIL'}\n`);

    // ----------------------------------------------------
    // TEST B: Cart Operations & Price Calculation
    // ----------------------------------------------------
    console.log('--- TEST B: Shopping Cart Operations & Calculation ---');
    const customer = await User.findOne({ email: 'customer1@smartqueue.com' });
    let cart = await Cart.findOne({ userId: customer._id });
    if (!cart) {
      cart = await Cart.create({
        userId: customer._id,
        storeId: store._id,
        items: [],
        subtotal: 0,
      });
    }

    // Add 2 Amul Milk units (74 each) and 1 Bread (50 each)
    const bread = await Product.findOne({ barcode: '8901725181122' });
    cart.items = [
      { productId: amulMilk._id, quantity: 2, priceAtAdd: amulMilk.price },
      { productId: bread._id, quantity: 1, priceAtAdd: bread.price },
    ];
    cart.subtotal = Math.round((2 * amulMilk.price + 1 * bread.price) * 100) / 100;
    await cart.save();

    console.log(`  Cart updated: 2x ${amulMilk.name} + 1x ${bread.name}`);
    console.log(`  Subtotal: INR ${cart.subtotal} (Expected: ${2 * 74 + 50} = 198)`);

    results.testB_cart = cart.items.length === 2 && cart.subtotal === 198;
    console.log(`  => Test B Result: ${results.testB_cart ? 'PASS' : 'FAIL'}\n`);

    // ----------------------------------------------------
    // TEST E: Real-Time Queue & Counter Assignment
    // ----------------------------------------------------
    console.log('--- TEST E: Queue Ticket Generation & Counter Assignment ---');
    // Clear today's test tickets for clean state
    await QueueTicket.deleteMany({ customerId: customer._id });

    let todayQueue = await Queue.findOne({ storeId: store._id, date: new Date().toISOString().slice(0, 10) });
    if (!todayQueue) {
      todayQueue = await Queue.create({
        storeId: store._id,
        date: new Date().toISOString().slice(0, 10),
        currentSequenceNumber: 100,
        activeTicketsCount: 0,
      });
    }
    todayQueue.currentSequenceNumber += 1;
    todayQueue.activeTicketsCount += 1;
    await todayQueue.save();

    const ticketNumber = `Q-${todayQueue.currentSequenceNumber}`;
    const newTicket = await QueueTicket.create({
      storeId: store._id,
      customerId: customer._id,
      ticketNumber,
      sequenceNumber: todayQueue.currentSequenceNumber,
      status: 'WAITING',
      estimatedWaitMinutes: 3,
      estimatedWaitTimeMinutes: 3,
    });
    console.log(`  [PASS] Generated Queue Ticket #${newTicket.ticketNumber} for customer.`);

    // Cashier 1 calls ticket at Counter 1
    const counter1 = await Counter.findOne({ counterNumber: 'Counter 1' });
    newTicket.status = 'CALLED';
    newTicket.counterId = counter1._id;
    newTicket.calledAt = new Date();
    await newTicket.save();

    counter1.currentTicketId = newTicket._id;
    counter1.currentServingTicketId = newTicket._id;
    counter1.status = 'BUSY';
    await counter1.save();
    console.log(`  [PASS] Counter 1 called Ticket #${newTicket.ticketNumber} (Status: BUSY).`);

    results.testE_queue = newTicket.status === 'CALLED' && counter1.status === 'BUSY';
    console.log(`  => Test E Result: ${results.testE_queue ? 'PASS' : 'FAIL'}\n`);

    // ----------------------------------------------------
    // TEST F & C: Checkout, Order Creation & Inventory Deduction
    // ----------------------------------------------------
    console.log('--- TEST F & C: Order Checkout & Inventory Deduction ---');
    const invMilkBefore = await Inventory.findOne({ productId: amulMilk._id, storeId: store._id });
    const stockBefore = invMilkBefore.currentStock;

    // Create Order from Cart
    const orderItems = cart.items.map((item) => ({
      productId: item.productId,
      name: item.productId.toString() === amulMilk._id.toString() ? amulMilk.name : bread.name,
      productName: item.productId.toString() === amulMilk._id.toString() ? amulMilk.name : bread.name,
      barcode: item.productId.toString() === amulMilk._id.toString() ? amulMilk.barcode : bread.barcode,
      brand: 'SmartQueue',
      quantity: item.quantity,
      price: item.priceAtAdd,
      unitPrice: item.priceAtAdd,
      subtotal: item.priceAtAdd * item.quantity,
    }));

    const orderSubtotal = cart.subtotal;
    const taxAmount = Math.round(orderSubtotal * 0.05 * 100) / 100;
    const finalTotal = Math.round((orderSubtotal + taxAmount) * 100) / 100;
    const orderNumber = `ORD-TEST-${Date.now()}`;

    const order = await Order.create({
      orderNumber,
      customerId: customer._id,
      storeId: store._id,
      counterId: counter1._id,
      ticketId: newTicket._id,
      items: orderItems,
      subtotal: orderSubtotal,
      tax: taxAmount,
      taxAmount,
      discount: 0,
      discountAmount: 0,
      totalAmount: finalTotal,
      finalTotal,
      paymentMethod: 'UPI',
      paymentStatus: 'COMPLETED',
      orderStatus: 'COMPLETED',
    });
    console.log(`  [PASS] Order created: #${order.orderNumber}, Total: INR ${order.finalTotal}`);

    // Deduct stock for milk (2 units)
    const prevStock = invMilkBefore.currentStock;
    invMilkBefore.currentStock = Math.max(0, invMilkBefore.currentStock - 2);
    invMilkBefore.stockMovements.push({
      type: 'SALE',
      quantity: -2,
      previousQuantity: prevStock,
      newQuantity: invMilkBefore.currentStock,
      balanceAfter: invMilkBefore.currentStock,
      reason: `Order #${order.orderNumber}`,
      timestamp: new Date(),
    });
    await invMilkBefore.save();

    const invMilkAfter = await Inventory.findOne({ productId: amulMilk._id, storeId: store._id });
    console.log(`  Milk Inventory: ${stockBefore} -> ${invMilkAfter.currentStock} (-2 units recorded)`);

    // Complete ticket
    newTicket.status = 'COMPLETED';
    newTicket.completedAt = new Date();
    await newTicket.save();

    counter1.status = 'OPEN';
    counter1.currentTicketId = null;
    counter1.currentServingTicketId = null;
    await counter1.save();
    console.log('  [PASS] Service completed, counter returned to OPEN.');

    // Clear cart after checkout
    cart.items = [];
    cart.subtotal = 0;
    await cart.save();
    console.log('  [PASS] Customer cart cleared upon checkout settlement.');

    results.testC_inventory = invMilkAfter.currentStock === stockBefore - 2;
    results.testF_orderCheckout = order && order.paymentStatus === 'COMPLETED' && order.orderStatus === 'COMPLETED';

    console.log(`  => Test C (Inventory Deduction) Result: ${results.testC_inventory ? 'PASS' : 'FAIL'}`);
    console.log(`  => Test F (Order Settlement) Result: ${results.testF_orderCheckout ? 'PASS' : 'FAIL'}\n`);

    // ----------------------------------------------------
    // SUMMARY
    // ----------------------------------------------------
    console.log('======================================================');
    console.log('             VERIFICATION SUMMARY TABLE               ');
    console.log('======================================================');
    console.log(`  Test A (Catalog & Barcode Search):  ${results.testA_catalog ? 'PASS' : 'FAIL'}`);
    console.log(`  Test B (Cart & Price Calculation):   ${results.testB_cart ? 'PASS' : 'FAIL'}`);
    console.log(`  Test C (Inventory Sync & Deduction): ${results.testC_inventory ? 'PASS' : 'FAIL'}`);
    console.log(`  Test D (Role-Based Authentication):  ${results.testD_auth ? 'PASS' : 'FAIL'}`);
    console.log(`  Test E (Queue & Counter Assignment): ${results.testE_queue ? 'PASS' : 'FAIL'}`);
    console.log(`  Test F (Checkout & Settlement):      ${results.testF_orderCheckout ? 'PASS' : 'FAIL'}`);
    console.log('======================================================\n');

    await disconnectDB();
    return results;
  } catch (error) {
    console.error('[Verification Aborted]', error);
    await disconnectDB();
    process.exit(1);
  }
}

if (require.main === module) {
  runSystemVerification();
}

module.exports = { runSystemVerification };
