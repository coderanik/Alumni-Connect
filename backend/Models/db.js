const mongoose = require('mongoose');
require('dotenv').config(); // If using .env for MONGO_URI

const mongo_uri = process.env.MONGO_URI ;
mongoose.connect(mongo_uri)
.then(() => console.log('✅ MongoDB connected locally'))
.catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1); // Exit if connection fails
});
