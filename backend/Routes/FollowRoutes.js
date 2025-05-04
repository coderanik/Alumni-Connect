const express = require('express');
const router = express.Router();
const protectRoute = require('../Middlewares/ProtectRoute');
const { followUser, followAlumni, unfollowUser, unfollowAlumni } = require('../Controllers/FollowController');

console.log('Registering follow routes...');

// Protect all follow routes
router.use(protectRoute);

// POST /api/follow/:userId/follow/user/:followeeId
router.post('/:userId/follow/user/:followeeId', (req, res, next) => {
    console.log('Follow user route hit:', req.params);
    followUser(req, res, next);
});

// POST /api/follow/:userId/follow/alumni/:alumniId
router.post('/:userId/follow/alumni/:alumniId', (req, res, next) => {
    console.log('Follow alumni route hit:', req.params);
    followAlumni(req, res, next);
});
  
// POST /api/follow/:userId/unfollow/user/:followeeId
router.post('/:userId/unfollow/user/:followeeId', (req, res, next) => {
    console.log('Unfollow user route hit:', req.params);
    unfollowUser(req, res, next);
});
  
// POST /api/follow/:userId/unfollow/alumni/:alumniId
router.post('/:userId/unfollow/alumni/:alumniId', (req, res, next) => {
    console.log('Unfollow alumni route hit:', req.params);
    unfollowAlumni(req, res, next);
});

console.log('Follow routes registered');

module.exports = router;