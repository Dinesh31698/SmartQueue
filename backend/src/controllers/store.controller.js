const { Store, StoreSettings, QueueTicket, Counter } = require('../models');

// GET /api/stores
const listStores = async (req, res, next) => {
  try {
    const stores = await Store.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({ success: true, data: stores });
  } catch (err) {
    next(err);
  }
};

// GET /api/stores/:id
const getStoreById = async (req, res, next) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ success: false, error: 'Store not found' });
    }
    const settings = await StoreSettings.findOne({ storeId: store._id });
    res.status(200).json({ success: true, data: { store, settings } });
  } catch (err) {
    next(err);
  }
};

// POST /api/stores
const createStore = async (req, res, next) => {
  try {
    const { storeCode, name, address, contactNumber, email, operatingHours } = req.body;
    const existing = await Store.findOne({ storeCode: storeCode.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Store code already exists' });
    }

    const store = await Store.create({
      storeCode: storeCode.toUpperCase(),
      name,
      address,
      contactNumber,
      email,
      operatingHours,
      nfcTagPayload: `SMARTQUEUE:STORE:${storeCode.toUpperCase()}`,
      qrCodePayload: `smartqueue://store/${storeCode.toUpperCase()}`,
    });

    // Create default settings
    await StoreSettings.create({ storeId: store._id });

    res.status(201).json({ success: true, data: store, message: 'Store created successfully' });
  } catch (err) {
    next(err);
  }
};

// PUT /api/stores/:id
const updateStore = async (req, res, next) => {
  try {
    const store = await Store.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!store) {
      return res.status(404).json({ success: false, error: 'Store not found' });
    }
    res.status(200).json({ success: true, data: store, message: 'Store updated successfully' });
  } catch (err) {
    next(err);
  }
};

// POST /api/stores/resolve-tag (NFC / QR / Code resolver)
const resolveTag = async (req, res, next) => {
  try {
    const { tagPayload, qrCode, storeCode } = req.body;
    const query = tagPayload || qrCode || storeCode;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Please provide tagPayload, qrCode, or storeCode to resolve.',
      });
    }

    // Attempt matching by NDEF payload, QR payload, storeCode, or store _id
    let store = await Store.findOne({
      $or: [
        { nfcTagPayload: query },
        { qrCodePayload: query },
        { storeCode: query.toUpperCase() },
      ],
    });

    // If query contains SMARTQUEUE:STORE:XXX, parse out code
    if (!store && typeof query === 'string' && query.includes('SMARTQUEUE:STORE:')) {
      const parsedCode = query.replace('SMARTQUEUE:STORE:', '').trim().toUpperCase();
      store = await Store.findOne({ storeCode: parsedCode });
    }

    // If query is an ObjectId
    if (!store && query.match(/^[0-9a-fA-F]{24}$/)) {
      store = await Store.findById(query);
    }

    if (!store) {
      return res.status(404).json({
        success: false,
        error: `Could not identify any supermarket for payload "${query}". Please verify NFC tag or QR code.`,
      });
    }

    // Fetch live store statistics (waiting tickets, open counters)
    const [settings, waitingTickets, openCounters] = await Promise.all([
      StoreSettings.findOne({ storeId: store._id }),
      QueueTicket.countDocuments({ storeId: store._id, status: 'WAITING' }),
      Counter.countDocuments({ storeId: store._id, status: { $in: ['OPEN', 'BUSY'] } }),
    ]);

    const estimatedWaitMinutes = Math.max(1, Math.ceil((waitingTickets * 3.5) / Math.max(1, openCounters)));

    res.status(200).json({
      success: true,
      data: {
        store,
        settings,
        liveStatus: {
          waitingTickets,
          openCounters,
          estimatedWaitMinutes,
        },
      },
      message: `Successfully connected to ${store.name}`,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/stores/:id/settings
const getStoreSettings = async (req, res, next) => {
  try {
    let settings = await StoreSettings.findOne({ storeId: req.params.id });
    if (!settings) {
      settings = await StoreSettings.create({ storeId: req.params.id });
    }
    res.status(200).json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
};

// PUT /api/stores/:id/settings
const updateStoreSettings = async (req, res, next) => {
  try {
    let settings = await StoreSettings.findOneAndUpdate(
      { storeId: req.params.id },
      req.body,
      { new: true, upsert: true }
    );
    res.status(200).json({ success: true, data: settings, message: 'Store settings updated' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listStores,
  getStoreById,
  createStore,
  updateStore,
  resolveTag,
  getStoreSettings,
  updateStoreSettings,
};
