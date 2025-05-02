const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const cors = require('cors');
const { initSocket } = require('./socket/socket');
const AuthRouter = require('./Routes/AuthRouter');
const AuthAlumniRouter = require('./Routes/AuthAlumniRoutes');
const uploadRoute = require('./Routes/routeUpload');
const eventRouter = require('./Routes/eventRoutes');
const messageRoutes = require('./Routes/messageRoutes');
const userRoutes = require('./Routes/userRoutes');
const connectCloudinary = require('./utils/cloudinary')
const AdminRoutes = require('./Routes/AdminRoutes')
const networkRoutes = require('./Routes/NetworkRoutes');
const postRoutes = require('./Routes/postRoutes');
require('./Models/db');

connectCloudinary();
const app = express();
const server = http.createServer(app); // Create HTTP server

// Configure CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Initialize socket
initSocket(server); // Initialize socket events

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.send('Backend is Working');
});
app.use('/auth', AuthRouter);
app.use('/api/alumni', AuthAlumniRouter);
app.use('/api/upload', uploadRoute);
app.use('/api/events', eventRouter);
app.use('/api/messages', messageRoutes);
app.use('/api/user', userRoutes);
app.use('/admin',AdminRoutes);
app.use('/api', networkRoutes); // Now available at /api/network
app.use('/api/posts', postRoutes); // Add post routes

// Start the server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
