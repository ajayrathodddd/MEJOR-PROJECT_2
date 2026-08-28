const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const chatRoutes = require('./routes/chatRoutes');
// Uncomment this only if you have created chatRoutes.js file, 
// otherwise keep it commented out to avoid crashes:
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();

// Enable CORS for Express API endpoints
app.use(cors());
app.use(express.json());

connectDB();
// Uncomment this only if you have created chatRoutes.js file, 
// otherwise keep it commented out to avoid crashes:
// const chatRoutes = require('./routes/chatRoutes');

app.get("/", (req, res) => {
    res.send('API is running');
});

// Static folder for uploaded files (Crucial for profile pictures and posts)
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/chat', chatRoutes);

// Custom Error Handler Middleware (Prevents 500 HTML crashes)
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Create HTTP Server & WebSockets
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
    console.log('New client connected');
  
    socket.on('joinChat', (chatId) => {
      socket.join(chatId);
      console.log(`User joined chat ${chatId}`);
    });
  
    socket.on('sendMessage', (message) => {
      console.log(`Message received from client: ${message.content}`);
      io.to(message.chatId).emit('receiveMessage', message);
      console.log(`Message sent to chat ${message.chatId}: ${message.content}`);
    });
  
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running at PORT ${PORT}`));