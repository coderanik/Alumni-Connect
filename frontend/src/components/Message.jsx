import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";

// Base URL for API calls
const API_BASE_URL = 'http://localhost:8080';

// Connect to backend socket with authentication
const socket = io(API_BASE_URL, {
  auth: {
    token: localStorage.getItem('token')
  },
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000
});

const Messages = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const currentUserId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  // Register user with socket when component mounts
  useEffect(() => {
    if (currentUserId && token) {
      socket.emit('registerUser', currentUserId);
    }
  }, [currentUserId, token]);

  // Handle socket connection events
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Socket connected successfully');
      setError("");
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setError("Connection error. Please try reconnecting.");
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        socket.connect();
      }
    });

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('disconnect');
    };
  }, []);

  // Fetch users list
  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) {
        setError("Please login to access messages");
        return;
      }

      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/user`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log("Users response:", res.data);
        setUsers(res.data.users || []);
        setError("");
      } catch (err) {
        console.error('Failed to fetch users', err);
        setError("Failed to load users. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  // Fetch messages when user is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser) return;
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/messages/${selectedUser._id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log("Messages response:", res.data);
        setMessages(res.data || []);
      } catch (err) {
        console.error('Failed to fetch messages', err);
        setError("Failed to load messages. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedUser, token]);

  // Socket - Receive new message
  useEffect(() => {
    socket.on('receiveMessage', (message) => {
      console.log("Received message via socket:", message);
      
      if (
        selectedUser && 
        ((message.senderId === selectedUser._id && message.receiverId === currentUserId) || 
         (message.receiverId === selectedUser._id && message.senderId === currentUserId))
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => socket.off('receiveMessage');
  }, [selectedUser, currentUserId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;
    try {
      const messageData = {
        message: newMessage
      };

      // Send message to backend
      await axios.post(`${API_BASE_URL}/api/messages/send/${selectedUser._id}`, messageData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setNewMessage("");
    } catch (err) {
      console.error('Failed to send message', err);
      setError("Failed to send message. Please try again.");
    }
  };

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
            <div className="space-y-2 mb-4">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`p-2 rounded ${msg.senderId === currentUserId ? 'bg-blue-200' : 'bg-gray-200'}`}
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
              />
              <button onClick={handleSendMessage} className="ml-2 p-2 bg-blue-500 text-white rounded">Send</button>
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
