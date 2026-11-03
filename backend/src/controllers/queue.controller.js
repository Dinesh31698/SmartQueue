const { Queue, QueueTicket, Counter, Store, Notification } = require('../models');
const { calculateWaitTime, refreshStoreWaitTimes } = require('../services/queuePrediction');
const { emitToStore, emitToUser } = require('../sockets/socketManager');

// Helper to get today's date string YYYY-MM-DD
const getTodayString = () => new Date().toISOString().slice(0, 10);

// POST /api/queue/join
const joinQueue = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    let { storeId, notes = '' } = req.body;

    if (!storeId) {
      // Fallback to customer's assigned store or default store
      if (req.user.storeId) {
        storeId = req.user.storeId;
      } else {
        const store = await Store.findOne({ isActive: true });
        if (!store) {
          return res.status(400).json({ success: false, error: 'No active supermarket store available.' });
        }
        storeId = store._id;
      }
    }

    const todayStr = getTodayString();

    // Check if customer already has an active ticket today
    const existingTicket = await QueueTicket.findOne({
      customerId,
      storeId,
      status: { $in: ['WAITING', 'CALLED', 'SERVING'] },
    }).populate('counterId', 'counterNumber name');

    if (existingTicket) {
      // Recalculate current position ahead
      const ticketsAhead = await QueueTicket.countDocuments({
        storeId,
        status: 'WAITING',
        sequenceNumber: { $lt: existingTicket.sequenceNumber },
      });

      const prediction = await calculateWaitTime(storeId, ticketsAhead);
      existingTicket.estimatedWaitTimeMinutes = prediction.estimatedMinutes;
      await existingTicket.save();

      return res.status(200).json({
        success: true,
        data: {
          ticket: existingTicket,
          positionInQueue: ticketsAhead + 1,
          ticketsAhead,
          estimatedWaitMinutes: prediction.estimatedMinutes,
          alreadyInQueue: true,
        },
        message: `You already have an active ticket #${existingTicket.ticketNumber}.`,
      });
    }

    // Atomically find or create today's store queue and increment sequence
    let queue = await Queue.findOne({ storeId, date: todayStr });
    if (!queue) {
      queue = await Queue.create({
        storeId,
        date: todayStr,
        currentSequenceNumber: 100, // start from 101
        activeTicketsCount: 0,
      });
    }

    queue.currentSequenceNumber += 1;
    queue.activeTicketsCount += 1;
    await queue.save();

    const sequenceNumber = queue.currentSequenceNumber;
    const ticketNumber = `Q-${sequenceNumber}`;

    // Count waiting tickets ahead
    const ticketsAhead = await QueueTicket.countDocuments({
      storeId,
      status: 'WAITING',
    });

    const prediction = await calculateWaitTime(storeId, ticketsAhead);

    const ticket = await QueueTicket.create({
      storeId,
      customerId,
      ticketNumber,
      sequenceNumber,
      status: 'WAITING',
      estimatedWaitTimeMinutes: prediction.estimatedMinutes,
      notes,
    });

    // Notify user via DB notification
    await Notification.create({
      userId: customerId,
      title: 'Joined Queue',
      message: `Your ticket is #${ticketNumber}. Estimated wait: ~${prediction.estimatedMinutes} mins.`,
      type: 'QUEUE_UPDATE',
      data: { ticketId: ticket._id, ticketNumber },
    });

    // Real-time socket events
    emitToStore(storeId, 'queue_joined', {
      ticketId: ticket._id,
      ticketNumber: ticket.ticketNumber,
      waitingCount: ticketsAhead + 1,
    });
    emitToStore(storeId, 'queue_updated', {
      storeId,
      totalWaiting: ticketsAhead + 1,
    });
    emitToUser(customerId, 'queue_status', {
      ticketNumber: ticket.ticketNumber,
      status: ticket.status,
      ticketsAhead,
      estimatedWaitMinutes: prediction.estimatedMinutes,
    });

    res.status(201).json({
      success: true,
      data: {
        ticket,
        positionInQueue: ticketsAhead + 1,
        ticketsAhead,
        estimatedWaitMinutes: prediction.estimatedMinutes,
      },
      message: `Successfully joined checkout queue! Ticket #${ticketNumber}`,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/queue/ticket/current
const getCurrentTicket = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const ticket = await QueueTicket.findOne({
      customerId,
      status: { $in: ['WAITING', 'CALLED', 'SERVING'] },
    })
      .populate('storeId', 'name storeCode address')
      .populate('counterId', 'counterNumber name');

    if (!ticket) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No active queue ticket found for current user.',
      });
    }

    // Refresh tickets ahead and wait time
    const ticketsAhead = await QueueTicket.countDocuments({
      storeId: ticket.storeId._id,
      status: 'WAITING',
      sequenceNumber: { $lt: ticket.sequenceNumber },
    });

    const prediction = await calculateWaitTime(ticket.storeId._id, ticketsAhead);
    ticket.estimatedWaitTimeMinutes = prediction.estimatedMinutes;

    res.status(200).json({
      success: true,
      data: {
        ticket,
        positionInQueue: ticketsAhead + 1,
        ticketsAhead,
        estimatedWaitMinutes: prediction.estimatedMinutes,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/queue/ticket/:id
const getTicketById = async (req, res, next) => {
  try {
    const ticket = await QueueTicket.findById(req.params.id)
      .populate('customerId', 'name email phone')
      .populate('storeId', 'storeCode name')
      .populate('counterId', 'counterNumber name');

    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found.' });
    }

    res.status(200).json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
};

// GET /api/queue/status
const getStoreQueueOverview = async (req, res, next) => {
  try {
    const storeId = req.query.storeId || req.user.storeId;
    if (!storeId) {
      return res.status(400).json({ success: false, error: 'storeId is required.' });
    }

    const [waitingCount, servingTickets, openCounters, counters] = await Promise.all([
      QueueTicket.countDocuments({ storeId, status: 'WAITING' }),
      QueueTicket.find({ storeId, status: { $in: ['CALLED', 'SERVING'] } })
        .populate('counterId', 'counterNumber name')
        .populate('customerId', 'name'),
      Counter.countDocuments({ storeId, status: { $in: ['OPEN', 'BUSY'] } }),
      Counter.find({ storeId })
        .populate('assignedCashierId', 'name')
        .populate('currentServingTicketId', 'ticketNumber status customerId'),
    ]);

    const prediction = await calculateWaitTime(storeId, waitingCount);

    res.status(200).json({
      success: true,
      data: {
        storeId,
        totalWaiting: waitingCount,
        openCounters,
        avgWaitMinutes: prediction.estimatedMinutes,
        currentlyServing: servingTickets,
        counters,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/queue/call-next
const callNextCustomer = async (req, res, next) => {
  try {
    const cashierId = req.user.id;
    const { counterId, storeId } = req.body;

    const targetStoreId = storeId || req.user.storeId;
    let targetCounter = null;

    if (counterId) {
      targetCounter = await Counter.findById(counterId);
    } else {
      // Find counter assigned to this cashier
      targetCounter = await Counter.findOne({ assignedCashierId: cashierId, storeId: targetStoreId });
    }

    if (!targetCounter) {
      return res.status(400).json({
        success: false,
        error: 'Please select or claim a checkout counter first before calling customers.',
      });
    }

    // Find the next waiting ticket (FIFO)
    const nextTicket = await QueueTicket.findOne({
      storeId: targetStoreId,
      status: 'WAITING',
    }).sort({ sequenceNumber: 1 });

    if (!nextTicket) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No customers currently waiting in queue.',
      });
    }

    // Update ticket
    nextTicket.status = 'CALLED';
    nextTicket.counterId = targetCounter._id;
    nextTicket.calledAt = new Date();
    await nextTicket.save();

    // Update counter
    targetCounter.status = 'BUSY';
    targetCounter.currentServingTicketId = nextTicket._id;
    await targetCounter.save();

    // Populate customer
    await nextTicket.populate('customerId', 'name phone');

    // Notify customer
    await Notification.create({
      userId: nextTicket.customerId._id,
      title: 'It is your turn!',
      message: `Ticket #${nextTicket.ticketNumber}: Please proceed to Counter ${targetCounter.counterNumber} (${targetCounter.name}).`,
      type: 'TICKET_CALLED',
      data: {
        ticketId: nextTicket._id,
        ticketNumber: nextTicket.ticketNumber,
        counterNumber: targetCounter.counterNumber,
      },
    });

    // Real-time broadcasts
    emitToStore(targetStoreId, 'customer_called', {
      ticketNumber: nextTicket.ticketNumber,
      counterNumber: targetCounter.counterNumber,
      counterName: targetCounter.name,
      customerName: nextTicket.customerId.name,
    });

    emitToUser(nextTicket.customerId._id, 'customer_called', {
      ticketNumber: nextTicket.ticketNumber,
      counterNumber: targetCounter.counterNumber,
      counterName: targetCounter.name,
      alert: true,
    });

    emitToStore(targetStoreId, 'queue_updated', { storeId: targetStoreId });

    // Refresh wait times of remaining waiting customers
    await refreshStoreWaitTimes(targetStoreId);

    res.status(200).json({
      success: true,
      data: {
        ticket: nextTicket,
        counter: targetCounter,
      },
      message: `Ticket #${nextTicket.ticketNumber} called to Counter ${targetCounter.counterNumber}.`,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/queue/ticket/:id/serve
const serveTicket = async (req, res, next) => {
  try {
    const ticket = await QueueTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    ticket.status = 'SERVING';
    ticket.servedAt = new Date();
    await ticket.save();

    emitToStore(ticket.storeId, 'queue_updated', { storeId: ticket.storeId });
    emitToUser(ticket.customerId, 'ticket_serving', { ticketNumber: ticket.ticketNumber });

    res.status(200).json({
      success: true,
      data: ticket,
      message: `Now serving ticket #${ticket.ticketNumber}`,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/queue/ticket/:id/complete
const completeTicket = async (req, res, next) => {
  try {
    const ticket = await QueueTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    ticket.status = 'COMPLETED';
    ticket.completedAt = new Date();
    await ticket.save();

    // Free counter
    if (ticket.counterId) {
      await Counter.findByIdAndUpdate(ticket.counterId, {
        status: 'OPEN',
        currentServingTicketId: null,
      });
    }

    emitToStore(ticket.storeId, 'queue_updated', { storeId: ticket.storeId });
    emitToUser(ticket.customerId, 'ticket_completed', { ticketNumber: ticket.ticketNumber });

    // Refresh wait times
    await refreshStoreWaitTimes(ticket.storeId);

    res.status(200).json({
      success: true,
      data: ticket,
      message: `Ticket #${ticket.ticketNumber} completed successfully.`,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/queue/ticket/:id/skip
const skipTicket = async (req, res, next) => {
  try {
    const ticket = await QueueTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    ticket.status = 'SKIPPED';
    ticket.skipCount = (ticket.skipCount || 0) + 1;
    await ticket.save();

    // Free counter if assigned
    if (ticket.counterId) {
      await Counter.findByIdAndUpdate(ticket.counterId, {
        status: 'OPEN',
        currentServingTicketId: null,
      });
    }

    emitToStore(ticket.storeId, 'queue_updated', { storeId: ticket.storeId });
    await refreshStoreWaitTimes(ticket.storeId);

    res.status(200).json({
      success: true,
      data: ticket,
      message: `Ticket #${ticket.ticketNumber} skipped.`,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/queue/ticket/:id/cancel
const cancelTicket = async (req, res, next) => {
  try {
    const ticket = await QueueTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    // Role check: customer can cancel their own, or staff can cancel
    if (req.user.role === 'CUSTOMER' && ticket.customerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized to cancel this ticket.' });
    }

    ticket.status = 'CANCELLED';
    await ticket.save();

    if (ticket.counterId) {
      await Counter.findByIdAndUpdate(ticket.counterId, {
        status: 'OPEN',
        currentServingTicketId: null,
      });
    }

    emitToStore(ticket.storeId, 'queue_updated', { storeId: ticket.storeId });
    await refreshStoreWaitTimes(ticket.storeId);

    res.status(200).json({
      success: true,
      message: `Ticket #${ticket.ticketNumber} cancelled.`,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/queue/display (Public live board feed)
const getPublicDisplay = async (req, res, next) => {
  try {
    const storeId = req.query.storeId;
    const filter = storeId ? { storeId } : {};

    const [serving, waiting] = await Promise.all([
      QueueTicket.find({ ...filter, status: { $in: ['CALLED', 'SERVING'] } })
        .populate('counterId', 'counterNumber name')
        .sort({ updatedAt: -1 })
        .limit(8),
      QueueTicket.find({ ...filter, status: 'WAITING' })
        .sort({ sequenceNumber: 1 })
        .limit(10),
    ]);

    res.status(200).json({
      success: true,
      data: {
        nowServing: serving.map((t) => ({
          ticketNumber: t.ticketNumber,
          counterNumber: t.counterId ? t.counterId.counterNumber : '-',
          counterName: t.counterId ? t.counterId.name : 'Counter',
          status: t.status,
        })),
        nextInLine: waiting.map((t) => ({
          ticketNumber: t.ticketNumber,
          estimatedWaitMinutes: t.estimatedWaitTimeMinutes,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  joinQueue,
  getCurrentTicket,
  getTicketById,
  getStoreQueueOverview,
  callNextCustomer,
  serveTicket,
  completeTicket,
  skipTicket,
  cancelTicket,
  getPublicDisplay,
};
