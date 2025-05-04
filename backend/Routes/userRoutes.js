const express = require('express');
const protectRoute = require('../Middlewares/ProtectRoute');
const { getUsersForSidebar } = require('../Controllers/UserController');
const { getUserProfile, updateUserProfile, getCurrentUserProfile } = require('../Controllers/UserProfileController');

const router = express.Router();

// Get all users for sidebar
router.get('/', protectRoute, getUsersForSidebar);

// Get current user's profile
router.get('/profile', protectRoute, getCurrentUserProfile);

// Get specific user's profile
router.get('/:id', getUserProfile);

// Route to update user profile
router.put('/:id', updateUserProfile);

module.exports = router;
