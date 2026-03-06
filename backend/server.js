import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Socket.io Setup
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_room', (complaintId) => {
    socket.join(complaintId);
    console.log(`User joined room: ${complaintId}`);
  });

  socket.on('send_message', (data) => {
    // Broadcast to everyone in the room EXCEPT the sender
    socket.to(data.complaintId).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Routes
app.use('/auth', authRoutes);
app.use('/complaints', complaintRoutes);
app.use('/chat', chatRoutes);
app.use('/upload', uploadRoutes);

// Health Check
app.get('/', (req, res) => {
  res.send('Jal Sahayak AI Backend is running...');
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
