// routes/networkRoutes.js
const express = require('express');
const protectRoute = require('../Middlewares/ProtectRoute');
const { getNetworkData } = require('../Controllers/NetworkController');

const router = express.Router();

router.get('/', protectRoute, getNetworkData);

module.exports = router;
