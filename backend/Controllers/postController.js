const Post = require('../Models/Post');
const User = require('../Models/users');
const Alumni = require('../Models/alumni');

// Create a new post
exports.createPost = async (req, res) => {
    try {
        console.log('Creating post with user:', req.user);
        const { title, content } = req.body;
        const post = new Post({
            title,
            content,
            author: req.user._id,
            authorType: req.isAlumni ? 'Alumni' : 'User'
        });
        await post.save();
        
        // Populate author data before sending response
        const populatedPost = await Post.findById(post._id)
            .populate({
                path: 'author',
                select: 'fullName email',
                model: req.isAlumni ? 'Alumni' : 'User'
            })
            .populate({
                path: 'comments.author',
                select: 'fullName email',
                model: req.isAlumni ? 'Alumni' : 'User'
            });
            
        res.status(201).json(populatedPost);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get all posts
exports.getAllPosts = async (req, res) => {
    try {
        console.log('Getting all posts with user:', req.user);
        const posts = await Post.find()
            .populate({
                path: 'author',
                select: 'fullName email',
                model: 'User'
            })
            .populate({
                path: 'comments.author',
                select: 'fullName email',
                model: 'User'
            })
            .sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        console.error('Error getting posts:', error);
        res.status(500).json({ message: error.message });
    }
};

// Add a comment to a post
exports.addComment = async (req, res) => {
    try {
        console.log('Adding comment with user:', req.user);
        const { postId } = req.params;
        const { content } = req.body;
        
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        post.comments.push({
            content,
            author: req.user._id,
            authorType: req.isAlumni ? 'Alumni' : 'User'
        });

        await post.save();
        
        // Populate author data before sending response
        const populatedPost = await Post.findById(post._id)
            .populate({
                path: 'author',
                select: 'fullName email',
                model: 'User'
            })
            .populate({
                path: 'comments.author',
                select: 'fullName email',
                model: 'User'
            });
            
        res.status(200).json(populatedPost);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: error.message });
    }
};

// Like/Unlike a post
exports.toggleLike = async (req, res) => {
    try {
        console.log('Toggling like with user:', req.user);
        const { postId } = req.params;
        const post = await Post.findById(postId);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const likeIndex = post.likes.indexOf(req.user._id);
        if (likeIndex === -1) {
            post.likes.push(req.user._id);
        } else {
            post.likes.splice(likeIndex, 1);
        }

        await post.save();
        
        // Populate author data before sending response
        const populatedPost = await Post.findById(post._id)
            .populate({
                path: 'author',
                select: 'fullName email',
                model: 'User'
            })
            .populate({
                path: 'comments.author',
                select: 'fullName email',
                model: 'User'
            });
            
        res.status(200).json(populatedPost);
    } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({ message: error.message });
    }
}; 