import React, { useState, useEffect } from 'react';
import axios from '../../utils/axios';
import { useAuth } from '../../context/AuthContext';
import CreatePost from './CreatePost';
import PostCard from './PostCard';
import { handleError } from '../../utils/utils';
import { useNavigate } from 'react-router-dom';

const Forum = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        console.log('Forum component mounted, auth state:', { isAuthenticated, user });
        if (!isAuthenticated) {
            console.log('User not authenticated, redirecting to login');
            navigate('/login');
            return;
        }
        console.log('User authenticated, fetching posts');
        fetchPosts();
    }, [isAuthenticated, navigate]);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching posts...');
            const token = localStorage.getItem('token');
            console.log('Using token:', token ? 'Token exists' : 'No token');
            
            const response = await axios.get('/api/posts');
            console.log('Posts fetched successfully:', response.data);
            setPosts(response.data);
        } catch (error) {
            console.error('Error fetching posts:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
                setError(error.response.data.message || 'Failed to load posts. Please try again later.');
            } else if (error.request) {
                console.error('No response received:', error.request);
                setError('No response from server. Please check your connection.');
            } else {
                console.error('Error setting up request:', error.message);
                setError('Failed to load posts. Please try again later.');
            }
            handleError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleNewPost = (newPost) => {
        setPosts([newPost, ...posts]);
    };

    if (!isAuthenticated) {
        return null;
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="text-red-600 text-center">
                        <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-lg font-semibold">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Forum</h1>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                            Welcome, {user?.fullName}
                        </span>
                        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                            {user?.fullName?.charAt(0)}
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-md mb-8">
                    <CreatePost onPostCreated={handleNewPost} />
                </div>
                
                <div className="space-y-6">
                    {posts.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-md p-8 text-center">
                            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Posts Yet</h3>
                            <p className="text-gray-500">Be the first to share your thoughts and start a discussion!</p>
                        </div>
                    ) : (
                        posts.map((post) => (
                            <PostCard 
                                key={post._id} 
                                post={post} 
                                onUpdate={fetchPosts}
                                currentUser={user}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Forum; 