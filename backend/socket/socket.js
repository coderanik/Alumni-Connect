const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../Models/users');
const Alumni = require('../Models/alumni');

// Map to track which socket ID belongs to which user
const userSocketMap = new Map();

let io;

function initSocket(server) {
  console.log('Initializing Socket.IO server...');
  
  io = new Server(server, {
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true,
      allowedHeaders: ['Authorization', 'Content-Type']
    },
    transports: ['polling', 'websocket'],
    allowEIO3: true,
    pingTimeout: 30000,
    pingInterval: 10000,
    connectTimeout: 20000,
    maxHttpBufferSize: 1e8,
    path: '/socket.io/',
    serveClient: false,
    cookie: false,
    allowUpgrades: true,
    perMessageDeflate: false
  });

  console.log('Socket.IO server configured with options:', {
    transports: ['polling', 'websocket'],
    pingTimeout: 30000,
    pingInterval: 10000,
    connectTimeout: 20000
  });

  // Middleware for socket authentication
  io.use(async (socket, next) => {
    try {
      console.log('Socket authentication attempt:', {
        socketId: socket.id,
        headers: socket.handshake.headers,
        auth: socket.handshake.auth
      });

      const token = socket.handshake.auth.token || 
                   socket.handshake.headers.authorization?.split(' ')[1] ||
                   socket.handshake.query.token;
      
      if (!token) {
        console.log('No token provided in socket connection');
        return next(new Error('Authentication error: No token provided'));
      }

      console.log('Token found, attempting to verify...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token verified for user:', decoded.userId);
      
      // Check both User and Alumni models
      const [user, alumni] = await Promise.all([
        User.findById(decoded.userId),
        Alumni.findById(decoded.userId)
      ]);

      const authenticatedUser = user || alumni;
      
      if (!authenticatedUser) {
        console.log('User not found for socket connection:', {
          userId: decoded.userId,
          checkedModels: ['User', 'Alumni']
        });
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = authenticatedUser;
      socket.isAlumni = !!alumni;
      console.log('Socket authenticated successfully:', {
        socketId: socket.id,
        userId: authenticatedUser._id,
        isAlumni: !!alumni
      });
      next();
    } catch (error) {
      console.error('Socket authentication error:', {
        message: error.message,
        stack: error.stack,
        socketId: socket.id
      });
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log('New socket connection established:', {
      socketId: socket.id,
      userId: socket.user._id,
      isAlumni: socket.isAlumni
    });

    socket.on('registerUser', (userId) => {
      if (userId) {
        console.log('User registration:', {
          userId,
          socketId: socket.id,
          previousSocketId: userSocketMap.get(userId)
        });
        userSocketMap.set(userId, socket.id);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', {
        socketId: socket.id,
        userId: socket.user._id,
        reason,
        wasRegistered: userSocketMap.has(socket.user._id)
      });
      
      // Remove user from mapping when disconnected
      for (const [userId, socketId] of userSocketMap.entries()) {
        if (socketId === socket.id) {
          console.log('Removing user from socket mapping:', {
            userId,
            socketId
          });
          userSocketMap.delete(userId);
          break;
        }
      }
    });

    socket.on('error', (error) => {
      console.error('Socket error:', {
        socketId: socket.id,
        userId: socket.user._id,
        error: error.message,
        stack: error.stack
      });
    });

    // Handle reconnection
    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('Reconnection attempt:', {
        socketId: socket.id,
        userId: socket.user._id,
        attempt: attemptNumber
      });
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected:', {
        socketId: socket.id,
        userId: socket.user._id,
        attempts: attemptNumber
      });
    });

    socket.on('reconnect_error', (error) => {
      console.error('Reconnection error:', {
        socketId: socket.id,
        userId: socket.user._id,
        error: error.message,
        stack: error.stack
      });
    });
  });

  console.log('Socket.IO server initialized successfully');
  return io;
}

function getReceiverSocketId(userId) {
  const socketId = userSocketMap.get(userId);
  console.log('Getting receiver socket ID:', {
    userId,
    socketId,
    hasMapping: userSocketMap.has(userId)
  });
  return socketId;
}

module.exports = { initSocket, getReceiverSocketId, io: () => io };
