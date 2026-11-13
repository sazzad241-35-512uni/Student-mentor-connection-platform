require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");
const resourceRoutes = require("./routes/resources");
const eventRoutes = require("./routes/events");
const messageRoutes = require("./routes/messages");
const connectionRoutes = require("./routes/connections");
const notificationRoutes = require("./routes/notifications");
const researchRoutes = require("./routes/research");
const commentRoutes = require("./routes/comments");
const reportRoutes = require("./routes/reports");
const adminRoutes = require("./routes/admin");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(",").map(x => x.trim()) : true } });
app.set("io", io);
io.use((socket, next) => {
  try { const jwt = require("jsonwebtoken"); const token = socket.handshake.auth && socket.handshake.auth.token; if (!token) return next(new Error("Authentication required")); const payload = jwt.verify(token, process.env.JWT_SECRET); socket.userId = String(payload.id); next(); } catch (_e) { next(new Error("Invalid token")); }
});
io.on("connection", socket => { socket.join(`user:${socket.userId}`); socket.on("disconnect", () => {}); });

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN.split(",").map((origin) => origin.trim())
    : true
}));
app.use(express.json({ limit: "30kb" }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 250 }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "Student Mentor Connection Platform API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/research", researchRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/profile", require("./routes/profile"));
app.use(express.static(path.join(__dirname, "..", "public")));

app.use((_req, res) => res.status(404).json({ message: "Endpoint not found." }));

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: "Validation failed.", errors: err.message });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid ID format." });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: "That email is already registered." });
  }
  res.status(err.status || 500).json({
    message: err.status ? err.message : "Internal server error."
  });
});

const PORT = process.env.PORT || 5000;

async function start() {
  if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
    console.error("Missing MONGODB_URI or JWT_SECRET. Copy .env.example to .env and configure it.");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");
  server.listen(PORT, () => console.log(`Platform running at http://localhost:${PORT}`));
}

start().catch((error) => {
  console.error("Could not start server:", error.message);
  process.exit(1);
});
