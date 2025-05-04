const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'authorType',
        required: true
    },
    authorType: {
        type: String,
        enum: ['User', 'Alumni'],
        required: true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'authorType'
    }],
    comments: [{
        content: String,
        author: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'authorType'
        },
        authorType: {
            type: String,
            enum: ['User', 'Alumni']
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Post', postSchema); 