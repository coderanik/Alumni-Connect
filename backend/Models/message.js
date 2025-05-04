const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    refPath: 'senderType',
    required: true 
  },
  senderType: {
    type: String,
    enum: ['User', 'Alumni'],
    required: true
  },
  receiverId: { 
    type: mongoose.Schema.Types.ObjectId, 
    refPath: 'receiverType',
    required: true 
  },
  receiverType: {
    type: String,
    enum: ['User', 'Alumni'],
    required: true
  },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Check if model exists first
const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

module.exports = Message;
