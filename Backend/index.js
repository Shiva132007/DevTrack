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

const allowedOrigins = (process.env.CLIENT_URLS || process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
};

const app = express();
const server = http.createServer(app); // ← needed for Socket.io

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  },
});

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(cors(corsOptions));
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
app.get('/', (req, res) => {
  res.json({
    service: 'DevTrack API',
    status: 'ok',
    health: '/health',
  });
});

// Socket.io connection handler
initSocket(io);

// ─── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
ConnectDB()
  .then(() => {
    server.listen(PORT, () => {  // ← server.listen, not app.listen
      console.log(`Server is running at ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  });