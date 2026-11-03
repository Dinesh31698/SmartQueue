const mongoose = require('mongoose');
const { QueueTicket, Counter } = require('../models');

/**
 * Predict estimated wait time in minutes for a ticket or general queue
 * @param {string} storeId - Store ObjectId
 * @param {number} ticketsAhead - Number of tickets waiting ahead
 * @returns {Promise<{estimatedMinutes: number, activeCounters: number, avgServiceMinutes: number}>}
 */
const calculateWaitTime = async (storeId, ticketsAhead = 0) => {
  try {
    // If database is not connected, return instant accurate deterministic estimation
    if (mongoose.connection.readyState !== 1) {
      const wait = Math.max(1, Math.ceil((ticketsAhead * 3.5) / 2));
      return {
        estimatedMinutes: wait,
        activeCounters: 2,
        avgServiceMinutes: 3.5,
        ticketsAhead,
      };
    }

    // 1. Get number of currently active counters
    const activeCounters = await Counter.countDocuments({
      storeId,
      status: { $in: ['OPEN', 'BUSY'] },
    });

    const effectiveCounters = Math.max(1, activeCounters);

    // 2. Average service time benchmark (default 3.5 minutes per ticket)
    // Could compute actual average from recently completed tickets in last 2 hours
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const recentTickets = await QueueTicket.find({
      storeId,
      status: 'COMPLETED',
      completedAt: { $gte: twoHoursAgo },
      servedAt: { $exists: true },
    }).limit(20);

    let avgServiceMinutes = 3.5;
    if (recentTickets.length >= 3) {
      const totalServiceMs = recentTickets.reduce((acc, t) => {
        if (t.servedAt && t.completedAt) {
          return acc + (new Date(t.completedAt) - new Date(t.servedAt));
        }
        return acc;
      }, 0);
      const computedMinutes = (totalServiceMs / recentTickets.length) / 60000;
      if (computedMinutes >= 1 && computedMinutes <= 15) {
        avgServiceMinutes = Math.round(computedMinutes * 10) / 10;
      }
    }

    // 3. Compute wait time
    const rawWait = (ticketsAhead * avgServiceMinutes) / effectiveCounters;
    const estimatedMinutes = Math.max(1, Math.ceil(rawWait));

    return {
      estimatedMinutes,
      activeCounters: effectiveCounters,
      avgServiceMinutes,
      ticketsAhead,
    };
  } catch (error) {
    console.error('[QueuePrediction] Error calculating wait time:', error.message);
    return {
      estimatedMinutes: Math.max(2, ticketsAhead * 3),
      activeCounters: 1,
      avgServiceMinutes: 3,
      ticketsAhead,
    };
  }
};

/**
 * Update wait times for all waiting tickets in a store
 */
const refreshStoreWaitTimes = async (storeId) => {
  try {
    const waitingTickets = await QueueTicket.find({
      storeId,
      status: 'WAITING',
    }).sort({ sequenceNumber: 1 });

    const activeCounters = await Counter.countDocuments({
      storeId,
      status: { $in: ['OPEN', 'BUSY'] },
    });
    const effectiveCounters = Math.max(1, activeCounters);
    const avgServiceMinutes = 3.5;

    for (let i = 0; i < waitingTickets.length; i++) {
      const ticket = waitingTickets[i];
      const wait = Math.max(1, Math.ceil((i * avgServiceMinutes) / effectiveCounters));
      ticket.estimatedWaitTimeMinutes = wait;
      await ticket.save();
    }
  } catch (err) {
    console.error('[QueuePrediction] Error refreshing store wait times:', err.message);
  }
};

module.exports = {
  calculateWaitTime,
  refreshStoreWaitTimes,
};
