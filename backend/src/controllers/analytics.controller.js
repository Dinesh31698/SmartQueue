const { Order, QueueTicket, Counter, Product, Transaction, User } = require('../models');

// GET /api/analytics/dashboard
const getDashboardSummary = async (req, res, next) => {
  try {
    const { storeId } = req.query;
    const filter = {};
    if (storeId) filter.storeId = storeId;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      paidOrders,
      waitingTickets,
      completedTicketsToday,
      activeCounters,
      lowStockCount,
    ] = await Promise.all([
      Order.countDocuments(filter),
      Order.find({ ...filter, paymentStatus: 'PAID' }),
      QueueTicket.countDocuments({ ...filter, status: 'WAITING' }),
      QueueTicket.countDocuments({
        ...filter,
        status: 'COMPLETED',
        completedAt: { $gte: todayStart },
      }),
      Counter.countDocuments({ ...filter, status: { $in: ['OPEN', 'BUSY'] } }),
      Product.countDocuments({ ...filter, isActive: true }),
    ]);

    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.finalTotal || 0), 0);
    const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;
    const avgWaitMinutes = Math.max(1, Math.ceil((waitingTickets * 3.5) / Math.max(1, activeCounters)));

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        paidOrdersCount: paidOrders.length,
        avgOrderValue: Math.round(avgOrderValue * 100) / 100,
        waitingTickets,
        completedTicketsToday,
        activeCounters,
        avgWaitMinutes,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/sales (Last 7 days trends for Recharts)
const getSalesTrends = async (req, res, next) => {
  try {
    const { storeId, days = 7 } = req.query;
    const daysCount = parseInt(days, 10);
    const filter = { paymentStatus: 'PAID' };
    if (storeId) filter.storeId = storeId;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (daysCount - 1));
    startDate.setHours(0, 0, 0, 0);
    filter.createdAt = { $gte: startDate };

    const orders = await Order.find(filter).sort({ createdAt: 1 });

    // Bucket by date YYYY-MM-DD
    const dateMap = {};
    for (let i = 0; i < daysCount; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      dateMap[key] = { date: key, revenue: 0, orders: 0 };
    }

    orders.forEach((o) => {
      const key = o.createdAt.toISOString().slice(0, 10);
      if (dateMap[key]) {
        dateMap[key].revenue += o.finalTotal || 0;
        dateMap[key].orders += 1;
      }
    });

    const series = Object.values(dateMap).map((item) => ({
      ...item,
      revenue: Math.round(item.revenue * 100) / 100,
    }));

    res.status(200).json({ success: true, data: series });
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/queue-traffic (Hourly breakdown)
const getQueueTraffic = async (req, res, next) => {
  try {
    const { storeId } = req.query;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const filter = { createdAt: { $gte: todayStart } };
    if (storeId) filter.storeId = storeId;

    const tickets = await QueueTicket.find(filter);

    // 24-hour distribution
    const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 8 AM to 9 PM
    const traffic = hours.map((hour) => {
      const label = hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
      const count = tickets.filter((t) => new Date(t.createdAt).getHours() === hour).length;
      return { hour: label, tickets: count };
    });

    res.status(200).json({ success: true, data: traffic });
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/top-products
const getTopProducts = async (req, res, next) => {
  try {
    const { storeId, limit = 5 } = req.query;
    const filter = { paymentStatus: 'PAID' };
    if (storeId) filter.storeId = storeId;

    const orders = await Order.find(filter).limit(100);
    const productStats = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const id = item.productId.toString();
        if (!productStats[id]) {
          productStats[id] = {
            id,
            name: item.name,
            totalQuantity: 0,
            totalRevenue: 0,
          };
        }
        productStats[id].totalQuantity += item.quantity;
        productStats[id].totalRevenue += item.subtotal;
      });
    });

    const sorted = Object.values(productStats)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, parseInt(limit, 10))
      .map((p) => ({
        ...p,
        totalRevenue: Math.round(p.totalRevenue * 100) / 100,
      }));

    res.status(200).json({ success: true, data: sorted });
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics/cashier-stats
const getCashierStats = async (req, res, next) => {
  try {
    const { storeId } = req.query;
    const filter = { role: 'CASHIER' };
    if (storeId) filter.storeId = storeId;

    const cashiers = await User.find(filter).select('name email');
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const stats = await Promise.all(
      cashiers.map(async (c) => {
        const ordersProcessed = await Order.countDocuments({
          cashierId: c._id,
          createdAt: { $gte: todayStart },
        });
        const transactions = await Transaction.find({
          cashierId: c._id,
          createdAt: { $gte: todayStart },
        });
        const revenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);

        return {
          id: c._id,
          name: c.name,
          email: c.email,
          ordersProcessed,
          revenueGenerated: Math.round(revenue * 100) / 100,
        };
      })
    );

    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardSummary,
  getSalesTrends,
  getQueueTraffic,
  getTopProducts,
  getCashierStats,
};
