import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { createApp } from "./app";
import { config } from "./config/env";
import prisma from "./config/prisma";

const app = createApp();
const server = http.createServer(app);

// Real-Time Socket.io setup
const io = new SocketIOServer(server, {
  cors: {
    origin: [config.CLIENT_URL, "http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  },
});

// Provide socket.io instance to Express controllers
app.set("io", io);

io.on("connection", (socket) => {
  if (config.NODE_ENV === "development") {
    console.log(`🔌 Client connected: ${socket.id}`);
  }

  // Join trip room for real-time collaboration on an itinerary
  socket.on("join_trip", (tripId: string) => {
    socket.join(`trip:${tripId}`);
    if (config.NODE_ENV === "development") {
      console.log(`📡 Socket ${socket.id} joined room: trip:${tripId}`);
    }
  });

  // Leave trip room
  socket.on("leave_trip", (tripId: string) => {
    socket.leave(`trip:${tripId}`);
  });

  // Join user room for personal updates
  socket.on("join_user", (userId: string) => {
    socket.join(`user:${userId}`);
  });

  socket.on("disconnect", () => {
    if (config.NODE_ENV === "development") {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    }
  });
});

const PORT = config.PORT;

server.listen(PORT, () => {
  console.log(`🌍 GlobeTrotter Backend listening on http://localhost:${PORT}`);
  console.log(`🚀 Real-time WebSocket enabled via Socket.io`);
  console.log(`📋 Environment: ${config.NODE_ENV}`);
});

// Graceful Shutdown
async function handleShutdown(signal: string) {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log("Prisma disconnected. Server closed.");
    process.exit(0);
  });
}

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));

export { server, io };
