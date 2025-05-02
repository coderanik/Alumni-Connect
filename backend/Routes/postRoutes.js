const express = require('express');
const router = express.Router();
const { createPost, getAllPosts, addComment, toggleLike } = require('../Controllers/postController');
const { verifyToken } = require('../Middlewares/authMiddleware');

// All routes are protected
router.use(verifyToken);

// Create a new post
router.post('/', createPost);

// Get all posts
router.get('/', getAllPosts);

// Add a comment to a post
router.post('/:postId/comments', addComment);

// Like/Unlike a post
router.post('/:postId/like', toggleLike);

module.exports = router; 