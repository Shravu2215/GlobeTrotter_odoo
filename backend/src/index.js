require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { Server } = require("socket.io");

const routes = require("./routes");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
cors: {
  origin: process.env.CLIENT_URL,
  methods: ["GET", "POST"],
  credentials: true,
},});

// Make io accessible in controllers via req.app.get("io")
app.set("io", io);

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow all localhost origins in development
    if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin) || origin === process.env.CLIENT_URL) {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

io.on("connection", (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Example: join a room for scoped real-time updates
  socket.on("join", (room) => socket.join(room));

  socket.on("disconnect", () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
