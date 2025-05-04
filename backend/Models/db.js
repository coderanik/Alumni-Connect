const mongoose = require('mongoose');
require('dotenv').config(); // If using .env for MONGO_URI

// Import models
require('./users');
require('./alumni');
require('./Post');

const mongo_uri = process.env.MONGO_URI;

mongoose.connect(mongo_uri)
    .then(() => console.log('✅ MongoDB connected locally'))
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1); // Exit if connection fails
    });

// Handle connection events
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    process.exit(0);
});
