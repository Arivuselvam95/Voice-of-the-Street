import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['road', 'water', 'electricity', 'sanitation', 'other'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  coordinates: {
    lat: Number,
    lng: Number
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved'],
    default: 'pending'
  },
  department: {
    type: String,
    required: true
  },
  summary: String
}, {
  timestamps: true
});

// Generate summary before saving
complaintSchema.pre('save', function(next) {
  this.summary = `${this.title} at ${this.location}. ${this.severity} severity ${this.type} issue.`;
  next();
});

export const ComplaintModel = mongoose.model('Complaint', complaintSchema);