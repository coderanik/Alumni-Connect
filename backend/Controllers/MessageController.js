const Conversation = require("../Models/conversation");
const Message = require("../Models/Message");
const User = require("../Models/users");
const Alumni = require("../Models/alumni");
const { getReceiverSocketId, io } = require("../socket/socket");

const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    const isAlumni = req.isAlumni;

    if (!senderId) {
      return res.status(401).json({ error: "Unauthorized access. SenderId missing." });
    }
    if (!receiverId) {
      return res.status(400).json({ error: "Receiver ID is required." });
    }

    // Determine receiver type
    const receiver = await Promise.all([
      User.findById(receiverId),
      Alumni.findById(receiverId)
    ]).then(([user, alumni]) => user || alumni);

    if (!receiver) {
      return res.status(404).json({ error: "Receiver not found" });
    }

    const receiverType = receiver instanceof User ? 'User' : 'Alumni';

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    const newMessage = new Message({
      senderId,
      senderType: isAlumni ? 'Alumni' : 'User',
      receiverId,
      receiverType,
      message,
    });

    const savedMessage = await newMessage.save();
    
    // Push message ID into conversation after saving the message
    conversation.messages.push(savedMessage._id);
    const savedConversation = await conversation.save();

    if (!savedConversation || !savedMessage) {
      throw new Error("Error saving conversation or message.");
    }

    const receiverSocketId = getReceiverSocketId(receiverId.toString());
    const senderSocketId = getReceiverSocketId(senderId.toString());

    // Log receiver socket ID for debugging
    console.log("Receiver Socket ID:", receiverSocketId);
    
    if (receiverSocketId) {
      io().to(receiverSocketId).emit("receiveMessage", savedMessage);
    }
    if (senderSocketId) {
      io().to(senderSocketId).emit("receiveMessage", savedMessage);
    }

    // Populate sender and receiver details
    const populatedMessage = await Message.findById(savedMessage._id)
      .populate({
        path: 'senderId',
        select: 'fullName email',
        model: isAlumni ? 'Alumni' : 'User'
      })
      .populate({
        path: 'receiverId',
        select: 'fullName email',
        model: receiverType
      });

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error in sendMessage controller:", error.message);
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};

const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user._id;
    const isAlumni = req.isAlumni;

    // Determine receiver type
    const receiver = await Promise.all([
      User.findById(userToChatId),
      Alumni.findById(userToChatId)
    ]).then(([user, alumni]) => user || alumni);

    if (!receiver) {
      return res.status(404).json({ error: "User not found" });
    }

    const receiverType = receiver instanceof User ? 'User' : 'Alumni';

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, userToChatId] },
    }).populate({
      path: 'messages',
      populate: [
        {
          path: 'senderId',
          select: 'fullName email',
          model: isAlumni ? 'Alumni' : 'User'
        },
        {
          path: 'receiverId',
          select: 'fullName email',
          model: receiverType
        }
      ]
    });

    if (!conversation) {
      return res.status(200).json([]);
    }

    res.status(200).json(conversation.messages);
  } catch (error) {
    console.error("Error in getMessages controller:", error.message);
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};

module.exports = { sendMessage, getMessages };
