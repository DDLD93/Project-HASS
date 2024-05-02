const socketIO = require("socket.io");

let io;

function initializeSocket(server) {
  io = socketIO(server, {
    cors: {
      origin: "*", // Allow requests from all origins
      methods: ["GET", "POST"], // Allow only GET and POST requests
      credentials: true, // Allow credentials (cookies, authorization headers, etc.)
    },
  });

  // Socket connection handling
  io.on("connection", (socket) => {
    console.log("A user connected");

    // Example: Emit a welcome message to the connected client
    socket.emit("message", "Welcome to the server!");
  });
}

function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}

module.exports = {
  initializeSocket,
  getIO,
};
