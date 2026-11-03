const { Counter, Store } = require('../models');
const { emitToStore } = require('../sockets/socketManager');

// GET /api/counters
const listCounters = async (req, res, next) => {
  try {
    const { storeId } = req.query;
    const targetStoreId = storeId || (req.user ? req.user.storeId : null);

    const filter = {};
    if (targetStoreId) filter.storeId = targetStoreId;

    const counters = await Counter.find(filter)
      .populate('assignedCashierId', 'name email')
      .populate('currentServingTicketId', 'ticketNumber status customerId')
      .sort({ counterNumber: 1 });

    res.status(200).json({ success: true, data: counters });
  } catch (err) {
    next(err);
  }
};

// POST /api/counters
const createCounter = async (req, res, next) => {
  try {
    const { storeId, counterNumber, name, acceptedPaymentType } = req.body;
    const existing = await Counter.findOne({ storeId, counterNumber });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: `Counter number ${counterNumber} already exists in this store.`,
      });
    }

    const counter = await Counter.create({
      storeId,
      counterNumber,
      name: name || `Counter ${counterNumber}`,
      acceptedPaymentType: acceptedPaymentType || 'ALL',
      status: 'CLOSED',
    });

    res.status(201).json({ success: true, data: counter, message: 'Counter lane created' });
  } catch (err) {
    next(err);
  }
};

// PUT /api/counters/:id
const updateCounter = async (req, res, next) => {
  try {
    const counter = await Counter.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!counter) {
      return res.status(404).json({ success: false, error: 'Counter not found' });
    }
    res.status(200).json({ success: true, data: counter, message: 'Counter updated' });
  } catch (err) {
    next(err);
  }
};

// POST /api/counters/:id/assign (Cashier claims this counter)
const assignCounter = async (req, res, next) => {
  try {
    const cashierId = req.user.id;
    const counterId = req.params.id;

    // Unassign cashier from any other counter first
    await Counter.updateMany(
      { assignedCashierId: cashierId, _id: { $ne: counterId } },
      { assignedCashierId: null, status: 'CLOSED' }
    );

    const counter = await Counter.findById(counterId);
    if (!counter) {
      return res.status(404).json({ success: false, error: 'Counter not found' });
    }

    counter.assignedCashierId = cashierId;
    counter.status = 'OPEN';
    await counter.save();

    await counter.populate('assignedCashierId', 'name email');

    emitToStore(counter.storeId, 'counter_status_changed', {
      counterId: counter._id,
      counterNumber: counter.counterNumber,
      status: counter.status,
      cashierName: req.user.name || 'Cashier',
    });

    res.status(200).json({
      success: true,
      data: counter,
      message: `You are now logged into Counter ${counter.counterNumber}`,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/counters/:id/unassign
const unassignCounter = async (req, res, next) => {
  try {
    const counter = await Counter.findById(req.params.id);
    if (!counter) {
      return res.status(404).json({ success: false, error: 'Counter not found' });
    }

    counter.assignedCashierId = null;
    counter.status = 'CLOSED';
    counter.currentServingTicketId = null;
    await counter.save();

    emitToStore(counter.storeId, 'counter_status_changed', {
      counterId: counter._id,
      counterNumber: counter.counterNumber,
      status: 'CLOSED',
    });

    res.status(200).json({
      success: true,
      data: counter,
      message: `Counter ${counter.counterNumber} closed.`,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/counters/:id/status
const updateCounterStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const counter = await Counter.findById(req.params.id);
    if (!counter) {
      return res.status(404).json({ success: false, error: 'Counter not found' });
    }

    counter.status = status;
    await counter.save();

    emitToStore(counter.storeId, 'counter_status_changed', {
      counterId: counter._id,
      counterNumber: counter.counterNumber,
      status: counter.status,
    });

    res.status(200).json({ success: true, data: counter });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listCounters,
  createCounter,
  updateCounter,
  assignCounter,
  unassignCounter,
  updateCounterStatus,
};
