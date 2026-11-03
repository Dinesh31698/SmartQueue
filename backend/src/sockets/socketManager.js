const { Server } = require('socket.io');

let io = null;

const initSocket = (server, allowedOrigins) => {
  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join store room
    socket.on('join_store', (storeId) => {
      const room = `store_${storeId}`;
      socket.join(room);
      console.log(`[Socket.IO] Socket ${socket.id} joined ${room}`);
      socket.emit('joined_room', { room, success: true });
    });

    // Join user specific room
    socket.on('join_user', (userId) => {
      const room = `user_${userId}`;
      socket.join(room);
      console.log(`[Socket.IO] Socket ${socket.id} joined personal room ${room}`);
      socket.emit('joined_room', { room, success: true });
    });

    // Join counter room
    socket.on('join_counter', (counterId) => {
      const room = `counter_${counterId}`;
      socket.join(room);
      console.log(`[Socket.IO] Socket ${socket.id} joined counter room ${room}`);
      socket.emit('joined_room', { room, success: true });
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized yet.');
  }
  return io;
};

const emitToStore = (storeId, event, data) => {
  if (io) {
    io.to(`store_${storeId}`).emit(event, data);
  }
};

const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user_${userId}`).emit(event, data);
  }
};

const emitToCounter = (counterId, event, data) => {
  if (io) {
    io.to(`counter_${counterId}`).emit(event, data);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitToStore,
  emitToUser,
  emitToCounter,
};
