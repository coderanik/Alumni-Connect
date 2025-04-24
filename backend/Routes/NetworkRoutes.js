// routes/networkRoutes.js
const express = require('express');
const { getNetworkData } = require('../Controllers/NetworkController');

const router = express.Router();

router.get('/network', getNetworkData);

module.exports = router;
