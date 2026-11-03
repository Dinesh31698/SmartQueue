const mongoose = require('mongoose');
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
  Payment,
  Transaction,
  Queue,
  QueueTicket,
  Notification,
  Recommendation,
} = require('../models');
const { connectDB, disconnectDB } = require('../config/db');

// List of realistic Indian customer names for demo population
const INDIAN_CUSTOMER_NAMES = [
  'Vikram Malhotra', 'Sneha Kulkarni', 'Rohit Nair', 'Kavita Reddy', 'Arjun Singhania',
  'Pooja Iyer', 'Deepak Joshi', 'Sunita Deshmukh', 'Rohan Mukherjee', 'Neha Gupta',
  'Manish Tiwari', 'Priya Nambiar', 'Gaurav Saxena', 'Meera Menon', 'Siddharth Rao',
  'Ananya Bhattacharya', 'Karan Mehra', 'Divya Pillai', 'Abhishek Verma', 'Ritu Aggarwal',
  'Harshvardhan Patil', 'Swati Choudhury', 'Pranav Kothari', 'Shreya Banerjee', 'Varun Hegde',
  'Nandini Shah', 'Aditya Sen', 'Poonam Rane', 'Vivek Kashyap', 'Kritika Jain',
  'Rakesh Chauhan', 'Simran Sethi', 'Mayank Mishra', 'Tanvi Bhatia', 'Akhil Gokhale',
  'Aishwarya Das', 'Nikhil Kapoor', 'Shalini Venkatesh', 'Rajesh Narang', 'Smriti Kaul',
  'Tarun Chawla', 'Shilpa Srinivas', 'Kunal Bhasin', 'Vidya Pai', 'Sameer Anand',
  'Bhavna Mittal', 'Alok Tripathi', 'Isha Sengupta', 'Vishal Goswami', 'Pallavi Shenoy'
];

// Helper to generate consistent phone numbers
const generateIndianPhone = (idx) => {
  const prefixes = ['98201', '98450', '98110', '98300', '97412', '99001', '98902', '98860', '99203', '97114'];
  const prefix = prefixes[idx % prefixes.length];
  const suffix = String(10000 + idx * 73).padStart(5, '0');
  return `+91 ${prefix}${suffix}`;
};

async function seedDemoSimulation() {
  console.log('\n======================================================');
  console.log('   SMARTQUEUE REALISTIC DEMO DATABASE POPULATION      ');
  console.log('======================================================\n');

  try {
    await connectDB();
    console.log('[System] Connected to MongoDB database.');

    // 1. Verify Store
    const store = await Store.findOne({ storeCode: 'STORE-001' });
    if (!store) {
      throw new Error('Flagship Store STORE-001 not found! Please run baseline seed first.');
    }
    console.log(`[Store] Target Store: ${store.name} (${store.storeCode})`);

    // Ensure StoreSettings exists
    await StoreSettings.findOneAndUpdate(
      { storeId: store._id },
      {
        storeId: store._id,
        maxQueuePerLane: 15,
        defaultEstimatedWaitPerCustomerMinutes: 2.5,
        businessHours: { open: '08:00', close: '22:00' },
        autoAssignCounter: true,
        enableAiRecommendations: true,
        enableNfc: true,
        enableQr: true,
      },
      { upsert: true }
    );
    console.log('  [Store Settings] Operational parameters configured.');

    // 2. Fetch Products
    const products = await Product.find({
      $or: [{ isActive: true }, { isAvailable: true }],
    });
    if (products.length < 6) {
      throw new Error(`Expected at least 6 products, found ${products.length}.`);
    }
    console.log(`[Products] Loaded ${products.length} catalog products.`);

    // 3. Create Additional Demo Employees (Cashiers and Manager)
    console.log('\n--- 1. Populating Additional Demo Employees ---');
    const demoStaffData = [
      {
        name: 'Kavita Rao (Cashier 3)',
        email: 'cashier3@smartqueue.com',
        phone: '+91 9845112233',
        password: 'Cashier@123',
        role: 'CASHIER',
        storeId: store._id,
      },
      {
        name: 'Deepak Sen (Cashier 4)',
        email: 'cashier4@smartqueue.com',
        phone: '+91 9845223344',
        password: 'Cashier@123',
        role: 'CASHIER',
        storeId: store._id,
      },
      {
        name: 'Sunita Sharma (Express Cashier)',
        email: 'cashier5@smartqueue.com',
        phone: '+91 9845334455',
        password: 'Cashier@123',
        role: 'CASHIER',
        storeId: store._id,
      },
      {
        name: 'Rajiv Nair (Assistant Manager)',
        email: 'manager2@smartqueue.com',
        phone: '+91 9845445566',
        password: 'Manager@123',
        role: 'MANAGER',
        storeId: store._id,
      },
    ];

    const staffAccounts = [];
    // Include existing cashiers
    const existingCashier1 = await User.findOne({ email: 'cashier1@smartqueue.com' });
    const existingCashier2 = await User.findOne({ email: 'cashier2@smartqueue.com' });
    if (existingCashier1) staffAccounts.push(existingCashier1);
    if (existingCashier2) staffAccounts.push(existingCashier2);

    for (const s of demoStaffData) {
      let user = await User.findOne({ email: s.email });
      if (!user) {
        user = await User.create(s);
        console.log(`  [Created Staff] ${s.name} (${s.email})`);
      } else {
        console.log(`  [Preserved Staff] ${s.name} (${s.email})`);
      }
      staffAccounts.push(user);
    }

    // 4. Update / Assign Checkout Counters
    console.log('\n--- 2. Setting Up Checkout Counters ---');
    const cashier1 = staffAccounts.find((s) => s.email === 'cashier1@smartqueue.com');
    const cashier2 = staffAccounts.find((s) => s.email === 'cashier2@smartqueue.com');
    const cashier3 = staffAccounts.find((s) => s.email === 'cashier3@smartqueue.com');
    const cashier4 = staffAccounts.find((s) => s.email === 'cashier4@smartqueue.com');

    const counterDefinitions = [
      {
        counterNumber: 'Counter 1',
        name: 'Express Lane (UPI)',
        assignedCashierId: cashier1 ? cashier1._id : null,
        status: 'BUSY',
        acceptedPaymentType: 'UPI',
      },
      {
        counterNumber: 'Counter 2',
        name: 'General Counter (All Payment)',
        assignedCashierId: cashier2 ? cashier2._id : null,
        status: 'BUSY',
        acceptedPaymentType: 'ALL',
      },
      {
        counterNumber: 'Counter 3',
        name: 'Card & Cash Counter',
        assignedCashierId: cashier3 ? cashier3._id : null,
        status: 'OPEN',
        acceptedPaymentType: 'CARD',
      },
      {
        counterNumber: 'Counter 4',
        name: 'Automated Self-Checkout 1',
        assignedCashierId: cashier4 ? cashier4._id : null,
        status: 'OPEN',
        acceptedPaymentType: 'SELF_CHECKOUT',
      },
    ];

    const counters = [];
    for (const c of counterDefinitions) {
      const counter = await Counter.findOneAndUpdate(
        { storeId: store._id, counterNumber: c.counterNumber },
        { ...c, storeId: store._id },
        { upsert: true, new: true }
      );
      counters.push(counter);
      console.log(`  [Counter Ready] ${counter.counterNumber}: ${counter.name} [Status: ${counter.status}]`);
    }

    // 5. Create 50 Realistic Demo Customers
    console.log('\n--- 3. Generating 50 Realistic Demo Customers ---');
    const demoCustomers = [];

    // Pre-include existing customer1 and customer2
    const existingCust1 = await User.findOne({ email: 'customer1@smartqueue.com' });
    const existingCust2 = await User.findOne({ email: 'customer2@smartqueue.com' });
    if (existingCust1) demoCustomers.push(existingCust1);
    if (existingCust2) demoCustomers.push(existingCust2);

    for (let i = 0; i < INDIAN_CUSTOMER_NAMES.length; i++) {
      const numStr = String(i + 1).padStart(3, '0');
      const email = `customer.demo${numStr}@example.test`;
      const name = INDIAN_CUSTOMER_NAMES[i];
      const phone = generateIndianPhone(i + 1);

      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          name,
          email,
          phone,
          password: 'Customer@123',
          role: 'CUSTOMER',
          storeId: store._id,
          isActive: true,
        });
      }
      demoCustomers.push(user);
    }
    console.log(`  [Customers] Ready with ${demoCustomers.length} active customer profiles.`);

    // 6. Generate 100 Realistic Customer Orders (Spanning 7 Days)
    console.log('\n--- 4. Simulating 100 Realistic Customer Orders (7 Days) ---');

    // Clean previous simulated demo orders, payments, and transactions
    await Order.deleteMany({ orderNumber: { $regex: /^ORD-2026/ } });
    await Payment.deleteMany({ transactionId: { $regex: /^TXN-(PAY|FAIL)-ORD-2026/ } });
    await Transaction.deleteMany({ notes: 'Simulated Demo Cashier POS Transaction' });

    // Calculate the 7 date buckets matching analytics.controller.js exactly
    const daysCount = 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (daysCount - 1));
    startDate.setHours(0, 0, 0, 0);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const paymentMethods = ['UPI', 'UPI', 'CARD', 'CARD', 'CASH', 'UPI'];
    const orderDocs = [];
    const paymentDocs = [];
    const transactionDocs = [];

    // Order distribution per day across the 7 buckets (i=0 is oldest, i=6 is today)
    const countsPerDay = [12, 14, 15, 16, 15, 14, 14]; // Sum = 100
    let orderSeq = 1000;

    for (let i = 0; i < daysCount; i++) {
      const bucketDate = new Date(startDate);
      bucketDate.setDate(bucketDate.getDate() + i);
      const bucketKey = bucketDate.toISOString().slice(0, 10);
      const count = countsPerDay[i];

      for (let j = 0; j < count; j++) {
        orderSeq++;
        const customer = demoCustomers[orderSeq % demoCustomers.length];
        const assignedCashier = staffAccounts[orderSeq % staffAccounts.length];
        const assignedCounter = counters[orderSeq % counters.length];
        const paymentMethod = paymentMethods[orderSeq % paymentMethods.length];

        // Construct precise timestamp ensuring bucket alignment
        let itemDate;
        if (i === 0 || i === daysCount - 1) {
          // For boundary buckets (oldest day and today), use 19:xx UTC to firmly exceed startDate / todayStart (18:30 UTC in IST)
          itemDate = new Date(bucketDate);
          const minute = (j * 4) % 60;
          const second = (j * 7) % 60;
          itemDate.setUTCHours(19, minute, second, 0);
        } else {
          // For middle days, distribute across realistic retail hours
          itemDate = new Date(bucketDate);
          const hour = 9 + (j % 10); // 9:00 to 19:00 UTC
          const minute = (j * 4) % 60;
          const second = (j * 7) % 60;
          itemDate.setUTCHours(hour, minute, second, 0);
        }

        const dateStr = bucketKey.replace(/-/g, '');
        const orderNumber = `ORD-${dateStr}-${orderSeq}`;

        // Select 1 to 4 products realistically
        const numItems = 1 + (orderSeq % 3);
        const orderItems = [];

        for (let k = 0; k < numItems; k++) {
          const prod = products[(orderSeq + k) % products.length];
          const qty = 1 + ((orderSeq + k) % 2); // 1 or 2 units
          orderItems.push({
            productId: prod._id,
            name: prod.name,
            productName: prod.name,
            barcode: prod.barcode,
            brand: prod.brand,
            quantity: qty,
            price: prod.price,
            unitPrice: prod.price,
            subtotal: prod.price * qty,
          });
        }

        const subtotal = orderItems.reduce((acc, it) => acc + it.subtotal, 0);
        const taxAmount = Math.round(subtotal * 0.05 * 100) / 100;
        const discountAmount = orderSeq % 7 === 0 ? 20 : 0;
        const finalTotal = Math.round((subtotal + taxAmount - discountAmount) * 100) / 100;

        // 94 completed & paid, 2 placed today, 4 cancelled historically
        let orderStatus = 'COMPLETED';
        let paymentStatus = 'PAID';

        if (i === daysCount - 1 && j >= count - 2) {
          orderStatus = 'PLACED';
          paymentStatus = 'PENDING';
        } else if (orderSeq % 25 === 0) {
          orderStatus = 'CANCELLED';
          paymentStatus = 'FAILED';
        }

        const orderId = new mongoose.Types.ObjectId();
        const orderDoc = {
          _id: orderId,
          orderNumber,
          customerId: customer._id,
          storeId: store._id,
          counterId: assignedCounter._id,
          cashierId: assignedCashier._id,
          items: orderItems,
          subtotal,
          tax: taxAmount,
          taxAmount,
          discount: discountAmount,
          discountAmount,
          totalAmount: finalTotal,
          finalTotal,
          paymentMethod,
          paymentStatus,
          orderStatus,
          notes: orderStatus === 'CANCELLED' ? 'Customer cancelled prior to counter payment.' : 'Standard Supermarket Purchase',
          createdAt: itemDate,
          updatedAt: itemDate,
        };
        orderDocs.push(orderDoc);

        // Payment and Cashier Transaction records
        if (paymentStatus === 'PAID') {
          const txnId = `TXN-PAY-${orderNumber}`;
          paymentDocs.push({
            _id: new mongoose.Types.ObjectId(),
            orderId: orderDoc._id,
            transactionId: txnId,
            paymentMethod,
            amount: finalTotal,
            status: 'SUCCESS',
            paymentDetails: {
              providerRef: `GATEWAY-${orderNumber}`,
              upiId: paymentMethod === 'UPI' ? `${customer.email.split('@')[0]}@okaxis` : undefined,
              cardLast4: paymentMethod === 'CARD' ? String(1000 + (orderSeq % 9000)) : undefined,
              notes: 'Simulated Demo Payment Confirmation',
            },
            createdAt: itemDate,
            updatedAt: itemDate,
          });

          transactionDocs.push({
            _id: new mongoose.Types.ObjectId(),
            storeId: store._id,
            orderId: orderDoc._id,
            cashierId: assignedCashier._id,
            counterId: assignedCounter._id,
            type: 'SALE',
            amount: finalTotal,
            paymentMethod,
            status: 'COMPLETED',
            notes: 'Simulated Demo Cashier POS Transaction',
            createdAt: itemDate,
            updatedAt: itemDate,
          });
        } else if (paymentStatus === 'FAILED') {
          const txnId = `TXN-FAIL-${orderNumber}`;
          paymentDocs.push({
            _id: new mongoose.Types.ObjectId(),
            orderId: orderDoc._id,
            transactionId: txnId,
            paymentMethod,
            amount: finalTotal,
            status: 'FAILED',
            paymentDetails: { notes: 'Card declined or session expired.' },
            createdAt: itemDate,
            updatedAt: itemDate,
          });
        }
      }
    }

    // Insert directly using MongoDB native driver to preserve exact timestamps
    await Order.collection.insertMany(orderDocs);
    await Payment.collection.insertMany(paymentDocs);
    await Transaction.collection.insertMany(transactionDocs);

    const paidOrders = orderDocs.filter((o) => o.paymentStatus === 'PAID');
    const totalRevenue = paidOrders.reduce((acc, o) => acc + o.finalTotal, 0);
    console.log(`  [Orders] Created ${orderDocs.length} orders total.`);
    console.log(`  [Paid Orders] ${paidOrders.length} settled orders generating INR ${Math.round(totalRevenue)} revenue.`);
    console.log(`  [Payments] Logged ${paymentDocs.length} payment records.`);
    console.log(`  [Transactions] Logged ${transactionDocs.length} cashier POS transactions.`);

    // 7. Generate Realistic Queue Tickets (Historical, Hourly Today, Serving & Waiting)
    console.log('\n--- 5. Simulating Queue Activity (55 Tickets) ---');
    const todayStr = new Date().toISOString().slice(0, 10);
    await QueueTicket.deleteMany({ notes: 'Simulated Demo Queue Activity' });

    const ticketDocs = [];
    let ticketSeq = 1000;

    // A. 30 Historical completed tickets over the past 6 days
    for (let dayOffset = 6; dayOffset >= 1; dayOffset--) {
      const qDate = new Date(startDate);
      qDate.setDate(qDate.getDate() + (6 - dayOffset));
      const ticketsForDay = 5;

      for (let t = 0; t < ticketsForDay; t++) {
        ticketSeq++;
        const customer = demoCustomers[ticketSeq % demoCustomers.length];
        const counter = counters[ticketSeq % counters.length];

        const hour = 9 + (t * 2);
        const min = (t * 11) % 60;
        const joined = new Date(qDate);
        joined.setUTCHours(hour, min, 0, 0);

        const called = new Date(joined.getTime() + 2 * 60000);
        const serving = new Date(called.getTime() + 30000);
        const completed = new Date(serving.getTime() + 3 * 60000);

        ticketDocs.push({
          _id: new mongoose.Types.ObjectId(),
          storeId: store._id,
          customerId: customer._id,
          counterId: counter._id,
          ticketNumber: `Q-${ticketSeq}`,
          sequenceNumber: ticketSeq,
          status: 'COMPLETED',
          paymentMethod: counter.acceptedPaymentType === 'ALL' ? 'UPI' : counter.acceptedPaymentType,
          estimatedWaitMinutes: 3,
          estimatedWaitTimeMinutes: 3,
          joinedAt: joined,
          calledAt: called,
          servingAt: serving,
          completedAt: completed,
          notes: 'Simulated Demo Queue Activity',
          createdAt: joined,
          updatedAt: completed,
        });
      }
    }

    // B. 15 Completed tickets for TODAY distributed across shopping hours (8 AM to 8 PM)
    for (let h = 8; h <= 20; h++) {
      ticketSeq++;
      const customer = demoCustomers[ticketSeq % demoCustomers.length];
      const counter = counters[ticketSeq % counters.length];

      // Local hour set on today's calendar date
      const joined = new Date(todayStart);
      joined.setHours(h, (ticketSeq * 7) % 60, 0, 0);

      const called = new Date(joined.getTime() + 2 * 60000);
      const serving = new Date(called.getTime() + 30000);
      const completed = new Date(serving.getTime() + 3 * 60000);

      ticketDocs.push({
        _id: new mongoose.Types.ObjectId(),
        storeId: store._id,
        customerId: customer._id,
        counterId: counter._id,
        ticketNumber: `Q-${ticketSeq}`,
        sequenceNumber: ticketSeq,
        status: 'COMPLETED',
        paymentMethod: counter.acceptedPaymentType === 'ALL' ? 'UPI' : counter.acceptedPaymentType,
        estimatedWaitMinutes: 3,
        estimatedWaitTimeMinutes: 3,
        joinedAt: joined,
        calledAt: called,
        servingAt: serving,
        completedAt: completed,
        notes: 'Simulated Demo Queue Activity',
        createdAt: joined,
        updatedAt: completed,
      });
    }

    // C. 2 Currently Serving Tickets Today
    ticketSeq++;
    const serving1Id = new mongoose.Types.ObjectId();
    const serving1 = {
      _id: serving1Id,
      storeId: store._id,
      customerId: demoCustomers[1]._id,
      counterId: counters[0]._id, // Counter 1
      ticketNumber: `Q-${ticketSeq}`,
      sequenceNumber: ticketSeq,
      status: 'SERVING',
      paymentMethod: 'UPI',
      estimatedWaitMinutes: 1,
      estimatedWaitTimeMinutes: 1,
      joinedAt: new Date(Date.now() - 6 * 60000),
      calledAt: new Date(Date.now() - 3 * 60000),
      servingAt: new Date(Date.now() - 1 * 60000),
      notes: 'Simulated Demo Queue Activity',
      createdAt: new Date(Date.now() - 6 * 60000),
      updatedAt: new Date(),
    };
    ticketDocs.push(serving1);

    ticketSeq++;
    const serving2Id = new mongoose.Types.ObjectId();
    const serving2 = {
      _id: serving2Id,
      storeId: store._id,
      customerId: demoCustomers[2]._id,
      counterId: counters[1]._id, // Counter 2
      ticketNumber: `Q-${ticketSeq}`,
      sequenceNumber: ticketSeq,
      status: 'SERVING',
      paymentMethod: 'CARD',
      estimatedWaitMinutes: 2,
      estimatedWaitTimeMinutes: 2,
      joinedAt: new Date(Date.now() - 5 * 60000),
      calledAt: new Date(Date.now() - 2 * 60000),
      servingAt: new Date(Date.now() - 1 * 60000),
      notes: 'Simulated Demo Queue Activity',
      createdAt: new Date(Date.now() - 5 * 60000),
      updatedAt: new Date(),
    };
    ticketDocs.push(serving2);

    // D. 4 Currently Waiting Tickets Today
    for (let w = 1; w <= 4; w++) {
      ticketSeq++;
      ticketDocs.push({
        _id: new mongoose.Types.ObjectId(),
        storeId: store._id,
        customerId: demoCustomers[w + 4]._id,
        counterId: null,
        ticketNumber: `Q-${ticketSeq}`,
        sequenceNumber: ticketSeq,
        status: 'WAITING',
        paymentMethod: 'UPI',
        estimatedWaitMinutes: w * 2.5,
        estimatedWaitTimeMinutes: w * 2.5,
        joinedAt: new Date(Date.now() - (5 - w) * 60000),
        notes: 'Simulated Demo Queue Activity',
        createdAt: new Date(Date.now() - (5 - w) * 60000),
        updatedAt: new Date(),
      });
    }

    // Insert all tickets using native collection
    await QueueTicket.collection.insertMany(ticketDocs);

    // Assign current tickets to counters
    counters[0].currentTicketId = serving1Id;
    counters[0].currentServingTicketId = serving1Id;
    counters[0].status = 'BUSY';
    await counters[0].save();

    counters[1].currentTicketId = serving2Id;
    counters[1].currentServingTicketId = serving2Id;
    counters[1].status = 'BUSY';
    await counters[1].save();

    // Update Today's Queue Document
    await Queue.findOneAndUpdate(
      { storeId: store._id, date: todayStr },
      {
        storeId: store._id,
        date: todayStr,
        currentSequenceNumber: ticketSeq,
        activeTicketsCount: 6, // 2 serving + 4 waiting
        averageServiceTimeMinutes: 2.5,
      },
      { upsert: true }
    );

    console.log(`  [Queue] Created ${ticketDocs.length} total tickets.`);
    console.log(`  [Queue Status] 2 SERVING (Counter 1 & 2), 4 WAITING in line.`);

    // 8. Populate Logically Sound Inventory & Stock Movements
    console.log('\n--- 6. Updating Inventory History & Stock Movements ---');
    const manager = await User.findOne({ email: 'manager@smartqueue.com' });

    // Target realistic current stocks:
    // Make Britannia Bread low stock (7 units <= minThreshold 8) so low-stock alert triggers!
    const targetStock = {
      '8901262010114': { stock: 48, min: 15, name: 'Amul Taaza Milk' },
      '8901030383321': { stock: 38, min: 10, name: 'Aashirvaad Atta' },
      '8901491101836': { stock: 85, min: 20, name: 'Tata Salt' },
      '8901058852441': { stock: 42, min: 12, name: 'Maggi Noodles' },
      '8901725181122': { stock: 7, min: 8, name: 'Britannia Whole Wheat Bread' }, // LOW STOCK ALERT
      '8901063012885': { stock: 28, min: 10, name: 'Tata Tea Gold' },
    };

    for (const prod of products) {
      const config = targetStock[prod.barcode] || { stock: 40, min: 10, name: prod.name };

      const movements = [
        {
          type: 'IN',
          quantity: 100,
          previousQuantity: 0,
          newQuantity: 100,
          balanceAfter: 100,
          reason: 'Initial flagship store intake',
          performedBy: manager ? manager._id : null,
          createdAt: new Date('2026-10-25T10:00:00Z'),
        },
        {
          type: 'IN',
          quantity: 50,
          previousQuantity: 100,
          newQuantity: 150,
          balanceAfter: 150,
          reason: 'Weekly supplier restocking batch #SUP-20261028',
          performedBy: manager ? manager._id : null,
          createdAt: new Date('2026-10-28T14:30:00Z'),
        },
        {
          type: 'SALE',
          quantity: -(150 - config.stock),
          previousQuantity: 150,
          newQuantity: config.stock,
          balanceAfter: config.stock,
          reason: 'Cumulative 7-day registered customer sales',
          createdAt: new Date('2026-11-03T18:00:00Z'),
        },
      ];

      await Inventory.findOneAndUpdate(
        { storeId: store._id, productId: prod._id },
        {
          storeId: store._id,
          productId: prod._id,
          currentStock: config.stock,
          minThreshold: config.min,
          minStockAlert: config.min,
          aisleLocation: prod.aisleLocation || 'Aisle 1',
          lastRestockedAt: new Date('2026-10-28T14:30:00Z'),
          stockMovements: movements,
        },
        { upsert: true }
      );

      // Keep product stockQuantity synchronized
      prod.stockQuantity = config.stock;
      prod.minStockThreshold = config.min;
      await prod.save();

      console.log(`  [Inventory] ${config.name}: Stock = ${config.stock} (Min: ${config.min}) ${config.stock <= config.min ? '⚠️ [LOW STOCK TRIGGERED]' : '✓'}`);
    }

    // 9. Customer Notifications
    console.log('\n--- 7. Generating Realistic Customer Notifications ---');
    await Notification.deleteMany({ title: { $regex: /^(Your turn|Order|Payment|Weekly|Queue Position)/ } });

    const notificationsData = [
      {
        userId: demoCustomers[1]._id,
        storeId: store._id,
        title: 'Your turn at Counter 1!',
        message: 'Ticket #Q-1046 is now being served at Express Lane Counter 1.',
        type: 'QUEUE_CALLED',
        isRead: false,
      },
      {
        userId: demoCustomers[2]._id,
        storeId: store._id,
        title: 'Your turn at Counter 2!',
        message: 'Ticket #Q-1047 is now being served at General Counter 2.',
        type: 'QUEUE_CALLED',
        isRead: false,
      },
      {
        userId: demoCustomers[5]._id,
        storeId: store._id,
        title: 'Queue Position Update',
        message: 'You are #1 in line. Estimated wait time: 2 minutes.',
        type: 'QUEUE_UPDATE',
        isRead: false,
      },
      {
        userId: demoCustomers[6]._id,
        storeId: store._id,
        title: 'Payment Successful',
        message: 'INR 345.00 paid successfully via UPI.',
        type: 'PAYMENT_CONFIRMED',
        isRead: true,
      },
      {
        userId: demoCustomers[7]._id,
        storeId: store._id,
        title: 'Order Completed',
        message: 'Your supermarket order has been verified.',
        type: 'ORDER_STATUS',
        isRead: true,
      },
    ];

    for (const n of notificationsData) {
      await Notification.create(n);
    }
    console.log(`  [Notifications] Seeded ${notificationsData.length} operational notifications.`);

    // 10. Frequently Bought Together Recommendations
    console.log('\n--- 8. Seeding Cross-Product Recommendations ---');
    const amul = products.find((p) => p.barcode === '8901262010114');
    const bread = products.find((p) => p.barcode === '8901725181122');
    const tea = products.find((p) => p.barcode === '8901063012885');
    const maggi = products.find((p) => p.barcode === '8901058852441');

    if (amul && bread) {
      await Recommendation.findOneAndUpdate(
        { productId: amul._id },
        {
          productId: amul._id,
          relatedProductIds: [bread._id, tea ? tea._id : bread._id],
          score: 0.95,
          coOccurrenceCount: 42,
          category: amul.category,
        },
        { upsert: true }
      );
    }

    if (maggi && tea) {
      await Recommendation.findOneAndUpdate(
        { productId: maggi._id },
        {
          productId: maggi._id,
          relatedProductIds: [tea._id],
          score: 0.88,
          coOccurrenceCount: 31,
          category: maggi.category,
        },
        { upsert: true }
      );
    }
    console.log('  [Recommendations] Cross-category product pairings seeded.');

    // 11. Populate Active Carts for Waiting Customers
    console.log('\n--- 9. Seeding Active Carts for Waiting Shoppers ---');
    const waitingCust = demoCustomers[5];
    if (waitingCust && amul && bread) {
      await Cart.findOneAndUpdate(
        { userId: waitingCust._id },
        {
          userId: waitingCust._id,
          storeId: store._id,
          items: [
            { productId: amul._id, quantity: 2, priceAtAdd: amul.price },
            { productId: bread._id, quantity: 1, priceAtAdd: bread.price },
          ],
          subtotal: 2 * amul.price + bread.price,
        },
        { upsert: true }
      );
    }
    console.log('  [Carts] Active customer carts established.');

    console.log('\n======================================================');
    console.log('        DEMO SIMULATION POPULATION COMPLETE           ');
    console.log('======================================================\n');

    await disconnectDB();
    return true;
  } catch (error) {
    console.error('[Demo Seed Error]', error);
    await disconnectDB();
    process.exit(1);
  }
}

if (require.main === module) {
  seedDemoSimulation();
}

module.exports = { seedDemoSimulation };
