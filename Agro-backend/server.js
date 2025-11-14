const http = require("http");
const app = require("./app");
const { Server } = require("socket.io");

const port = process.env.PORT || 3001;

const server = http.createServer(app);

// Initialize Socket.IO with CORS configuration
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for React Native
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'], // Support both transports
  pingTimeout: 60000,
  pingInterval: 25000
});

// Make io accessible to other modules
app.set('io', io);

// Initialize socket handlers
require('./api/sockets/socketHandler')(io);

console.log(`✅ Socket.IO initialized on port ${port}`);

server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
