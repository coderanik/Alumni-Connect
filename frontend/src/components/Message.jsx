import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSocket } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Base URL for API calls
const API_BASE_URL = 'http://localhost:8080';

const Messages = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const socket = useSocket();

  // Check authentication on mount
  useEffect(() => {
    console.log('Message component mounted, auth state:', { isAuthenticated, user });
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  // Register user with socket when component mounts
  useEffect(() => {
    if (user?._id && socket) {
      console.log('Registering user with socket:', user._id);
      socket.emit('registerUser', user._id);
    }
  }, [user, socket]);

  // Fetch users list
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAuthenticated || !user) {
        setError("Please login to access messages");
        navigate('/login');
        return;
      }

      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/user`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        console.log("Users response:", res.data);
        setUsers(res.data.users || []);
        setError("");
      } catch (err) {
        console.error('Failed to fetch users', err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          // Token expired or invalid
          navigate('/login');
        } else {
          setError(err.response?.data?.error || "Failed to load users. Please check your connection.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isAuthenticated, user, navigate]);

  // Fetch messages when user is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser || !isAuthenticated || !user) return;
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/messages/${selectedUser._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        console.log("Messages response:", res.data);
        setMessages(res.data || []);
      } catch (err) {
        console.error('Failed to fetch messages', err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          // Token expired or invalid
          navigate('/login');
        } else {
          setError("Failed to load messages. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedUser, isAuthenticated, user, navigate]);

  // Socket - Receive new message
  useEffect(() => {
    if (!socket || !user?._id) return;

    const handleReceiveMessage = (message) => {
      console.log("Received message via socket:", message);
      
      if (
        selectedUser && 
        ((message.senderId === selectedUser._id && message.receiverId === user._id) || 
         (message.receiverId === selectedUser._id && message.senderId === user._id))
      ) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on('receiveMessage', handleReceiveMessage);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
    };
  }, [socket, selectedUser, user]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || !isAuthenticated || !user) return;
    try {
      const messageData = {
        message: newMessage
      };

      // Send message to backend
      const response = await axios.post(`${API_BASE_URL}/api/messages/send/${selectedUser._id}`, messageData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Add the sent message to the messages list
      setMessages((prev) => [...prev, response.data]);
      setNewMessage("");
    } catch (err) {
      console.error('Failed to send message', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        // Token expired or invalid
        navigate('/login');
      } else {
        setError("Failed to send message. Please try again.");
      }
    }
  };

  // If not authenticated, show loading or redirect
  if (!isAuthenticated || !user) {
    return <div className="text-center py-4">Redirecting to login...</div>;
  }

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-1/4 p-4 border-r h-screen overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Messages</h2>
        <input
          type="text"
          placeholder="Search users..."
          className="w-full p-2 border rounded mb-4"
        />
        
        {error && <div className="text-red-500 mb-2">{error}</div>}
        
        <div>
          {loading ? (
            <div className="text-center py-4">Loading users...</div>
          ) : users.length > 0 ? (
            users.map((user) => (
              <div
                key={user._id}
                className={`p-2 cursor-pointer hover:bg-gray-100 rounded ${selectedUser?._id === user._id ? "bg-gray-200" : ""}`}
                onClick={() => setSelectedUser(user)}
              >
                {user.fullName || user.name || "Unknown User"}
              </div>
            ))
          ) : (
            <div className="text-center py-4">No users found.</div>
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 p-4">
        {selectedUser ? (
          <>
            <h2 className="text-xl font-bold mb-4">Chat with {selectedUser.fullName}</h2>
            <div className="space-y-2 mb-4 h-[calc(100vh-200px)] overflow-y-auto">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`p-2 rounded max-w-[70%] ${
                    msg.senderId === user._id 
                      ? 'bg-blue-500 text-white ml-auto' 
                      : 'bg-gray-200'
                  }`}
                >
                  {msg.message}
                </div>
              ))}
            </div>

            <div className="flex">
              <input
                type="text"
                className="w-full p-2 border rounded"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
              />
              <button 
                onClick={handleSendMessage} 
                className="ml-2 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-4">Select a user to start chatting</div>
        )}
      </div>
    </div>
  );
};

export default Messages;
