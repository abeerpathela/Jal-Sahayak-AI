import Complaint from '../models/Complaint.js';

export const sendMessage = async (req, res) => {
  const { complaintId, message, sender } = req.body;

  try {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const newMessage = {
      sender,
      message,
      timestamp: new Date(),
    };

    complaint.chatHistory.push(newMessage);
    
    // If it's a respondent joining the chat, assign them if not already assigned
    if (sender === 'respondent' && !complaint.respondentId) {
      complaint.respondentId = req.user._id;
      complaint.status = 'IN_PROGRESS';
    }

    await complaint.save();

    res.status(201).json(newMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error sending message' });
  }
};

export const getAIChatResponse = async (req, res) => {
  const { message } = req.body;
  try {
    const { getAIResponse } = await import('../services/aiService.js');
    const response = await getAIResponse(message);
    res.json({ message: response });
  } catch (error) {
    res.status(500).json({ message: 'AI Error' });
  }
};
