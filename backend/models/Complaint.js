import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  complaintNumber: {
    type: String,
    required: true,
    unique: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  respondentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
  },
  address: {
    type: String,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
    },
  },
  category: {
    type: String,
    enum: [
      'Water Supply Issue',
      'Water Quality Issue',
      'Scheme Information',
      'Billing Issue',
      'Complaint Tracking',
      'Other'
    ],
    default: 'Other',
  },
  priority: {
    type: String,
    enum: ['HIGH', 'MEDIUM', 'LOW'],
    default: 'LOW',
  },
  status: {
    type: String,
    enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'REOPENED'],
    default: 'OPEN',
  },
  chatHistory: [
    {
      sender: {
        type: String,
        enum: ['customer', 'ai', 'respondent'],
        required: true,
      },
      message: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    }
  ],
  aiSummary: {
    type: String,
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    message: {
      type: String,
    },
  }
}, { timestamps: true });

const Complaint = mongoose.model('Complaint', complaintSchema);
export default Complaint;
