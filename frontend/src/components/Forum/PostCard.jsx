import React, { useState } from 'react';
import axios from '../../utils/axios';
import { handleError } from '../../utils/utils';
import { formatDistanceToNow } from 'date-fns';

const PostCard = ({ post, onUpdate, currentUser }) => {
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const [showComments, setShowComments] = useState(false);

    const authorName = post.author?.fullName || 'Unknown User';
    const isLiked = post.likes.includes(currentUser?._id);
    const isAuthor = post.author?._id === currentUser?._id;

    const handleComment = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;

        try {
            setIsSubmitting(true);
            await axios.post(`/api/posts/${post._id}/comment`, { content: comment });
            setComment('');
            onUpdate();
        } catch (error) {
            handleError(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLike = async () => {
        try {
            setIsLiking(true);
            await axios.post(`/api/posts/${post._id}/like`);
            onUpdate();
        } catch (error) {
            handleError(error);
        } finally {
            setIsLiking(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                            {authorName.charAt(0)}
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h3 className="font-semibold text-gray-900">{authorName}</h3>
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                    {post.authorType === 'alumni' ? 'Alumni' : 'User'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500">
                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                            </p>
                        </div>
                    </div>
                    {isAuthor && (
                        <span className="text-xs text-gray-500">Your post</span>
                    )}
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h2>
                <p className="text-gray-700 whitespace-pre-wrap mb-4">{post.content}</p>

                <div className="flex items-center space-x-4 border-t border-gray-100 pt-4">
                    <button
                        onClick={handleLike}
                        disabled={isLiking}
                        className={`flex items-center space-x-1 text-sm font-medium transition-colors duration-200 ${
                            isLiked ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
                        }`}
                    >
                        <svg className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>{post.likes.length}</span>
                    </button>

                    <button
                        onClick={() => setShowComments(!showComments)}
                        className="flex items-center space-x-1 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors duration-200"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>{post.comments.length}</span>
                    </button>
                </div>

                {showComments && (
                    <div className="mt-4 space-y-4">
                        <form onSubmit={handleComment} className="flex space-x-2">
                            <input
                                type="text"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Write a comment..."
                                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={isSubmitting}
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting || !comment.trim()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                {isSubmitting ? 'Posting...' : 'Post'}
                            </button>
                        </form>

                        <div className="space-y-4">
                            {post.comments.map((comment, index) => (
                                <div key={index} className="flex space-x-3">
                                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                                        {comment.author?.fullName?.charAt(0) || 'U'}
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-gray-50 rounded-lg px-4 py-2">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className="font-medium text-gray-900">
                                                    {comment.author?.fullName || 'Unknown User'}
                                                </span>
                                                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                                                    {comment.authorType === 'alumni' ? 'Alumni' : 'User'}
                                                </span>
                                            </div>
                                            <p className="text-gray-700">{comment.content}</p>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostCard; 