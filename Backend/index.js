import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import ConnectDB from './src/config/db.js';
import initSocket from './src/socket/index.js';

import authroute from './src/routes/authroute.js';
import taskRoutes from './src/routes/tasksroute.js';
import userRoutes from './src/routes/users.js';
import projectRoutes from './src/routes/projects.js';

dotenv.config();

const app = express();
const server = http.createServer(app); // ← needed for Socket.io

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  },
});

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true, // ← allows cookies to be sent
  })
);
app.use(express.json());
app.use(cookieParser());

// Attach io to every request — this is what makes req.io.emit() work
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authroute);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Socket.io connection handler
initSocket(io);

// ─── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
ConnectDB();

server.listen(PORT, () => {  // ← server.listen, not app.listen
  console.log(`Server is running at ${PORT}`);
});