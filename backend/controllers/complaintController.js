import Complaint from '../models/Complaint.js';
import { analyzeComplaint, getAISummary } from '../services/aiService.js';
import { predictPriority } from '../services/priorityService.js';

// Helper to generate unique complaint number
const generateComplaintNumber = () => {
  return 'JSA-' + Math.random().toString(36).substr(2, 9).toUpperCase();
};

export const createComplaint = async (req, res) => {
  const { title, description, imageUrl, category, address, location } = req.body;

  try {
    const complaintNumber = generateComplaintNumber();
    
    // AI Analysis for Priority and better Classification
    const aiAnalysis = await analyzeComplaint(description);
    const predictedPriority = predictPriority(description, aiAnalysis.category);

    const complaint = await Complaint.create({
      complaintNumber,
      customerId: req.user._id,
      title,
      description,
      imageUrl,
      address,
      location,
      category: aiAnalysis.category || category,
      priority: predictedPriority,
      status: 'OPEN',
      chatHistory: [{
        sender: 'customer',
        message: description,
        timestamp: new Date()
      }]
    });

    // Generate AI summary asynchronously (don't block response)
    getAISummary([{ sender: 'customer', message: description }])
      .then(async (summary) => {
        await Complaint.findByIdAndUpdate(complaint._id, { aiSummary: summary });
      })
      .catch((err) => console.error('AI summary error:', err));

    res.status(201).json(complaint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating complaint' });
  }
};

export const getUserComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ customerId: req.params.userId }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user complaints' });
  }
};

export const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({}).populate('customerId', 'name email').sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching complaints for respondent' });
  }
};

export const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.complaintId)
      .populate('customerId', 'name email')
      .populate('respondentId', 'name email');
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching complaint details' });
  }
};

export const resolveComplaint = async (req, res) => {
  const { complaintId, feedback } = req.body;
  try {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    complaint.status = 'RESOLVED';
    if (feedback) complaint.feedback = feedback;
    
    await complaint.save();
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: 'Error resolving complaint' });
  }
};

export const reopenComplaint = async (req, res) => {
  const { complaintId } = req.body;
  try {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    complaint.status = 'REOPENED';
    await complaint.save();
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: 'Error reopening complaint' });
  }
};

export const searchComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ complaintNumber: req.params.complaintNumber })
      .populate('customerId', 'name email');
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: 'Error searching complaint' });
  }
};
